/**
 * SFL 戰鬥模擬器 - 屬性相剋資料表
 */

const ATTRIBUTE_DATA = {
    // 基礎屬性
    basic: ['火', '水', '自然', '雷', '光', '暗', '全'],
    // 寰宇屬性
    cosmic: ['宇', '宙', '源', '律']
};

const ELEMENT_MAP = {
    'pyro': '火', 'hydro': '水', 'nature': '自然', 'electro': '雷',
    'lumen': '光', 'light': '光', 'dark': '暗',
    'cosmos': '宇', 'universe': '宇',
    'chronos': '宙', 'spacetime': '宙',
    'origin': '源', 'law': '律', 'none': '無', 'all': '全'
};

/**
 * 取得屬性相剋倍率
 * @param {string} attacker - 攻擊方屬性
 * @param {string} defender - 防禦方屬性
 * @returns {number} 傷害倍率
 */
function getAttributeMultiplier(attacker, defender) {
    if (!attacker || !defender) return 1.0;

    // 1. 基礎屬性克制優勢 (+25% 傷害)
    const advantages = {
        '火': ['自然'],
        '水': ['火'],
        '雷': ['水'],
        '自然': ['雷'],
        '光': ['暗'],
        '暗': ['光'],
        '全': ['火', '水', '自然', '雷', '光', '暗', '無']
    };

    // 寰宇屬性克制優勢 (+50% 傷害)
    const cosmicAdvantages = {
        '宙': ['宇', '源'],
        '宇': ['宙', '源']
    };

    // 檢查優勢判定
    if (advantages[attacker] && advantages[attacker].includes(defender)) return 1.25;
    if (cosmicAdvantages[attacker] && cosmicAdvantages[attacker].includes(defender)) return 1.50;

    // 2. 基礎屬性克制劣勢 (-25% 傷害)
    const disadvantages = {
        '自然': ['火'],
        '火': ['水'],
        '水': ['雷'],
        '雷': ['自然']
    };
    // 基礎屬性被 全 克制
    if (ATTRIBUTE_DATA.basic.includes(attacker) && attacker !== '全' && defender === '全') return 0.75;
    if (disadvantages[attacker] && disadvantages[attacker].includes(defender)) return 0.75;

    // 3. 寰宇屬性克制劣勢
    // 全 打 宇/宙 (-95% 傷害)
    if (attacker === '全' && (defender === '宇' || defender === '宙')) return 0.05;

    // 其餘 打 宇/宙 (-50% 傷害)
    if ((defender === '宇' || defender === '宙')) {
        // 能走到這裡表示不是優勢 (宙打宇/宇打宙) 且不是 全打宇/宙
        return 0.50;
    }

    // 其餘 打 源/律 (-75% 傷害)
    if (defender === '源' || defender === '律') {
        // 能走到這裡表示不是優勢 (宇/宙 打 源)
        return 0.25;
    }

    return 1.0;
}

// 如果是在瀏覽器環境，掛載到 window 物件
if (typeof window !== 'undefined') {
    window.getAttributeMultiplier = getAttributeMultiplier;
    window.ELEMENT_MAP = ELEMENT_MAP;
}

// 如果是在 Node.js 環境，導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getAttributeMultiplier, ATTRIBUTE_DATA, ELEMENT_MAP };
}
