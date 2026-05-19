/**
 * Genesis 系統 - 等級增益資料庫
 * 用於根據角色等級提供額外的屬性與機制加成
 */
const GENESIS_SYSTEM = [
    { 
        lv: 300, 
        name: "[特殊] 元素掌控 I", 
        desc: "屬性克制傷害 +25%", 
        effect: (char) => { 
            char.genesis_attr_dmg = (char.genesis_attr_dmg || 0) + 0.25; 
        } 
    },
    { 
        lv: 305, 
        name: "創世餘暉 I", 
        desc: "魔瘴侵蝕降低 5", 
        effect: (char) => { 
            char.miasma_value = Math.max(0, (char.miasma_value || 0) - 5); 
        } 
    },
    { 
        lv: 310, 
        name: "會心一擊 I", 
        desc: "星值爆傷傷害 +5%", 
        effect: (char) => { 
            char.genesis_crit_dmg = (char.genesis_crit_dmg || 0) + 0.05; 
        } 
    },
    { 
        lv: 315, 
        name: "最終傷害 I", 
        desc: "額外傷害加成 +5%", 
        effect: (char) => { 
            char.bonus_dmg = (char.bonus_dmg || 0) + 5; 
        } 
    },
    { 
        lv: 330, 
        name: "持久戰 I", 
        desc: "戰鬥回合上限 +1", 
        effect: (char) => { 
            char.genesis_max_rounds = (char.genesis_max_rounds || 0) + 1; 
        } 
    },
    { 
        lv: 375, 
        name: "[特殊] 絕對指令 I", 
        desc: "戰鬥開始敵方無法行動 1 次", 
        effect: (char) => { 
            char.genesis_enemy_stun = (char.genesis_enemy_stun || 0) + 1; 
        } 
    },
    { 
        lv: 400, 
        name: "[特殊] 時空權能 I", 
        desc: "技能有 5% 機率無視冷卻 (會和艦船冷卻加成相加)", 
        effect: (char) => { 
            char.genesis_cd_ignore = (char.genesis_cd_ignore || 0) + 5; 
        } 
    },
    { 
        lv: 450, 
        name: "[特殊] 元素掌控 II", 
        desc: "屬性克制傷害 +25% (累積 50%)", 
        effect: (char) => { 
            char.genesis_attr_dmg = (char.genesis_attr_dmg || 0) + 0.25; 
        } 
    },
    { 
        lv: 475, 
        name: "[特殊] 時空權能 II", 
        desc: "無視冷卻機率 +2.5% (累積 7.5%)", 
        effect: (char) => { 
            char.genesis_cd_ignore = (char.genesis_cd_ignore || 0) + 2.5; 
        } 
    },
    { 
        lv: 500, 
        name: "[特殊] 時空權能 III", 
        desc: "無視冷卻機率 +2.5% (累積 10%)", 
        effect: (char) => { 
            char.genesis_cd_ignore = (char.genesis_cd_ignore || 0) + 2.5; 
        } 
    }
];

/**
 * 應用 Genesis 系統增益
 * @param {Object} char - 角色資料物件
 * @returns {Array} 已應用的增益清單
 */
function applyGenesisSystem(char) {
    const level = char.level || 0;
    const appliedBuffs = [];
    
    GENESIS_SYSTEM.forEach(buff => {
        if (level >= buff.lv) {
            buff.effect(char);
            appliedBuffs.push(buff);
        }
    });
    
    if (appliedBuffs.length > 0) {
        battleLog(`--- Genesis 系統啟動 (LV ${level}) ---`, 'success');
        appliedBuffs.forEach(buff => {
            battleLog(`啟用增益: 【${buff.name}】 - ${buff.desc}`, 'info');
        });
    }
    
    return appliedBuffs;
}
