/**
 * SFL 戰鬥模擬器 - 屬性相剋資料表 (data/skills/attribute.js)
 * 採用宣告式資料結構，將所有克制倍率與規則數據化，以利未來新增屬性與跨語言工具讀取。
 */

// 屬性清單定義
const ATTRIBUTE_DATA = {
    // 基礎屬性
    basic: ['火', '水', '自然', '雷', '光', '暗', '全', '無'],
    // 寰宇屬性
    cosmic: ['宇', '宙', '源', '律']
};

// 英文 ID 到中文屬性名稱映射表
const ELEMENT_MAP = {
    'pyro': '火', 'hydro': '水', 'nature': '自然', 'electro': '雷',
    'light': '光', 'dark': '暗',
    'universe': '宇',
    'spacetime': '宙',
    'origin': '源', 'law': '律', 'none': '無', 'all': '全'
};

// 1. 精確屬性相剋倍率對照表 [攻擊方][防禦方]
const ATTRIBUTE_MULTIPLIERS = {
    '火': {
        '自然': 1.25, // 基礎克制優勢 (+25% 傷害)
        '水': 0.75    // 基礎克制劣勢 (-25% 傷害)
    },
    '水': {
        '火': 1.25,
        '雷': 0.75
    },
    '雷': {
        '水': 1.25,
        '自然': 0.75
    },
    '自然': {
        '雷': 1.25,
        '火': 0.75
    },
    '光': {
        '暗': 1.25
    },
    '暗': {
        '光': 1.25
    },
    '宙': {
        '宇': 1.50, // 寰宇克制優勢 (+50% 傷害)
        '源': 1.50
    },
    '宇': {
        '宙': 1.50,
        '源': 1.50
    },
    // 全屬性主動攻擊時的倍率
    '全': {
        '火': 1.25, '水': 1.25, '自然': 1.25, '雷': 1.25,
        '光': 1.25, '暗': 1.25, '無': 1.25,
        '宇': 0.05, // 全 打 宇/宙 (-95% 傷害，受極端壓制)
        '宙': 0.05
    }
};

// 2. 防禦方的群組預設倍率對照表 (Fallback Rules)
// 當相剋對照表無精確匹配時，若防禦方為寰宇特定屬性，則套用此預設傷害減免倍率
const ATTRIBUTE_DEFENDER_FALLBACKS = {
    '宇': 0.50, // 其餘打 宇/宙 (-50% 傷害)
    '宙': 0.50,
    '源': 0.75, // 其餘打 源 (-25% 傷害)
    '律': 0.25  // 其餘打 律 (-75% 傷害)
};

// 3. 屬性攻擊/防禦特性定義表 (Attack/Defense Characteristics)
// 用於宣告特殊屬性的核心戰鬥機制與加成/防禦限制規則
const ATTRIBUTE_CHARACTERISTICS = {
    '全': {
        name: '全屬性',
        atk: {
            guaranteed_hit: true          // 攻擊時必定命中
        }
    },
    '源': {
        name: '源屬性',
        def: {
            disable_true_damage: true,    // 防禦時對方的真實傷害禁用
            disable_guaranteed_hit: true  // 防禦時對方的必中傷害禁用
        }
    },
    '律': {
        name: '律屬性',
        atk: {
            guaranteed_hit: true,         // 攻擊時必定命中
            ignore_shield: true,          // 攻擊時無視護盾值
            level_diff_max: true          // 攻擊時等差傷害視為最大值
        },
        def: {
            disable_true_damage: true     // 防禦時對方的真實傷害禁用
        }
    }
};

/**
 * 取得屬性相剋倍率
 * @param {string} attacker - 攻擊方屬性
 * @param {string} defender - 防禦方屬性
 * @returns {number} 傷害倍率
 */
function getAttributeMultiplier(attacker, defender) {
    if (!attacker || !defender) return 1.0;

    // 1. 優先查明確定定義的相剋矩陣
    if (ATTRIBUTE_MULTIPLIERS[attacker] && ATTRIBUTE_MULTIPLIERS[attacker][defender] !== undefined) {
        return ATTRIBUTE_MULTIPLIERS[attacker][defender];
    }

    // 2. 特殊對稱規則處理 (例如基礎屬性打 '全' 被壓制減傷 -25%)
    if (defender === '全' && ATTRIBUTE_DATA.basic.includes(attacker) && attacker !== '全') {
        return 0.75;
    }

    // 3. 套用防禦方群組預設減免倍率
    if (ATTRIBUTE_DEFENDER_FALLBACKS[defender] !== undefined) {
        return ATTRIBUTE_DEFENDER_FALLBACKS[defender];
    }

    return 1.0;
}

/**
 * 取得屬性攻防特性整合結果
 * @param {string} atkAttrStr - 攻擊方屬性字串 (例如 "全、水")
 * @param {string} defAttrStr - 防禦方屬性字串 (例如 "源")
 * @returns {Object} 屬性特性整合結果物件
 */
function getAttributeCombatCharacteristics(atkAttrStr, defAttrStr) {
    const characteristics = {
        guaranteed_hit: false,
        true_damage: false,
        ignore_shield: false,
        level_diff_max: false
    };

    const atkAttrs = (atkAttrStr || '').split(/[、,]/).map(s => s.trim()).filter(s => s);
    const defAttrs = (defAttrStr || '').split(/[、,]/).map(s => s.trim()).filter(s => s);

    // 1. 收集攻擊方所有屬性的攻擊特性
    let hasGuaranteedHit = false;
    let hasIgnoreShield = false;
    let hasLevelDiffMax = false;
    let hasTrueDamage = false; // 保留擴展性

    for (const attr of atkAttrs) {
        const charData = ATTRIBUTE_CHARACTERISTICS[attr];
        if (charData && charData.atk) {
            if (charData.atk.guaranteed_hit) hasGuaranteedHit = true;
            if (charData.atk.ignore_shield) hasIgnoreShield = true;
            if (charData.atk.level_diff_max) hasLevelDiffMax = true;
            if (charData.atk.true_damage) hasTrueDamage = true;
        }
    }

    // 2. 收集防禦方所有屬性的防禦限制特性
    let disableTrueDamage = false;
    let disableGuaranteedHit = false;

    for (const attr of defAttrs) {
        const charData = ATTRIBUTE_CHARACTERISTICS[attr];
        if (charData && charData.def) {
            if (charData.def.disable_true_damage) disableTrueDamage = true;
            if (charData.def.disable_guaranteed_hit) disableGuaranteedHit = true;
        }
    }

    // 3. 合併攻防規則，套用禁用優先級
    characteristics.guaranteed_hit = hasGuaranteedHit && !disableGuaranteedHit;
    characteristics.true_damage = hasTrueDamage && !disableTrueDamage;
    characteristics.ignore_shield = hasIgnoreShield;
    characteristics.level_diff_max = hasLevelDiffMax;
    characteristics.disable_true_damage = disableTrueDamage;
    characteristics.disable_guaranteed_hit = disableGuaranteedHit;

    return characteristics;
}

/**
 * 取得屬性攻擊特性整合結果 (向後相容舊調用)
 * @param {string} attrString - 技能或攻擊屬性字串
 * @returns {Object} 屬性特性整合結果物件
 */
function getAttributeCharacteristics(attrString) {
    return getAttributeCombatCharacteristics(attrString, '');
}

// 瀏覽器全域物件掛載
if (typeof window !== 'undefined') {
    window.getAttributeMultiplier = getAttributeMultiplier;
    window.ELEMENT_MAP = ELEMENT_MAP;
    window.ATTRIBUTE_DATA = ATTRIBUTE_DATA;
    window.ATTRIBUTE_MULTIPLIERS = ATTRIBUTE_MULTIPLIERS;
    window.ATTRIBUTE_DEFENDER_FALLBACKS = ATTRIBUTE_DEFENDER_FALLBACKS;
    window.ATTRIBUTE_CHARACTERISTICS = ATTRIBUTE_CHARACTERISTICS;
    window.getAttributeCharacteristics = getAttributeCharacteristics;
    window.getAttributeCombatCharacteristics = getAttributeCombatCharacteristics;
}

// Node.js 模組導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getAttributeMultiplier,
        ATTRIBUTE_DATA,
        ELEMENT_MAP,
        ATTRIBUTE_MULTIPLIERS,
        ATTRIBUTE_DEFENDER_FALLBACKS,
        ATTRIBUTE_CHARACTERISTICS,
        getAttributeCharacteristics,
        getAttributeCombatCharacteristics
    };
}
