window.SFL_SKILLS_DB = [
    {
        "id": "slash",
        "name": "斬擊",
        "description": "使用武器斬擊敵人，\n對目標造成無屬性傷害。",
        "learnlvl": 1,
        "multiplier": 1.2,
        "maxlvl": 10,
        "multiplierperlvl": 0.3,
        "type": "atk",
        "cd": 1,
        "element": [
            "none"
        ],
        "sort": 1
    },
    {
        "id": "fireball",
        "name": "火球術",
        "description": "召喚火球攻擊敵人，\n對目標造成火屬性傷害。",
        "learnlvl": 1,
        "multiplier": 1.5,
        "multiplierperlvl": 0.27,
        "maxlvl": 10,
        "type": "atk",
        "cd": 2,
        "element": [
            "pyro"
        ],
        "sort": 2
    },
    {
        "id": "shadow_slash",
        "name": "暗影突襲",
        "description": "潛入暗影中突襲敵人，\n對目標造成暗屬性傷害。",
        "learnlvl": 5,
        "multiplier": 1.5,
        "maxlvl": 10,
        "multiplierperlvl": 0.31,
        "type": "atk",
        "cd": 5,
        "element": [
            "dark"
        ],
        "sort": 3
    },
    {
        "id": "emergency_heal",
        "name": "緊急治療",
        "description": "對自己進行治療，\n治療值為 基礎生命值10% x 倍率。",
        "learnlvl": 8,
        "multiplier": 1.1,
        "maxlvl": 20,
        "multiplierperlvl": 0.15,
        "type": "heal",
        "cd": 5,
        "element": [
            "none"
        ],
        "sort": 4
    },
    {
        "id": "fighting_buff",
        "name": "狂戰",
        "description": "持續 3 回合。\n凝聚憤怒的力量提升戰鬥力，\n增益效果為 總攻擊力 x 倍率。",
        "learnlvl": 10,
        "multiplier": 1.2,
        "maxlvl": 10,
        "multiplierperlvl": 0.03,
        "type": "buff",
        "effectType": "attack",
        "round": 3,
        "cd": 6,
        "element": [
            "none"
        ],
        "sort": 5
    },
    {
        "id": "evade_buff",
        "name": "閃避",
        "description": "持續 1 回合。\n開場第一次行動後，提高迴避率。\n需等待戰鬥開始後才可施放。",
        "learnlvl": 15,
        "multiplier": 2.0,
        "maxlvl": 1,
        "multiplierperlvl": 0.1,
        "type": "buff",
        "effectType": "evade",
        "round": 1,
        "cd": 999,
        "element": [
            "none"
        ],
        "sort": 6,
        "waitRound": 1
    },
    {
        "id": "fire_arrow",
        "name": "烈火箭",
        "description": "射出一發燃燒的烈火箭，\n對目標造成火屬性傷害。",
        "learnlvl": 20,
        "multiplier": 2.0,
        "maxlvl": 20,
        "multiplierperlvl": 0.3,
        "type": "atk",
        "cd": 2,
        "element": [
            "pyro"
        ],
        "sort": 7
    },
    {
        "id": "stone_bomb",
        "name": "石破",
        "description": "向敵人扔擲石頭後爆裂，\n對目標造成自然屬性傷害。",
        "learnlvl": 21,
        "multiplier": 2.0,
        "maxlvl": 20,
        "multiplierperlvl": 0.3,
        "type": "atk",
        "cd": 3,
        "element": [
            "nature"
        ],
        "sort": 8
    },
    {
        "id": "cursed_strike",
        "name": "詛咒打擊",
        "description": "攻擊敵人並以50%機率附加詛咒效果，\n造成暗屬性傷害並以50%機率降低敵人10%攻擊力。",
        "learnlvl": 22,
        "multiplier": 1.8,
        "maxlvl": 15,
        "multiplierperlvl": 0.25,
        "type": "debuff_atk",
        "cd": 4,
        "element": [
            "dark"
        ],
        "sort": 9,
        "debuff": {
            "name": "虛弱詛咒",
            "description": "攻擊力小幅降低了",
            "effectType": "attack",
            "multiplier": 0.9,
            "round": 2,
            "hit_chance": 0.5
        }
    },
    {
        "id": "poison_blade",
        "name": "毒刃",
        "description": "用野生毒素塗抹武器攻擊敵人，\n對目標造成自然屬性傷害。",
        "learnlvl": 25,
        "multiplier": 2.0,
        "maxlvl": 20,
        "multiplierperlvl": 0.3,
        "type": "atk",
        "cd": 2,
        "element": [
            "nature"
        ],
        "sort": 10
    },
    {
        "id": "flame_sword",
        "name": "烈焰劍",
        "description": "以火焰包覆武器攻擊敵人，\n造成火屬性傷害並以50%機率施加燃燒效果。",
        "learnlvl": 27,
        "multiplier": 2.2,
        "maxlvl": 20,
        "multiplierperlvl": 0.28,
        "type": "dot_atk",
        "cd": 4,
        "element": [
            "pyro"
        ],
        "sort": 11,
        "dot": {
            "name": "灼燒",
            "damage_per_turn": 25,
            "damage_per_level": 4,
            "round": 3,
            "hit_chance": 0.5
        }
    },
    {
        "id": "spiritual_meditation",
        "name": "靈性冥視",
        "description": "用黑暗的力量束縛敵人，\n對目標造成暗屬性傷害並以50%機率降低敵人20%攻擊速度。",
        "learnlvl": 30,
        "multiplier": 2.5,
        "maxlvl": 15,
        "multiplierperlvl": 0.3,
        "type": "debuff_atk",
        "cd": 5,
        "element": [
            "dark"
        ],
        "sort": 12,
        "debuff": {
            "name": "暗氣纏繞",
            "description": "攻擊速度小幅降低了",
            "effectType": "atk_speed",
            "multiplier": 0.8,
            "round": 2,
            "hit_chance": 0.5
        }
    },
    {
        "id": "lightning_curse",
        "name": "狂雷擊",
        "description": "以強大的雷電攻擊敵人，\n對目標造成雷屬性傷害。",
        "learnlvl": 33,
        "multiplier": 3,
        "maxlvl": 20,
        "multiplierperlvl": 0.3,
        "type": "atk",
        "cd": 2,
        "element": [
            "electro"
        ],
        "sort": 13
    },
    {
        "id": "elemental_convergence",
        "name": "元素匯聚",
        "description": "匯聚元素力量準備終極攻擊，\n若敵人無法在回合內造成足夠傷害將釋放強力一擊造成真實傷害。\n※推薦需擁有高運氣值迴避。",
        "learnlvl": 35,
        "multiplier": 1.0,
        "maxlvl": 30,
        "multiplierperlvl": 0.06,
        "type": "damage_shield",
        "cd": 10,
        "element": [
            "none"
        ],
        "sort": 14,
        "shield_rounds": 2,
        "damage_threshold": 0.05,
        "ultimate_skill": {
            "name": "元素爆發",
            "damage": 10
        }
    },
    {
        "id": "acid_spray",
        "name": "酸液噴射",
        "description": "噴射腐蝕性酸液攻擊敵人，\n對目標造成水屬性傷害。",
        "learnlvl": 40,
        "multiplier": 3,
        "maxlvl": 20,
        "multiplierperlvl": 0.3,
        "type": "atk",
        "cd": 2,
        "element": [
            "hydro"
        ],
        "sort": 15
    },
    {
        "id": "holy_star",
        "name": "聖光之杖",
        "description": "使用聖光照亮敵人驅散黑暗，\n對目標造成光屬性傷害。",
        "learnlvl": 44,
        "multiplier": 4,
        "maxlvl": 20,
        "multiplierperlvl": 0.35,
        "type": "atk",
        "cd": 3,
        "element": [
            "light"
        ],
        "sort": 16,
        "waitRound": 1
    },
    {
        "id": "ultimate_strike",
        "name": "終極一擊",
        "description": "蓄力後釋放的毀滅性攻擊，\n對目標造成全屬性傷害並必定命中。",
        "learnlvl": 48,
        "multiplier": 8.0,
        "maxlvl": 50,
        "multiplierperlvl": 0.2,
        "type": "atk",
        "cd": 10,
        "element": [
            "all"
        ],
        "sort": 17,
        "waitRound": 3
    },
    {
        "id": "divine_protection",
        "name": "神聖護盾",
        "description": "召喚神聖力量保護自身，\n在短時間內免疫怪物傷害。(仍會承受持續傷害)",
        "learnlvl": 50,
        "multiplier": 1.0,
        "maxlvl": 1,
        "multiplierperlvl": 0.01,
        "type": "invincible",
        "cd": 999,
        "element": [
            "none"
        ],
        "sort": 18,
        "round": 2,
        "waitRound": 3
    },
    {
        "id": "big_heal",
        "name": "大治療術",
        "description": "以更厲害的治療方式對自己進行治療，\n治療值為 基礎生命值10% x 倍率。",
        "learnlvl": 52,
        "multiplier": 2.0,
        "maxlvl": 40,
        "multiplierperlvl": 0.15,
        "type": "heal",
        "cd": 5,
        "element": [
            "none"
        ],
        "sort": 19,
        "waitRound": 3
    },
    {
        "id": "Dawn",
        "name": "曙光",
        "description": "在絕境之中依然能看見那一縷曙光，\n對目標造成光屬性傷害。",
        "learnlvl": 55,
        "multiplier": 6,
        "maxlvl": 20,
        "multiplierperlvl": 0.3,
        "type": "atk",
        "cd": 5,
        "element": [
            "light"
        ],
        "sort": 20,
        "waitRound": 4
    },
    {
        "id": "tidal_slash",
        "name": "潮汐一斬",
        "description": "以潮水的力量包覆武器攻擊敵人，\n對目標造成水屬性傷害。",
        "learnlvl": 60,
        "multiplier": 1.5,
        "maxlvl": 20,
        "multiplierperlvl": 0.3,
        "type": "atk",
        "cd": 1,
        "element": [
            "hydro"
        ],
        "sort": 21,
        "waitRound": 3
    },
    {
        "id": "corrosive_touch",
        "name": "侵蝕之觸",
        "description": "以潮水的力量包覆武器攻擊敵人，\n對目標造成水屬性傷害並以50%機率施加侵蝕效果。",
        "learnlvl": 70,
        "multiplier": 3.0,
        "maxlvl": 20,
        "multiplierperlvl": 0.3,
        "type": "dot_atk",
        "cd": 2,
        "element": [
            "hydro"
        ],
        "sort": 22,
        "dot": {
            "name": "侵蝕",
            "damage_per_turn": 25,
            "damage_per_level": 2,
            "round": 2,
            "hit_chance": 0.5
        },
        "waitRound": 2
    },
    {
        "id": "druid_wind_fist",
        "name": "德魯伊風拳",
        "description": "以自然的力量造成一段強大的風拳，\n對目標造成自然屬性傷害。",
        "learnlvl": 80,
        "multiplier": 3.0,
        "maxlvl": 30,
        "multiplierperlvl": 0.3,
        "type": "atk",
        "cd": 2,
        "element": [
            "nature"
        ],
        "sort": 23,
        "waitRound": 1
    },
    {
        "id": "holy_light_slash",
        "name": "聖輝斬",
        "description": "將光凝聚在武器上進行揮擊，\n對目標造成光屬性傷害。",
        "learnlvl": 90,
        "multiplier": 3.0,
        "maxlvl": 30,
        "multiplierperlvl": 0.3,
        "type": "atk",
        "cd": 2,
        "element": [
            "light"
        ],
        "sort": 24,
        "waitRound": 1
    },
    {
        "id": "elemental_convergence_2",
        "name": "元素匯聚．強",
        "description": "精通反擊精髓後，強化後的元素匯聚。\n若敵人無法在回合內造成足夠傷害將釋放強力一擊造成真實傷害。\n※無法與元素匯聚一同使用。\n※推薦需擁有高運氣值迴避。",
        "learnlvl": 95,
        "multiplier": 1.0,
        "maxlvl": 50,
        "multiplierperlvl": 0.1,
        "type": "damage_shield",
        "cd": 10,
        "element": [
            "all"
        ],
        "sort": 25,
        "shield_rounds": 2,
        "damage_threshold": 0.05,
        "ultimate_skill": {
            "name": "元素爆發．強",
            "damage": 15
        }
    },
    {
        "id": "absolute_judgment",
        "name": "絕對審判",
        "description": "學習創世主的力量，解放致命的一擊。\n對目標造成全屬性傷害並必定命中。",
        "learnlvl": 100,
        "multiplier": 10.0,
        "maxlvl": 50,
        "multiplierperlvl": 0.2,
        "type": "atk",
        "cd": 3,
        "element": [
            "all"
        ],
        "sort": 26,
        "waitRound": 4
    },
    {
        "id": "thunder_pulse",
        "name": "疾雷脈衝",
        "description": "攻擊敵人並低機率附加麻痺效果，\n對目標造成雷屬性傷害並以25%機率降低敵人25%迴避率。",
        "learnlvl": 110,
        "multiplier": 3.0,
        "maxlvl": 30,
        "multiplierperlvl": 0.3,
        "waitRound": 3,
        "type": "debuff_atk",
        "cd": 2,
        "element": [
            "electro"
        ],
        "sort": 27,
        "debuff": {
            "name": "電流癱瘓",
            "description": "迴避率中幅降低了",
            "effectType": "evade",
            "multiplier": 0.75,
            "round": 1,
            "hit_chance": 0.25
        }
    },
    {
        "id": "fountain_of_eternity",
        "name": "永恆之泉",
        "description": "以神聖之力祈禱後對自己進行治療，\n治療值為 基礎生命值10% x 倍率。",
        "learnlvl": 120,
        "multiplier": 5.1,
        "maxlvl": 50,
        "multiplierperlvl": 0.1,
        "type": "heal",
        "cd": 999,
        "element": [
            "none"
        ],
        "sort": 28,
        "waitRound": 7
    },
    {
        "id": "accuraccy_buff",
        "name": "會心",
        "description": "持續 3 回合。\n看破敵方弱點，提升命中率，\n增益效果為 總命中率 x 倍率。",
        "learnlvl": 125,
        "multiplier": 1.01,
        "maxlvl": 30,
        "multiplierperlvl": 0.01,
        "type": "buff",
        "effectType": "accuracy",
        "round": 3,
        "cd": 4,
        "element": [
            "none"
        ],
        "sort": 29
    },
    {
        "id": "dark_dragon_curse",
        "name": "暗噬龍咒",
        "description": "召喚龍族的詛咒之力。\n對目標造成暗屬性傷害。",
        "learnlvl": 130,
        "multiplier": 8.01,
        "maxlvl": 40,
        "multiplierperlvl": 0.2,
        "type": "atk",
        "cd": 4,
        "element": [
            "dark"
        ],
        "sort": 30,
        "waitRound": 5
    },
    {
        "id": "starfire_apocalypse",
        "name": "星火滅世陣",
        "description": "引動星辰之火焚燒大地，專門剋制自然生物。\n對目標造成火屬性傷害。",
        "learnlvl": 140,
        "multiplier": 8.01,
        "maxlvl": 40,
        "multiplierperlvl": 0.2,
        "type": "atk",
        "cd": 4,
        "element": [
            "pyro"
        ],
        "sort": 31,
        "waitRound": 6
    },
    {
        "id": "void_erosion",
        "name": "虛空侵蝕",
        "description": "召喚虛空之力慢慢侵蝕敵人的存在。\n對目標造成全屬性傷害並以100%機率施加虛空侵蝕效果。",
        "learnlvl": 150,
        "multiplier": 8.0,
        "maxlvl": 50,
        "multiplierperlvl": 0.18,
        "type": "dot_atk",
        "cd": 15,
        "element": [
            "all"
        ],
        "sort": 32,
        "waitRound": 10,
        "dot": {
            "name": "虛空侵蝕",
            "damage_per_turn": 500,
            "damage_per_level": 10,
            "round": 6,
            "hit_chance": 1.0
        }
    },
    {
        "id": "star_crash_sword",
        "name": "星碎滅劍",
        "description": "斬斷星辰的劍擊，\n對目標造成無屬性傷害。",
        "learnlvl": 160,
        "multiplier": 5.46,
        "maxlvl": 40,
        "multiplierperlvl": 0.16,
        "type": "atk",
        "cd": 1,
        "element": [
            "none"
        ],
        "waitRound": 1,
        "sort": 33
    },
    {
        "id": "immortal_will",
        "name": "不滅意志",
        "description": "艱難的戰鬥不會熄滅你的意志，\n治療值為 基礎生命值10% x 倍率。",
        "learnlvl": 170,
        "multiplier": 0.13,
        "maxlvl": 30,
        "multiplierperlvl": 0.03,
        "type": "heal",
        "cd": 1,
        "element": [
            "none"
        ],
        "sort": 34,
        "waitRound": 10
    },
    {
        "id": "thunder_god_roar",
        "name": "天雷神轟鳴",
        "description": "以天雷神的雷鳴降下制裁攻擊敵人，\n對目標造成雷屬性傷害。",
        "learnlvl": 180,
        "multiplier": 10.4,
        "maxlvl": 50,
        "multiplierperlvl": 0.4,
        "type": "atk",
        "cd": 999,
        "element": [
            "electro"
        ],
        "waitRound": 8,
        "sort": 35
    },
    {
        "id": "water_erosion",
        "name": "厄水侵蝕",
        "description": "厄運之水侵蝕詛咒著敵人，\n對目標造成水屬性傷害並以40%機率降低敵人40%運氣值。",
        "learnlvl": 190,
        "multiplier": 3.0,
        "maxlvl": 30,
        "multiplierperlvl": 0.35,
        "waitRound": 6,
        "type": "debuff_atk",
        "cd": 3,
        "element": [
            "hydro"
        ],
        "sort": 36,
        "debuff": {
            "name": "厄水",
            "description": "運氣值中幅降低了",
            "effectType": "evade",
            "multiplier": 0.6,
            "round": 3,
            "hit_chance": 0.4
        }
    },
    {
        "id": "soul_blessing",
        "name": "靈魂庇佑",
        "description": "施放後 3 回合內以機率無視目標接下來附加的負面效果/持續傷害。\n已經被施加的狀態無法抵擋仍然會受減益/傷害。",
        "learnlvl": 210,
        "multiplier": 0.01,
        "maxlvl": 70,
        "multiplierperlvl": 0.01,
        "type": "support",
        "cd": 3,
        "element": [
            "none"
        ],
        "sort": 37,
        "round": 3,
        "waitRound": 2,
        "MultipleDisable": true
    },
    {
        "id": "savage_shock",
        "name": "野蠻震盪",
        "description": "每觸發一次向目標累積【震盪值】，震盪值每10等額外增加累積計數。\n當震盪值累積至28時，目標攻擊力永久降低(一次戰鬥僅能觸發一次)。\n並且束縛1次行動(一次戰鬥最多觸發3次，受技能等級影響)。",
        "learnlvl": 220,
        "multiplier": 0.3,
        "maxlvl": 30,
        "multiplierperlvl": 0.3,
        "waitRound": 4,
        "type": "control",
        "cd": 2,
        "element": [
            "none"
        ],
        "sort": 38,
        "MultipleDisable": true
    },
    {
        "id": "ultimate_burst",
        "name": "終絕爆破",
        "description": "施放後啟用追擊模式。每次使用【輸出型】技能皆有機率觸發【終絕爆破】追打，造成真實傷害。",
        "learnlvl": 250,
        "multiplier": 0.4,
        "maxlvl": 50,
        "multiplierperlvl": 0.4,
        "waitRound": 12,
        "type": "pursuit",
        "cd": 999,
        "element": [
            "all"
        ],
        "sort": 39,
        "MultipleDisable": true
    },
    {
        "id": "starfall",
        "name": "星辰墜落",
        "description": "召喚星辰砸向敵人，\n對目標造成宇屬性傷害。",
        "learnlvl": 260,
        "multiplier": 5.0,
        "multiplierperlvl": 0.85,
        "maxlvl": 5,
        "type": "atk",
        "cd": 1,
        "waitRound": 4,
        "element": [
            "universe"
        ],
        "sort": 40
    },
    {
        "id": "order_judgment",
        "name": "宙序裁決",
        "description": "定義規則裁決目標，\n對目標造成宙屬性傷害。",
        "learnlvl": 270,
        "multiplier": 8.0,
        "multiplierperlvl": 1.0,
        "maxlvl": 5,
        "type": "atk",
        "cd": 8,
        "waitRound": 10,
        "element": [
            "spacetime"
        ],
        "sort": 41
    },
    {
        "id": "astral_end",
        "name": "星界終焉",
        "description": "引爆星辰為敵人帶來終焉，\n對目標造成宇屬性傷害。",
        "learnlvl": 280,
        "multiplier": 4.0,
        "multiplierperlvl": 0.65,
        "maxlvl": 5,
        "type": "atk",
        "cd": 4,
        "waitRound": 8,
        "element": [
            "universe"
        ],
        "sort": 42
    }
];