/**
 * SFL Tools Integrated Portal - Dungeon Combat Engine & Character Settings (js/dungeon.js)
 * Implements: Tab switching, detailed stat points, equipped cards, enemy database render, combat engine.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. DATA AND STATES DEFINITION
    // -------------------------------------------------------------------------
    let currentPlayer = 1;
    let currentEnemy = null;
    let isSimulationRunning = false;

    const getStorageKey = (p) => {
        const pathPrefix = window.location.pathname.replace(/\/[^\/]*$/, '/');
        return `sfl_${pathPrefix}_battle_stats_${p}`;
    };

    const BASE_ATTRIBUTES = {
        hp: 5, attack: 20, luck: 10, atk_speed: 100,
        shield: 0, evasion: 10, hit_rate: 100, shield_pen: 0, bonus_dmg: 0
    };

    const DEFAULT_STATS = {
        isEnabled: true,
        level: 454,
        hp: 300,
        attack: 1040,
        shield: 250,
        evasion: 10,
        hit_rate: 150,
        bonus_dmg: 130,
        luck: 110,
        atk_speed: 1000,
        shield_pen: 1100,
        // Skill Levels Default
        '斬擊': 0, '火球術': 0, '暗影突襲': 0, '緊急治療': 0, '狂戰': 20,
        '烈火箭': 0, '石破': 0, '詛咒打擊': 0, '毒刃': 0, '烈焰劍': 0,
        '靈性冥視': 0, '狂雷擊': 0, '元素匯聚': 0, '酸液噴射': 0, '聖光之杖': 0,
        '終極一擊': 70, '神聖護盾': 0, '大治療術': 0, '曙光': 0, '潮汐一斬': 0,
        '侵蝕之觸': 0, '德魯伊風拳': 0, '聖輝斬': 0, '元素匯聚．強': 0, '絕對審判': 0,
        '疾雷脈衝': 0, '永恆之泉': 60, '會心': 0, '暗噬龍咒': 60, '星火滅世陣': 0,
        '虛空侵蝕': 70, '星碎滅劍': 0, '不滅意志': 0, '天雷神轟鳴': 70, '厄水侵蝕': 0,
        '靈魂庇佑': 0, '野蠻震盪': 0, '終絕爆破': 0, '星辰墜落': 25, '宙序裁決': 25,
        '星界終焉': 0, '艦船冷卻加成': 0,
        isDetailedEnabled: false,
        // Allocated Points
        'detail-hp': 0, 'detail-attack': 0, 'detail-luck': 0, 'detail-atk_speed': 0,
        // Equipped Slots
        'card-slot-1': '', 'card-lv-1': 5,
        'card-slot-2': '', 'card-lv-2': 5,
        'card-slot-3': '', 'card-lv-3': 5,
        'card-slot-4': '', 'card-lv-4': 5,
        'card-slot-5': '', 'card-lv-5': 5
    };

    const DEFAULT_P2 = { ...DEFAULT_STATS, isEnabled: false };
    const DEFAULT_P3 = { ...DEFAULT_STATS, isEnabled: false };

    window.CHARACTER_DEFAULT_STATS = DEFAULT_STATS;

    const ALL_KEYS = Object.keys(DEFAULT_STATS).filter(k => k !== 'isEnabled');

    // DOM Elements
    const statsForm = document.getElementById('stats-form');
    const skillsForm = document.getElementById('skills-form');
    const resetBtn = document.getElementById('reset-btn');
    const saveBtn = document.getElementById('save-btn');
    const detailedToggle = document.getElementById('detailed-settings-toggle');
    const detailedBody = document.getElementById('detailed-settings-body');
    const playerTabs = document.querySelectorAll('.player-tab');
    const joinToggleContainer = document.getElementById('join-toggle-container');
    const joinCombatToggle = document.getElementById('join-combat-toggle');

    const enemySelectionGrid = document.getElementById('enemy-selection-grid');
    const bossListView = document.getElementById('dungeon-boss-list-view');
    const bossDetailView = document.getElementById('dungeon-boss-detail-view');
    const bossDetailBack = document.getElementById('boss-detail-back');
    const bossCombatProfile = document.getElementById('boss-combat-profile');
    const clearLogBtn = document.getElementById('clear-log-btn');
    const copyLogBtn = document.getElementById('copy-log-btn');
    const combatLogPane = document.getElementById('combat-log-pane');

    // -------------------------------------------------------------------------
    // 2. SKILL DATA DYNAMIC COMPILATION SYSTEM
    // -------------------------------------------------------------------------
    function compileSkillsData() {
        const attack = {};
        const buff = {};
        const heal = {};

        const mapObj = window.ELEMENT_MAP || {};

        if (window.SFL_SKILLS_DB) {
            window.SFL_SKILLS_DB.forEach(s => {
                const elNames = (s.element || []).map(e => mapObj[e] || e).join('、');

                const multiFn = (lv, stats) => {
                    if (s.id === 'elemental_focus' || s.id === 'elemental_focus_strong') {
                        const base = s.id === 'elemental_focus_strong' ? 15 : 10;
                        const growth = s.id === 'elemental_focus_strong' ? 0.10 : 0.06;
                        return (1.00 + (lv - 1) * growth) * base * (stats?.luck || 0);
                    }
                    return s.multiplier + (lv - 1) * (s.multiplierperlvl || 0);
                };

                const ub = s.waitRound || 0;

                if (s.id === 'normal_attack' || s.name === '普攻') {
                    attack['普攻'] = { attr: '無', ub: 0, cd: 0, multi: 1, cri: false, type: 'atk' };
                }

                if (['atk', 'debuff_atk', 'dot_atk', 'damage_shield', 'control', 'pursuit'].includes(s.type)) {
                    attack[s.name] = {
                        attr: (s.id === 'elemental_focus' || s.id === 'elemental_focus_strong') ? '特殊' : elNames,
                        ub: ub,
                        cd: s.cd || 0,
                        multi: multiFn,
                        type: s.type,
                        raw: s
                    };
                    if (s.type === 'debuff_atk' && s.debuff) {
                        attack[s.name].deffnum = s.deffnum || 1; // Keep for safety if any fallback uses it
                        attack[s.name].debuff = s.debuff;
                    }
                    if (s.type === 'dot_atk' && s.dot) {
                        attack[s.name].dotnum = s.dotnum || 1; // Keep for safety if any fallback uses it
                        attack[s.name].dot = s.dot;
                    }
                } else if (['buff', 'invincible', 'support'].includes(s.type)) {
                    buff[s.name] = {
                        attr: s.type === 'invincible' ? '抵禦' : (s.type === 'support' ? '輔助' : '增益'),
                        ub: ub,
                        cd: s.cd || 0,
                        effect: s.effectType === 'accuracy' ? 'hit_rate' : (s.effectType || s.type),
                        multi: multiFn,
                        dur: s.round || 3,
                        type: s.type,
                        raw: s
                    };
                } else if (s.type === 'heal') {
                    heal[s.name] = {
                        attr: '治療',
                        ub: ub,
                        cd: s.cd || 0,
                        multi: multiFn
                    };
                }
            });
        }

        // Guarantee 普攻 exists just in case
        if (!attack['普攻']) {
            attack['普攻'] = { attr: '無', ub: 0, cd: 0, multi: 1, cri: false, type: 'atk' };
        }

        window.ATTACK_SKILLS_DATA = attack;
        window.BUFF_SKILLS_DATA = buff;
        window.HEAL_SKILLS_DATA = heal;
        window.DOT_SKILLS_DATA = {};
        window.DEBUFF_SKILLS_DATA = {};
    }

    compileSkillsData();

    // -------------------------------------------------------------------------
    // 3. CARDS SLOTS WORKBENCH AND DUPLICATE EXCLUSION SYSTEM
    // -------------------------------------------------------------------------
    function populateCardSelects() {
        if (!window.SFL_CARDS_DB) return;

        const selectedIds = [];
        for (let j = 1; j <= 5; j++) {
            const val = document.getElementById(`card-slot-${j}`)?.value;
            if (val) selectedIds.push(val);
        }

        for (let i = 1; i <= 5; i++) {
            const select = document.getElementById(`card-slot-${i}`);
            const levelSelect = document.getElementById(`card-lv-${i}`);
            const level = levelSelect ? levelSelect.value : 5;
            if (!select) continue;

            const currentValue = select.value;
            select.innerHTML = '<option value="">請選擇卡片</option>';

            window.SFL_CARDS_DB.forEach(card => {
                const isSelectedElsewhere = selectedIds.includes(card.id) && card.id !== currentValue;

                const option = document.createElement('option');
                option.value = card.id;

                let bonusParts = [];
                const bonus = card.value && card.value[level];
                if (bonus) {
                    if (bonus.hp) bonusParts.push(`血+${bonus.hp}`);
                    if (bonus.attack) bonusParts.push(`攻+${bonus.attack}`);
                    if (bonus.luck) bonusParts.push(`運+${bonus.luck}`);
                    if (bonus.atk_speed) bonusParts.push(`速+${bonus.atk_speed}`);
                    if (bonus.shield) bonusParts.push(`盾+${bonus.shield}`);
                    if (bonus.evade) bonusParts.push(`迴+${Math.round(bonus.evade * 100)}%`);
                    if (bonus.accuracy) bonusParts.push(`命+${Math.round(bonus.accuracy * 100)}%`);
                    if (bonus.penetrate) bonusParts.push(`穿+${bonus.penetrate}`);
                    if (bonus.other_bonus) bonusParts.push(`傷+${Math.round(bonus.other_bonus * 100)}%`);
                }
                const bonusStr = bonusParts.length > 0 ? ` [${bonusParts.join(', ')}]` : '';
                const statusStr = isSelectedElsewhere ? ' (已在其他插槽使用)' : '';

                option.textContent = card.name + bonusStr + statusStr;
                if (isSelectedElsewhere) {
                    option.disabled = true;
                    option.style.color = '#555';
                }

                select.appendChild(option);
            });

            select.value = currentValue;
        }
    }

    if (window.SFL_CARDS_DB) {
        populateCardSelects();
    } else {
        setTimeout(populateCardSelects, 500);
    }

    // Real-time Detailed Base Calculation
    function updateFinalStatsFromDetailed() {
        if (!detailedToggle || !detailedToggle.checked) return;

        const calculatedStats = { ...BASE_ATTRIBUTES };

        // 1. Add Allocated Points (加點)
        calculatedStats.hp += Number(document.getElementById('detail-hp')?.value || 0);
        calculatedStats.attack += Number(document.getElementById('detail-attack')?.value || 0);
        calculatedStats.luck += Number(document.getElementById('detail-luck')?.value || 0);
        calculatedStats.atk_speed += Number(document.getElementById('detail-atk_speed')?.value || 0);

        // 2. Add Equipped Cards Bonuses
        for (let i = 1; i <= 5; i++) {
            const cardId = document.getElementById(`card-slot-${i}`)?.value;
            const level = document.getElementById(`card-lv-${i}`)?.value || 5;

            if (cardId && level && window.SFL_CARDS_DB) {
                const cardData = window.SFL_CARDS_DB.find(c => c.id === cardId);
                if (cardData && cardData.value && cardData.value[level]) {
                    const bonus = cardData.value[level];

                    if (bonus.hp) calculatedStats.hp += bonus.hp;
                    if (bonus.attack) calculatedStats.attack += bonus.attack;
                    if (bonus.luck) calculatedStats.luck += bonus.luck;
                    if (bonus.atk_speed) calculatedStats.atk_speed += bonus.atk_speed;
                    if (bonus.shield) calculatedStats.shield += bonus.shield;
                    if (bonus.evade) calculatedStats.evasion += (bonus.evade * 100);
                    if (bonus.accuracy) calculatedStats.hit_rate += (bonus.accuracy * 100);
                    if (bonus.penetrate) calculatedStats.shield_pen += bonus.penetrate;
                    if (bonus.other_bonus) calculatedStats.bonus_dmg += (bonus.other_bonus * 100);
                }
            }
        }

        // 3. Update main base inputs (which are disabled/readonly)
        const updateUI = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = Math.round(val);
        };

        updateUI('hp', calculatedStats.hp);
        updateUI('attack', calculatedStats.attack);
        updateUI('luck', calculatedStats.luck);
        updateUI('atk_speed', calculatedStats.atk_speed);
        updateUI('shield', calculatedStats.shield);
        updateUI('evasion', calculatedStats.evasion);
        updateUI('hit_rate', calculatedStats.hit_rate);
        updateUI('shield_pen', calculatedStats.shield_pen);
        updateUI('bonus_dmg', calculatedStats.bonus_dmg);
    }

    // Bind listeners to detailed inputs
    const detailedInputs = document.querySelectorAll('#card-detailed-settings select, #detailed-points-allocation input');
    detailedInputs.forEach(input => {
        const updateEvent = () => {
            if (input.classList.contains('card-db-select') || input.classList.contains('card-lv-select') || input.id.includes('card-lv') || input.id.includes('card-slot')) {
                populateCardSelects();
            }
            updateFinalStatsFromDetailed();
        };
        input.addEventListener('input', updateEvent);
        input.addEventListener('change', updateEvent);
    });

    // Detailed Toggle Lock logic
    if (detailedToggle) {
        detailedToggle.addEventListener('change', function () {
            const isChecked = this.checked;
            const statInputs = document.querySelectorAll('#base-stats-inputs input');

            if (isChecked) {
                if (detailedBody) detailedBody.style.display = 'block';
                statInputs.forEach(input => {
                    if (input.id !== 'level') {
                        input.disabled = true;
                        input.classList.add('locked-input');
                        input.closest('.filter-group')?.classList.add('locked-group');
                    }
                });
                populateCardSelects();
                updateFinalStatsFromDetailed();
            } else {
                if (detailedBody) detailedBody.style.display = 'none';
                statInputs.forEach(input => {
                    input.disabled = false;
                    input.classList.remove('locked-input');
                    input.closest('.filter-group')?.classList.remove('locked-group');
                });
            }
        });
    }

    // Expose hooks to loadout.js
    window.populateCardSelects = populateCardSelects;
    window.updateFinalStatsFromDetailed = updateFinalStatsFromDetailed;

    // -------------------------------------------------------------------------
    // 4. CHARACTER TABS & STORAGE SYSTEM
    // -------------------------------------------------------------------------
    function loadPlayerStats(playerNum) {
        const savedData = localStorage.getItem(getStorageKey(playerNum));
        let stats = playerNum === 1 ? DEFAULT_STATS : (playerNum === 2 ? DEFAULT_P2 : DEFAULT_P3);

        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                stats = { ...stats, ...parsed };
            } catch (e) {
                console.error(`Error loading P${playerNum} stats:`, e);
            }
        }

        // Populate values to DOM
        ALL_KEYS.forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = (stats[key] !== undefined && stats[key] !== '') ? stats[key] : DEFAULT_STATS[key];
            }
        });

        // Handle Enabled Toggle for P2, P3
        if (playerNum > 1) {
            if (joinToggleContainer) joinToggleContainer.style.display = 'flex';
            if (joinCombatToggle) joinCombatToggle.checked = !!stats.isEnabled;
        } else {
            if (joinToggleContainer) joinToggleContainer.style.display = 'none';
        }

        // Handle detailed toggle state
        if (detailedToggle) {
            detailedToggle.checked = !!stats.isDetailedEnabled;
            detailedToggle.dispatchEvent(new Event('change'));
        }
    }

    function saveCurrentPlayerStats(e) {
        if (e) e.preventDefault();

        const savedData = localStorage.getItem(getStorageKey(currentPlayer));
        let currentStats = {};
        if (savedData) {
            try { currentStats = JSON.parse(savedData); } catch (e) { }
        }

        const stats = { ...currentStats };

        // Save normal inputs
        ALL_KEYS.forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                if (input.type === 'number') {
                    stats[key] = input.value !== '' ? Number(input.value) : DEFAULT_STATS[key];
                } else {
                    stats[key] = input.value;
                }
            }
        });

        // Save switch settings
        if (currentPlayer > 1) {
            stats.isEnabled = joinCombatToggle ? joinCombatToggle.checked : false;
        } else {
            stats.isEnabled = true; // P1 is always enabled
        }

        if (detailedToggle) {
            stats.isDetailedEnabled = detailedToggle.checked;
        }

        localStorage.setItem(getStorageKey(currentPlayer), JSON.stringify(stats));
        window.showToast(`玩家 ${currentPlayer} 配置已保存！`);
    }

    function switchPlayerTab(playerNum) {
        currentPlayer = playerNum;

        playerTabs.forEach(btn => {
            const pNum = parseInt(btn.dataset.player);
            if (pNum === playerNum) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        loadPlayerStats(playerNum);
    }

    function resetPlayerStats() {
        if (confirm(`確定要將 玩家 ${currentPlayer} 的能力值恢復到預設狀態嗎？`)) {
            const def = currentPlayer === 1 ? DEFAULT_STATS : (currentPlayer === 2 ? DEFAULT_P2 : DEFAULT_P3);
            localStorage.setItem(getStorageKey(currentPlayer), JSON.stringify(def));
            loadPlayerStats(currentPlayer);
            window.showToast(`玩家 ${currentPlayer} 已成功恢復至預設！`);
        }
    }

    // Attach listeners
    playerTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            switchPlayerTab(parseInt(btn.dataset.player));
        });
    });

    if (resetBtn) resetBtn.addEventListener('click', resetPlayerStats);
    if (saveBtn) saveBtn.addEventListener('click', saveCurrentPlayerStats);
    if (statsForm) statsForm.addEventListener('submit', saveCurrentPlayerStats);
    if (skillsForm) skillsForm.addEventListener('submit', saveCurrentPlayerStats);

    // Initial load P1
    switchPlayerTab(1);

    // -------------------------------------------------------------------------
    // 5. DUNGEON BOSSES LIST & WORKBENCH RENDERING
    // -------------------------------------------------------------------------
    function initDungeonBossesGrid() {
        if (!enemySelectionGrid) return;
        if (typeof ENEMY_DATABASE === 'undefined') {
            enemySelectionGrid.innerHTML = '<div style="color:var(--color-attack); padding:40px; text-align:center;">錯誤：找不到 ENEMY_DATABASE 資料庫。</div>';
            return;
        }

        enemySelectionGrid.innerHTML = '';
        ENEMY_DATABASE.forEach(enemy => {
            const card = document.createElement('div');
            card.className = 'enemy-card';

            // Dynamic color mapping for tags and badges
            let elementColor = '#6366f1';
            if (enemy.attribute.includes('火') && enemy.attribute.includes('水')) { elementColor = '#ff82c0'; } // Astaroth Rose/Magenta
            else if (enemy.attribute.includes('火')) { elementColor = '#ef4444'; }
            else if (enemy.attribute.includes('水')) { elementColor = '#3b82f6'; }
            else if (enemy.attribute.includes('雷')) { elementColor = '#d1a40f'; }
            else if (enemy.attribute.includes('自然')) { elementColor = '#10b981'; }
            else if (enemy.attribute.includes('暗')) { elementColor = '#a855f7'; }
            else if (enemy.attribute.includes('光')) { elementColor = '#ffee00'; }

            // Set all card borders and shadows to premium green as requested
            const cardBorderColor = '#10b981';
            const cardGlowColor = 'rgba(16, 185, 129, 0.15)';
            card.style.borderLeft = `4px solid ${cardBorderColor}`;
            card.style.boxShadow = `0 4px 20px -5px ${cardGlowColor}`;

            card.innerHTML = `
                <div class="level-tag" style="background: ${elementColor}22; color: ${elementColor}; border: 1px solid ${elementColor}33; top: 20px; right: 20px;">等級 ${enemy.level}</div>
                <h3 style="padding-right: 80px; line-height: 1.3; min-height: 32px; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.72rem; background: ${elementColor}22; color: ${elementColor}; border: 1px solid ${elementColor}44; padding: 2px 6px; border-radius: 4px; font-weight: bold; flex-shrink: 0;">${enemy.attribute}</span>
                    <span>${enemy.name}</span>
                </h3>
                <p style="color: var(--text-dim); font-size: 0.8rem; line-height: 1.4; margin-top: 10px; height: 50px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                    ${enemy.description}
                </p>
            `;
            card.onclick = () => showBossDetailWorkbench(enemy);
            enemySelectionGrid.appendChild(card);
        });
    }

    function showBossDetailWorkbench(enemy) {
        currentEnemy = enemy;
        if (bossListView) bossListView.style.display = 'none';
        if (bossDetailView) bossDetailView.style.display = 'block';

        // Dynamic color mapping based on enemy attribute for details view
        let elementColor = '#6366f1'; // default
        if (enemy.attribute.includes('火') && enemy.attribute.includes('水')) elementColor = '#ff82c0'; // Astaroth blend!
        else if (enemy.attribute.includes('火')) elementColor = '#ef4444';
        else if (enemy.attribute.includes('水')) elementColor = '#3b82f6';
        else if (enemy.attribute.includes('雷')) elementColor = '#d1a40f';
        else if (enemy.attribute.includes('自然')) elementColor = '#10b981';
        else if (enemy.attribute.includes('暗')) elementColor = '#a855f7';
        else if (enemy.attribute.includes('光')) elementColor = '#ffee00';

        if (bossCombatProfile) {
            bossCombatProfile.innerHTML = `
                <div class="enemy-header" style="margin-bottom: 20px;">
                    <span class="level-tag" style="position:static; display:inline-block; margin-bottom: 8px; background: ${elementColor}22; color: ${elementColor}; border: 1px solid ${elementColor}44;">等級 ${enemy.level}</span>
                    <h3 style="font-size: 1.5rem; margin: 0; font-weight: bold; color: ${elementColor};">${enemy.name}</h3>
                    <p style="color: var(--text-dim); font-size: 0.85rem; line-height: 1.5; margin-top: 10px; font-style: italic;">
                        ${enemy.description}
                    </p>
                </div>
                
                <h4 style="font-size: 1rem; color: ${elementColor}; margin-bottom: 12px; font-weight: 600;">敵人屬性數值</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 25px;">
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; color: var(--text-dim);">屬性: <b style="color: ${elementColor}; float: right;">${enemy.attribute}</b></div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; color: var(--text-dim);">生命: <b style="color: #7eeff3; float: right;">${enemy.hp.toLocaleString()}</b></div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; color: var(--text-dim);">攻擊: <b style="color: #7eeff3; float: right;">${enemy.attack.toLocaleString()}</b></div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; color: var(--text-dim);">防禦: <b style="color: #7eeff3; float: right;">${enemy.shield.toLocaleString()}</b></div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; color: var(--text-dim);">速度: <b style="color: #7eeff3; float: right;">${enemy.atk_speed}</b></div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; color: var(--text-dim);">命中: <b style="color: #7eeff3; float: right;">${enemy.hit_rate}%</b></div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; color: var(--text-dim);">閃避: <b style="color: #7eeff3; float: right;">${enemy.evasion}%</b></div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; color: var(--text-dim);">護甲穿透: <b style="color: #7eeff3; float: right;">${enemy.shield_pen}</b></div>
                </div>

                <div class="filter-group" style="margin-bottom: 20px;">
                    <label for="combat-repeat-count" style="color: ${elementColor}; font-weight: 600;">重複模擬次數 (1-1000)</label>
                    <input type="number" id="combat-repeat-count" value="100" min="1" max="1000" style="width: 100%;">
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="btn btn-outline" id="btn-single-test" style="width: 100%; border-color: ${elementColor}aa; color: ${elementColor};">單次戰鬥 (輸出日誌)</button>
                    <button class="btn primary" id="btn-start-challenge" style="width: 100%; background: linear-gradient(135deg, ${elementColor} 0%, ${elementColor}dd 100%); border: none;">開始批次挑戰模擬</button>
                </div>

                <div id="quick-stats" style="margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--border-glass);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: var(--text-dim);">預估勝率</span>
                        <span id="stat-win-rate" style="color: ${elementColor}; font-weight: bold; font-size: 1.1rem;">0%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-dim);">累計場次</span>
                        <span id="stat-total" style="color: var(--text-main); font-weight: bold;">0</span>
                    </div>
                </div>
            `;

            // Bind simulation click events
            document.getElementById('btn-single-test').onclick = executeSingleCombatTest;
            document.getElementById('btn-start-challenge').onclick = executeBatchChallengeSimulation;
        }

        if (combatLogPane) {
            combatLogPane.innerHTML = `<div class="log-entry log-info">已成功掛載 ${enemy.name} 的作戰模組。請點擊「批次模擬」或「單次戰鬥」啟動對決。</div>`;
        }
        updateWinMetrics(0, 0);
    }

    if (bossDetailBack) {
        bossDetailBack.onclick = () => {
            if (isSimulationRunning) return;
            if (bossDetailView) bossDetailView.style.display = 'none';
            if (bossListView) bossListView.style.display = 'block';
            currentEnemy = null;
        };
    }

    function updateWinMetrics(wins, total) {
        const rateEl = document.getElementById('stat-win-rate');
        const totalEl = document.getElementById('stat-total');
        if (totalEl) totalEl.textContent = total;
        if (rateEl) {
            const rate = total === 0 ? 0 : (wins / total * 100).toFixed(1);
            rateEl.textContent = `${rate}%`;
        }
    }

    function battleLog(msg, type = 'info') {
        if (!combatLogPane) return;
        const div = document.createElement('div');
        div.className = `log-entry log-${type}`;
        div.innerHTML = msg;
        combatLogPane.appendChild(div);
        combatLogPane.scrollTop = combatLogPane.scrollHeight;
    }

    // Defense mechanism to prevent genesis.js or other plugins from crashing
    window.battleLog = battleLog;

    initDungeonBossesGrid();

    // -------------------------------------------------------------------------
    // 6. COMBAT SIMULATION CORE ENGINE
    // -------------------------------------------------------------------------
    const getDebuffMulti = (target, attr) => {
        if (!target.activeDebuffs) return 1.0;
        let multi = 1.0;
        target.activeDebuffs.forEach(d => {
            if (d.attr === attr) multi *= (1 - d.effect);
        });
        return multi;
    };

    const getBuffMulti = (target, attr) => {
        if (!target.activeBuffs) return 1.0;
        let multi = 1.0;
        target.activeBuffs.forEach(b => {
            if (!b.pending && b.effect === attr) multi *= b.value;
        });
        return multi;
    };

    const hasBuff = (target, attr) => {
        if (!target.activeBuffs) return false;
        return target.activeBuffs.some(b => !b.pending && b.effect === attr);
    };

    const getFinalAttrMulti = (atkAttrStr, defAttrStr) => {
        if (typeof window.getAttributeMultiplier !== 'function') return 1.0;
        const atkAttrs = (atkAttrStr || '無').split(/[、,]/).map(s => s.trim()).filter(s => s);
        const defAttrs = (defAttrStr || '無').split(/[、,]/).map(s => s.trim()).filter(s => s);

        let totalMultiplier = 0;
        let combinations = 0;

        for (const aa of atkAttrs) {
            for (const da of defAttrs) {
                totalMultiplier += window.getAttributeMultiplier(aa, da);
                combinations++;
            }
        }
        return combinations > 0 ? (totalMultiplier / combinations) : 1.0;
    };

    const processDots = (target, nameTag, isVerbose) => {
        if (!target.activeDots || target.activeDots.length === 0) return;
        target.activeDots.forEach(dot => {
            if (dot.dur > 0) {
                const prevHp = target.hp;
                target.hp -= dot.dmg;
                dot.dur--;
                if (isVerbose) battleLog(`[${nameTag}] 💀 ${dot.name} 造成 ${Math.floor(dot.dmg).toLocaleString()} 持續傷害 (${Math.floor(prevHp).toLocaleString()} -> ${Math.floor(Math.max(0, target.hp)).toLocaleString()}) (剩餘 ${dot.dur} 回合)`, 'fail');
                if (target.pendingSkill) target.pendingSkill.damageTaken += dot.dmg;
            }
        });
        target.activeDots = target.activeDots.filter(d => d.dur > 0);
    };

    const processDebuffs = (target, nameTag, isVerbose) => {
        if (!target.activeDebuffs || target.activeDebuffs.length === 0) return;
        target.activeDebuffs.forEach(d => { if (d.dur > 0) d.dur--; });
        const expired = target.activeDebuffs.filter(d => d.dur <= 0);
        if (isVerbose && expired.length > 0) {
            expired.forEach(d => battleLog(`[${nameTag}] ${d.name} 減益效果已消失`, 'info'));
        }
        target.activeDebuffs = target.activeDebuffs.filter(d => d.dur > 0);
    };

    const processBuffs = (target, nameTag, isVerbose) => {
        if (!target.activeBuffs || target.activeBuffs.length === 0) return;
        target.activeBuffs.forEach(b => {
            if (b.pending) {
                b.pending = false;
            } else if (b.dur > 0) {
                b.dur--;
            }
        });
        const expired = target.activeBuffs.filter(b => b.dur <= 0 && !b.pending);
        if (isVerbose && expired.length > 0) {
            expired.forEach(b => battleLog(`[${nameTag}] ${b.name} 增益效果已消失`, 'info'));
        }
        target.activeBuffs = target.activeBuffs.filter(b => b.dur > 0 || b.pending);
    };

    // Main Duel Logic Loop
    function runBattleLoop(players, enemy, verbose = false) {
        let activePlayers = players.map(p => {
            let player = { ...p };
            player.ownedSkills = [];
            const hasStrong = player['元素匯聚．強'] && player['元素匯聚．強'] > 0;

            // Attack Skills
            if (window.ATTACK_SKILLS_DATA) {
                for (const name in window.ATTACK_SKILLS_DATA) {
                    if (name === '普攻') continue;
                    if (name === '元素匯聚' && hasStrong) continue;
                    const lv = player[name];
                    if (lv && lv > 0) {
                        player.ownedSkills.push({
                            name: name, lv: lv, data: window.ATTACK_SKILLS_DATA[name], type: 'attack'
                        });
                    }
                }
            }
            // Heal Skills
            if (window.HEAL_SKILLS_DATA) {
                for (const name in window.HEAL_SKILLS_DATA) {
                    const lv = player[name];
                    if (lv && lv > 0) {
                        player.ownedSkills.push({
                            name: name, lv: lv, data: window.HEAL_SKILLS_DATA[name], type: 'heal'
                        });
                    }
                }
            }
            // Buff Skills
            if (window.BUFF_SKILLS_DATA) {
                for (const name in window.BUFF_SKILLS_DATA) {
                    const lv = player[name];
                    if (lv && lv > 0) {
                        player.ownedSkills.push({
                            name: name, lv: lv, data: window.BUFF_SKILLS_DATA[name], type: 'buff'
                        });
                    }
                }
            }

            player.skillCDs = {};
            player.activeDots = [];
            player.activeDebuffs = [];
            player.activeBuffs = [];
            player.pendingSkill = null;

            // Health conversion
            const bossShieldPen = enemy.shield_pen || 0;
            const playerShield = player.shield || 0;
            const pMitigation = Math.min(Math.max(0, (playerShield - bossShieldPen) * 0.001), 0.99);
            player.mitigation = pMitigation;

            const finalHpMulti = 50 - (pMitigation / 0.99) * 49;
            const baseHp = player.hp || 5;
            const lv = player.level || 1;
            player.maxHp = baseHp * (20 + (lv - 1)) * finalHpMulti;
            player.hp = player.maxHp;

            // Level differences modifier
            const eLv = enemy.level || 1;
            const diff = player.level - eLv;
            if (diff >= 7) player.lvMulti = 1.5;
            else if (diff <= -7) player.lvMulti = 0.5;
            else player.lvMulti = 1.0 + (diff * (0.5 / 7));

            return player;
        });

        let e = { ...enemy };
        e.maxHp = e.hp;
        e.skillCDs = {};
        e.activeDots = [];
        e.activeDebuffs = [];
        e.activeBuffs = [];

        let round = 1;
        const maxRounds = 30;

        if (verbose) {
            battleLog(`--- 戰鬥開始 (多人副本模式: ${activePlayers.length} 人參與) ---`, 'info');
            activePlayers.forEach((p, idx) => {
                battleLog(`[玩家 ${idx + 1}] 生命上限: ${Math.floor(p.hp).toLocaleString()} | 減傷: ${(p.mitigation * 100).toFixed(1)}% | 等差倍率: ${p.lvMulti.toFixed(2)}x`, 'info');
            });
            battleLog(`--------------------------------`, 'info');
        }





        while (round <= maxRounds && e.hp > 0 && activePlayers.some(p => p.hp > 0)) {
            if (verbose) battleLog(`--- 第 ${round} 回合 ---`, 'info');

            // 回合開始計算 DOT
            activePlayers.forEach((p, idx) => {
                if (p.hp > 0) processDots(p, `玩家 ${idx + 1}`, verbose);
            });
            if (e.hp > 0) processDots(e, '敵方', verbose);

            if (e.hp <= 0 || !activePlayers.some(p => p.hp > 0)) {
                round++;
                continue;
            }

            // Calculate Speed based turn order
            const participants = [
                ...activePlayers.map((p, idx) => ({ type: 'player', ref: p, id: idx + 1, originalIdx: idx })),
                { type: 'enemy', ref: e, id: 'BOSS' }
            ];

            participants.sort((a, b) => {
                const speedA = a.ref.atk_speed * getBuffMulti(a.ref, 'speed') * getDebuffMulti(a.ref, 'speed');
                const speedB = b.ref.atk_speed * getBuffMulti(b.ref, 'speed') * getDebuffMulti(b.ref, 'speed');
                return speedB - speedA;
            });

            // Perform actions sequentially
            for (const actor of participants) {
                const target = actor.ref;
                if (target.hp <= 0 || e.hp <= 0 || !activePlayers.some(p => p.hp > 0)) continue;

                const nameTag = actor.type === 'player' ? `玩家 ${actor.id}` : '敵方';

                // Tick CDs and status effects
                for (const sName in target.skillCDs) {
                    if (target.skillCDs[sName] > 0) target.skillCDs[sName]--;
                }
                processDebuffs(target, nameTag, verbose);
                processBuffs(target, nameTag, verbose);

                if (target.hp <= 0) continue;

                /* 暫時註解：野蠻震盪束縛邏輯
                if (target.bondageCount && target.bondageCount > 0) {
                    target.bondageCount--;
                    if (verbose) battleLog(`[${nameTag}] ⛓️ 受到震盪束縛，無法行動！(剩餘 ${target.bondageCount} 回合)`, 'fail');
                    continue;
                }
                */

                if (actor.type === 'player') {
                    const p = target;

                    // Elemental Focus guidance check
                    if (p.pendingSkill) {
                        p.pendingSkill.countdown--;
                        if (p.pendingSkill.countdown <= 0) {
                            const ps = p.pendingSkill;
                            if (ps.damageTaken <= p.maxHp * 0.05) {
                                const trueDmg = typeof ps.data.multi === 'function' ? ps.data.multi(ps.lv, p) : (ps.data.multi || 0);
                                const prevHp = e.hp;
                                e.hp -= trueDmg;
                                if (verbose) battleLog(`[玩家 ${actor.id}] 💥 ${ps.name} 蓄力完成！造成 ${Math.floor(trueDmg).toLocaleString()} 真實傷害 (${Math.floor(prevHp).toLocaleString()} -> ${Math.floor(Math.max(0, e.hp)).toLocaleString()})`, 'success');
                            } else if (verbose) {
                                battleLog(`[玩家 ${actor.id}] ❌ ${ps.name} 蓄力被擊中中斷！`, 'fail');
                            }
                            p.pendingSkill = null;
                            continue;
                        } else {
                            continue;
                        }
                    }

                    // Select and cast skill
                    const pAtk = p.attack * getDebuffMulti(p, 'attack') * getBuffMulti(p, 'attack');
                    const eSpeed = e.atk_speed * getDebuffMulti(e, 'speed');
                    const eEva = e.evasion * getDebuffMulti(e, 'evasion');
                    const currentEMitigation = Math.min(Math.max(0, ((e.shield || 0) - (p.shield_pen || 0)) * 0.001), 0.99);

                    const available = p.ownedSkills.filter(s => (p.skillCDs[s.name] || 0) === 0);
                    let skillToUse = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : { name: '普攻', lv: 1, data: window.ATTACK_SKILLS_DATA['普攻'], type: 'attack' };
                    const sData = skillToUse.data;
                    const pHitRate = (p.hit_rate || 100) * getBuffMulti(p, 'hit_rate');
                    let p_hit = pHitRate - eEva - ((e.luck || 0) * 0.004);

                    // Safe Check for 'all elements' or real damage skills (guaranteed hit)
                    if (sData && (sData.attr && sData.attr.includes('全') || skillToUse.name === '元素匯聚' || skillToUse.name === '元素匯聚．強')) {
                        p_hit = 1000;
                    }

                    p_hit = Math.max(2, p_hit);

                    if (skillToUse.type === 'heal') {
                        const healPercent = typeof sData.multi === 'function' ? sData.multi(skillToUse.lv, p) : (sData.multi || 0);
                        activePlayers.forEach((tp, tIdx) => {
                            if (tp.hp <= 0) return;
                            const healAmt = tp.maxHp * 0.1 * healPercent;
                            const prevHp = tp.hp;
                            tp.hp = Math.min(tp.maxHp, tp.hp + healAmt);
                            if (verbose) battleLog(`[玩家 ${actor.id}] 💚 使用 ${skillToUse.name}！為 玩家 ${tIdx + 1} 補回 ${Math.floor(healAmt).toLocaleString()} 生命 (${Math.floor(prevHp).toLocaleString()} -> ${Math.floor(tp.hp).toLocaleString()})`, 'success');
                        });
                        p.skillCDs[skillToUse.name] = (sData.cd || 0) + 1;
                    } else if (skillToUse.type === 'buff') {
                        const bValue = typeof sData.multi === 'function' ? sData.multi(skillToUse.lv, p) : (sData.multi || 1.0);
                        p.activeBuffs.push({ name: skillToUse.name, effect: sData.effect, value: bValue, dur: sData.dur, pending: true });
                        if (verbose) battleLog(`[玩家 ${actor.id}] ✨ 使用 ${skillToUse.name}！(增幅將於下回合生效，持續 ${sData.dur} 回合)`, 'info');
                        p.skillCDs[skillToUse.name] = (sData.cd || 0) + 1;
                        /* 暫時註解：終絕爆破主動施放
                        } else if (skillToUse.name === '終絕爆破') {
                            p.pursuitMode = {
                                active: true,
                                lv: skillToUse.lv,
                                data: sData
                            };
                            p.skillCDs[skillToUse.name] = (sData.cd || 0) + 1;
                            if (verbose) battleLog(`[玩家 ${actor.id}] 🚀 啟動了 ${skillToUse.name} 追擊模式！使用輸出型技能將有機會觸發追打`, 'info');
                        */
                    } else if (Math.random() * 100 < p_hit) {
                        if (skillToUse.name === '元素匯聚' || skillToUse.name === '元素匯聚．強') {
                            p.pendingSkill = { name: skillToUse.name, lv: skillToUse.lv, data: sData, countdown: 2, damageTaken: 0 };
                            if (verbose) battleLog(`[玩家 ${actor.id}] 🌀 開始引導蓄力 ${skillToUse.name}...`, 'info');
                        } else {
                            let sMulti = typeof sData.multi === 'function' ? sData.multi(skillToUse.lv, p) : (sData.multi || 1.0);
                            const attrMulti = getFinalAttrMulti(sData.attr, e.attribute);
                            const currentPAtkMulti = Math.max(1, Math.floor((p.atk_speed * getBuffMulti(p, 'speed') * getDebuffMulti(p, 'speed')) / (eSpeed || 1)));
                            let damage = pAtk * sMulti * (1 + (p.bonus_dmg || 0) / 100) * currentPAtkMulti * p.lvMulti * attrMulti * (1 - currentEMitigation);

                            const prevHp = e.hp;
                            e.hp -= damage;

                            if (sData.dot) {
                                const dotDmg = sData.dot.damage_per_turn + (skillToUse.lv - 1) * (sData.dot.damage_per_level || 0);
                                e.activeDots.push({
                                    name: sData.dot.name,
                                    dmg: dotDmg,
                                    dur: sData.dot.round
                                });
                            }

                            if (sData.debuff) {
                                const prob = (sData.debuff.hit_chance || 0.5) * 100;
                                if (Math.random() * 100 < prob) {
                                    e.activeDebuffs.push({
                                        name: sData.debuff.name,
                                        effect: 1 - (sData.debuff.multiplier || 1.0),
                                        attr: sData.debuff.effectType || 'attack',
                                        dur: sData.debuff.round || 2
                                    });
                                    if (verbose) battleLog(`[敵方] 受到 ${sData.debuff.name} 侵擾，各項能力被扣減`, 'fail');
                                }
                            }

                            let attrText = "";
                            if (attrMulti > 1) attrText = ` <span style="color:#ffcc00">(克制 +${Math.round((attrMulti - 1) * 100)}%)</span>`;
                            else if (attrMulti < 1) attrText = ` <span style="color:#ff4444">(被克制 -${Math.round((1 - attrMulti) * 100)}%)</span>`;

                            if (verbose) battleLog(`[玩家 ${actor.id}] ⚔️ 使用 ${skillToUse.name}！造成 ${Math.floor(damage).toLocaleString()} 傷害${attrText} (${Math.floor(prevHp).toLocaleString()} -> ${Math.floor(Math.max(0, e.hp)).toLocaleString()})`, 'player');

                            /* 暫時註解：野蠻震盪與終絕爆破戰鬥計算邏輯
                            // SAVAGE SHOCK (野蠻震盪) specific effect
                            if (skillToUse.name === '野蠻震盪') {
                                const currentLevel = skillToUse.lv;
                                const shockIncrement = Math.floor(1 + currentLevel / 10);
                                
                                e.shockValue = (e.shockValue || 0) + shockIncrement;
                                if (verbose) battleLog(`[敵方] 🔨 累積震盪值 +${shockIncrement} (目前震盪值: ${e.shockValue}/28)`, 'info');

                                if (e.shockValue >= 28 && !e.shockReduced) {
                                    const rawMultiplier = sData.raw.multiplier + (currentLevel - 1) * (sData.raw.multiplierperlvl || 0);
                                    const currentMultiplier = parseFloat(rawMultiplier.toFixed(1));
                                    
                                    e.attack = e.attack * (1 - currentMultiplier / 100);
                                    e.shockReduced = true;
                                    if (verbose) battleLog(`[敵方] 💥 震盪值達到臨界點！攻擊力永久降低 ${currentMultiplier}%！`, 'fail');
                                }

                                const maxBondageTimes = Math.floor(currentLevel / 10);
                                e.bondageTriggeredTimes = e.bondageTriggeredTimes || 0;
                                if (e.bondageTriggeredTimes < maxBondageTimes) {
                                    e.bondageCount = (e.bondageCount || 0) + 1;
                                    e.bondageTriggeredTimes++;
                                    if (verbose) battleLog(`[敵方] ⛓️ 觸發束縛效果！下回合將無法行動！(已觸發 ${e.bondageTriggeredTimes}/${maxBondageTimes} 次)`, 'fail');
                                }
                            }

                            // Pursuit mode check (終絕爆破)
                            if (p.pursuitMode && p.pursuitMode.active && ['atk', 'debuff_atk', 'dot_atk', 'damage_shield', 'control'].includes(sData.type)) {
                                const pursuitLv = p.pursuitMode.lv;
                                const pursuitData = p.pursuitMode.data;
                                const triggerChance = 1 + Math.floor(0.1 * pursuitLv);
                                
                                if (Math.random() * 100 < triggerChance) {
                                    const rawMultiplier = pursuitData.raw.multiplier + (pursuitLv - 1) * (pursuitData.raw.multiplierperlvl || 0);
                                    const currentMultiplier = parseFloat(rawMultiplier.toFixed(2));
                                    const pursuitDmg = Math.floor(pAtk * currentMultiplier);
                                    
                                    const prevHp2 = e.hp;
                                    e.hp -= pursuitDmg;
                                    if (verbose) battleLog(`[玩家 ${actor.id}] 💥 觸發【終絕爆破】追擊！造成 ${pursuitDmg.toLocaleString()} 真實傷害 (${Math.floor(prevHp2).toLocaleString()} -> ${Math.floor(Math.max(0, e.hp)).toLocaleString()})`, 'success');
                                }
                            }
                            */
                        }
                    } else {
                        if (verbose) battleLog(`[玩家 ${actor.id}] 使用 ${skillToUse.name} 攻擊，但被 BOSS 閃避！`, 'fail');
                        p.skillCDs[skillToUse.name] = (sData.cd || 0) + 1;
                    }
                } else {
                    // BOSS Action Loop
                    const eAtk = e.attack * getDebuffMulti(e, 'attack') * getBuffMulti(e, 'attack');
                    const eHpPercent = (e.hp / e.maxHp) * 100;
                    const availableSkills = (e.skills || []).filter(s => eHpPercent <= (s.threshold || 100) && (e.skillCDs[s.name] || 0) === 0);
                    let selectedSkill = availableSkills.length > 0 ? availableSkills[Math.floor(Math.random() * availableSkills.length)] : { name: '普攻', multi: 1.0, type: 'single' };

                    const executeEnemyHit = (tp, pIdx, skill) => {
                        const pEva = tp.evasion * getDebuffMulti(tp, 'evasion') * getBuffMulti(tp, 'evasion');
                        let e_hit = (e.hit_rate || 100) - pEva - ((tp.luck || 0) * 0.004);
                        if (Math.random() * 100 < Math.max(2, e_hit)) {
                            const attrMulti = getFinalAttrMulti(e.attribute, '無') || 1.0;
                            const diff = e.level - tp.level;
                            const eLvMultiForP = diff >= 7 ? 1.5 : (diff <= -7 ? 0.5 : 1.0 + (diff * (0.5 / 7)));
                            const skillMulti = skill.multi || skill.damage || 1.0;
                            const currentPMitigation = hasBuff(tp, 'invincible') ? 1.0 : tp.mitigation;

                            let damage = eAtk * skillMulti * eLvMultiForP * attrMulti * (1 - currentPMitigation);
                            damage = Math.max(1, Math.floor(damage));

                            const prevHp = tp.hp;
                            tp.hp -= damage;
                            if (tp.pendingSkill) tp.pendingSkill.damageTaken += damage;

                            let attrText = "";
                            if (attrMulti > 1) attrText = ` <span style="color:#ffcc00">(克制 +${Math.round((attrMulti - 1) * 100)}%)</span>`;
                            else if (attrMulti < 1) attrText = ` <span style="color:#ff4444">(被克制 -${Math.round((1 - attrMulti) * 100)}%)</span>`;

                            if (verbose) battleLog(`[敵方] ⚡ 使用 ${skill.name} 橫掃 玩家 ${pIdx + 1}！造成 ${damage.toLocaleString()} 物理重創${attrText} (${Math.floor(prevHp).toLocaleString()} -> ${Math.floor(Math.max(0, tp.hp)).toLocaleString()})`, 'enemy');

                            /* 暫時註解：靈魂庇佑抵擋負面狀態邏輯
                            if (skill.dot) {
                                let blocked = false;
                                if (hasBuff(tp, 'support')) {
                                    const blessingBuff = tp.activeBuffs.find(b => b.effect === 'support');
                                    const blockChance = blessingBuff ? blessingBuff.value : 0;
                                    if (Math.random() < blockChance) {
                                        blocked = true;
                                        if (verbose) battleLog(`[玩家 ${pIdx + 1}] 🛡️ 靈魂庇佑生效，抵擋了持續傷害效果！`, 'success');
                                    }
                                }
                                if (!blocked) tp.activeDots.push({ ...skill.dot });
                            }
                            if (skill.debuff) {
                                let blocked = false;
                                if (hasBuff(tp, 'support')) {
                                    const blessingBuff = tp.activeBuffs.find(b => b.effect === 'support');
                                    const blockChance = blessingBuff ? blessingBuff.value : 0;
                                    if (Math.random() < blockChance) {
                                        blocked = true;
                                        if (verbose) battleLog(`[玩家 ${pIdx + 1}] 🛡️ 靈魂庇佑生效，抵擋了負面減益效果！`, 'success');
                                    }
                                }
                                if (!blocked) {
                                    tp.activeDebuffs.push({
                                        name: skill.debuff.name,
                                        effect: 1 - (skill.debuff.value || skill.debuff.multiplier || 1),
                                        attr: skill.debuff.effect || skill.debuff.effectType,
                                        dur: skill.debuff.dur || skill.debuff.round
                                    });
                                }
                            }
                            */
                            if (skill.dot) tp.activeDots.push({ ...skill.dot });
                            if (skill.debuff) {
                                tp.activeDebuffs.push({
                                    name: skill.debuff.name,
                                    effect: 1 - (skill.debuff.value || skill.debuff.multiplier || 1),
                                    attr: skill.debuff.effect || skill.debuff.effectType,
                                    dur: skill.debuff.dur || skill.debuff.round
                                });
                            }
                        } else if (verbose) {
                            battleLog(`[敵方] ${skill.name} 猛攻 玩家 ${pIdx + 1}，被玩家靈活翻滾閃避！`, 'info');
                        }
                    };

                    if (selectedSkill.type === 'single') {
                        const targets = activePlayers.filter(p => p.hp > 0);
                        if (targets.length > 0) {
                            const targetP = targets[Math.floor(Math.random() * targets.length)];
                            executeEnemyHit(targetP, activePlayers.indexOf(targetP), selectedSkill);
                        }
                    } else if (selectedSkill.type === 'multi') {
                        activePlayers.forEach((tp, pIdx) => { if (tp.hp > 0) executeEnemyHit(tp, pIdx, selectedSkill); });
                    } else if (selectedSkill.type === 'self') {
                        if (selectedSkill.buff) {
                            e.activeBuffs.push({
                                name: selectedSkill.buff.name, value: selectedSkill.buff.value || selectedSkill.buff.multiplier,
                                effect: selectedSkill.buff.effect || selectedSkill.buff.effectType, dur: selectedSkill.buff.dur || selectedSkill.buff.round, pending: true
                            });
                            if (verbose) battleLog(`[敵方] 使用 ${selectedSkill.name}！獲得 ${selectedSkill.buff.name} 狀態庇佑`, 'info');
                        }
                        if (selectedSkill.heal) {
                            const healAmt = e.maxHp * selectedSkill.heal;
                            e.hp = Math.min(e.maxHp, e.hp + healAmt);
                            if (verbose) battleLog(`[敵方] 使用 ${selectedSkill.name} 進行修復！恢復 ${Math.floor(healAmt).toLocaleString()} 生命`, 'success');
                        }
                    }
                    e.skillCDs[selectedSkill.name] = (selectedSkill.cd || 0) + 1;
                }
            }
            round++;
        }

        const win = e.hp <= 0;
        const playerStatus = activePlayers.map((p, idx) => ({
            name: `玩家 ${idx + 1}`, hp: Math.max(0, p.hp), isAlive: p.hp > 0
        }));

        if (verbose) {
            battleLog(`--------------------------------`, 'info');
            if (win) battleLog(`🏆 戰役勝利！冒險者隊伍成功於第 ${round - 1} 回合擊殺 ${enemy.name}！`, 'success');
            else if (round > maxRounds) battleLog(`⏳ 已突破 ${maxRounds} 回合最大極限限制，挑戰超時落敗。`, 'fail');
            else battleLog(`💀 挑戰失敗！冒險者隊伍全軍覆沒。`, 'fail');

            const statusLine = playerStatus.map(ps => `${ps.name}: ${ps.isAlive ? `存活 (${Math.floor(ps.hp).toLocaleString()})` : '陣亡'}`).join(' | ');
            battleLog(`[最終統計] ${statusLine}`, 'info');
        }

        return { win, playerStatus };
    }

    // Load enabled player list from storage
    function getBattleActivePlayers() {
        const activeList = [];
        for (let i = 1; i <= 3; i++) {
            const saved = localStorage.getItem(getStorageKey(i));
            let stats = i === 1 ? { ...DEFAULT_STATS } : (i === 2 ? { ...DEFAULT_P2 } : { ...DEFAULT_P3 });

            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    stats = { ...stats, ...parsed };
                } catch (e) { }
            }

            if (stats.isEnabled) {
                activeList.push(stats);
            }
        }
        return activeList;
    }

    // Single duel test runner
    function executeSingleCombatTest() {
        if (!currentEnemy || isSimulationRunning) return;
        if (combatLogPane) combatLogPane.innerHTML = '';

        const activePlayers = getBattleActivePlayers();
        if (activePlayers.length === 0) {
            battleLog('⚠️ 錯誤：至少需要 1 名啟用的玩家參與對決！請返回第一分頁設定 P1 加入戰鬥。', 'fail');
            return;
        }

        runBattleLoop(activePlayers, currentEnemy, true);
        updateWinMetrics(0, 0);
    }

    // Batch challenges simulator
    async function executeBatchChallengeSimulation() {
        if (!currentEnemy || isSimulationRunning) return;

        const countInput = document.getElementById('combat-repeat-count');
        const count = parseInt(countInput?.value) || 100;
        if (count <= 0) return;

        const activePlayers = getBattleActivePlayers();
        if (activePlayers.length === 0) {
            if (combatLogPane) combatLogPane.innerHTML = '';
            battleLog('⚠️ 錯誤：至少需要 1 名啟用的玩家參與對決！請返回設定。', 'fail');
            return;
        }

        isSimulationRunning = true;

        const testBtn = document.getElementById('btn-single-test');
        const startBtn = document.getElementById('btn-start-challenge');
        if (testBtn) testBtn.disabled = true;
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = '批次挑戰進行中...';
        }

        if (combatLogPane) combatLogPane.innerHTML = `<div class="log-entry log-info">🚀 開始執行 ${count} 次批次對戰模擬...</div>`;

        let wins = 0;
        const survivalCounts = activePlayers.map(() => 0);

        for (let i = 1; i <= count; i++) {
            const { win, playerStatus } = runBattleLoop(activePlayers, currentEnemy, false);
            if (win) wins++;
            playerStatus.forEach((ps, idx) => { if (ps.isAlive) survivalCounts[idx]++; });

            if (i % 10 === 0 || i === count) {
                updateWinMetrics(wins, i);
                if (i % 100 === 0) {
                    battleLog(`已完成第 ${i} / ${count} 輪模擬對決...`, 'info');
                    // Brief pause to allow browser UI updates
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
            }
        }

        battleLog(`===============================`, 'info');
        const winRate = ((wins / count) * 100).toFixed(2);
        battleLog(`🎯 模擬戰役結束！勝率總結：<b style="color:var(--primary); font-size:1.1rem;">${winRate}%</b>`, 'success');

        activePlayers.forEach((p, idx) => {
            const sRate = ((survivalCounts[idx] / count) * 100).toFixed(1);
            battleLog(`玩家 ${idx + 1} (P${idx + 1}) 存活率：${sRate}% (${survivalCounts[idx]}/${count})`, 'player');
        });

        isSimulationRunning = false;
        if (testBtn) testBtn.disabled = false;
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = '開始批次挑戰模擬';
        }
    }

    if (copyLogBtn) {
        copyLogBtn.onclick = () => {
            if (!combatLogPane) return;
            const entries = combatLogPane.querySelectorAll('.log-entry');
            if (entries.length === 0) {
                window.showToast('日誌內容為空，無法複製。');
                return;
            }
            // Extract plain text from each entry (strip HTML tags)
            const text = Array.from(entries)
                .map(el => el.innerText || el.textContent)
                .join('\n');
            navigator.clipboard.writeText(text).then(() => {
                window.showToast('✅ 戰鬥記錄已複製到剪貼簿！');
            }).catch(() => {
                window.showToast('⚠️ 複製失敗，請手動選取記錄內容。');
            });
        };
    }

    if (clearLogBtn) {
        clearLogBtn.onclick = () => {
            if (combatLogPane) {
                combatLogPane.innerHTML = '<div class="log-entry log-info">戰報日誌已清空。</div>';
            }
        };
    }
});
