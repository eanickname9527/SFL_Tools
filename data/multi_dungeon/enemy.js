/**
 * SFL 敵人資料庫
 * 根據 data/html/ex_dungeon/EXBoss.json 資料同步更新
 */
const ENEMY_DATABASE = [
    {
        id: 'e1',
        name: '白金使者',
        description: '鋼鐵都市深處，機構異常震動。伴隨著雷光閃現，一名白金色身影自空間裂隙中現形。「雷擊啟動——戰鬥模組上線。」白金使者低聲宣告，雙眼閃爍冷冽青光，雷鳴刀應聲出鞘，劍尖激盪電弧。',
        level: 30,
        attribute: '雷',
        hp: 8000,
        attack: 230,
        shield: 150,
        hit_rate: 90,
        evasion: 8,
        atk_speed: 150,
        shield_pen: 30,
        skills: [
            { name: '量子入侵', multi: 1.2, cd: 1, type: 'single', threshold: 100 },
            { name: '白金斬擊', multi: 1.2, cd: 2, type: 'single', threshold: 100 },
            { name: '電磁波', multi: 0.8, cd: 2, type: 'multi', threshold: 100 },
            { name: '雷霆風暴', multi: 1.0, cd: 4, type: 'multi', threshold: 70 },
            { name: '雷鳴一閃', multi: 1.8, cd: 6, type: 'single', threshold: 45 }
        ]
    },
    {
        id: 'e2',
        name: '幻境巨獸',
        description: '裂口撕開空間，巨爪橫掃而出。幻境巨獸咆哮著降臨，帶來扭曲現實的恐懼波動。牠是夢魘的源頭，能吞噬魔力與理智。這不是單純的戰鬥，而是生存考驗。準備迎戰潘朵拉的惡夢吧。',
        level: 50,
        attribute: '暗',
        hp: 17000,
        attack: 590,
        shield: 250,
        hit_rate: 100,
        evasion: 40,
        atk_speed: 200,
        shield_pen: 90,
        skills: [
            { name: '潛伏襲擊', multi: 1.4, cd: 2, type: 'single', threshold: 100 },
            { name: '暗影利爪', multi: 1.2, cd: 1, type: 'single', threshold: 100 },
            { name: '黑暗擴散', multi: 0.7, cd: 3, type: 'multi', threshold: 100 },
            { name: '虛空崩塌', multi: 1.8, cd: 7, type: 'multi', threshold: 30 },
            { name: '末日一擊', multi: 2.2, cd: 6, type: 'multi', threshold: 15 }
        ]
    },
    {
        id: 'e3',
        name: '神化信使',
        description: '它靜靜降臨，並未先攻擊，而是掃描全場。這不是尋常械具，而是代表「王命」的意志延伸。若你選擇對抗，便等同於向天啟王本人宣戰。神化信使，即將執行毀滅命令。',
        level: 70,
        attribute: '雷',
        hp: 44000,
        attack: 1200,
        shield: 400,
        hit_rate: 100,
        evasion: 20,
        atk_speed: 250,
        shield_pen: 100,
        skills: [
            { name: '爆裂狙擊', multi: 1.25, cd: 1, type: 'single', threshold: 100 },
            { name: '全彈幕射擊', multi: 0.9, cd: 3, type: 'multi', threshold: 75 },
            { name: '巨爆手榴彈', multi: 1.5, cd: 5, type: 'multi', threshold: 35 },
            { name: '鎖定狙擊', multi: 1.8, cd: 1, type: 'single', threshold: 30 },
            { name: '守護者之怒', multi: 2.0, cd: 8, type: 'multi', threshold: 15 }
        ]
    },
    {
        id: 'e4',
        name: '亞斯塔路',
        description: '「龍王教」五賢者之一，忠實踐行著阿瓦隆的命令。被指派在雲空大陸行動，隨著世間的紛爭與混亂而現身。手持蘊含混沌魔劍碎片之力的「混沌魔弓」，同時掌控火與冰兩種元素，因此亦有「冰與火的魔術師」之稱。',
        level: 90,
        attribute: '火、水',
        hp: 165000,
        attack: 4000,
        shield: 350,
        hit_rate: 120,
        evasion: 40,
        atk_speed: 300,
        shield_pen: 200,
        skills: [
            { name: '冰之箭矢', multi: 1.15, cd: 1, type: 'single', threshold: 100 },
            { name: '火之箭矢', multi: 1.3, cd: 2, type: 'single', threshold: 100 },
            { name: '精彩的魔術表演', multi: 0.9, cd: 3, type: 'multi', threshold: 75 },
            { name: '混沌箭矢', multi: 1.5, cd: 3, type: 'multi', threshold: 50 },
            { name: '死亡之舞', multi: 1.9, cd: 1, type: 'single', threshold: 30 },
            { name: '冰火五重奏', multi: 2.0, cd: 8, type: 'multi', threshold: 15 }
        ]
    },
    {
        id: 'e5',
        name: '主教墨洛伊克',
        description: '赤血教堂的樞機主教。在波羅斯賦予絕滅項鍊的焰火後，大火吞噬了他，卻未焚盡信仰。如今的他，只剩燃燒的骷髏與永不止息的獻祭之火。「信仰即焰，靈魂即薪。成為灰燼吧。」',
        level: 110,
        attribute: '火',
        hp: 220000,
        attack: 10000,
        shield: 400,
        hit_rate: 150,
        evasion: 50,
        atk_speed: 350,
        shield_pen: 300,
        skills: [
            { name: '焰火一擊', multi: 1.2, cd: 1, type: 'single', threshold: 100 },
            { name: '絕滅波動', multi: 0.9, cd: 2, type: 'multi', threshold: 100 },
            { name: '焚燒自我', multi: 1.4, cd: 4, type: 'multi', threshold: 75 },
            { name: '焰火燒滅', multi: 2.0, cd: 5, type: 'single', threshold: 50 },
            { name: '火之屠戮', multi: 2.5, cd: 8, type: 'multi', threshold: 15 }
        ]
    },
    {
        id: 'e6',
        name: '完全之龍．伊格斯邦',
        description: '吞噬希露薇亞後逃離並長大成為巨龍的伊格斯邦。仍然在追尋著自己存在的意義。「母親...，我將找到您...」',
        level: 130,
        attribute: '水',
        hp: 275000,
        attack: 22000,
        shield: 450,
        hit_rate: 200,
        evasion: 50,
        atk_speed: 350,
        shield_pen: 400,
        skills: [
            { name: '龍爪', multi: 1.3, cd: 1, type: 'single', threshold: 100 },
            { name: '瀑水龍息', multi: 1.0, cd: 2, type: 'multi', threshold: 100 },
            { name: '龍吼', multi: 1.5, cd: 3, type: 'multi', threshold: 80 },
            { name: '水牢', multi: 2.2, cd: 4, type: 'single', threshold: 60 },
            { name: '巨龍振翅', multi: 1.8, cd: 5, type: 'multi', threshold: 40 },
            { name: '龍族威壓', multi: 2.5, cd: 7, type: 'multi', threshold: 20 },
            { name: '末日', multi: 3.0, cd: 10, type: 'multi', threshold: 10 }
        ]
    },
    {
        id: 'e7',
        name: '卡姆蘭',
        description: '「我不是祂，我也不是祂的影子。」他凝視眾生，聲音飄渺。「造物主也是有想要看看世界的時候」有時候，那一位存在會捏出一個身體在伊甸徘徊，看看三界的現況。「但願阿瓦隆不會發現我。」',
        level: 150,
        attribute: '光',
        hp: 330000,
        attack: 30000,
        shield: 450,
        hit_rate: 200,
        evasion: 60,
        atk_speed: 400,
        shield_pen: 500,
        skills: [
            { name: '原初之擊', multi: 1.4, cd: 1, type: 'single', threshold: 100 },
            { name: '聖光波動', multi: 1.1, cd: 2, type: 'multi', threshold: 100 },
            { name: '虛無吞噬', multi: 1.6, cd: 3, type: 'multi', threshold: 85 },
            { name: '概念抹除', multi: 2.4, cd: 4, type: 'single', threshold: 70 },
            { name: '現實湮滅', multi: 2.0, cd: 5, type: 'multi', threshold: 55 },
            { name: '原初混沌', multi: 2.5, cd: 6, type: 'multi', threshold: 40 },
            { name: '宇宙重置', multi: 2.5, cd: 8, type: 'multi', threshold: 25 },
            { name: '絕對毀滅', multi: 3.0, cd: 12, type: 'multi', threshold: 10 }
        ]
    },
    {
        id: 'e8',
        name: '菲妮克絲．尼克羅諾',
        description: '「請把尼克羅諾米肯的下落告訴我，好嗎？」她微笑著。尼克羅諾家族的大小姊，對家族失望至極，拋下中立的立場，選擇投向七罪帝國。「那本書原本就會是屬於我的。知道它在哪裡，是我的權利。」她的眼神仍舊溫柔，只是那份溫柔裡藏著令人發寒的空洞。「如果你們不願意說……那就讓靈魂代替你回答吧。」',
        level: 200,
        attribute: '暗',
        hp: 550000,
        attack: 40000,
        shield: 650,
        hit_rate: 300,
        evasion: 60,
        atk_speed: 400,
        shield_pen: 500,
        skills: [
            { name: '渴血', multi: 1.2, cd: 1, type: 'single', threshold: 100 },
            { name: '紅月', multi: 1.1, cd: 2, type: 'multi', threshold: 100 },
            { name: '惡魔之力', multi: 1.6, cd: 3, type: 'multi', threshold: 85 },
            { name: '死靈術：降', multi: 2.4, cd: 4, type: 'single', threshold: 70 },
            { name: '死靈術：滅', multi: 2.0, cd: 5, type: 'multi', threshold: 55 },
            { name: '死靈召喚：惡魔混沌', multi: 2.5, cd: 6, type: 'multi', threshold: 40 },
            { name: '死靈術：狂滅', multi: 2.5, cd: 8, type: 'multi', threshold: 25 },
            { name: '七罪罰', multi: 3.0, cd: 12, type: 'multi', threshold: 10 }
        ]
    },
    {
        id: 'e9',
        name: '紗布．妮古拉斯',
        description: '「為何至今仍無人信奉阿撒托斯？」紗布．妮古拉斯低聲疑惑。它盤踞在卡達斯聖山上空已久，自認絕對的恐懼早已瀰漫整個舊日領域，卻始終未曾誕生能夠對抗「神秘」的人才。人們只是不斷被舊日魔物追殺、凌虐，毫無止境。「阿撒托斯，這真的是你所希望的嗎？」',
        level: 300,
        attribute: '無',
        hp: 1100000,
        attack: 40000,
        shield: 1000,
        hit_rate: 450,
        evasion: 60,
        atk_speed: 500,
        shield_pen: 700,
        skills: [
            { name: '注視之眼', multi: 1.2, cd: 1, type: 'single', threshold: 100 },
            { name: '觸手', multi: 1.1, cd: 2, type: 'multi', threshold: 100 },
            { name: '化身', multi: 1.6, cd: 3, type: 'multi', threshold: 85 },
            { name: '死亡呼叫', multi: 3.5, cd: 4, type: 'single', threshold: 70 },
            { name: '亡魂召集', multi: 2.0, cd: 5, type: 'multi', threshold: 55 },
            { name: '自混沌', multi: 2.5, cd: 6, type: 'multi', threshold: 40 },
            { name: '自滅亡', multi: 2.5, cd: 8, type: 'multi', threshold: 25 },
            { name: '七罪罰', multi: 3.5, cd: 12, type: 'multi', threshold: 10 }
        ]
    },
    {
        id: 'e10',
        name: '「櫻庭組老大」櫻代 久遠',
        description: '久遠先生看起來像個十三、四歲的少年。但要說他在櫻代家裡的位階肯定高過當代家主。他和櫻代屋敷地下的神祕的關係十分密切，地下鐵門上的封印只有當代家主和他能解除。',
        level: 400,
        attribute: '無',
        hp: 3850000,
        attack: 200000,
        shield: 1200,
        hit_rate: 300,
        evasion: 50,
        atk_speed: 500,
        shield_pen: 2500,
        skills: [
            { name: '因緣', multi: 1.0, cd: 1, type: 'single', threshold: 100 },
            { name: '血盃', multi: 1.0, cd: 3, type: 'multi', threshold: 100, dot: { name: '盃中物', dmg: 80000, dur: 3 } },
            { name: '破門', multi: 3.0, cd: 4, type: 'single', threshold: 100 },
            { name: '制裁', multi: 1.5, cd: 6, type: 'multi', threshold: 70, debuff: { name: '組之掟', effect: 'evasion', value: 0.5, dur: 2 } },
            { name: '夜櫻', multi: 1.5, cd: 5, type: 'multi', threshold: 50, dot: { name: '花毒', dmg: 150000, dur: 3 } },
            { name: '襲名', multi: 0, cd: 8, type: 'self', threshold: 40, buff: { name: '家督', effect: 'attack', value: 1.8, dur: 3 } },
            { name: '散華', multi: 3.0, cd: 10, type: 'multi', threshold: 15, dot: { name: '花散', dmg: 300000, dur: 3 } }
        ]
    },
    /*
    {
        id: 'e11',
        name: '測試宇宙存在',
        description: '來自宇宙盡頭的未知存在。沒有人知道它為何出現，也沒有人能解釋它所攜帶的力量。它的存在本身就是對物理法則的嘲弄。',
        level: 500,
        attribute: '無',
        hp: 2750000,
        attack: 80000,
        shield: 1500,
        hit_rate: 600,
        evasion: 60,
        atk_speed: 600,
        shield_pen: 1000,
        skills: [
            { name: '星辰衝擊', multi: 1.4, cd: 1, type: 'single', threshold: 100 },
            { name: '星雲波動', multi: 1.0, cd: 2, type: 'multi', threshold: 100 },
            { name: '重力坍縮', multi: 1.8, cd: 4, type: 'single', threshold: 75, debuff: { name: '重力場', effect: 'atk_speed', value: 0.6, dur: 2 } },
            { name: '恆星閃焰', multi: 0.8, cd: 5, type: 'multi', threshold: 70, dot: { name: '灼燒輻射', dmg: 5000, dur: 3 } },
            { name: '暗物質護甲', multi: 0, cd: 8, type: 'self', threshold: 60, buff: { name: '暗物質護甲', effect: 'attack', value: 1.8, dur: 3 } },
            { name: '類星體爆發', multi: 1.5, cd: 5, type: 'multi', threshold: 50, debuff: { name: '空間撕裂', effect: 'shield', value: 0.5, dur: 2 } },
            { name: '星際修復', multi: 0, cd: 10, type: 'self', threshold: 40, heal: 500000 },
            { name: '奇點', multi: 3.5, cd: 12, type: 'single', threshold: 20, dot: { name: '時空崩解', dmg: 10000, dur: 3 } },
            { name: '宇宙終焉', multi: 4.0, cd: 15, type: 'multi', threshold: 10 }
        ]
    }
        */
];
