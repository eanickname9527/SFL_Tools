/**
 * Genesis 系統 - 等級增益資料庫 (data/character/genesis.js)
 * 用於根據角色等級提供額外的屬性與機制加成。
 * 採用宣告式資料設計 (Declarative Schema)，便於跨平台/跨模組直接進行 JSON 序列化與解析。
 */

// 創世加成配置資料表
const GENESIS_SYSTEM = [
    { 
        lv: 300, 
        name: "[特殊] 元素掌控 I", 
        desc: "屬性克制傷害 +25%", 
        // 屬性修改器列表，支援多屬性同時修改
        modifiers: [
            { target: "genesis_attr_dmg", operator: "add", value: 0.25 }
        ]
    },
    { 
        lv: 305, 
        name: "創世餘暉 I", 
        desc: "魔瘴侵蝕降低 5", 
        modifiers: [
            { target: "miasma_value", operator: "subtract", value: 5, min_limit: 0 } // 設定下限邊界為 0
        ]
    },
    { 
        lv: 310, 
        name: "會心一擊 I", 
        desc: "星值爆傷傷害 +5%", 
        modifiers: [
            { target: "genesis_crit_dmg", operator: "add", value: 0.05 }
        ]
    },
    { 
        lv: 315, 
        name: "最終傷害 I", 
        desc: "額外傷害加成 +5%", 
        modifiers: [
            { target: "bonus_dmg", operator: "add", value: 5 }
        ]
    },
    { 
        lv: 330, 
        name: "持久戰 I", 
        desc: "戰鬥回合上限 +1", 
        modifiers: [
            { target: "genesis_max_rounds", operator: "add", value: 1 }
        ]
    },
    { 
        lv: 375, 
        name: "[特殊] 絕對指令 I", 
        desc: "戰鬥開始敵方無法行動 1 次", 
        modifiers: [
            { target: "genesis_enemy_stun", operator: "add", value: 1 }
        ]
    },
    { 
        lv: 400, 
        name: "[特殊] 時空權能 I", 
        desc: "技能有 5% 機率無視冷卻 (會和艦船冷卻加成相加)", 
        modifiers: [
            { target: "genesis_cd_ignore", operator: "add", value: 5 }
        ]
    },
    { 
        lv: 450, 
        name: "[特殊] 元素掌控 II", 
        desc: "屬性克制傷害 +25% (累積 50%)", 
        modifiers: [
            { target: "genesis_attr_dmg", operator: "add", value: 0.25 }
        ]
    },
    { 
        lv: 475, 
        name: "[特殊] 時空權能 II", 
        desc: "無視冷卻機率 +2.5% (累積 7.5%)", 
        modifiers: [
            { target: "genesis_cd_ignore", operator: "add", value: 2.5 }
        ]
    },
    { 
        lv: 500, 
        name: "[特殊] 時空權能 III", 
        desc: "無視冷卻機率 +2.5% (累積 10%)", 
        modifiers: [
            { target: "genesis_cd_ignore", operator: "add", value: 2.5 }
        ]
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
            // 解析並套用宣告式的修改器列表
            if (buff.modifiers && Array.isArray(buff.modifiers)) {
                buff.modifiers.forEach(mod => {
                    const base = char[mod.target] || 0;
                    let finalVal = base;
                    
                    // 根據操作符進行運算
                    if (mod.operator === 'add') {
                        finalVal = base + mod.value;
                    } else if (mod.operator === 'subtract') {
                        finalVal = base - mod.value;
                    }
                    
                    // 邊界條件處理
                    if (mod.min_limit !== undefined) {
                        finalVal = Math.max(mod.min_limit, finalVal);
                    }
                    if (mod.max_limit !== undefined) {
                        finalVal = Math.min(mod.max_limit, finalVal);
                    }
                    
                    char[mod.target] = finalVal;
                });
            }
            appliedBuffs.push(buff);
        }
    });
    
    // 如果有啟用的增益，在戰鬥日誌中輸出提示
    if (appliedBuffs.length > 0 && typeof battleLog === 'function') {
        battleLog(`--- Genesis 系統啟動 (LV ${level}) ---`, 'success');
        appliedBuffs.forEach(buff => {
            battleLog(`啟用增益: 【${buff.name}】 - ${buff.desc}`, 'info');
        });
    }
    
    return appliedBuffs;
}

// 瀏覽器全域物件掛載
if (typeof window !== 'undefined') {
    window.GENESIS_SYSTEM = GENESIS_SYSTEM;
    window.applyGenesisSystem = applyGenesisSystem;
}

// Node.js 模組導出（用於單元測試或工具鏈解析）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GENESIS_SYSTEM, applyGenesisSystem };
}
