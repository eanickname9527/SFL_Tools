/**
 * SFL Tools Integrated Portal - Skill Upgrades Optimizer Module (js/skills.js)
 * Computes upgrade priority ranking based on round efficiency and elemental advantages.
 */

document.addEventListener('DOMContentLoaded', () => {
    const enemyAttr1Select = document.getElementById('enemy-attr-1');
    const enemyAttr2Select = document.getElementById('enemy-attr-2');
    const totalActionsInput = document.getElementById('total-actions');
    const tinisToggle = document.getElementById('tinis-toggle');
    const futureDebuffToggle = document.getElementById('future-debuff-toggle');
    const genesisControl = document.getElementById('genesis-control');
    const genesisHint = document.getElementById('genesis-bonus-hint');
    const skillListContainer = document.getElementById('skill-upgrade-ranks');
    const saveBtn = document.getElementById('skills-save-btn');
    const detailsToggle = document.getElementById('details-toggle');
    const disabledSkills = new Set();

    const getStorageKey = (key) => {
        const pathPrefix = window.location.pathname.replace(/\/[^\/]*$/, '/');
        return `sfl_${pathPrefix}_skills_${key}`;
    };

    // Load saved settings from localStorage
    function loadSettings() {
        const saved = localStorage.getItem(getStorageKey('settings'));
        if (saved) {
            try {
                const s = JSON.parse(saved);
                if (enemyAttr1Select && s.eAttr1 !== undefined) enemyAttr1Select.value = s.eAttr1;
                if (enemyAttr2Select && s.eAttr2 !== undefined) enemyAttr2Select.value = s.eAttr2;
                if (totalActionsInput && s.totalActions !== undefined) totalActionsInput.value = s.totalActions;
                if (tinisToggle && s.tinis !== undefined) tinisToggle.checked = s.tinis;
                if (futureDebuffToggle && s.futureDebuff !== undefined) futureDebuffToggle.checked = s.futureDebuff;
                if (genesisControl && s.genesis !== undefined) genesisControl.value = s.genesis;
                if (detailsToggle && s.details !== undefined) detailsToggle.checked = s.details;
            } catch (e) {
                // Ignore corrupted data
            }
        }

        // 載入關閉的技能
        const savedDisabled = localStorage.getItem(getStorageKey('disabled_skills'));
        if (savedDisabled) {
            try {
                const list = JSON.parse(savedDisabled);
                if (Array.isArray(list)) {
                    disabledSkills.clear();
                    list.forEach(id => disabledSkills.add(id));
                }
            } catch (e) {
                // Ignore
            }
        }
    }

    // Save current settings to localStorage
    function saveSettings() {
        const s = {
            eAttr1: enemyAttr1Select ? enemyAttr1Select.value : '火',
            eAttr2: enemyAttr2Select ? enemyAttr2Select.value : '無',
            totalActions: totalActionsInput ? totalActionsInput.value : '10',
            tinis: tinisToggle ? tinisToggle.checked : false,
            futureDebuff: futureDebuffToggle ? futureDebuffToggle.checked : false,
            genesis: genesisControl ? genesisControl.value : 'none',
            details: detailsToggle ? detailsToggle.checked : true
        };
        localStorage.setItem(getStorageKey('settings'), JSON.stringify(s));
        if (typeof window.showToast === 'function') window.showToast('技能計算設定已保存！');
    }

    // 1. Initialize Options and default setups
    function init() {
        // Apply defaults first, then overwrite with saved settings
        if (enemyAttr1Select && enemyAttr2Select) {
            enemyAttr1Select.value = '火';
            enemyAttr2Select.value = '無';
        }
        if (detailsToggle) {
            detailsToggle.checked = true;
        }
        loadSettings();

        // Attach listeners
        [enemyAttr1Select, enemyAttr2Select, tinisToggle, futureDebuffToggle, genesisControl, detailsToggle].forEach(el => {
            if (el) {
                el.addEventListener('change', calculateUpgradeEfficiency);
            }
        });

        if (totalActionsInput) {
            totalActionsInput.addEventListener('input', calculateUpgradeEfficiency);
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', saveSettings);
        }

        // 註冊全部啟用與全部關閉按鈕事件
        const enableAllBtn = document.getElementById('skills-enable-all-btn');
        const disableAllBtn = document.getElementById('skills-disable-all-btn');

        if (enableAllBtn) {
            enableAllBtn.addEventListener('click', () => {
                disabledSkills.clear();
                localStorage.setItem(getStorageKey('disabled_skills'), JSON.stringify([]));
                calculateUpgradeEfficiency();
            });
        }

        if (disableAllBtn) {
            disableAllBtn.addEventListener('click', () => {
                if (window.SFL_SKILLS_DB) {
                    window.SFL_SKILLS_DB.filter(s => ['atk', 'debuff_atk', 'dot_atk'].includes(s.type)).forEach(skill => {
                        disabledSkills.add(skill.id);
                    });
                    localStorage.setItem(getStorageKey('disabled_skills'), JSON.stringify(Array.from(disabledSkills)));
                    calculateUpgradeEfficiency();
                }
            });
        }

        // 註冊開關事件監聽 (事件委託)
        if (skillListContainer) {
            skillListContainer.addEventListener('change', (event) => {
                if (event.target && event.target.classList.contains('skill-toggle-input')) {
                    const skillId = event.target.getAttribute('data-skill-id');
                    const isChecked = event.target.checked;
                    if (isChecked) {
                        disabledSkills.delete(skillId);
                    } else {
                        disabledSkills.add(skillId);
                    }
                    localStorage.setItem(getStorageKey('disabled_skills'), JSON.stringify(Array.from(disabledSkills)));
                    calculateUpgradeEfficiency();
                }
            });
        }

        // Initial Calculation
        calculateUpgradeEfficiency();
    }

    // 2. Count actions count limits in battles
    function countUses(ub, cd, totalActions) {
        if (totalActions < ub + 1) return 0;
        return 1 + Math.floor((totalActions - ub - 1) / (cd + 1));
    }

    // 3. Calculate efficiency and rank
    function calculateUpgradeEfficiency() {
        if (!enemyAttr1Select || !enemyAttr2Select || !totalActionsInput || !skillListContainer) return;

        if (typeof window.SFL_SKILLS_DB === 'undefined' || typeof window.getAttributeMultiplier === 'undefined') {
            skillListContainer.innerHTML = '<div style="color: var(--color-attack); text-align: center; padding: 20px;">找不到技能資料庫或屬性判定工具。</div>';
            return;
        }

        const eAttr1 = enemyAttr1Select.value;
        const eAttr2 = enemyAttr2Select.value;
        const totalActions = parseInt(totalActionsInput.value) || 10;
        const isTinisActive = tinisToggle ? tinisToggle.checked : false;
        const isFutureDebuffActive = futureDebuffToggle ? futureDebuffToggle.checked : false;

        // 偵測敵方是否具有 disable_true_damage 與 disable_guaranteed_hit 特性
        let enemyDisableTrueDamage = false;
        let enemyDisableGuaranteedHit = false;
        if (typeof window.getAttributeCombatCharacteristics === 'function') {
            const targetAttr = [eAttr1, eAttr2].filter(a => a && a !== '無').join('、');
            const eChars = window.getAttributeCombatCharacteristics('', targetAttr);
            enemyDisableTrueDamage = eChars.disable_true_damage || false;
            enemyDisableGuaranteedHit = eChars.disable_guaranteed_hit || false;
        }

        // Map Genesis control selection values
        let elementBonus = 0.00;
        const genesisVal = genesisControl ? genesisControl.value : 'none';
        if (genesisVal === '1') elementBonus = 0.25;
        else if (genesisVal === '2') elementBonus = 0.50;

        // Update hint text
        if (genesisHint) {
            genesisHint.textContent = `創世增幅：屬性克制傷害 +${Math.round(elementBonus * 100)}%`;
        }

        const results = [];

        // Filter for skills of type "atk", "debuff_atk", and "dot_atk" from SFL_SKILLS_DB
        const atkSkills = window.SFL_SKILLS_DB.filter(s => ['atk', 'debuff_atk', 'dot_atk'].includes(s.type));

        const mapObj = window.ELEMENT_MAP || {};

        atkSkills.forEach(skill => {
            // Map technical element array strings to Chinese display strings
            const skillAttrs = (skill.element || []).map(e => mapObj[e] || e);
            const displayAttr = skillAttrs.join('、') || '無';

            // growthRate is multiplierperlvl directly as specified by user
            const growthRate = skill.multiplierperlvl || 0;

            let multipliers = [];
            const activeAttrs = [];
            if (eAttr1 !== '無') activeAttrs.push(eAttr1);
            if (eAttr2 !== '無') activeAttrs.push(eAttr2);

            if (activeAttrs.length === 0) {
                // Both are '無'
                skillAttrs.forEach(sa => {
                    multipliers.push(window.getAttributeMultiplier(sa, '無'));
                });
            } else {
                skillAttrs.forEach(sa => {
                    activeAttrs.forEach(ea => {
                        multipliers.push(window.getAttributeMultiplier(sa, ea));
                    });
                });
            }

            // ① Raw restraint multiplier (Average between double attributes)
            let rawMultiplier;
            if (multipliers.length === 0) {
                rawMultiplier = 1.0;
            } else {
                rawMultiplier = multipliers.reduce((a, b) => a + b, 0) / multipliers.length;
            }

            // ② Apply Genesis element controls if the multiplier is greater than 1.0 (advantaged)
            let totalMultiplier = rawMultiplier;
            if (rawMultiplier > 1.0) {
                totalMultiplier += elementBonus;
            }

            // Apply Tinis helper CD reduction and waitRound reduction
            let skillCD = skill.cd || 0;
            let skillWaitRound = skill.waitRound || 0;
            if (isTinisActive) {
                // Tinis shortens waitRound by 3 rounds and cooldowns by 1 round
                skillWaitRound = Math.max(0, skillWaitRound - 3);
                skillCD = Math.max(0, skillCD - 1);
            }

            let numUses = countUses(skillWaitRound, skillCD, totalActions);
            if (isFutureDebuffActive && ((skill.element || []).includes('all') || skill.type === 'dot_atk')) {
                numUses = 0;
            }
            if (enemyDisableTrueDamage && skill.type === 'dot_atk') {
                numUses = 0;
            }
            if (enemyDisableGuaranteedHit && (skill.element || []).includes('all')) {
                numUses = 0;
            }
            const efficiency = growthRate * numUses * totalMultiplier;

            results.push({
                id: skill.id,
                name: skill.name,
                attr: displayAttr,
                ub: skillWaitRound,
                cd: skillCD,
                numUses,
                multiplier: totalMultiplier,
                efficiency: efficiency,
                growth: growthRate,
                disabled: disabledSkills.has(skill.id)
            });
        });

        // 區分啟用與禁用的技能
        const activeResults = results.filter(r => !r.disabled);
        const disabledResults = results.filter(r => r.disabled);

        // 僅對啟用的技能進行效益排序 (高到低)
        activeResults.sort((a, b) => b.efficiency - a.efficiency);

        // 合併結果，排序後的啟用技能在前，禁用技能在後
        const finalResults = [...activeResults, ...disabledResults];

        // Expose current efficiency ranks globally for the fast-import tool
        window.currentSkillEfficiencyRanks = finalResults;

        renderRanks(finalResults);
    }

    // 4. Render Rank Layout
    function renderRanks(results) {
        if (results.length === 0) {
            skillListContainer.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 20px;">無相符的攻擊技能。</div>';
            return;
        }

        function getElementStyle(attr) {
            switch (attr) {
                case '火':
                    return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }; // Red
                case '水':
                    return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }; // Blue
                case '自然':
                    return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }; // Green
                case '雷':
                    return { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }; // Yellow
                case '光':
                    return { bg: 'rgba(253, 224, 71, 0.15)', color: '#fde047' }; // Gold/Yellow
                case '暗':
                    return { bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }; // Purple/Violet
                case '全':
                    return { bg: 'rgba(126, 239, 243, 0.15)', color: '#7eeff3' }; // Cyan
                case '宇':
                case '宙':
                case '源':
                case '律':
                    return { bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }; // Cosmic Pink/Magenta
                default:
                    return { bg: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0' };
            }
        }

        const showDetails = detailsToggle ? detailsToggle.checked : true;

        if (showDetails) {
            skillListContainer.className = 'skill-grid';
            skillListContainer.innerHTML = results.map((skill, index) => {
                const attrStyle = getElementStyle(skill.attr);

                // Apply HSL colors for higher ranks to make it feel extremely premium
                let borderStyle = 'border: 1px solid var(--border-glass);';
                let rankBadgeClass = 'rank-badge-normal';
                let rankText = `#${index + 1}`;
                let opacityStyle = '';

                if (skill.disabled) {
                    borderStyle = 'border: 1px solid rgba(255, 255, 255, 0.05); background: rgba(255, 255, 255, 0.02);';
                    rankBadgeClass = 'rank-badge-disabled';
                    rankText = '關閉';
                    opacityStyle = 'opacity: 0.55;';
                } else {
                    if (index === 0) {
                        borderStyle = 'border: 1px solid rgba(255, 210, 63, 0.4); background: rgba(255, 210, 63, 0.08);';
                        rankBadgeClass = 'rank-badge-gold';
                    } else if (index === 1) {
                        borderStyle = 'border: 1px solid rgba(168, 85, 247, 0.4); background: rgba(168, 85, 247, 0.08);';
                        rankBadgeClass = 'rank-badge-silver';
                    } else if (index === 2) {
                        borderStyle = 'border: 1px solid rgba(78, 201, 176, 0.4); background: rgba(78, 201, 176, 0.08);';
                        rankBadgeClass = 'rank-badge-bronze';
                    }
                }

                return `
                    <div class="skill-card" style="${borderStyle} padding: 16px; border-radius: 12px; backdrop-filter: blur(10px); display: flex; flex-direction: column; gap: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease; ${opacityStyle}">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span class="skill-rank-badge ${rankBadgeClass}">${rankText}</span>
                                <label class="skill-switch" title="啟用/關閉排序">
                                    <input type="checkbox" class="skill-toggle-input" data-skill-id="${skill.id}" ${skill.disabled ? '' : 'checked'}>
                                    <span class="skill-slider"></span>
                                </label>
                            </div>
                            <span style="font-size: 0.8rem; padding: 2px 8px; border-radius: 99px; background: ${attrStyle.bg}; color: ${attrStyle.color}; border: 1px solid ${attrStyle.color}33; font-weight: 600;">
                                ${skill.attr} 屬性
                            </span>
                        </div>
                        <div>
                            <h4 style="font-size: 1.1rem; margin: 0; font-weight: bold; color: var(--text-main);">${skill.name}</h4>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-top: 1px solid var(--border-glass); padding-top: 10px; margin-top: 5px;">
                            <span style="font-size: 0.8rem; color: #7eeff3;">CD冷卻: <b style="color: var(--text-main);">${skill.cd} 回合</b></span>
                            <span style="font-size: 0.8rem; color: #7eeff3;">等待回合: <b style="color: var(--text-main);">${skill.ub} 回合</b></span>
                            <span style="font-size: 0.8rem; color: #7eeff3;">可用次數: <b style="color: var(--primary);">${skill.numUses} 次</b></span>
                            <span style="font-size: 0.8rem; color: #7eeff3;">克制倍率: <b style="color: var(--accent);">${skill.multiplier.toFixed(2)}x</b></span>
                            <span style="font-size: 0.8rem; color: #7eeff3; grid-column: span 2;">每級成長: <b style="color: var(--text-main);">${skill.growth.toFixed(2)}</b></span>
                        </div>
                        <div style="border-top: 1px solid var(--border-glass); padding-top: 12px; margin-top: 5px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.75rem; color: #7eeff3;">升級效益分值：</span>
                            <span style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">${skill.efficiency.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            skillListContainer.className = 'skill-grid-compact';
            skillListContainer.innerHTML = results.map((skill, index) => {
                const attrStyle = getElementStyle(skill.attr);

                let borderStyle = 'border: 1px solid var(--border-glass);';
                let rankBadgeClass = 'rank-badge-normal';
                let rankText = `#${index + 1}`;
                let opacityStyle = '';

                if (skill.disabled) {
                    borderStyle = 'border: 1px solid rgba(255, 255, 255, 0.05); background: rgba(255, 255, 255, 0.02);';
                    rankBadgeClass = 'rank-badge-disabled';
                    rankText = '關閉';
                    opacityStyle = 'opacity: 0.55;';
                } else {
                    if (index === 0) {
                        borderStyle = 'border: 1px solid rgba(255, 210, 63, 0.4); background: rgba(255, 210, 63, 0.08);';
                        rankBadgeClass = 'rank-badge-gold';
                    } else if (index === 1) {
                        borderStyle = 'border: 1px solid rgba(168, 85, 247, 0.4); background: rgba(168, 85, 247, 0.08);';
                        rankBadgeClass = 'rank-badge-silver';
                    } else if (index === 2) {
                        borderStyle = 'border: 1px solid rgba(78, 201, 176, 0.4); background: rgba(78, 201, 176, 0.08);';
                        rankBadgeClass = 'rank-badge-bronze';
                    }
                }

                return `
                    <div class="skill-card-compact" style="${borderStyle} ${opacityStyle}">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="skill-rank-badge ${rankBadgeClass}" style="min-width: 42px; text-align: center;">${rankText}</span>
                            <label class="skill-switch" title="啟用/關閉排序">
                                <input type="checkbox" class="skill-toggle-input" data-skill-id="${skill.id}" ${skill.disabled ? '' : 'checked'}>
                                <span class="skill-slider"></span>
                            </label>
                        </div>
                        <h4 style="font-size: 1.05rem; margin: 0; font-weight: bold; color: var(--text-main); flex-grow: 1;">${skill.name}</h4>
                        <span style="font-size: 0.8rem; padding: 2px 8px; border-radius: 99px; background: ${attrStyle.bg}; color: ${attrStyle.color}; border: 1px solid ${attrStyle.color}33; font-weight: 600;">
                            ${skill.attr} 屬性
                        </span>
                    </div>
                `;
            }).join('');
        }
    }

    // Run setup
    init();

    // === 快速導入 SFL 核心邏輯 ===
    const fastImportToggle = document.getElementById('fast-import-toggle');
    const fastImportContainer = document.getElementById('fast-import-container');
    const fastFileInput = document.getElementById('fast-import-sfl-input');
    const fastFilenameDisplay = document.getElementById('fast-import-filename');
    const fastLoadSelect = document.getElementById('fast-import-load-select');
    const fastSaveSelect = document.getElementById('fast-import-save-select');
    const fastShipSelect = document.getElementById('fast-ship-level-select');
    const fastExecuteBtn = document.getElementById('fast-import-execute-btn');
    const fastImportInfo = document.getElementById('fast-import-info');

    let fastDecodedData = null;

    // 1. 折疊開關控制
    if (fastImportToggle && fastImportContainer) {
        fastImportToggle.addEventListener('change', () => {
            if (fastImportToggle.checked) {
                fastImportContainer.style.display = 'flex';
                // 當打開時，若已有全域載入的 SFL 資料，則自動同步
                if (window.sflDecodedData) {
                    syncFromGlobalData();
                }
            } else {
                fastImportContainer.style.display = 'none';
            }
        });
    }

    // 2. 監聽全域 SFL 資料載入事件（實現雙向同步）
    window.addEventListener('sfl-data-loaded', (e) => {
        if (e.detail.source === 'fast-import') return;
        fastDecodedData = e.detail.data;
        if (fastFilenameDisplay && e.detail.filename) {
            fastFilenameDisplay.textContent = `📄 ${e.detail.filename}`;
        }
        populateFastDropdowns();
        enableFastControls();
        if (fastImportInfo) {
            fastImportInfo.textContent = '提示：已自動同步大廳載入的 SFL 資料配置！可以直接設定分頁並執行導入。';
            fastImportInfo.style.color = 'var(--primary)';
        }
    });

    function syncFromGlobalData() {
        if (window.sflDecodedData) {
            fastDecodedData = window.sflDecodedData;
            if (fastFilenameDisplay && window.sflFilename) {
                fastFilenameDisplay.textContent = `📄 ${window.sflFilename}`;
            }
            populateFastDropdowns();
            enableFastControls();
        }
    }

    // 3. 處理點擊載入檔案
    if (fastFileInput) {
        fastFileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            if (fastFilenameDisplay) fastFilenameDisplay.textContent = `📄 ${file.name}`;
            if (fastImportInfo) {
                fastImportInfo.textContent = '提示：載入成功，請選擇分頁以進行點數優化分配。';
                fastImportInfo.style.color = 'var(--primary)';
            }

            try {
                const text = await file.text();
                fastDecodedData = decodeSFLDataFast(text);

                // 同步給全域與多人副本模組
                window.sflDecodedData = fastDecodedData;
                window.sflFilename = file.name;
                window.dispatchEvent(new CustomEvent('sfl-data-loaded', {
                    detail: { data: fastDecodedData, filename: file.name, source: 'fast-import' }
                }));

                populateFastDropdowns();
                enableFastControls();
                if (typeof window.showToast === 'function') {
                    window.showToast('成功載入 .sfl 備份檔案！');
                }
            } catch (e) {
                if (fastImportInfo) {
                    fastImportInfo.textContent = '⚠️ 載入失敗：' + e.message;
                    fastImportInfo.style.color = '#ef4444';
                }
                if (fastFilenameDisplay) fastFilenameDisplay.textContent = '';
                console.error(e);
            }
        });
    }

    function populateFastDropdowns() {
        if (!fastDecodedData) return;
        fillFastSelect(fastLoadSelect, fastDecodedData.sfl_skill_slot_names, fastDecodedData.sfl_skill_loadouts);
        fillFastSelect(fastSaveSelect, fastDecodedData.sfl_skill_slot_names, fastDecodedData.sfl_skill_loadouts);
    }

    function fillFastSelect(select, names, data) {
        if (!select) return;
        select.innerHTML = '<option value="">-- 請選擇分頁 --</option>';
        if (!names) return;

        Object.entries(names).forEach(([id, name]) => {
            const hasData = data && data[id] !== null && data[id] !== undefined;
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = `${id}. ${name}`;
            if (!hasData) {
                opt.style.color = '#555';
            }
            select.appendChild(opt);
        });
    }

    function enableFastControls() {
        if (fastLoadSelect) fastLoadSelect.disabled = false;
        if (fastSaveSelect) fastSaveSelect.disabled = false;
        if (fastExecuteBtn) fastExecuteBtn.disabled = false;
    }

    // 4. 解碼與編碼演算法
    function decodeSFLDataFast(raw) {
        const str = raw.trim();
        if (str.startsWith('{')) return JSON.parse(str);
        if (!str.startsWith('SFL1:')) throw new Error('格式不正確 (遺失 SFL1 標頭)');

        const parts = str.split(':');
        if (parts.length < 3) throw new Error('格式不正確 (段落不足)');

        const savedChecksum = parseInt(parts[1], 10);
        const b64 = parts.slice(2).join(':');
        const jsonStr = decodeURIComponent(escape(atob(b64)));

        let checksum = 0;
        for (let i = 0; i < jsonStr.length; i += 7) {
            checksum = (checksum + jsonStr.charCodeAt(i)) % 65521;
        }

        if (checksum !== savedChecksum) {
            throw new Error('資料已被篡改，校驗碼比對失敗');
        }

        return JSON.parse(jsonStr);
    }

    function sanitizeLoadouts(data) {
        if (!data) return;

        // 1. sfl_stat_loadouts
        if (data.sfl_stat_loadouts && typeof data.sfl_stat_loadouts === 'object') {
            Object.keys(data.sfl_stat_loadouts).forEach(key => {
                const slot = data.sfl_stat_loadouts[key];
                if (slot && typeof slot === 'object') {
                    const originalStats = slot.stats || {};
                    const cleanSlot = {
                        timestamp: typeof slot.timestamp === 'number' ? slot.timestamp : Date.now(),
                        stats: {
                            hp: typeof originalStats.hp === 'number' ? originalStats.hp : Number(originalStats.hp) || 0,
                            attack: typeof originalStats.attack === 'number' ? originalStats.attack : Number(originalStats.attack) || 0,
                            luck: typeof originalStats.luck === 'number' ? originalStats.luck : Number(originalStats.luck) || 0,
                            atk_speed: typeof originalStats.atk_speed === 'number' ? originalStats.atk_speed : Number(originalStats.atk_speed) || 0
                        },
                        playerLevel: typeof slot.playerLevel === 'number' ? slot.playerLevel : 429,
                        availableStatPoints: typeof slot.availableStatPoints === 'number' ? slot.availableStatPoints : 0
                    };
                    data.sfl_stat_loadouts[key] = cleanSlot;
                }
            });
        }

        // 2. sfl_skill_loadouts
        if (data.sfl_skill_loadouts && typeof data.sfl_skill_loadouts === 'object') {
            const defaultSkills = (window.SFL_SKILLS_DB && Array.isArray(window.SFL_SKILLS_DB)) 
                ? window.SFL_SKILLS_DB.map(s => s.id) 
                : [
                    "slash", "fireball", "shadow_slash", "emergency_heal", "fighting_buff", 
                    "evade_buff", "fire_arrow", "stone_bomb", "cursed_strike", "poison_blade", 
                    "flame_sword", "spiritual_meditation", "lightning_curse", "elemental_convergence", 
                    "acid_spray", "holy_star", "ultimate_strike", "divine_protection", "big_heal", 
                    "Dawn", "tidal_slash", "corrosive_touch", "druid_wind_fist", "holy_light_slash", 
                    "elemental_convergence_2", "absolute_judgment", "thunder_pulse", "fountain_of_eternity", 
                    "accuraccy_buff", "dark_dragon_curse", "starfire_apocalypse", "void_erosion", 
                    "star_crash_sword", "immortal_will", "thunder_god_roar", "water_erosion", 
                    "soul_blessing", "savage_shock", "ultimate_burst", "starfall", 
                    "order_judgment", "astral_end", "storm_hunt", "skybreak_strike", "photon_hack"
                ];
            Object.keys(data.sfl_skill_loadouts).forEach(key => {
                const slot = data.sfl_skill_loadouts[key];
                if (slot && typeof slot === 'object') {
                    const originalSkills = slot.skills || {};
                    const cleanSkills = {};
                    defaultSkills.forEach(skillKey => {
                        cleanSkills[skillKey] = typeof originalSkills[skillKey] === 'number' ? originalSkills[skillKey] : Number(originalSkills[skillKey]) || 0;
                    });
                    const cleanSlot = {
                        timestamp: typeof slot.timestamp === 'number' ? slot.timestamp : Date.now(),
                        skills: cleanSkills,
                        playerLevel: typeof slot.playerLevel === 'number' ? slot.playerLevel : 429,
                        totalSkillPoints: typeof slot.totalSkillPoints === 'number' ? slot.totalSkillPoints : 0
                    };
                    data.sfl_skill_loadouts[key] = cleanSlot;
                }
            });
        }

        // 3. sfl_card_loadouts
        if (data.sfl_card_loadouts && typeof data.sfl_card_loadouts === 'object') {
            const allowedCardKeys = ["1", "2", "3", "4", "5"];
            Object.keys(data.sfl_card_loadouts).forEach(key => {
                const slot = data.sfl_card_loadouts[key];
                if (slot && typeof slot === 'object') {
                    const originalCards = slot.cards || {};
                    const cleanCards = {};
                    allowedCardKeys.forEach(cardKey => {
                        if (originalCards[cardKey] !== undefined) {
                            cleanCards[cardKey] = originalCards[cardKey];
                        }
                    });
                    const cleanSlot = {
                        timestamp: typeof slot.timestamp === 'number' ? slot.timestamp : Date.now(),
                        cards: cleanCards
                    };
                    data.sfl_card_loadouts[key] = cleanSlot;
                }
            });
        }
    }

    function encodeExportDataFast(data) {
        // Clean and validate loadouts structure before final export encoding
        sanitizeLoadouts(data);

        const jsonStr = JSON.stringify(data);
        const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
        let checksum = 0;
        for (let i = 0; i < jsonStr.length; i += 7) {
            checksum = (checksum + jsonStr.charCodeAt(i)) % 65521;
        }
        return 'SFL1:' + checksum + ':' + b64;
    }

    // 5. 快速導入分配按鈕執行
    if (fastExecuteBtn) {
        fastExecuteBtn.addEventListener('click', async () => {
            if (!fastDecodedData) return;

            const loadSlotId = fastLoadSelect.value;
            const saveSlotId = fastSaveSelect.value;

            if (!loadSlotId || !saveSlotId) {
                await window.showCustomAlert('⚠️ 槽位選取提示', '請選擇載入與儲存的分頁槽位。');
                return;
            }

            const sourceSlot = fastDecodedData.sfl_skill_loadouts[loadSlotId];
            if (!sourceSlot) {
                await window.showCustomAlert('⚠️ 資料遺失提示', '載入分頁沒有可讀取的技能數據。');
                return;
            }

            // 1. 篩選所有攻擊技能 ('atk', 'debuff_atk', 'dot_atk')
            if (!window.SFL_SKILLS_DB) {
                await window.showCustomAlert('⚠️ 資料庫遺失提示', '找不到技能資料庫，無法執行分配。');
                return;
            }
            const atkSkillsInDB = window.SFL_SKILLS_DB.filter(s => ['atk', 'debuff_atk', 'dot_atk'].includes(s.type));

            // 2. 建立目標技能配置 (深拷貝選單 a)
            const targetSkills = { ...(sourceSlot.skills || {}) };

            // 3. 計算原配置中所有攻擊型技能等級之和
            let originalAtkPoints = 0;
            atkSkillsInDB.forEach(skill => {
                const lvl = Number(targetSkills[skill.id] || 0);
                originalAtkPoints += lvl;
            });

            // 4. 可分配到攻擊技能點數總和 = (所有攻擊技能點數總和) + (totalSkillPoints)
            const originalTotalPoints = Number(sourceSlot.totalSkillPoints || 0);
            let totalAttackPoints = originalAtkPoints + originalTotalPoints;
            const absoluteTotalPoints = totalAttackPoints; // 備份總額

            // 5. 將所有攻擊技能重置為最低配置 (啟用技能為 1 等，禁用技能為 0 等)
            atkSkillsInDB.forEach(skill => {
                if (disabledSkills.has(skill.id)) {
                    targetSkills[skill.id] = 0;
                } else {
                    targetSkills[skill.id] = 1;
                    totalAttackPoints -= 1;
                }
            });
            totalAttackPoints = Math.max(0, totalAttackPoints); // 確保防呆，不小於 0

            // 獲取當前設定下的技能效益排行
            const ranks = window.currentSkillEfficiencyRanks || [];
            if (ranks.length === 0) {
                await window.showCustomAlert('⚠️ 效益排行遺失', '當前無可供分配的技能排行，請確保在上方「技能效益計算」中有成功的排行結果。');
                return;
            }

            // 獲取艦船等級加成
            const shipLevel = fastShipSelect ? fastShipSelect.value : '0';
            let shipBonus = 0;
            if (shipLevel === '1') shipBonus = 10;
            else if (shipLevel === '3') shipBonus = 20;

            let allocatedCount = 0;
            let detailLog = [];

            // 6. 依據效益高低排序分派剩餘 of the attack skills' points
            if (totalAttackPoints > 0) {
                for (let i = 0; i < ranks.length; i++) {
                    const rankItem = ranks[i];
                    // 跳過禁用的技能，不參與點數分配
                    if (rankItem.disabled) continue;

                    // 找出技能 id 與 maxlvl
                    const skillObj = window.SFL_SKILLS_DB.find(s => s.name === rankItem.name);
                    if (!skillObj) continue;

                    const sId = skillObj.id;
                    const maxLvl = Number(skillObj.maxlvl || 10);
                    const limit = maxLvl + shipBonus;

                    const currentLvl = Number(targetSkills[sId] || 1); // 當前重置後是 1

                    if (currentLvl < limit) {
                        const needed = limit - currentLvl;
                        if (totalAttackPoints >= needed) {
                            targetSkills[sId] = limit;
                            totalAttackPoints -= needed;
                            allocatedCount += needed;
                            detailLog.push(`【${rankItem.name}】重設 1 級後，升滿至 ${limit} 級 (分配 ${needed} 點)`);
                        } else {
                            targetSkills[sId] = currentLvl + totalAttackPoints;
                            allocatedCount += totalAttackPoints;
                            detailLog.push(`【${rankItem.name}】重設 1 級後，升至 ${currentLvl + totalAttackPoints} 級 (分配全部剩餘 ${totalAttackPoints} 點)`);
                            totalAttackPoints = 0;
                        }
                    }

                    if (totalAttackPoints <= 0) break;
                }
            }

            // 寫回儲存分頁 (選單 b)
            if (!fastDecodedData.sfl_skill_loadouts[saveSlotId]) {
                fastDecodedData.sfl_skill_loadouts[saveSlotId] = {
                    skills: {},
                    playerLevel: sourceSlot.playerLevel || 429
                };
            }

            fastDecodedData.sfl_skill_loadouts[saveSlotId].skills = targetSkills;

            // 依要求將新的配置儲存，並強制設定 totalSkillPoints 為 0
            fastDecodedData.sfl_skill_loadouts[saveSlotId].totalSkillPoints = 0;
            fastDecodedData.sfl_skill_loadouts[saveSlotId].timestamp = Date.now();

            // 觸發全域 SFL 資料同步
            const currentFilename = window.sflFilename || 'backup.sfl';
            window.sflDecodedData = fastDecodedData;
            window.dispatchEvent(new CustomEvent('sfl-data-loaded', {
                detail: { data: fastDecodedData, filename: currentFilename, source: 'fast-import' }
            }));

            // 先跳出確認通知，使用者按確定才開始下載，按取消則終止下載
            let msg = `可分配攻擊技能點數總和: ${absoluteTotalPoints} 點 (其中重設 1 級保留消耗了 ${absoluteTotalPoints - totalAttackPoints - allocatedCount} 點，分配了 ${allocatedCount} 點，剩餘 ${totalAttackPoints} 點)。\n\n您是否要下載優化後的 .sfl 備份檔案？`;
            if (detailLog.length > 0) {
                msg += `\n\n升級詳情:\n` + detailLog.join('\n');
            }

            const isConfirmed = await showCustomConfirm('✅ 導入配置計算完成！', msg);
            if (!isConfirmed) {
                if (typeof window.showToast === 'function') {
                    window.showToast('已取消下載備份檔！');
                }
                return; // 直接中止，不觸發下載
            }

            // 自動編碼下載
            try {
                const encoded = encodeExportDataFast(fastDecodedData);
                const blob = new Blob([encoded], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const originalName = currentFilename.replace('.sfl', '');
                a.href = url;
                a.download = `${originalName}_fast_imported.sfl`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                if (typeof window.showToast === 'function') {
                    window.showToast('優化分配成功，備份檔已下載！');
                }
            } catch (e) {
                console.error(e);
                await window.showCustomAlert('❌ 匯出失敗提示', '點數分配成功，但自動匯出下載失敗: ' + e.message);
            }
        });
    }

    // Expose globally for app.js tab-switch trigger
    window.calculateSkillUpgrades = calculateUpgradeEfficiency;
});
