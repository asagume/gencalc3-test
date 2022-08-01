import { ARTIFACT_SET_MASTER, DAMAGE_CATEGORY_ARRAY, getCharacterMasterDetail, getWeaponMasterDetail, IMG_SRC_DUMMY, RECOMMEND_ABBREV_MAP, TArtifactSetKey, TCharacterDetail, TCharacterKey, TWeaponDetail, TWeaponKey, キャラクター構成PROPERTY_MAP } from '@/master';

export const 基礎ステータスARRAY = [
    '基礎HP',
    '基礎攻撃力',
    '基礎防御力'
];
export const 基本ステータスARRAY = [
    'HP上限',
    '攻撃力',
    '防御力',
    '元素熟知'
];
export const 高級ステータスARRAY = [
    '会心率',
    '会心ダメージ',
    '与える治療効果',
    '受ける治療効果',
    '元素チャージ効率',
    'シールド強化'
];
export const 元素ステータス_ダメージARRAY = [
    '炎元素ダメージバフ',
    '水元素ダメージバフ',
    '風元素ダメージバフ',
    '雷元素ダメージバフ',
    '草元素ダメージバフ',
    '氷元素ダメージバフ',
    '岩元素ダメージバフ',
    '物理ダメージバフ'
];
export const 元素ステータス_耐性ARRAY = [
    '炎元素耐性',
    '水元素耐性',
    '風元素耐性',
    '雷元素耐性',
    '草元素耐性',
    '氷元素耐性',
    '岩元素耐性',
    '物理耐性'
];
export const ダメージバフARRAY = [
    '通常攻撃ダメージバフ',
    '重撃ダメージバフ',
    '落下攻撃ダメージバフ',
    '元素スキルダメージバフ',
    '元素爆発ダメージバフ',
    '与えるダメージ'
];
export const 実数ダメージ加算ARRAY = [
    '通常攻撃ダメージアップ',
    '重撃ダメージアップ',
    '落下攻撃ダメージアップ',
    '元素スキルダメージアップ',
    '元素爆発ダメージアップ',
    '炎元素ダメージアップ',
    '水元素ダメージアップ',
    '風元素ダメージアップ',
    '雷元素ダメージアップ',
    '草元素ダメージアップ',
    '氷元素ダメージアップ',
    '岩元素ダメージアップ',
    '物理ダメージアップ'
];
export const 元素反応バフARRAY = [
    '蒸発',
    '溶解',
    '過負荷',
    '感電',
    '凍結',
    '超電導',
    '拡散',
    '結晶',
    '燃焼',
    '開花',
    '激化'
];
export const ステータスその他ARRAY = [
    'ダメージ軽減',
    'HP%',
    '攻撃力%',
    '防御力%',
    'HP+',
    '攻撃力+',
    '防御力+'
];
export const 敵元素ステータス_耐性ARRAY = [
    '敵炎元素耐性',
    '敵水元素耐性',
    '敵風元素耐性',
    '敵雷元素耐性',
    '敵草元素耐性',
    '敵氷元素耐性',
    '敵岩元素耐性',
    '敵物理耐性'
];

export const ステータスARRAY_MAP = new Map([
    ['基礎ステータス', 基礎ステータスARRAY],
    ['基本ステータス', 基本ステータスARRAY],
    ['高級ステータス', 高級ステータスARRAY],
    ['元素ステータス·ダメージ', 元素ステータス_ダメージARRAY],
    ['元素ステータス·耐性', 元素ステータス_耐性ARRAY],
    ['ダメージバフ', ダメージバフARRAY],
    ['実数ダメージ加算', 実数ダメージ加算ARRAY],
    ['元素反応バフ', 元素反応バフARRAY],
    ['その他', ステータスその他ARRAY],
    ['敵元素ステータス·耐性', 敵元素ステータス_耐性ARRAY],
]);

function makeStatusTenmplate() {
    const statusObj = {} as { [key: string]: number };
    ステータスARRAY_MAP.forEach((value) => {
        value.forEach(stat => {
            statusObj[stat] = 0;
        });
    });
    statusObj['会心率'] = 5;
    statusObj['会心ダメージ'] = 50;
    statusObj['元素チャージ効率'] = 100;
    return statusObj;
}
export const ステータスTEMPLATE = makeStatusTenmplate();

function makeEnemyStatusTemplate() {
    const statusObj = {} as { [key: string]: number };
    [元素ステータス_耐性ARRAY].forEach((value) => {
        value.forEach(stat => {
            statusObj[stat] = 0;
        });
    });
    statusObj['防御力'] = 0;
    return statusObj;
}
export const 敵ステータスTEMPLATE = makeEnemyStatusTemplate();

export const 聖遺物メイン効果_生の花ARRAY = [
    '5_HP', '4_HP'
];
export const 聖遺物メイン効果_死の羽ARRAY = [
    '5_攻撃力', '4_攻撃力'
];
export const 聖遺物メイン効果_時の砂ARRAY = [
    '5_元素チャージ効率',
    '5_HP%',
    '5_攻撃力%',
    '5_防御力%',
    '5_元素熟知',
    '4_元素チャージ効率',
    '4_HP%',
    '4_攻撃力%',
    '4_防御力%',
    '4_元素熟知'
];
export const 聖遺物メイン効果_空の杯ARRAY = [
    '5_炎元素ダメージバフ',
    '5_水元素ダメージバフ',
    '5_風元素ダメージバフ',
    '5_雷元素ダメージバフ',
    '5_草元素ダメージバフ',
    '5_氷元素ダメージバフ',
    '5_岩元素ダメージバフ',
    '5_物理ダメージバフ',
    '5_HP%',
    '5_攻撃力%',
    '5_防御力%',
    '5_元素熟知',
    '4_炎元素ダメージバフ',
    '4_水元素ダメージバフ',
    '4_風元素ダメージバフ',
    '4_雷元素ダメージバフ',
    '4_草元素ダメージバフ',
    '4_氷元素ダメージバフ',
    '4_岩元素ダメージバフ',
    '4_物理ダメージバフ',
    '4_HP%',
    '4_攻撃力%',
    '4_防御力%',
    '4_元素熟知'
];
export const 聖遺物メイン効果_理の冠ARRAY = [
    '5_会心率',
    '5_会心ダメージ',
    '5_HP%',
    '5_攻撃力%',
    '5_防御力%',
    '5_元素熟知',
    '5_与える治療効果',
    '4_会心率',
    '4_会心ダメージ',
    '4_HP%',
    '4_攻撃力%',
    '4_防御力%',
    '4_元素熟知',
    '4_与える治療効果'
];

export const 聖遺物優先するサブ効果ARRAY = [
    '攻撃力%',
    'HP%',
    '防御力%',
    '元素熟知',
    '会心率',
    '会心ダメージ',
    '元素チャージ効率',
];

export const 聖遺物ステータスTEMPLATE = {
    'HP': 0,
    '攻撃力': 0,
    '防御力': 0,
    '元素熟知': 0,
    '会心率': 0,
    '会心ダメージ': 0,
    '元素チャージ効率': 0,
    'HP%': 0,
    '攻撃力%': 0,
    '防御力%': 0,
};

export const 元素反応TEMPLATE = {
    蒸発倍率: 0,
    溶解倍率: 0,
    過負荷ダメージ: 0,
    感電ダメージ: 0,
    超電導ダメージ: 0,
    拡散ダメージ: 0,
    拡散元素: '炎',
    結晶吸収量: 0,
    結晶元素: '炎',
    燃焼ダメージ: 0,
    激化ダメージ: 0,
    開花ダメージ: 0
};

export const 計算結果TEMPLATE = {
    通常攻撃: [],
    重撃: [],
    落下攻撃: [],
    元素スキル: [],
    元素爆発: [],
    その他: []
};

export const 突破レベルレベルARRAY = [
    Array.from({ length: 20 }, (_, i) => i + 1),
    Array.from({ length: 21 }, (_, i) => i + 20),
    Array.from({ length: 11 }, (_, i) => i + 40),
    Array.from({ length: 11 }, (_, i) => i + 50),
    Array.from({ length: 11 }, (_, i) => i + 60),
    Array.from({ length: 11 }, (_, i) => i + 70),
    Array.from({ length: 11 }, (_, i) => i + 80),
];

export const ARTIFACT_SET_MASTER_DUMMY = {
    key: 'dummy',
    image: IMG_SRC_DUMMY
};

export const CHARACTER_INPUT_TEMPLATE = {
    character: null,
    characterMaster: {} as TCharacterDetail,
    突破レベル: 6,
    レベル: 90,
    命ノ星座: 0,
    通常攻撃レベル: 8,
    元素スキルレベル: 8,
    元素爆発レベル: 8,
    weapon: null,
    weaponMaster: {} as TWeaponDetail,
    武器突破レベル: 6,
    武器レベル: 90,
    武器精錬ランク: 1,
    artifactSets: ['NONE', 'NONE'],
    artifactSetMasters: [ARTIFACT_SET_MASTER_DUMMY, ARTIFACT_SET_MASTER_DUMMY],
};
export type TCharacterInput = typeof CHARACTER_INPUT_TEMPLATE;

export const ARTIFACT_DETAIL_INPUT_TEMPLATE = {
    聖遺物メイン効果: ['', '', '', '', ''],
    聖遺物優先するサブ効果: ['', '', ''],
    聖遺物優先するサブ効果上昇値: [-1, -1, -1],
    聖遺物優先するサブ効果上昇回数: [8, 5, 5],
    聖遺物ステータス: JSON.parse(JSON.stringify(聖遺物ステータスTEMPLATE)),
    聖遺物ステータス補正: JSON.parse(JSON.stringify(聖遺物ステータスTEMPLATE))
};
export type TArticactDetailInput = typeof ARTIFACT_DETAIL_INPUT_TEMPLATE;

export const CONDITION_INPUT_TEMPLATE = {
    conditionValues: {},
    character: 'アンバー' as TCharacterKey,
    characterMaster: {} as TCharacterDetail,
    conditionAdjustments: {}
};
export type TConditionInput = typeof CONDITION_INPUT_TEMPLATE;

export const OPTION_INPUT_TEMPLATE = {
    elementalResonanceConditionValues: {},
    elementalResonanceStatusAdjustment: {},
    supporterList: [],
    isSupporterOptionOpened: {},
    teamOptionConditionMap: {},
    teamOptionConditionValues: {},
    teamOptionStatusAdjustment: {},
    miscOptionConditionValues: {},
    miscOptionStatusAdjustment: {},
};

export const SUPPORTER_INPUT_TEMPLATE = {
    characterInput: CHARACTER_INPUT_TEMPLATE,
    artifactDetailInput: ARTIFACT_DETAIL_INPUT_TEMPLATE,
    conditionInput: CONDITION_INPUT_TEMPLATE,
    statusInput: {}
};

export function isString(value: any) {
    return typeof value === 'string' || value instanceof String;
}

export function isNumber(value: any) {
    return isFinite(value) && value != null;
}

export function isPlainObject(value: any) {
    const myType = Object.prototype.toString.call(value);
    return myType === '[object Object]';
}

/**
 * 
 * @param {string} levelStr 
 * @returns {[number, number]}
 */
export function parseLevelStr(levelStr: number | string): [number, number] {
    try {
        let level: number;
        if (isString(levelStr)) {
            level = Number(String(levelStr).replace('+', ''));
        } else {
            level = Number(levelStr);
        }
        let ascension = 0;
        for (let i = 突破レベルレベルARRAY.length - 1; i >= 0; i--) {
            if (突破レベルレベルARRAY[i][0] < level) continue;
            if (突破レベルレベルARRAY[i][突破レベルレベルARRAY[i].length - 1] > level) continue;
            ascension = i;
            if (String(levelStr).endsWith('+')) {
                ascension++;
            }
            break;
        }
        return [ascension, level];
    } catch (error) {
        console.error(levelStr);
        throw error;
    }
}

export type TRecommendation = {
    name: string,
    build: any,
    overwrite: boolean
}

/**
 * おすすめセットのリストを作成します.
 * 
 * @param {Object} characterMaster キャラクターマスター
 * @returns {[string, object, boolean][]} おすすめセットのリスト
 */
export function makeRecommendationList(characterMaster: { [key: string]: any }, opt_buildData?: { [key: string]: any }): TRecommendation[] {
    const result: TRecommendation[] = [];

    const character = characterMaster['名前'];
    let isSavable: boolean | null = null;

    if (opt_buildData) {
        result.push({ name: 'IMPORTED DATA', build: opt_buildData, overwrite: false });
        isSavable = true;
    }

    const storageKeyArr: string[] = [];
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('構成_' + character)) {
            storageKeyArr.push(key);
            if (isSavable == null) {
                isSavable = false;
            }
        }
    });
    storageKeyArr.sort();
    const re = new RegExp('^構成_' + character + '_');
    storageKeyArr.forEach(key => {
        let buildname;
        if (key == '構成_' + character) {
            buildname = 'あなたの' + character;
        } else {
            buildname = key.replace(re, '');
        }
        result.push({ name: buildname, build: JSON.parse(localStorage[key]), overwrite: true });
    });

    characterMaster['おすすめセット'].forEach((obj: { [key: string]: any }) => {
        const myRecommendation = obj;
        ['聖遺物優先するサブ効果1', '聖遺物優先するサブ効果2', '聖遺物優先するサブ効果3'].forEach(stat => {
            if (!(stat in obj)) {
                obj[stat] = null;
            }
        });
        const artifactRarerityArrArr = [[5, 5, 5, 5, 5], [4, 4, 5, 5, 5], [4, 4, 4, 5, 4]];
        let artifactRarerity4Num = 0;
        const artifactSet1 = myRecommendation['聖遺物セット効果1'] as TArtifactSetKey;
        const artifactSet2 = myRecommendation['聖遺物セット効果2'] as TArtifactSetKey;
        if (ARTIFACT_SET_MASTER[artifactSet1]['レアリティ'] == 4) {
            artifactRarerity4Num++;
        }
        if (ARTIFACT_SET_MASTER[artifactSet2]['レアリティ'] == 4) {
            artifactRarerity4Num++;
        }
        for (let i = 0; i < 2; i++) {
            const name = '聖遺物メイン効果' + (i + 1);
            if (!(name in myRecommendation)) {
                if (i == 0) {
                    myRecommendation[name] = artifactRarerityArrArr[artifactRarerity4Num][i] + '_HP';
                } else if (i == 1) {
                    myRecommendation[name] = artifactRarerityArrArr[artifactRarerity4Num][i] + '_攻撃力';
                }
            }
        }

        let buildname = myRecommendation['武器'];
        buildname += ' ';
        if (myRecommendation['聖遺物セット効果1'] == myRecommendation['聖遺物セット効果2']) {
            buildname += myRecommendation['聖遺物セット効果1'];
        } else {
            buildname += makeArtifactSetAbbrev(myRecommendation['聖遺物セット効果1']);
            buildname += '/';
            buildname += makeArtifactSetAbbrev(myRecommendation['聖遺物セット効果2']);
        }
        buildname += ' [';
        for (let i = 3; i <= 5; i++) {
            const statusName = myRecommendation['聖遺物メイン効果' + i].split('_')[1];
            if (RECOMMEND_ABBREV_MAP.has(statusName)) {
                buildname += RECOMMEND_ABBREV_MAP.get(statusName);
            } else {
                buildname += statusName.substring(0, 1);
            }
        }
        buildname += ']';
        result.push({ name: buildname, build: myRecommendation, overwrite: false });
    });

    return result;
}

/**
 * 聖遺物セット名の略称を作成します
 * 
 * @param {string} name 聖遺物セット名
 * @returns {string} 聖遺物セット名の略称
 */
function makeArtifactSetAbbrev(name: string): string {
    const abbrRe = /[\p{sc=Hiragana}\p{sc=Katakana}ー]+/ug;
    let abbr = name.replace(abbrRe, '');
    if (abbr.length > 2) {
        abbr = name.split(abbrRe).sort((a, b) => {
            return b.length - a.length;
        })[0];
    }
    if (abbr.length > 3) {
        abbr = abbr.substring(0, 2);
    }
    return abbr;
}

export async function loadRecommendation(characterInput: { [key: string]: any }, artifactDetailInput: { [key: string]: any }, conditionInput: { [key: string]: any }, build: { [key: string]: any }) {
    try {
        const character = characterInput.character;
        const characterMaster = await getCharacterMasterDetail(character);
        characterInput.characterMaster = characterMaster;

        if ('レベル' in build) {
            [characterInput.突破レベル, characterInput.レベル] = parseLevelStr(build['レベル']);
        }
        ['命ノ星座', '通常攻撃レベル', '元素スキルレベル', '元素爆発レベル'].forEach(key => {
            if (key in build) {
                characterInput[key] = build[key];
            }
        });

        const weaponType = characterMaster['武器'];
        if ('武器' in build) {
            characterInput.weapon = build['武器'] as TWeaponKey;
            characterInput.weaponMaster = await getWeaponMasterDetail(characterInput.weapon, weaponType);
        }
        if ('武器レベル' in build) {
            [characterInput.武器突破レベル, characterInput.武器レベル] = parseLevelStr(build['武器レベル']);
        }
        if ('精錬ランク' in build) {
            characterInput.武器精錬ランク = build['精錬ランク'];
        }

        ['聖遺物セット効果1', '聖遺物セット効果2'].forEach((key, index) => {
            if (!(key in build)) return;
            const artifactSet = build[key] as TArtifactSetKey;
            if (artifactSet && artifactSet in ARTIFACT_SET_MASTER) {
                characterInput.artifactSets[index] = artifactSet;
                characterInput.artifactSetMasters[index] = ARTIFACT_SET_MASTER[artifactSet];
            } else {
                characterInput.artifactSetMasters[index] = ARTIFACT_SET_MASTER_DUMMY;
            }
        });
        ['聖遺物メイン効果1', '聖遺物メイン効果2'].forEach((key, index) => {
            if (!(key in build)) return;
            let mainstat = build[key];
            if (!mainstat) {
                mainstat = ['5_HP', '5_攻撃力'][index];
            }
            artifactDetailInput['聖遺物メイン効果'][index] = mainstat;
        });
        ['聖遺物メイン効果3', '聖遺物メイン効果4', '聖遺物メイン効果5'].forEach((key, index) => {
            if (!(key in build)) return;
            const mainstat = build[key];
            artifactDetailInput['聖遺物メイン効果'][index + 2] = mainstat;
        });
        ['聖遺物優先するサブ効果1', '聖遺物優先するサブ効果2', '聖遺物優先するサブ効果3'].forEach((key, index) => {
            if (!(key in build)) return;
            const substat = build[key];
            artifactDetailInput['聖遺物優先するサブ効果'][index] = substat;
        });
        ['聖遺物優先するサブ効果1上昇値', '聖遺物優先するサブ効果2上昇値', '聖遺物優先するサブ効果3上昇値'].forEach((key, index) => {
            if (!(key in build)) return;
            const substatValue = build[key];
            artifactDetailInput['聖遺物優先するサブ効果上昇値'][index] = substatValue;
        });
        ['聖遺物優先するサブ効果1上昇回数', '聖遺物優先するサブ効果2上昇回数', '聖遺物優先するサブ効果3上昇回数'].forEach((key, index) => {
            if (!(key in build)) return;
            const substatCount = build[key];
            artifactDetailInput['聖遺物優先するサブ効果上昇回数'][index] = substatCount;
        });

        Object.keys(build).filter(s => !キャラクター構成PROPERTY_MAP.has(s)).forEach(key => {
            conditionInput.conditionValues[key] = build[key];
        });

        // makeDamageDetailObjArrObjCharacter(characterInput);
        // makeDamageDetailObjArrObjWeapon(characterInput);
        // makeDamageDetailObjArrObjArtifactSet(characterInput);
    }
    catch (error) {
        console.error(characterInput, artifactDetailInput, conditionInput, build);
        throw error;
    }
}

export const CHANGE_KIND_STATUS = 'ステータス変更系詳細';
export const CHANGE_KIND_TALENT = '天賦性能変更系詳細';

export type TDamageDetailObj = {
    名前: string | null,
    種類: string | null,
    元素: string | null,
    数値: number | string | Array<any> | null,
    条件: string | null,
    対象: string | null,
    上限: number | string | null,
    HIT数: number | null,
    ダメージバフ: string | null,
    元素付与無効: boolean | null,
    除外条件: string | null,
    適用条件: string | null,
};

export type TDamageDetail = {
    ステータス変更系詳細: TDamageDetailObj[],
    天賦性能変更系詳細: TDamageDetailObj[],
    条件: Map<string, Array<string> | null>,
    排他: Map<string, Array<string> | null>,
};
export function makeDamageDetailObjArrObjCharacter(characterInput: any, conditionInput: any): TDamageDetail {
    try {
        const characterMaster = characterInput.characterMaster as any;

        const result = {} as any;

        let myTalentDetail;
        let myTalentLevel: number;
        let myDefaultKind: string | null;
        let myDefaultElement: string | null;
        const myInputCategory = 'キャラクター';

        const myStatusChangeDetailObjArr = [] as any[];
        const myTalentChangeDetailObjArr = [] as any[];

        // 通常攻撃 重撃 落下攻撃
        myTalentLevel = characterInput['通常攻撃レベル'];
        myDefaultElement = characterMaster['武器'] === '法器' ? characterMaster['元素'] : null;
        ['通常攻撃', '重撃', '落下攻撃'].forEach(category => {
            myTalentDetail = characterMaster[category];
            myDefaultKind = category + 'ダメージ';
            result[category] = makeDamageDetailObjArr(myTalentDetail, myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
        });

        ['通常攻撃', '重撃', '落下攻撃'].forEach(category => {
            const workCategory = '特殊' + category;
            if (workCategory in characterMaster) {
                myTalentDetail = characterMaster[workCategory];
                if ('種類' in myTalentDetail) {
                    myDefaultKind = myTalentDetail['種類'];
                    switch (myDefaultKind) {
                        case '元素スキルダメージ':
                            myTalentLevel = characterInput['元素スキルレベル'];
                            break;
                        case '元素爆発ダメージ':
                            myTalentLevel = characterInput['元素爆発レベル'];
                            break;
                    }
                }
                if ('元素' in myTalentDetail) {
                    myDefaultElement = myTalentDetail['元素'];
                }
                const workObj = {
                    条件: myTalentDetail['条件'],
                    詳細: makeDamageDetailObjArr(myTalentDetail, myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory)
                };
                result[workCategory] = workObj;
            }
        });

        // 元素スキル
        myTalentLevel = characterInput['元素スキルレベル'];
        myDefaultKind = '元素スキルダメージ';
        myDefaultElement = characterMaster['元素'];
        result['元素スキル'] = makeDamageDetailObjArr(characterMaster['元素スキル'], myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);

        // 元素爆発
        myTalentLevel = characterInput['元素爆発レベル'];
        myDefaultKind = '元素爆発ダメージ';
        myDefaultElement = characterMaster['元素'];
        result['元素爆発'] = makeDamageDetailObjArr(characterMaster['元素爆発'], myTalentLevel, myDefaultKind, myDefaultElement, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);

        // その他戦闘天賦
        if ('その他戦闘天賦' in characterMaster) {
            characterMaster['その他戦闘天賦'].forEach((myTalentDetail: any) => {
                let workArr = [];
                if ('その他' in result) {
                    workArr = result['その他'];
                }
                workArr.concat(makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
                result['その他'] = workArr;
            });
        }

        // 固有天賦
        characterMaster['固有天賦'].forEach((myTalentDetail: any) => {
            let workArr = [];
            if ('その他' in result) {
                workArr = result['その他'];
            }
            workArr.concat(makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
            result['その他'] = workArr;
        });

        // 命ノ星座
        if ('命ノ星座' in characterMaster) {
            Object.keys(characterMaster['命ノ星座']).forEach(key => {
                myTalentDetail = characterMaster['命ノ星座'][key];
                if ('詳細' in myTalentDetail) {
                    myTalentDetail['詳細'].forEach((detailObj: { [x: string]: string; }) => {
                        if ('条件' in detailObj && detailObj['条件']) {
                            if (detailObj['条件'].indexOf('命ノ星座') == -1) {
                                detailObj['条件'] = '命ノ星座@' + key + '&' + detailObj['条件'];
                            }
                        } else {
                            detailObj['条件'] = '命ノ星座@' + key;
                        }
                    });
                }
                let workArr = [];
                if ('その他' in result) {
                    workArr = result['その他'];
                }
                workArr.concat(makeDamageDetailObjArr(myTalentDetail, null, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory));
                result['その他'] = workArr;
            });
        }

        // 風元素キャラクター
        if (characterMaster['元素'] == '風') {
            ['炎元素', '水元素', '雷元素', '氷元素'].forEach(cond => {
                myTalentChangeDetailObjArr.push({
                    名前: null,
                    種類: '固有変数',
                    元素: null,
                    数値: null,
                    条件: '拡散@' + cond,
                    対象: null,
                    上限: null,
                    HIT数: null,
                    ダメージバフ: null,
                    元素付与無効: null,
                    除外条件: null,
                    適用条件: null
                });
            });
        }

        result[CHANGE_KIND_STATUS] = myStatusChangeDetailObjArr;
        result[CHANGE_KIND_TALENT] = myTalentChangeDetailObjArr;

        const conditionMap = new Map();
        const exclusionMap = new Map();
        myStatusChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
        });
        myTalentChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            makeConditionExclusionMapFromStr(detailObj['条件'], conditionMap, exclusionMap);
        });
        conditionMap.delete('命ノ星座');
        result['条件'] = conditionMap;
        result['排他'] = exclusionMap;

        conditionMap.forEach((value, key) => {
            if (key in conditionInput.conditionValues) {
                console.log(key);
            } else {
                if (value) {    // select
                    conditionInput.conditionValues[key] = value.length - 1;
                } else {    // checkbox
                    conditionInput.conditionValues[key] = true;
                }
            }
        });
        exclusionMap.forEach((value, key) => {
            if (!(key in conditionInput.conditionValues)) return;
            for (const exclusion of value) {
                if (!(exclusion in conditionInput.conditionValues)) return;
                if (conditionMap.get(exclusion) == null) {
                    conditionInput.conditionValues[exclusion] == null;
                } else {
                    conditionInput.conditionValues[exclusion] == -1;
                }
            }
        });

        return result;
    } catch (error) {
        console.log(characterInput, conditionInput);
        throw error;
    }
}

export function makeDamageDetailObjArrObjWeapon(characterInput: any, conditionInput: any) {
    try {
        const name = characterInput.weapon;
        const weaponMaster = characterInput.weaponMaster;

        const result = {} as any;

        if (!name || !weaponMaster) return result;

        let myTalentDetail;
        const myLevel = characterInput.武器精錬ランク;
        const myInputCategory = '武器';

        const myStatusChangeDetailObjArr = [] as any[];
        const myTalentChangeDetailObjArr = [] as any[];

        if ('武器スキル' in weaponMaster) {
            myTalentDetail = weaponMaster['武器スキル'];
            result['武器'] = makeDamageDetailObjArr(myTalentDetail, myLevel, null, null, myStatusChangeDetailObjArr, myTalentChangeDetailObjArr, myInputCategory);
        }

        result[CHANGE_KIND_STATUS] = myStatusChangeDetailObjArr;
        result[CHANGE_KIND_TALENT] = myTalentChangeDetailObjArr;

        const conditionMap = new Map();
        const exclusionMap = new Map();
        myStatusChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            let condition = detailObj['条件'];
            if (isPlainObject(condition) && myLevel in condition) {
                condition = condition[myLevel];
            }
            makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
        });
        myTalentChangeDetailObjArr.filter(s => s['条件']).forEach(detailObj => {
            let condition = detailObj['条件'];
            if (isPlainObject(condition) && myLevel in condition) {
                condition = condition[myLevel];
            }
            makeConditionExclusionMapFromStr(condition, conditionMap, exclusionMap);
        });
        result['条件'] = conditionMap;
        result['排他'] = exclusionMap;

        conditionMap.forEach((value, key) => {
            if (key in conditionInput.conditionValues) return;
            if (value) {    // select
                conditionInput.conditionValues[key] = value.length - 1;
            } else {    // checkbox
                conditionInput.conditionValues[key] = true;
            }
        });
        exclusionMap.forEach((value, key) => {
            if (!(key in conditionInput.conditionValues)) return;
            for (const exclusion of value) {
                if (!(exclusion in conditionInput.conditionValues)) return;
                if (conditionMap.get(exclusion) == null) {
                    conditionInput.conditionValues[exclusion] == null;
                } else {
                    conditionInput.conditionValues[exclusion] == -1;
                }
            }
        });

        return result;
    } catch (error) {
        console.log(characterInput);
        throw error;
    }
}


export const makeDamageDetailObjArr = function (talentDataObj: any, level: number | null, defaultKind: string | null, defaultElement: string | null, statusChangeDetailObjArr: any[], talentChangeDetailObjArr: any[], inputCategory: string, opt_condition = null) {
    const resultArr = [] as any[];
    if (!('詳細' in talentDataObj)) return resultArr;

    talentDataObj['詳細'].forEach((detailObj: { [x: string]: any; }) => {
        let my種類 = '種類' in detailObj ? detailObj['種類'] : defaultKind;
        let my対象 = null;
        if (my種類.indexOf('.') != -1) {
            my対象 = my種類.substring(my種類.indexOf('.') + 1);
            my種類 = my種類.substring(0, my種類.indexOf('.'));
        } else if ('対象' in detailObj) {
            my対象 = detailObj['対象'];
        }
        let my数値 = null;
        if ('数値' in detailObj) {
            my数値 = detailObj['数値'];
            if (isNumber(my数値) || isString(my数値)) {
                // nop
            } else if (isPlainObject(my数値) && level && level in my数値) { // キャラクター|武器のサブステータス
                my数値 = my数値[level];
            } else {
                console.error(talentDataObj, level, defaultKind, defaultElement, my数値);
            }
            if (DAMAGE_CATEGORY_ARRAY.includes(my種類 + 'ダメージ') || my種類.endsWith('ダメージ')) {
                my数値 = analyzeFormulaStr(my数値, '攻撃力');
            } else {
                my数値 = analyzeFormulaStr(my数値, my種類);
            }
        }
        let my条件 = null;
        if ('条件' in detailObj) {
            if (isPlainObject(detailObj['条件']) && level && level in detailObj['条件']) {  // 武器は精錬ランクによって数値を変えたいときがあるので
                my条件 = detailObj['条件'][level];
            } else {
                my条件 = detailObj['条件'];
            }
        } else {
            my条件 = opt_condition;
        }
        let my上限 = null;
        if ('上限' in detailObj) {
            my上限 = detailObj['上限'];
            if (isPlainObject(my上限) && level && level in my上限) {   // 草薙の稲光
                my上限 = my上限[level];
            }
            my上限 = analyzeFormulaStr(my上限);
        }
        const resultObj = {
            名前: detailObj['名前'],
            種類: my種類,
            元素: '元素' in detailObj ? detailObj['元素'] : defaultElement,
            数値: my数値,
            条件: my条件,
            対象: my対象,
            上限: my上限,
            HIT数: 'HIT数' in detailObj ? detailObj['HIT数'] : null,
            ダメージバフ: 'ダメージバフ' in detailObj ? detailObj['ダメージバフ'] : null,
            元素付与無効: '元素付与無効' in detailObj ? detailObj['元素付与無効'] : inputCategory == '武器',
            除外条件: '除外条件' in detailObj ? detailObj['除外条件'] : null,
            適用条件: '適用条件' in detailObj ? detailObj['適用条件'] : null
        }
        if (statusChangeDetailObjArr != null) {
            if (resultObj['種類'] in ステータスTEMPLATE
                || resultObj['種類'].endsWith('%')
                || new RegExp('[自全].+バフ').exec(resultObj['種類'])
                || new RegExp('敵?[自全]元素耐性').exec(resultObj['種類'])
                || resultObj['種類'] == '別枠乗算'
                || ['継続時間', '発動回数', 'クールタイム', '使用回数'].includes(my種類)
            ) {
                resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                statusChangeDetailObjArr.push(resultObj);
                return;
            }
        }
        if (talentChangeDetailObjArr != null) {
            if (resultObj['種類'].endsWith('強化')
                || resultObj['種類'].endsWith('付与')
                || resultObj['種類'].endsWith('アップ')
                || resultObj['種類'] == '防御無視' ||
                resultObj['種類'] == '固有変数') {   // ex.元素爆発強化,氷元素付与
                resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                talentChangeDetailObjArr.push(resultObj);
                return;
            }
        }
        resultArr.push(resultObj);
    });
    return resultArr;
}

const makeConditionExclusionMapFromStr = function (conditionStr: string, conditionMap: Map<string, string[] | null>, exclusionMap: Map<string, string[] | null>) {
    // 排他条件を抽出します
    let exclusionCond: string | null = null;
    let myCondStrArr = conditionStr.split('^');
    if (myCondStrArr.length > 1) {
        exclusionCond = myCondStrArr[1];
    }
    const myCondStr = myCondStrArr[0];
    if (myCondStr.indexOf('|') != -1) {
        // OR条件 for 申鶴
        myCondStrArr = myCondStr.split('|');
        myCondStrArr.forEach((myCondStr: string) => {
            makeConditionExclusionMapFromStrSub(myCondStr, conditionMap, exclusionMap, exclusionCond);
        });
    } else {
        // AND条件
        myCondStrArr = myCondStr.split('&');
        myCondStrArr.forEach((myCondStr: string) => {
            makeConditionExclusionMapFromStrSub(myCondStr, conditionMap, exclusionMap, exclusionCond);
        });
    }
}

function makeConditionExclusionMapFromStrSub(conditionStr: string, conditionMap: Map<string, string[] | null>, exclusionMap: Map<string, string[] | null>, exclusion: string | null) {
    const myCondStrArr = conditionStr.split('@');
    const myName = myCondStrArr[0];
    if (myCondStrArr.length == 1) {
        pushToMapValueArray(conditionMap, myName, null);
    } else if (myCondStrArr.length == 2) {
        if (myCondStrArr[1].indexOf('-') != -1) {
            const re = new RegExp('([^0-9\\.]*)([0-9\\.]+)-([0-9\\.]+)(.*)');
            const re2 = new RegExp('/([0-9\\.]+)(.*)');
            const reRet = re.exec(myCondStrArr[1]);
            if (reRet) {
                const prefix = reRet[1];
                const rangeStart = Number(reRet[2]);
                const rangeEnd = Number(reRet[3]);
                let step = rangeStart;
                let postfix = reRet[4];
                if (postfix) {
                    const re2Ret = re2.exec(postfix);
                    if (re2Ret) {
                        step = Number(re2Ret[1]);
                        postfix = re2Ret[2];
                    }
                }
                for (let i = rangeStart; i < rangeEnd; i = addDecimal(i, step, rangeEnd)) {
                    pushToMapValueArray(conditionMap, myName, prefix + String(i) + postfix);
                }
                pushToMapValueArray(conditionMap, myName, prefix + String(rangeEnd) + postfix);
            } else {
                pushToMapValueArray(conditionMap, myName, myCondStrArr[1]);
            }
        } else if (myCondStrArr[1].indexOf(',') != -1) {
            const re = new RegExp('([^0-9\\.]*)([0-9\\.,]+)(.*)');
            const reRet = re.exec(myCondStrArr[1]);
            if (reRet) {
                const prefix = reRet[1];
                const condValurArr = reRet[2].split(',');
                const postfix = reRet[3];
                condValurArr.forEach(value => {
                    pushToMapValueArray(conditionMap, myName, prefix + value + postfix);
                });
            }
        } else {
            pushToMapValueArray(conditionMap, myName, myCondStrArr[1]);
        }
    } else {
        console.error(conditionStr, conditionMap, exclusionMap);
    }
    if (exclusion) {
        exclusion.split(',').forEach(e => {
            pushToMapValueArray(exclusionMap, myName, e);
        });
    }
}

function pushToMapValueArray(map: Map<any, any>, key: any, value: any) {
    if (value == null) {
        if (!map.has(key)) {
            map.set(key, null);
        }
    } else if (map.has(key)) {
        const oldValue = map.get(key);
        if (oldValue == null) {
            map.set(key, [value]);
        } else if (!oldValue.includes(value)) {
            map.get(key).push(value);
        }
    } else {
        map.set(key, [value]);
    }
}

const addDecimal = function (value1: number, value2: number, opt_max: number | null = null) {
    let result = value1 + value2;
    if (opt_max != null) {
        result = Math.min(result, opt_max);
    }
    return result;
}

const analyzeFormulaStr = function (formulaStr: number | string, opt_defaultItem: string | null = null) {
    const resultArr = [] as any[];
    const re = new RegExp('([\\+\\-\\*/]?)([^\\+\\-\\*/]+)(.*)');
    let workStr = String(formulaStr);
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const reRet = re.exec(workStr);
        if (!reRet) {
            resultArr.push(workStr);
            break;
        }
        if (reRet[1]) { // + - * /
            resultArr.push(reRet[1]);
        }
        resultArr.push(analyzeFormulaStrSub(reRet[2], opt_defaultItem));
        if (!reRet[3]) {
            break;
        }
        workStr = reRet[3];
    }
    return resultArr;
}

function analyzeFormulaStrSub(formulaStr: string, opt_defaultItem: string | null = null) {
    const resultArr = [] as any;
    if (isNumber(formulaStr)) {
        resultArr.push(Number(formulaStr));
    } else {
        const strArr = (formulaStr as string).split('%');
        if (strArr.length == 1) {
            resultArr.push(strArr[0]);
        } else {
            resultArr.push(Number(strArr[0]) / 100);
            resultArr.push('*');
            if (strArr[1].length > 0) {
                resultArr.push(strArr[1]);
            } else if (opt_defaultItem != null) {
                resultArr.push(opt_defaultItem);
            }
        }
    }
    return resultArr;
}
