/**
 * SFL Tools Integrated Portal - Loadout Management Module (js/loadout.js)
 * Handles decoding, validation, importing and exporting .sfl files
 */

(function () {
    let decodedData = null;
    let skillDatabase = {};
    const cardDatabase = {};

    const BASE_STATS = {
        hp: 5,
        attack: 20,
        luck: 10,
        atk_speed: 100,
        shield: 0,
        evasion: 10,
        hit_rate: 100,
        shield_pen: 0,
        bonus_dmg: 0
    };

    // DOM Elements
    const importBtn = document.getElementById('import-sfl-btn');
    const exportBtn = document.getElementById('export-sfl-btn');
    const fileInput = document.getElementById('import-sfl-input');
    const filenameDisplay = document.getElementById('sfl-filename');
    const loadoutInfo = document.getElementById('loadout-info');
    const statSelect = document.getElementById('stat-slot-select');
    const skillSelect = document.getElementById('skill-slot-select');
    const cardSelect = document.getElementById('card-slot-select');

    // Reverse mapping for skills
    const reverseSkillMap = {};

    // Initialize
    function init() {
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }
        if (importBtn) {
            importBtn.addEventListener('click', importSelectedLoadouts);
        }
        if (exportBtn) {
            exportBtn.addEventListener('click', exportConfiguration);
        }

        // Load Databases from local JS source
        if (window.SFL_SKILLS_DB) {
            window.SFL_SKILLS_DB.forEach(s => {
                skillDatabase[s.id] = s.name;
                reverseSkillMap[s.name] = s.id;
            });
        }
        if (window.SFL_CARDS_DB) {
            window.SFL_CARDS_DB.forEach(c => cardDatabase[c.id] = c.name);
        }

        console.log('Loadout database sync completed:', {
            skills: Object.keys(skillDatabase).length,
            cards: Object.keys(cardDatabase).length
        });
    }

    // Run initialization
    init();

    /**
     * Decode SFL data (Decrypt logic from backup system)
     */
    function decodeSFLData(raw) {
        const str = raw.trim();
        if (str.startsWith('{')) return JSON.parse(str);
        if (!str.startsWith('SFL1:')) throw new Error('格式不正確 (遺失 SFL1 標頭)');

        const parts = str.split(':');
        if (parts.length < 3) throw new Error('格式不正確 (段落不足)');

        const savedChecksum = parseInt(parts[1], 10);
        const b64 = parts.slice(2).join(':');
        const jsonStr = decodeURIComponent(escape(atob(b64)));

        // Verify checksum
        let checksum = 0;
        for (let i = 0; i < jsonStr.length; i += 7) {
            checksum = (checksum + jsonStr.charCodeAt(i)) % 65521;
        }

        if (checksum !== savedChecksum) {
            throw new Error('資料已被篡改，校驗碼比對失敗 (Checksum mismatch)');
        }

        return JSON.parse(jsonStr);
    }

    /**
     * Encode SFL data back into safe Base64 format
     */
    function encodeExportData(data) {
        const jsonStr = JSON.stringify(data);
        const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
        let checksum = 0;
        for (let i = 0; i < jsonStr.length; i += 7) {
            checksum = (checksum + jsonStr.charCodeAt(i)) % 65521;
        }
        return 'SFL1:' + checksum + ':' + b64;
    }

    /**
     * Handle file selection and populate selectors
     */
    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Reset UI labels
        if (filenameDisplay) filenameDisplay.textContent = `📄 ${file.name}`;
        if (loadoutInfo) {
            loadoutInfo.textContent = '提示：請選擇要導入的配置分頁，然後點擊「導入選擇配置」。';
            loadoutInfo.style.color = 'var(--primary)';
        }

        try {
            const text = await file.text();
            decodedData = decodeSFLData(text);

            populateDropdowns();

            // Enable controls
            if (statSelect) statSelect.disabled = false;
            if (skillSelect) skillSelect.disabled = false;
            if (cardSelect) cardSelect.disabled = false;
            if (importBtn) importBtn.disabled = false;
            if (exportBtn) exportBtn.disabled = false;

            window.showToast('成功載入 .sfl 備份檔案！');
        } catch (e) {
            if (loadoutInfo) {
                loadoutInfo.textContent = '⚠️ 載入失敗：' + e.message;
                loadoutInfo.style.color = '#ef4444';
            }
            if (filenameDisplay) filenameDisplay.textContent = '';
            console.error('Failed to load SFL backup:', e);
            window.showToast('載入備份檔案失敗，請檢查格式。');
        }
    }

    /**
     * Populate dropdown menus from decoded data
     */
    function populateDropdowns() {
        if (statSelect) fillSelect(statSelect, decodedData.sfl_stat_slot_names, decodedData.sfl_stat_loadouts);
        if (skillSelect) fillSelect(skillSelect, decodedData.sfl_skill_slot_names, decodedData.sfl_skill_loadouts);
        if (cardSelect) fillSelect(cardSelect, decodedData.sfl_card_slot_names, decodedData.sfl_card_loadouts);
    }

    function fillSelect(select, names, data) {
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

    /**
     * Import selected loadouts into the UI forms
     */
    function importSelectedLoadouts() {
        if (!decodedData) return;

        let importCount = 0;
        let finalStats = { ...BASE_STATS };
        let importNames = [];

        // 1. Get Stat Points from sfl_stat_loadouts
        const statId = statSelect?.value;
        if (statId && decodedData.sfl_stat_loadouts && decodedData.sfl_stat_loadouts[statId]) {
            const statPoints = decodedData.sfl_stat_loadouts[statId].stats || {};

            // Sync to Detailed UI forms
            updateInputValue('detail-hp', statPoints.hp || 0);
            updateInputValue('detail-attack', statPoints.attack || 0);
            updateInputValue('detail-luck', statPoints.luck || 0);
            updateInputValue('detail-atk_speed', statPoints.atk_speed || 0);

            // Add points to final stats
            finalStats.hp += (statPoints.hp || 0);
            finalStats.attack += (statPoints.attack || 0);
            finalStats.luck += (statPoints.luck || 0);
            finalStats.atk_speed += (statPoints.atk_speed || 0);

            const name = decodedData.sfl_stat_slot_names[statId] || statId;
            importNames.push(`能力加點[${name}]`);
            importCount++;
        }

        // 2. Import Skills
        const skillId = skillSelect?.value;
        if (skillId && decodedData.sfl_skill_loadouts && decodedData.sfl_skill_loadouts[skillId]) {
            const skills = decodedData.sfl_skill_loadouts[skillId].skills || {};
            
            // Clear current skills form first by setting to 0
            const inputs = document.querySelectorAll('#skills-form input[type="number"]');
            inputs.forEach(input => {
                input.value = 0;
            });

            // Set new skill values
            Object.entries(skills).forEach(([id, lvl]) => {
                const skillName = skillDatabase[id];
                if (skillName) {
                    updateInputValue(skillName, lvl);
                } else {
                    updateInputValue(id, lvl);
                }
            });
            const name = decodedData.sfl_skill_slot_names[skillId] || skillId;
            importNames.push(`技能等級[${name}]`);
            importCount++;
        }

        // 3. Import Card Slots
        const cardId = cardSelect?.value;
        if (cardId && decodedData.sfl_card_loadouts && decodedData.sfl_card_loadouts[cardId]) {
            const cards = decodedData.sfl_card_loadouts[cardId].cards || {};

            // Update slot selectors
            Object.entries(cards).forEach(([slot, cid]) => {
                const slotNum = parseInt(slot);
                if (slotNum >= 1 && slotNum <= 5) {
                    updateInputValue(`card-slot-${slotNum}`, cid || '');
                    updateInputValue(`card-lv-${slotNum}`, 5);
                }
            });

            // Calculate card sum values
            Object.values(cards).forEach(cid => {
                if (!cid) return;
                const cardData = window.SFL_CARDS_DB ? window.SFL_CARDS_DB.find(c => c.id === cid) : null;
                if (cardData && cardData.value && cardData.value["5"]) {
                    const bonus = cardData.value["5"];
                    if (bonus.hp) finalStats.hp += bonus.hp;
                    if (bonus.attack) finalStats.attack += bonus.attack;
                    if (bonus.luck) finalStats.luck += bonus.luck;
                    if (bonus.atk_speed) finalStats.atk_speed += bonus.atk_speed;
                    if (bonus.shield) finalStats.shield += bonus.shield;
                    if (bonus.evade) finalStats.evasion += (bonus.evade * 100);
                    if (bonus.accuracy) finalStats.hit_rate += (bonus.accuracy * 100);
                    if (bonus.penetrate) finalStats.shield_pen += bonus.penetrate;
                    if (bonus.other_bonus) finalStats.bonus_dmg += (bonus.other_bonus * 100);
                }
            });

            const name = decodedData.sfl_card_slot_names[cardId] || cardId;
            importNames.push(`卡片插槽[${name}]`);
            importCount++;
        }

        // Apply Final Stats to active Player Form
        if (statId || cardId) {
            // Enable detailed toggle automatically
            const detailedToggle = document.getElementById('detailed-settings-toggle');
            if (detailedToggle && !detailedToggle.checked) {
                detailedToggle.checked = true;
                detailedToggle.dispatchEvent(new Event('change'));
            }

            if (window.populateCardSelects) window.populateCardSelects();
            if (window.updateFinalStatsFromDetailed) window.updateFinalStatsFromDetailed();

            updateInputValue('hp', Math.round(finalStats.hp));
            updateInputValue('attack', Math.round(finalStats.attack));
            updateInputValue('luck', Math.round(finalStats.luck));
            updateInputValue('atk_speed', Math.round(finalStats.atk_speed));
            updateInputValue('shield', Math.round(finalStats.shield));
            updateInputValue('evasion', Math.round(finalStats.evasion));
            updateInputValue('hit_rate', Math.round(finalStats.hit_rate));
            updateInputValue('shield_pen', Math.round(finalStats.shield_pen));
            updateInputValue('bonus_dmg', Math.round(finalStats.bonus_dmg));
        }

        if (importCount > 0) {
            if (loadoutInfo) {
                loadoutInfo.textContent = `✅ 成功導入：${importNames.join('、')}！請記得保存設定。`;
                loadoutInfo.style.color = '#4ec9b0';
            }
            window.showToast('配置導入成功，已寫入屬性/技能欄位！');

            // Force save current active player state to persist
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn) saveBtn.click();
        } else {
            if (loadoutInfo) {
                loadoutInfo.textContent = '⚠️ 請至少選擇一個分頁槽位進行導入。';
                loadoutInfo.style.color = '#ffd23f';
            }
        }
    }

    /**
     * Export current values back to a .sfl backup file
     */
    function exportConfiguration() {
        if (!decodedData) return;

        const statId = statSelect?.value;
        const skillId = skillSelect?.value;
        const cardId = cardSelect?.value;

        if (!statId && !skillId && !cardId) {
            alert('請至少選擇一個分頁槽位作為寫回目標。');
            return;
        }

        const isConfirmed = confirm('您確定要將目前的「加點屬性/卡片配置」與「技能等級」覆蓋回備份檔中，並匯出下載新檔案嗎？');
        if (!isConfirmed) return;

        const now = Date.now();

        // 1. Update Stats (Points Allocation)
        if (statId) {
            if (!decodedData.sfl_stat_loadouts) decodedData.sfl_stat_loadouts = {};
            if (!decodedData.sfl_stat_loadouts[statId]) {
                decodedData.sfl_stat_loadouts[statId] = { stats: {}, playerLevel: 429, availableStatPoints: 0 };
            }
            decodedData.sfl_stat_loadouts[statId].stats = {
                hp: Number(document.getElementById('detail-hp')?.value || 0),
                attack: Number(document.getElementById('detail-attack')?.value || 0),
                luck: Number(document.getElementById('detail-luck')?.value || 0),
                atk_speed: Number(document.getElementById('detail-atk_speed')?.value || 0)
            };
            decodedData.sfl_stat_loadouts[statId].timestamp = now;
        }

        // 2. Update Skills (Skill Levels Form)
        if (skillId) {
            if (!decodedData.sfl_skill_loadouts) decodedData.sfl_skill_loadouts = {};
            if (!decodedData.sfl_skill_loadouts[skillId]) {
                decodedData.sfl_skill_loadouts[skillId] = { skills: {}, playerLevel: 429, totalSkillPoints: 0 };
            }
            const currentSkills = decodedData.sfl_skill_loadouts[skillId].skills || {};

            // Map all known skill names from form inputs back to their database IDs
            Object.keys(currentSkills).forEach(sId => {
                const sName = skillDatabase[sId];
                if (sName) {
                    const uiInput = document.getElementById(sName);
                    currentSkills[sId] = uiInput ? Number(uiInput.value || 0) : 0;
                } else {
                    currentSkills[sId] = 0;
                }
            });

            // Catch any new skills not originally present
            Object.entries(reverseSkillMap).forEach(([sName, sId]) => {
                if (currentSkills[sId] === undefined) {
                    const uiInput = document.getElementById(sName);
                    if (uiInput) currentSkills[sId] = Number(uiInput.value || 0);
                }
            });

            decodedData.sfl_skill_loadouts[skillId].timestamp = now;
        }

        // 3. Update Cards (Equipped Card Selects)
        if (cardId) {
            if (!decodedData.sfl_card_loadouts) decodedData.sfl_card_loadouts = {};
            if (!decodedData.sfl_card_loadouts[cardId]) {
                decodedData.sfl_card_loadouts[cardId] = { cards: {} };
            }
            const currentCards = {};
            for (let i = 1; i <= 5; i++) {
                currentCards[i.toString()] = document.getElementById(`card-slot-${i}`)?.value || null;
            }
            decodedData.sfl_card_loadouts[cardId].cards = currentCards;
            decodedData.sfl_card_loadouts[cardId].timestamp = now;
        }

        try {
            // Encode Base64
            const encoded = encodeExportData(decodedData);

            // Trigger file download
            const blob = new Blob([encoded], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const originalName = filenameDisplay?.textContent.replace('📄 ', '').replace('.sfl', '') || 'backup';
            a.href = url;
            a.download = `${originalName}_modified.sfl`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (loadoutInfo) {
                loadoutInfo.textContent = '✅ 新備份配置檔案匯出下載成功！';
                loadoutInfo.style.color = '#4ec9b0';
            }
            window.showToast('遊戲備份設定匯出成功！');
        } catch (e) {
            console.error('Export configuration error:', e);
            alert('匯出失敗：' + e.message);
        }
    }

    function updateInputValue(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
})();
