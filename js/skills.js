/**
 * SFL Tools Integrated Portal - Skill Upgrades Optimizer Module (js/skills.js)
 * Computes upgrade priority ranking based on round efficiency and elemental advantages.
 */

document.addEventListener('DOMContentLoaded', () => {
    const enemyAttr1Select = document.getElementById('enemy-attr-1');
    const enemyAttr2Select = document.getElementById('enemy-attr-2');
    const totalActionsInput = document.getElementById('total-actions');
    const tinisToggle = document.getElementById('tinis-toggle');
    const genesisControl = document.getElementById('genesis-control');
    const genesisHint = document.getElementById('genesis-bonus-hint');
    const skillListContainer = document.getElementById('skill-upgrade-ranks');

    // 1. Initialize Options and default setups
    function init() {
        if (enemyAttr1Select && enemyAttr2Select) {
            enemyAttr1Select.value = '火';
            enemyAttr2Select.value = '無';
        }

        // Attach listeners
        [enemyAttr1Select, enemyAttr2Select, tinisToggle, genesisControl].forEach(el => {
            if (el) {
                el.addEventListener('change', calculateUpgradeEfficiency);
            }
        });

        if (totalActionsInput) {
            totalActionsInput.addEventListener('input', calculateUpgradeEfficiency);
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

            const numUses = countUses(skillWaitRound, skillCD, totalActions);
            const efficiency = growthRate * numUses * totalMultiplier;

            results.push({
                name: skill.name,
                attr: displayAttr,
                ub: skillWaitRound,
                cd: skillCD,
                numUses,
                multiplier: totalMultiplier,
                efficiency: efficiency,
                growth: growthRate
            });
        });

        // Rank by efficiency from high to low
        results.sort((a, b) => b.efficiency - a.efficiency);

        renderRanks(results);
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

        skillListContainer.innerHTML = results.map((skill, index) => {
            const attrStyle = getElementStyle(skill.attr);

            // Apply HSL colors for higher ranks to make it feel extremely premium
            let borderStyle = 'border: 1px solid var(--border-glass);';
            let rankBadgeClass = 'rank-badge-normal';
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

            return `
                <div class="skill-card" style="${borderStyle} padding: 16px; border-radius: 12px; backdrop-filter: blur(10px); display: flex; flex-direction: column; gap: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="skill-rank-badge ${rankBadgeClass}">#${index + 1}</span>
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
    }

    // Run setup
    init();
});
