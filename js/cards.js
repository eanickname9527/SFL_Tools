/**
 * SFL Tools Integrated Portal - Cards Gallery Module (js/cards.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Attribute Mappings from equips.js
    const ATTR_MAPPING = {
        'hp': '生命基值',
        'attack': '攻擊力',
        'shield': '護盾值',
        'atk_speed': '攻擊速度',
        'evade': '迴避率',
        'accuracy': '命中率',
        'penetrate': '護盾穿透',
        'other_bonus': '額外傷害',
        'luck': '運氣值',
        'star_point': '星值',
        'demonic_miasma_reduce': '魔瘴侵蝕'
    };

    const PERCENT_ATTRS = ['accuracy', 'other_bonus', 'evade'];

    // 2. Initial State
    let searchKeyword = '';
    let selectedChapter = 'all';
    let selectedAttribute = 'all';
    let selectedSortAttr = 'original';
    let selectedSortOrder = 'desc';

    // 3. Dynamically collect all attributes present in the database to populate selects
    const allAttributes = new Set();
    if (window.SFL_CARDS_DB) {
        window.SFL_CARDS_DB.forEach(card => {
            for (let levelKey in card.value) {
                const levelData = card.value[levelKey];
                Object.keys(levelData).forEach(key => {
                    const chineseKey = ATTR_MAPPING[key] || key;
                    allAttributes.add(chineseKey);
                });
            }
        });
    }

    // 4. Populate filters dynamically
    const cardAttrSelect = document.getElementById('card-attribute-select');
    const cardSortAttrSelect = document.getElementById('card-sort-attr-select');

    if (cardAttrSelect) {
        cardAttrSelect.innerHTML = '<option value="all">全部屬性</option>';
        Array.from(allAttributes).sort().forEach(attr => {
            const opt = document.createElement('option');
            opt.value = attr;
            opt.textContent = attr;
            cardAttrSelect.appendChild(opt);
        });
    }

    if (cardSortAttrSelect) {
        cardSortAttrSelect.innerHTML = '<option value="original">原始排序</option>';
        Array.from(allAttributes).sort().forEach(attr => {
            const opt = document.createElement('option');
            opt.value = attr;
            opt.textContent = attr;
            cardSortAttrSelect.appendChild(opt);
        });
    }

    // 5. Identify Card Chapter Category helper
    function getCardChapter(cardName) {
        if (!window.SORT_CARD_DB) return 'other';
        const found = window.SORT_CARD_DB.find(category => category.cardname.includes(cardName));
        return found ? found.id : 'other';
    }

    // Helper to get card color
    function getTitleColor(cardName, chapter) {
        return '#7eeff3ff';
    }

    // Helper to get rarity tag color
    function getRarityColor(quality) {
        if (quality === '傳說') return '#ff9e00'; // Gold/Orange
        if (quality === '超稀有') return '#d946ef'; // Purple
        if (quality === '稀有') return '#3b82f6'; // Blue
        if (quality === '罕見') return '#10b981'; // Green
        return '#94a3b8'; // Muted Slate
    }

    // 6. Render Card Gallery Function
    function updateCardsGallery() {
        const grid = document.getElementById('cards-grid');
        if (!grid || !window.SFL_CARDS_DB) return;

        grid.innerHTML = '';

        // Filter cards
        let filtered = window.SFL_CARDS_DB.filter(card => {
            // Keyword Filter
            if (searchKeyword && !card.name.toLowerCase().includes(searchKeyword.toLowerCase())) {
                return false;
            }

            // Chapter Filter
            const chapter = getCardChapter(card.name);
            if (selectedChapter !== 'all' && chapter !== selectedChapter) {
                return false;
            }

            // Attribute Filter
            if (selectedAttribute !== 'all') {
                const sampleVal = card.value?.['5'] || card.value?.['1'] || {};
                const hasAttr = Object.keys(sampleVal).some(key => (ATTR_MAPPING[key] || key) === selectedAttribute);
                if (!hasAttr) return false;
            }

            return true;
        });

        // Sort cards
        if (selectedSortAttr !== 'original') {
            filtered.sort((a, b) => {
                const getVal = (card) => {
                    const valData = card.value?.['5'] || card.value?.['1'] || {};
                    // Find database key that maps to selectedSortAttr
                    const dbKey = Object.keys(ATTR_MAPPING).find(k => ATTR_MAPPING[k] === selectedSortAttr);
                    const val = dbKey ? valData[dbKey] : undefined;

                    if (val === undefined) return 0;

                    // Parse values (convert percentage decimal or parse string integers)
                    return parseFloat(val);
                };

                const valA = getVal(a);
                const valB = getVal(b);

                return selectedSortOrder === 'asc' ? valA - valB : valB - valA;
            });
        }

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">找不到符合條件的卡片</div>';
            return;
        }

        // Build HTML cards elements
        filtered.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.dataset.rarity = card.quality;

            const chapter = getCardChapter(card.name);
            cardEl.dataset.chapter = chapter;
            const currentLevel = 5;

            // Extract clean display name
            const typeMatch = card.name.match(/^\[(.*?)\](.*)$/);
            const type = typeMatch ? typeMatch[1] : '其他';
            const displayName = typeMatch ? typeMatch[2].trim() : card.name;

            const titleStyle = `style="color: ${getTitleColor(card.name, chapter)};"`;

            cardEl.innerHTML = `
                <div class="card-header">
                    <span class="card-title" ${titleStyle} title="${card.name}">${displayName}</span>
                    <div class="card-tags">
                        <span class="tag" style="color: ${getRarityColor(card.quality)}">${card.quality}</span>
                        <span class="tag" style="color: var(--color-${chapter})">${chapter.toUpperCase()}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="attrs-container" id="attrs-container-${card.id}">
                        <!-- Attributes filled dynamically -->
                    </div>
                    <select class="level-selector" id="lvl-select-${card.id}">
                        <option value="1">等級 1</option>
                        <option value="2">等級 2</option>
                        <option value="3">等級 3</option>
                        <option value="4">等級 4</option>
                        <option value="5" selected>等級 5</option>
                    </select>
                </div>
            `;

            grid.appendChild(cardEl);

            // Populate attributes
            const attrsContainer = document.getElementById(`attrs-container-${card.id}`);
            const lvlSelect = document.getElementById(`lvl-select-${card.id}`);

            function updateCardAttributesUI(level) {
                if (!attrsContainer) return;
                attrsContainer.innerHTML = '';
                const bonus = card.value?.[level] || {};

                let count = 0;
                Object.entries(bonus).forEach(([key, val]) => {
                    const chineseKey = ATTR_MAPPING[key] || key;
                    const row = document.createElement('div');
                    row.className = 'attr-row';

                    // Highlight row if it is currently filtered or sorted
                    let style = '';
                    if (chineseKey === selectedAttribute) {
                        style = 'style="color: #FFD306; font-weight: bold;"';
                    } else if (chineseKey === selectedSortAttr) {
                        style = 'style="color: #00BB00; font-weight: bold;"';
                    }

                    let displayVal = val;
                    if (PERCENT_ATTRS.includes(key)) {
                        displayVal = `+${(val * 100).toFixed(1).replace(/\.0$/, '')}%`;
                    } else {
                        displayVal = `+${val}`;
                    }

                    row.innerHTML = `<span class="attr-name" ${style}>${chineseKey}</span><span class="attr-val">${displayVal}</span>`;
                    attrsContainer.appendChild(row);
                    count++;
                });

                if (count === 0) {
                    attrsContainer.innerHTML = '<span style="font-size:0.75rem; color:var(--text-dim)">無屬性加成</span>';
                }
            }

            // Initial paint
            updateCardAttributesUI(currentLevel);

            // Bind change events
            lvlSelect.addEventListener('change', (e) => {
                updateCardAttributesUI(e.target.value);
            });
        });
    }

    // 7. Bind Gallery Filters & Search Control
    const cardSearch = document.getElementById('card-search');
    const cardChapterSelect = document.getElementById('card-chapter-select');
    const cardSortAttrSelectElement = document.getElementById('card-sort-attr-select');
    const cardSortOrderSelectElement = document.getElementById('card-sort-order-select');

    if (cardSearch) {
        cardSearch.addEventListener('input', (e) => {
            searchKeyword = e.target.value;
            updateCardsGallery();
        });
    }
    if (cardChapterSelect) {
        cardChapterSelect.addEventListener('change', (e) => {
            selectedChapter = e.target.value;
            updateCardsGallery();
        });
    }
    if (cardAttrSelect) {
        cardAttrSelect.addEventListener('change', (e) => {
            selectedAttribute = e.target.value;
            updateCardsGallery();
        });
    }
    if (cardSortAttrSelectElement) {
        cardSortAttrSelectElement.addEventListener('change', (e) => {
            selectedSortAttr = e.target.value;
            updateCardsGallery();
        });
    }
    if (cardSortOrderSelectElement) {
        cardSortOrderSelectElement.addEventListener('change', (e) => {
            selectedSortOrder = e.target.value;
            updateCardsGallery();
        });
    }

    // Expose helpers globally so they can be triggered from app.js tab switches
    window.updateCardsGallery = updateCardsGallery;

    // Initial Gallery Draw
    updateCardsGallery();
});
