////////////////////////////////////////////////////////////////////////////////
// セレクターに使用できない文字をエスケープします
function selectorEscape(val) {
    return val.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
}

// 加算関数です
const addDecimal = function (value1, value2, opt_max = null) {
    let decimalDigits1 = String(value1).length - String(value1).lastIndexOf('.');
    let decimalDigits2 = String(value2).length - String(value2).lastIndexOf('.');
    let decimalDigits = Math.max([decimalDigits1, decimalDigits2]);
    let result = Math.floor((value1 * 100 + value2 * 100) / 10) / 10;
    if (opt_max != null) {
        result = Math.min(result, opt_max);
    }
    return result;
}

// 代入先のstep属性に併せて丸めた数値をセットします
function setInputValue(selector, value) {
    let step = $(selector).attr('step');
    let newValue = value;
    if (step && Number(step) < 1) {
        newValue = Number(value.toFixed(1));
    } else {
        newValue = Math.round(value);
    }
    $(selector).val(newValue);
}

// Mapのvalue(Array)にvalueを追加(push)します
function pushToMapValueArray(map, key, value) {
    if (map.has(key)) {
        if (value != null) {
            if (!map.get(key).includes(value)) {
                map.get(key).push(value);
            }
        }
    } else {
        if (value == null) {
            map.set(key, null);
        } else {
            map.set(key, [value]);
        }
    }
}

// オブジェクトのプロパティ値を同名の要素にセットします
function setObjectPropertiesToElements(obj, prefix, postfix) {
    Object.keys(obj).forEach(propName => {
        let inputElem = document.getElementById(prefix + propName + postfix);
        if (inputElem) {
            let value = obj[propName];
            let step = inputElem.step;
            if (step && Number(step) < 1) {
                value = value.toFixed(1);
            } else {
                value = Math.round(value);
            }
            inputElem.value = value;
        }
    });
}

////////////////////////////////////////////////////////////////////////////////
const calculateFormulaArray = function (statusObj, formulaArr, opt_max = null) {
    let result = 0;
    if (!$.isArray(formulaArr)) {
        if ($.isNumeric(formulaArr)) {
            result = Number(formulaArr);
        } else {
            if (formulaArr in statusObj) {
                result = statusObj[formulaArr];
            } else {
                console.error(statusObj, formulaArr, opt_max);
            }
        }
    } else {
        let operator = null;
        formulaArr.forEach(entry => {
            let subResult = 0;
            if (['+', '-', '*', '/'].includes(entry)) {
                operator = entry;
                return;
            } else if ($.isNumeric(entry)) {
                subResult = Number(entry);
            } else if ($.isArray(entry)) {
                subResult = calculateFormulaArray(statusObj, entry);
            } else {
                if (entry in statusObj) {
                    subResult = Number(statusObj[entry]);
                } else if (entry.indexOf('#') != -1) {
                    let nameArr = entry.split('#');
                    if ('ダメージ計算' in statusObj && nameArr[0] in statusObj['ダメージ計算']) {
                        let damageArrArr = statusObj['ダメージ計算'][nameArr[0]];
                        let damage = null;
                        for (let damageArr of damageArrArr) {
                            if (nameArr[1] == damageArr[0]) {
                                damage = damageArr[4];  // 非会心
                                break;
                            }
                        }
                        if (damage != null) {
                            subResult = damage;
                        } else {
                            console.error(statusObj, formulaArr, opt_max, entry);
                        }
                    }
                } else {
                    console.error(statusObj, formulaArr, opt_max);
                }
            }
            if (operator == null) {
                result += subResult;
            } else {
                switch (operator) {
                    case '+':
                        result += subResult;
                        break;
                    case '-':
                        result -= subResult;
                        break;
                    case '*':
                        result *= subResult;
                        result = Math.floor(result * 100) / 100;
                        break;
                    case '/':
                        result /= subResult;
                        break;
                }
            }
        });
    }
    if (opt_max != null) {
        let maxValue = calculateFormulaArray(statusObj, opt_max);
        if (result > maxValue) {
            result = maxValue;
        }
    }
    return result;
}

// 文字列を解析して、計算式Arrayを作成します
// 数値|数値%|数値%文字列|文字列
function analyzeFormulaStrSub(str, defaultItem = null) {
    let resultArr = [];
    if ($.isNumeric(str)) {
        resultArr.push(Number(str));
    } else {
        let strArr = str.split('%');
        if (strArr.length == 1) {
            resultArr.push(strArr[0]);
        } else {
            resultArr.push(Number(strArr[0]) / 100);
            resultArr.push('*');
            if (strArr[1].length > 0) {
                resultArr.push(strArr[1]);
            } else if (defaultItem != null) {
                resultArr.push(defaultItem);
            }
        }
    }
    return resultArr;
}

const analyzeFormulaStr = function (str, defaultItem = null) {
    let resultArr = [];
    let re = new RegExp('([0-9\\.]+%[^0-9\\.%\\+\\-\\*/]+|[0-9\\.]+%|\\-?[0-9\\.]+|[^0-9\\.%\\+\\-\\*/]+)([\\+\\-\\*/]?)(.*)');
    let workStr = str;
    while (true) {
        let reRet = re.exec(workStr);
        if (!reRet) {
            resultArr.push(workStr);
            break;
        }
        resultArr.push(analyzeFormulaStrSub(reRet[1], defaultItem));
        if (reRet[2]) {
            resultArr.push(reRet[2]);
            if (reRet[3]) {
                workStr = reRet[3];
                continue;
            } else {
                console.error(str, defaultItem);
            }
        } else if (reRet[3]) {
            console.error(str, defaultItem);
        }
        break;
    }
    return resultArr;
}

////////////////////////////////////////////////////////////////////////////////
// 防御補正を計算します
function calculate防御補正(opt_def = 0, opt_ignoreDef = 0, opt_statusObj = null) { // 防御力,防御無視
    if (opt_statusObj == null) {
        opt_statusObj = ステータス詳細ObjVar;
    }
    let level = Number($('#レベルInput').val().replace('+', ''));
    let enemyLevel = opt_statusObj['敵レベル'];
    let calcIgnoreDef = opt_ignoreDef / 100;
    let calcDef = opt_def / 100;
    let result = (level + 100) / ((1 - calcIgnoreDef) * (1 + calcDef) * (enemyLevel + 100) + level + 100);
    return result;
}

// 元素耐性補正を計算します
function calculate元素耐性補正(element, opt_statusObj = null) {
    if (opt_statusObj == null) {
        opt_statusObj = ステータス詳細ObjVar;
    }
    let res = opt_statusObj['敵' + element + (element != '物理' ? '元素' : '') + '耐性'];
    if (res < 0) {
        res = 100 - res / 2;
    } else if (res < 75) {
        res = 100 - res;
    } else {
        res = 100 / (4 * res + 100)
    }
    return res / 100;
}

// 蒸発 融解
function calculate乗算系元素反応倍率(element, elementalMastery, elementalReaction, opt_statusObj = null) {
    if (opt_statusObj == null) {
        opt_statusObj = ステータス詳細ObjVar;
    }
    if (!element || element == '物理' || !(elementalReaction in 元素反応MasterVar[element])) {
        return 0;
    }
    let result = 元素反応MasterVar[element][elementalReaction]['数値'];
    let dmgBuff = opt_statusObj[elementalReaction + 'ダメージバフ'];
    result *= 1 + 25 * elementalMastery / (9 * (elementalMastery + 1400)) + dmgBuff / 100;
    return result;
}

// 過負荷 感電 超電導
function calculate固定値系元素反応ダメージ(element, elementalMastery, elementalReaction, opt_statusObj = null) {
    if (opt_statusObj == null) {
        opt_statusObj = ステータス詳細ObjVar;
    }
    if (!element || element == '物理' || !(elementalReaction in 元素反応MasterVar[element])) {
        return 0;
    }
    let level = Number($('#レベルInput').val().replace('+', ''));
    let dmgBuff = opt_statusObj[elementalReaction + 'ダメージバフ'];
    let result = 元素反応MasterVar[element][elementalReaction]['数値'][level];
    result *= 1 + 16 * elementalMastery / (elementalMastery + 2000) + dmgBuff / 100;
    return result;
}

// 結晶
function calculate結晶シールド吸収量(element, elementalMastery, opt_statusObj = null) {
    if (opt_statusObj == null) {
        opt_statusObj = ステータス詳細ObjVar;
    }
    if (!element || element == '物理' || !('結晶' in 元素反応MasterVar[element])) {
        return 0;
    }
    let level = Number($('#レベルInput').val().replace('+', ''));
    let result = 元素反応MasterVar[element]['結晶']['数値'][level];
    result *= 1 + 4.44 * elementalMastery / (elementalMastery + 1400);
    return result;
}

// 蒸発
function calculate蒸発倍率(element, elementalMastery, opt_statusObj = null) {
    return calculate乗算系元素反応倍率(element, elementalMastery, '蒸発', opt_statusObj);
}

// 融解
function calculate溶解倍率(element, elementalMastery, opt_statusObj = null) {
    return calculate乗算系元素反応倍率(element, elementalMastery, '溶解', opt_statusObj);
}

// ダメージ計算を行います
const DAMAGE_CATEGORY_ARRAY = ['通常攻撃ダメージ', '重撃ダメージ', '落下攻撃ダメージ', '元素スキルダメージ', '元素爆発ダメージ'];
function calculateDamageFromDetailSub(formula, dmgBuff, critRate, critDmg, isTargetEnemy, element, enemyDef, ignoreDef, multi, opt_statusObj = null) {
    if (opt_statusObj == null) {
        opt_statusObj = ステータス詳細ObjVar;
    }
    let my非会心Result = calculateFormulaArray(opt_statusObj, formula);
    console.debug("%o => %o", formula, Math.round(my非会心Result));
    let my会心Result = null;
    let my期待値Result;
    if (dmgBuff) {
        my非会心Result *= (100 + dmgBuff) / 100;
    }
    if (isTargetEnemy) {    // 敵対象の場合、敵の耐性補正と防御補正を計算に加えます
        if (element) {
            my非会心Result *= calculate元素耐性補正(element, opt_statusObj);
        }
        my非会心Result *= calculate防御補正(enemyDef, ignoreDef, opt_statusObj);
    }
    if (multi) {    // 別枠乗算 for 宵宮
        my非会心Result *= multi / 100;
    }
    if (critRate > 0) {
        my会心Result = my非会心Result * (100 + critDmg) / 100;
        my会心Result = Math.round(my会心Result);
        let my会心率 = Math.min(100, Math.max(0, critRate));    // 0≦会心率≦100
        my期待値Result = (my会心Result * my会心率 / 100) + (my非会心Result * (100 - my会心率) / 100);
        my期待値Result = Math.round(my期待値Result);
        my非会心Result = Math.round(my非会心Result);
    } else {
        my非会心Result = Math.round(my非会心Result);
        my期待値Result = my非会心Result;
    }
    console.debug(dmgBuff, critRate, critDmg, isTargetEnemy, element, enemyDef, ignoreDef, multi, '=>', my期待値Result, my会心Result, my非会心Result);
    return [element, my期待値Result, my会心Result, my非会心Result];
}

function calculateDamageFromDetail(detailObj, opt_element = null, opt_statusObj = null) {
    if (opt_statusObj == null) {
        opt_statusObj = ステータス詳細ObjVar;
    }
    let my元素 = detailObj['元素'] != null ? detailObj['元素'] : opt_element != null ? opt_element : null;
    let myダメージバフ = 0;
    let my会心率 = opt_statusObj['会心率'];
    let my会心ダメージ = opt_statusObj['会心ダメージ'];
    let my別枠乗算 = 0; // for 宵宮
    let my敵防御力 = opt_statusObj['敵防御力'];
    let my防御無視 = 0; // for 雷電将軍
    let myHIT数 = detailObj['HIT数'] != null ? Number(detailObj['HIT数']) : 1;
    let myステータス補正 = {};

    let validConditionValueArr = makeValidConditionValueArr('#オプションBox');  // 有効な条件

    let my天賦性能変更詳細Arr = [];
    let myステータス変更系詳細Arr = [];
    // 対象指定ありのダメージ計算（主に加算）を適用したい
    天賦性能変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(valueObj => {
            let number = null;
            if (valueObj['条件']) {
                number = checkConditionMatches(valueObj['条件'], validConditionValueArr);
                if (number == 0) {
                    return;
                }
            }
            if (valueObj['対象']) {    // 大分類 or 大分類.小分類
                let my対象カテゴリArr = valueObj['対象'].split('.');
                if (my対象カテゴリArr[0] != detailObj['種類']) {
                    return;
                } if (my対象カテゴリArr.length > 1 && my対象カテゴリArr[my対象カテゴリArr.length - 1] != detailObj['名前']) {
                    return;
                }
            }
            if (valueObj['種類'].endsWith('元素付与')) {   // 元素付与は先んじて適用します
                if (!detailObj['元素付与無効'] && detailObj['種類'] != '追加ダメージ') {
                    my元素 = valueObj['種類'].replace('元素付与', '');
                }
            } else if (valueObj['種類'] == '防御無視') {   // 防御無視は先んじて適用します for 雷電将軍
                let myValue = calculateFormulaArray(opt_statusObj, valueObj['数値'], valueObj['最大値']);
                my防御無視 += myValue;
            } else if (valueObj['種類'] == '固有変数') {
                // nop
            } else {
                if (number != null && number != 1) {    // オプションの@以降の数値でスケールする場合あり
                    let myNewValueObj = JSON.parse(JSON.stringify(valueObj)); // deepcopy
                    myNewValueObj['数値'] = myNewValueObj['数値'].concat(['*', number]);
                    my天賦性能変更詳細Arr.push(myNewValueObj);
                } else {
                    my天賦性能変更詳細Arr.push(valueObj);
                }
            }
        });
    });
    console.debug(detailObj['名前'] + ':my天賦性能変更詳細Arr');
    console.debug(my天賦性能変更詳細Arr);

    // 対象指定ありのステータスアップを適用したい
    ステータス変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(value => {
            if (!value['対象']) return; // 対象指定なしのものは適用済みのためスキップします
            if (value['対象'].endsWith('元素ダメージ')) {   // for 九条裟羅
                if (!value['対象'].startsWith(my元素)) {
                    return;
                }
            } else {
                let my対象カテゴリArr = value['対象'].split('.');
                if (my対象カテゴリArr[0] != detailObj['種類']) {
                    return;
                } if (my対象カテゴリArr.length > 1 && my対象カテゴリArr[my対象カテゴリArr.length - 1] != detailObj['名前']) {
                    return;
                }
            }
            let myNewValue = value;
            let number = null;
            if (value['条件']) {
                number = checkConditionMatches(value['条件'], validConditionValueArr);
                if (number == 0) {
                    return;
                }
                if (number != null && number != 1) {    // オプションの@以降の数値でスケールする場合あり
                    let myNew数値 = value['数値'].concat(['*', number]);
                    myNewValue = JSON.parse(JSON.stringify(value)); // deepcopy
                    myNewValue['数値'] = myNew数値;
                }
            }
            myステータス変更系詳細Arr.push(myNewValue);
        });
    });
    console.debug(detailObj['名前'] + ':myステータス変更系詳細Arr');
    console.debug(myステータス変更系詳細Arr);

    myステータス変更系詳細Arr.forEach(valueObj => {
        if (!valueObj['数値']) return;
        let myValue = calculateFormulaArray(opt_statusObj, valueObj['数値'], valueObj['最大値']);
        switch (valueObj['種類']) {
            case '攻撃力':
                if (!('攻撃力' in myステータス補正)) {
                    myステータス補正['攻撃力'] = 0;
                }
                myステータス補正['攻撃力'] += myValue;
                break;
            case '会心率':      // for 辛炎 腐植の剣 甘雨 「漁獲」
                console.debug('my会心率', valueObj['数値'], my会心率, myValue);
                my会心率 += myValue;
                break;
            case '会心ダメージ':    // for 九条裟羅
                my会心ダメージ += myValue;
                break;
            case '別枠乗算':    // for 宵宮
                if (my別枠乗算 > 0) {
                    my別枠乗算 *= myValue / 100;    // for ディオナ
                } else {
                    my別枠乗算 = myValue;
                }
                break;
            default:
                if (valueObj['種類'] == '与えるダメージ') {
                    myダメージバフ += myValue;
                } else if (valueObj['種類'].endsWith('ダメージバフ')) {
                    if (valueObj['種類'].startsWith(my元素)) {
                        myダメージバフ += myValue;
                    } else if (valueObj['種類'].startsWith(valueObj['種類'])) {
                        myダメージバフ += myValue;
                    }
                }
                break;
        }
    });

    // 一時的にステータスを書き換えます。
    Object.keys(myステータス補正).forEach(statusName => {
        opt_statusObj[statusName] += myステータス補正[statusName];
    });

    let my計算Result;
    switch (detailObj['種類']) {
        case 'HP回復':
            let my回復バフ = opt_statusObj['与える治療効果'] + opt_statusObj['受ける治療効果'];
            my計算Result = calculateDamageFromDetailSub(detailObj['数値'], my回復バフ, null, null, false, null, null, null, null, opt_statusObj);
            break;
        case 'シールド':
            let myシールドバフ = opt_statusObj['シールド強化'];
            my計算Result = calculateDamageFromDetailSub(detailObj['数値'], myシールドバフ, null, null, false, my元素, null, null, my別枠乗算, opt_statusObj);
            break;
        case '元素創造物HP':    // for アンバー 甘雨
            my計算Result = calculateDamageFromDetailSub(detailObj['数値'], null, null, null, false, null, null, null, null, opt_statusObj);
            break;
        case '付加元素ダメージ':    // for 風キャラ
            my計算Result = calculateDamageFromDetailSub(detailObj['数値'], null, null, null, true, '炎', null, null, null, opt_statusObj);
            break;
        case '表示':    // for ベネット 九条裟羅 攻撃力上昇
            my計算Result = calculateDamageFromDetailSub(detailObj['数値'], null, null, null, false, null, null, null, null, opt_statusObj);
            break;
        case '他所基準ダメージ':
            my計算Result = calculateDamageFromDetailSub(detailObj['数値'], null, my会心率, my会心ダメージ, false, my元素, null, null, null, opt_statusObj);
            break;
        default:
            myダメージバフ += opt_statusObj['与えるダメージ'];
            if (detailObj['ダメージバフ'] != null) {
                myダメージバフ += opt_statusObj[detailObj['ダメージバフ']];
            } else if (DAMAGE_CATEGORY_ARRAY.includes(detailObj['種類'])) {
                myダメージバフ += opt_statusObj[detailObj['種類'] + 'バフ'];
            }
            if (my元素 != null) {
                myダメージバフ += opt_statusObj[my元素 == '物理' ? '物理ダメージバフ' : my元素 + '元素ダメージバフ'];
            }
            my計算Result = calculateDamageFromDetailSub(detailObj['数値'], myダメージバフ, my会心率, my会心ダメージ, true, my元素, my敵防御力, my防御無視, my別枠乗算, opt_statusObj);
            break;
    }
    console.debug(my計算Result);

    my天賦性能変更詳細Arr.forEach(valueObj => {
        if (valueObj['種類'].endsWith('ダメージアップ')) {
            let myResultWork = calculateDamageFromDetailSub(valueObj['数値'], myダメージバフ, my会心率, my会心ダメージ, true, my元素, my敵防御力, my防御無視, my別枠乗算, opt_statusObj);
            if (DAMAGE_CATEGORY_ARRAY.includes(detailObj['種類'])) {
                // 複数回HITするダメージについては、HIT数を乗算します
                if (myHIT数 > 1) {
                    myResultWork[1] *= myHIT数;
                    if (myResultWork[2] != null) {
                        myResultWork[2] *= myHIT数;
                    }
                    if (myResultWork[3] != null) {
                        myResultWork[3] *= myHIT数;
                    }
                }
            }
            my計算Result[1] += myResultWork[1];
            if (my計算Result[2] != null) {
                my計算Result[2] += myResultWork[2];
            }
            if (my計算Result[3] != null) {
                my計算Result[3] += myResultWork[3];
            }
        } else if (valueObj['種類'].endsWith('強化')) {
            let myResultWork;
            switch (detailObj['種類']) {
                case 'HP回復':  // for 早柚 珊瑚宮心海
                    let my回復バフ = opt_statusObj['与える治療効果'] + opt_statusObj['受ける治療効果'];
                    myResultWork = calculateDamageFromDetailSub(valueObj['数値'], my回復バフ, null, null, false, null, null, null, null, opt_statusObj);
                    break;
                case 'シールド':
                    let myシールドバフ = opt_statusObj['シールド強化'];
                    myResultWork = calculateDamageFromDetailSub(valueObj['数値'], myシールドバフ, null, null, false, my元素, null, null, my別枠乗算, opt_statusObj);
                    break;
                case '表示':    // for ベネット
                    myResultWork = calculateDamageFromDetailSub(valueObj['数値'], null, null, null, false, null, null, null, null, opt_statusObj);
                    break;
                default:
                    myResultWork = calculateDamageFromDetailSub(valueObj['数値'], myダメージバフ, my会心率, my会心ダメージ, true, my元素, my敵防御力, my防御無視, my別枠乗算, opt_statusObj);
                    break;
            }
            my計算Result[1] += myResultWork[1];
            if (my計算Result[2] != null) {
                my計算Result[2] += myResultWork[2];
            }
            if (my計算Result[3] != null) {
                my計算Result[3] += myResultWork[3];
            }
        }
    });

    // 書き換えたステータスを元に戻します。
    Object.keys(myステータス補正).forEach(statusName => {
        opt_statusObj[statusName] -= myステータス補正[statusName];
    });

    let my計算Result_蒸発 = [null, null, null];
    let my計算Result_溶解 = [null, null, null];
    if (detailObj['種類'] == 'シールド') {
        if (my計算Result[0] == '岩') {  // for ノエル 鍾離 岩元素シールド
            my計算Result[1] = Math.round(my計算Result[1] * 1.5);
            my計算Result[3] = Math.round(my計算Result[3] * 1.5);
        }
    } else if (my計算Result[0]) {
        let my元素熟知 = opt_statusObj['元素熟知'];
        let my蒸発倍率 = calculate蒸発倍率(my計算Result[0], my元素熟知, opt_statusObj);
        if (my蒸発倍率 > 0) {
            my計算Result_蒸発[0] = Math.round(my計算Result[1] * my蒸発倍率);
            if (my計算Result[2] != null) {
                my計算Result_蒸発[1] = Math.round(my計算Result[2] * my蒸発倍率);
            }
            if (my計算Result[3] != null) {
                my計算Result_蒸発[2] = Math.round(my計算Result[3] * my蒸発倍率);
            }
        }
        let my溶解倍率 = calculate溶解倍率(my計算Result[0], my元素熟知, opt_statusObj);
        if (my溶解倍率 > 0) {
            my計算Result_溶解[0] = Math.round(my計算Result[1] * my溶解倍率);
            if (my計算Result[2] != null) {
                my計算Result_溶解[1] = Math.round(my計算Result[2] * my溶解倍率);
            }
            if (my計算Result[3] != null) {
                my計算Result_溶解[2] = Math.round(my計算Result[3] * my溶解倍率);
            }
        }
    }
    let resultArr = [detailObj['名前'], my計算Result[0], my計算Result[1], my計算Result[2], my計算Result[3]];
    resultArr.push(my計算Result_蒸発[0]);
    resultArr.push(my計算Result_蒸発[1]);
    resultArr.push(my計算Result_蒸発[2]);
    resultArr.push(my計算Result_溶解[0]);
    resultArr.push(my計算Result_溶解[1]);
    resultArr.push(my計算Result_溶解[2]);
    return resultArr;
}

function compareFunction(a, b) {
    let arr = ['HP%', 'HP', 'HP上限', '防御力%', '防御力', '元素熟知', '会心率', '会心ダメージ', '与える治療効果', '受ける治療効果', '元素チャージ効率', '攻撃力%', '攻撃力'];
    let aIndex = arr.indexOf(a[0]);
    let bIndex = arr.indexOf(b[0]);
    return (aIndex != -1 ? aIndex : arr.length) - (bIndex != -1 ? bIndex : arr.length);
}

function calculateStatus(statusObj, kind, formulaArr, opt_max = null) {
    let result = calculateFormulaArray(statusObj, formulaArr, opt_max);
    let statusName = kind;
    if (!$.isNumeric(result)) {
        console.error(statusObj, kind, formulaArr, result);
    }
    if (KIND_TO_PROPERTY_MAP.has(kind)) {
        statusName = KIND_TO_PROPERTY_MAP.get(kind);
    } else {
        switch (kind) {
            case '自元素ダメージバフ':
                statusName = 選択中キャラクターデータVar['元素'] + '元素ダメージバフ';
                break;
            case '全元素ダメージバフ':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    let statusName = entry + '元素ダメージバフ';
                    statusObj[statusName] += result;
                });
                return;
            case '敵自元素耐性':
                statusName = '敵' + 選択中キャラクターデータVar['元素'] + '元素耐性';
                break;
            case '敵全元素耐性':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    let statusName = '敵' + entry + '元素耐性';
                    statusObj[statusName] += result;
                });
                return;
            case '全元素耐性':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    let statusName = entry + '元素耐性';
                    statusObj[statusName] += result;
                });
                return;
        }
    }
    statusObj[statusName] += result;
    console.debug(calculateStatus.name, null, kind, formulaArr, '=>', result);
}

// 条件適用可能かチェックします
// {条件名}
// {条件名}@{条件値}
// {条件名}@{条件値:START}-{条件値:END} ←この形式の場合条件値で倍率がかかります
// {条件名}@{条件値1},{条件値2},...     ←この形式の場合条件値で倍率がかかります
// {上記}^{排他条件名}
function checkConditionMatchesSub(conditionStr, validConditionValueArr) {
    let myCondArr = conditionStr.split('@');
    if (myCondArr[0] == '命ノ星座') {
        if (myCondArr.length == 2) {
            const re = new RegExp('[^0-9]*([0-9\\.]+).*');
            let reRet = re.exec(myCondArr[1]);
            if (reRet) {
                let myConstellation = $('#命ノ星座Input').val();
                if (Number(reRet[1]) <= Number(myConstellation)) {
                    return 1;
                }
            }
        }
        return 0;   // アンマッチ
    }
    if (validConditionValueArr.includes(conditionStr)) {
        if (myCondArr.length == 1 || (myCondArr[1].indexOf('-') == -1 && myCondArr[1].indexOf(',') == -1)) {
            return 1;   // マッチ 等倍
        }
    } else if (myCondArr.length == 1 || (myCondArr[1].indexOf('-') == -1 && myCondArr[1].indexOf(',') == -1)) {
        return 0;   // アンマッチ
    }
    const re = new RegExp('[^0-9]*([0-9\\.]+).*');    // 条件値={prefix}{倍率}{postfix}
    for (let i = 0; i < validConditionValueArr.length; i++) {
        if (validConditionValueArr[i].startsWith(myCondArr[0] + '@')) {
            let workArr = validConditionValueArr[i].split('@');
            let reRet = re.exec(workArr[1]);
            if (reRet) {
                return Number(reRet[1]);    // マッチ x倍
            }
            console.error(conditionStr, validConditionValueArr[i]);
        }
    }
    return 0;   // アンマッチ
}
const checkConditionMatches = function (conditionStr, validConditionValueArr) {
    let myCondStrArr = conditionStr.split('^')[0].split('&');   // &はAND条件です
    let result = 1;
    for (let i = 0; i < myCondStrArr.length; i++) {
        let resultSub = checkConditionMatchesSub(myCondStrArr[i], validConditionValueArr);
        if (resultSub == 0) {
            return 0;   // アンマッチ
        }
        if (resultSub != 1) {
            result = resultSub;
        }
    }
    return result;
}

function makeValidConditionValueArr(parentSelector) {
    let validConditionValueArr = [];
    $(parentSelector + ' input[type="checkbox"]').each((index, elem) => {
        if (elem.checked) {
            validConditionValueArr.push(elem.id.replace(new RegExp('Option$'), ''));
        }
    });
    $(parentSelector + ' select').each((index, elem) => {
        if (elem.value) {
            validConditionValueArr.push(elem.id.replace(new RegExp('Option$'), '') + '@' + elem.value);
        }
    });
    return validConditionValueArr;
}



// とても大事なデータを作成しています
const makeTalentDetailArray = function (talentDataObj, level, defaultKind, defaultElement, statusChangeArrMap, talentChangeArrMap, inputCategory) {
    let resultArr = [];
    if ('詳細' in talentDataObj) {
        talentDataObj['詳細'].forEach(detailObj => {
            let my種類 = '種類' in detailObj ? detailObj['種類'] : defaultKind;
            let my数値 = null;
            if ('数値' in detailObj) {
                my数値 = detailObj['数値'];
                if ($.isPlainObject(my数値) && level != null && level in my数値) { // キャラクター|武器のサブステータス
                    my数値 = my数値[level];
                } else if ($.isNumeric(my数値) || $.type(my数値) == 'string') {
                    // nop
                } else {
                    console.error(talentDataObj, level, defaultKind, defaultElement, inputCategory);
                }
                if (my種類.endsWith('ダメージ')) {
                    my数値 = analyzeFormulaStr(my数値, '攻撃力');
                } else {
                    my数値 = analyzeFormulaStr(my数値, my種類);
                }
            }
            let my条件 = null;
            if ('条件' in detailObj) {
                my条件 = detailObj['条件'];
                if (level && $.isPlainObject(my条件) && level in my条件) {  // 武器は精錬ランクによって数値を変えたいときがあるので
                    my条件 = my条件[level];
                }
            }
            let my最大値 = null;
            if ('最大値' in detailObj) {
                my最大値 = detailObj['最大値'];
                if (level != null && $.isPlainObject(my最大値) && level in my最大値) {   // 草薙の稲光
                    my最大値 = my最大値[level];
                }
                my最大値 = analyzeFormulaStr(my最大値);
            }
            let resultObj = {
                名前: detailObj['名前'],
                種類: my種類,
                元素: '元素' in detailObj ? detailObj['元素'] : defaultElement,
                数値: my数値,
                条件: my条件,
                対象: '対象' in detailObj ? detailObj['対象'] : null,
                最大値: my最大値,
                HIT数: 'HIT数' in detailObj ? detailObj['HIT数'] : null,
                ダメージバフ: 'ダメージバフ' in detailObj ? detailObj['ダメージバフ'] : null,
                元素付与無効: '元素付与無効' in detailObj ? detailObj['元素付与無効'] : inputCategory == '武器'
            }
            if (statusChangeArrMap != null) {
                if (resultObj['種類'] in ステータス詳細ObjVar || resultObj['種類'].endsWith('%') || new RegExp('[自全].+バフ').exec(resultObj['種類']) || new RegExp('敵?[自全]元素耐性').exec(resultObj['種類']) || resultObj['種類'] == '別枠乗算') { // ex,HP上限,攻撃力%
                    resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                    statusChangeArrMap.get(inputCategory).push(resultObj);
                    return;
                }
            }
            if (talentChangeArrMap != null) {
                if (resultObj['種類'].endsWith('強化') || resultObj['種類'].endsWith('付与') || resultObj['種類'].endsWith('アップ') || resultObj['種類'] == '防御無視' || resultObj['種類'] == '固有変数') {   // ex.元素爆発強化,氷元素付与
                    resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                    talentChangeArrMap.get(inputCategory).push(resultObj);
                    return;
                }
            }
            resultArr.push(resultObj);
        });
    } else {
        //console.error(talentDataObj, level, defaultKind, defaultElement, inputCategory);
    }
    return resultArr;
}

const makeSpecialTalentDetailArray = function (talentDataObj, level, defaultKind, defaultElement, statusChangeArrMap, talentChangeArrMap, inputCategory) {
    if ('種類' in talentDataObj) {
        switch (talentDataObj['種類']) {
            case '元素スキルダメージ':
                level = $('#元素スキルレベルInput').val();
                defaultKind = talentDataObj['種類'];
                break;
            case '元素爆発ダメージ':
                level = $('#元素爆発レベルInput').val();
                defaultKind = talentDataObj['種類'];
                break;
        }
    }
    if ('元素' in talentDataObj) {
        defaultElement = talentDataObj['元素'];
    }
    return makeTalentDetailArray(talentDataObj, level, defaultKind, defaultElement, statusChangeArrMap, talentChangeArrMap, inputCategory);
}

// 「条件」からオプション表示用の情報を作成します Sub
function makeConditionExclusionMapFromStrSub(conditionStr, conditionMap, exclusionMap, exclusion) {
    let myCondStrArr = conditionStr.split('@');
    let myName = myCondStrArr[0];
    if (myCondStrArr.length == 1) {
        pushToMapValueArray(conditionMap, myName, null);
    } else if (myCondStrArr.length == 2) {
        if (myCondStrArr[1].indexOf('-') != -1) {
            const re = new RegExp('([^0-9\\.]*)([0-9\\.]+)-([0-9\\.]+)(.*)');
            const re2 = new RegExp('/([0-9\\.]+)(.*)');
            let reRet = re.exec(myCondStrArr[1]);
            if (reRet) {
                let prefix = reRet[1];
                let rangeStart = Number(reRet[2]);
                let rangeEnd = Number(reRet[3]);
                let step = rangeStart;
                let postfix = reRet[4];
                if (postfix) {
                    let re2Ret = re2.exec(postfix);
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
            let reRet = re.exec(myCondStrArr[1]);
            let prefix = reRet[1];
            let condValurArr = reRet[2].split(',');
            let postfix = reRet[3];
            condValurArr.forEach(value => {
                pushToMapValueArray(conditionMap, myName, prefix + value + postfix);
            });
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

// 「条件」からオプション表示用の情報を作成します
// {条件名}
// {条件名}@{条件値}
// {条件名}@{条件値:START}-{条件値:END} ←この形式の場合条件値で倍率がかかります
// {条件名}@{条件値1},{条件値2},...     ←この形式の場合条件値で倍率がかかります
// {上記}^{排他条件名}
const makeConditionExclusionMapFromStr = function (conditionStr, conditionMap, exclusionMap) {
    // 排他条件を抽出します
    let exclusionCond = null;
    let myCondStrArr = conditionStr.split('^');
    if (myCondStrArr.length > 1) {
        exclusionCond = myCondStrArr[1];
    }
    // AND条件
    myCondStrArr = myCondStrArr[0].split('&');
    myCondStrArr.forEach(myCondStr => {
        makeConditionExclusionMapFromStrSub(myCondStr, conditionMap, exclusionMap, exclusionCond);
    });
}

const ELEMENT_TD_CLASS_MAP = new Map([
    ['炎', 'pyro'],
    ['水', 'hydro'],
    ['風', 'aero'],
    ['雷', 'electro'],
    ['氷', 'cryo'],
    ['岩', 'geo']
]);

// ダメージ計算結果テーブルを表示します
const displayResultTable = function (tableId, categoryName, damageResultArr) {
    let tableElem = document.getElementById(tableId);
    while (tableElem.firstChild) {
        tableElem.removeChild(tableElem.firstChild);
    }

    if (damageResultArr.length == 0) return;

    let elementalReaction = $('input[name="元素反応Input"]:checked').val();

    let myIsHidden = true;
    if (resultTableVisibilityMap.has(tableId)) {
        myIsHidden = !resultTableVisibilityMap.get(tableId);
    }

    let theadElem = document.createElement('thead');
    tableElem.appendChild(theadElem);
    let trElem1 = document.createElement('tr');
    theadElem.appendChild(trElem1);
    let trElem2 = document.createElement('tr');
    trElem2.className = 'noreaction';
    trElem2.hidden = (elementalReaction != 'noreaction');
    tableElem.appendChild(trElem2);
    let trElem3 = document.createElement('tr');
    trElem3.className = 'noreaction hidable';
    trElem3.hidden = (elementalReaction != 'noreaction') || myIsHidden;
    tableElem.appendChild(trElem3);
    let trElem4 = document.createElement('tr');
    trElem4.className = 'noreaction hidable';
    trElem4.hidden = (elementalReaction != 'noreaction') || myIsHidden;
    tableElem.appendChild(trElem4);
    let thElem1 = document.createElement('th');
    thElem1.className = 'category';
    thElem1.textContent = categoryName;
    trElem1.appendChild(thElem1);
    let thElem2 = document.createElement('th');
    thElem2.className = 'label';
    thElem2.textContent = '期待値';
    trElem2.appendChild(thElem2);
    let thElem3 = document.createElement('th');
    thElem3.className = 'label';
    thElem3.textContent = '会心';
    trElem3.appendChild(thElem3);
    let thElem4 = document.createElement('th');
    thElem4.className = 'label';
    thElem4.textContent = '非会心';
    trElem4.appendChild(thElem4);
    // 蒸発ダメージ
    let trElem5 = document.createElement('tr');
    trElem5.className = 'vaporize';
    trElem5.hidden = (elementalReaction != 'vaporize');
    tableElem.appendChild(trElem5);
    let trElem6 = document.createElement('tr');
    trElem6.className = 'vaporize hidable';
    trElem6.hidden = (elementalReaction != 'vaporize') || myIsHidden;
    tableElem.appendChild(trElem6);
    let trElem7 = document.createElement('tr');
    trElem7.className = 'vaporize hidable';
    trElem7.hidden = (elementalReaction != 'vaporize') || myIsHidden;
    tableElem.appendChild(trElem7);
    let thElem5 = document.createElement('th');
    thElem5.className = 'label';
    thElem5.textContent = '期待値';
    trElem5.appendChild(thElem5);
    let thElem6 = document.createElement('th');
    thElem6.className = 'label';
    thElem6.textContent = '会心';
    trElem6.appendChild(thElem6);
    let thElem7 = document.createElement('th');
    thElem7.className = 'label';
    thElem7.textContent = '非会心';
    trElem7.appendChild(thElem7);
    // 溶解ダメージ
    let trElem8 = document.createElement('tr');
    trElem8.className = 'melt';
    trElem8.hidden = (elementalReaction != 'melt');
    tableElem.appendChild(trElem8);
    let trElem9 = document.createElement('tr');
    trElem9.className = 'melt hidable';
    trElem9.hidden = (elementalReaction != 'melt') || myIsHidden;
    tableElem.appendChild(trElem9);
    let trElem10 = document.createElement('tr');
    trElem10.className = 'melt hidable';
    trElem10.hidden = (elementalReaction != 'melt') || myIsHidden;
    tableElem.appendChild(trElem10);
    let thElem8 = document.createElement('th');
    thElem8.className = 'label';
    thElem8.textContent = '期待値';
    trElem8.appendChild(thElem8);
    let thElem9 = document.createElement('th');
    thElem9.className = 'label';
    thElem9.textContent = '会心';
    trElem9.appendChild(thElem9);
    let thElem10 = document.createElement('th');
    thElem10.className = 'label';
    thElem10.textContent = '非会心';
    trElem10.appendChild(thElem10);

    damageResultArr.forEach(valueArr => {
        let tdClassName = null;
        if (valueArr[1] && ELEMENT_TD_CLASS_MAP.has(valueArr[1])) {
            tdClassName = ELEMENT_TD_CLASS_MAP.get(valueArr[1]);
        }
        let thElem1 = document.createElement('th');
        if (valueArr[0]) {
            let name = valueArr[0];
            if (damageResultArr.length > 2) {
                name = name.replace('のダメージ', '');
            }
            if (damageResultArr.length > 3) {
                thElem1.textContent = name.replace('ダメージ', '');
            } else {
                thElem1.textContent = name;
            }
        }
        trElem1.appendChild(thElem1);
        let tdElem2 = document.createElement('td');
        tdElem2.textContent = valueArr[2];
        tdElem2.className = tdClassName;
        trElem2.appendChild(tdElem2);
        let tdElem3 = document.createElement('td');
        tdElem3.textContent = valueArr[3];
        tdElem3.className = tdClassName;
        trElem3.appendChild(tdElem3);
        let tdElem4 = document.createElement('td');
        tdElem4.textContent = valueArr[4];
        tdElem4.className = tdClassName;
        trElem4.appendChild(tdElem4);
        // 蒸発ダメージ
        let tdElem5 = document.createElement('td');
        tdElem5.textContent = valueArr[5] != null ? valueArr[5] : valueArr[2];
        tdElem5.className = tdClassName;
        trElem5.appendChild(tdElem5);
        let tdElem6 = document.createElement('td');
        tdElem6.textContent = valueArr[6] != null ? valueArr[6] : valueArr[3];
        tdElem6.className = tdClassName;
        trElem6.appendChild(tdElem6);
        let tdElem7 = document.createElement('td');
        tdElem7.textContent = valueArr[7] != null ? valueArr[7] : valueArr[4];
        tdElem7.className = tdClassName;
        trElem7.appendChild(tdElem7);
        // 溶解ダメージ
        let tdElem8 = document.createElement('td');
        tdElem8.textContent = valueArr[8] != null ? valueArr[8] : valueArr[2];
        tdElem8.className = tdClassName;
        trElem8.appendChild(tdElem8);
        let tdElem9 = document.createElement('td');
        tdElem9.textContent = valueArr[9] != null ? valueArr[9] : valueArr[3];
        tdElem9.className = tdClassName;
        trElem9.appendChild(tdElem9);
        let tdElem10 = document.createElement('td');
        tdElem10.textContent = valueArr[10] != null ? valueArr[10] : valueArr[4];
        tdElem10.className = tdClassName;
        trElem10.appendChild(tdElem10);
    });
}

// オプションBox用 input[type=checkbox]およびselect要素を追加します
const appendInputForOptionElement = function (parentElemId, optionMap, name, opt_checked = true) {
    optionMap.forEach((value, key) => {
        if (value) return;

        let divElem = document.createElement('div');
        $('#' + selectorEscape(parentElemId)).append(divElem);

        let elem = document.createElement('input');
        elem.type = 'checkbox';
        if (opt_checked) {  // チェック指定ありの場合でも、自身の排他条件のうちcheckedのものが存在すればチェックしません
            let myChecked = true;
            if (オプション排他MapVar.has(key)) {
                オプション排他MapVar.get(key).forEach(entry => {
                    if ($('#' + selectorEscape(entry) + 'Option').prop('checked')) {
                        myChecked = false;
                    }
                });
            }
            elem.checked = myChecked;
        } else {
            elem.checked = opt_checked;
        }
        elem.value = value;
        elem.id = key + 'Option';
        elem.name = name;
        divElem.appendChild(elem);

        let labelElem = document.createElement('label');
        labelElem.htmlFor = elem.id;
        labelElem.textContent = key;
        elem.after(labelElem);

        elem.onchange = オプションInputOnChange;
    });
    optionMap.forEach((value, key) => {
        if (!value) return;

        let divElem = document.createElement('div');
        $('#' + selectorEscape(parentElemId)).append(divElem);

        let elem = document.createElement('select');
        elem.id = key + 'Option';
        elem.name = name;
        divElem.append(elem);
        let optionElem = document.createElement('option');
        elem.appendChild(optionElem);
        value.forEach(v => {
            optionElem = document.createElement('option');
            optionElem.text = v;
            optionElem.value = v;
            elem.appendChild(optionElem);
        });
        if (opt_checked) {
            let mySelected = true;
            if (オプション排他MapVar.has(key)) {
                オプション排他MapVar.get(key).forEach(entry => {
                    if ($('#' + selectorEscape(entry) + 'Option').prop('checked')) {
                        mySelected = false;
                    }
                });
            }
            optionElem.selected = mySelected;
        }

        let labelElem = document.createElement('label');
        labelElem.htmlFor = elem.id;
        labelElem.textContent = key;
        elem.before(labelElem);

        elem.onchange = オプションInputOnChange;
        applyOptionVariable(elem);
    });
}

// キャラクターデータから
const setupBaseDamageDetailDataCharacter = function () {
    let my通常攻撃レベル = $('#通常攻撃レベルInput').val();
    let my元素スキルレベル = $('#元素スキルレベルInput').val();
    let my元素爆発レベル = $('#元素爆発レベルInput').val();

    ステータス変更系詳細ArrMapVar.set('キャラクター', []);
    天賦性能変更系詳細ArrMapVar.set('キャラクター', []);
    その他_基礎ダメージ詳細ArrMapVar.set('キャラクター', []);

    // 通常攻撃を解析します。Object
    let my天賦レベル = my通常攻撃レベル;
    let myデフォルト種類 = '通常攻撃ダメージ';
    let myデフォルト元素 = getNormalAttackDefaultElement();
    let myTalentDataObj = 選択中キャラクターデータVar['通常攻撃'];
    通常攻撃_基礎ダメージ詳細ArrVar = makeTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
    console.debug('通常攻撃_基礎ダメージ詳細ArrVar');
    console.debug(通常攻撃_基礎ダメージ詳細ArrVar);
    // 特殊通常攻撃を解析します。Object
    特殊通常攻撃_基礎ダメージ詳細MapVar.clear();
    if ('特殊通常攻撃' in 選択中キャラクターデータVar) {
        myTalentDataObj = 選択中キャラクターデータVar['特殊通常攻撃'];
        if ('種類' in myTalentDataObj) {
            switch (myTalentDataObj['種類']) {
                case '元素スキルダメージ':
                    my天賦レベル = my元素スキルレベル;
                    break;
                case '元素爆発ダメージ':
                    my天賦レベル = my元素爆発レベル;
                    break;
            }
        }
        if ('元素' in myTalentDataObj) {
            myデフォルト元素 = myTalentDataObj['元素'];
        }
        let myMapKey = myTalentDataObj['条件'];    // 特殊＊＊に切り替わる条件です。必須です
        let myMapValue = makeSpecialTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
        特殊通常攻撃_基礎ダメージ詳細MapVar.set(myMapKey, myMapValue);
        console.debug('特殊通常攻撃_基礎ダメージ詳細MapVar');
        console.debug(特殊通常攻撃_基礎ダメージ詳細MapVar);
    }

    // 重撃を解析します。Object
    my天賦レベル = my通常攻撃レベル;
    myデフォルト種類 = '重撃ダメージ';
    myデフォルト元素 = getNormalAttackDefaultElement();
    myTalentDataObj = 選択中キャラクターデータVar['重撃'];
    重撃_基礎ダメージ詳細ArrVar = makeTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
    console.debug('重撃_基礎ダメージ詳細ArrVar');
    console.debug(重撃_基礎ダメージ詳細ArrVar);
    // 特殊重撃を解析します。Object
    if ('特殊重撃' in 選択中キャラクターデータVar) {
        myTalentDataObj = 選択中キャラクターデータVar['特殊重撃'];
        if ('種類' in myTalentDataObj) {
            switch (myTalentDataObj['種類']) {
                case '元素スキルダメージ':
                    my天賦レベル = my元素スキルレベル;
                    break;
                case '元素爆発ダメージ':
                    my天賦レベル = my元素爆発レベル;
                    break;
            }
        }
        if ('元素' in myTalentDataObj) {
            myデフォルト元素 = myTalentDataObj['元素'];
        }
        let myMapKey = myTalentDataObj['条件'];    // 特殊＊＊に切り替わる条件です。必須です
        let myMapValue = makeSpecialTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
        特殊重撃_基礎ダメージ詳細MapVar.set(myMapKey, myMapValue);
        console.debug('特殊重撃_基礎ダメージ詳細MapVar');
        console.debug(特殊重撃_基礎ダメージ詳細MapVar);
    }

    // 落下攻撃を解析します。Object
    my天賦レベル = my通常攻撃レベル;
    myデフォルト種類 = '落下攻撃ダメージ';
    myデフォルト元素 = getNormalAttackDefaultElement();
    myTalentDataObj = 選択中キャラクターデータVar['落下攻撃'];
    落下攻撃_基礎ダメージ詳細ArrVar = makeTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
    console.debug('落下攻撃_基礎ダメージ詳細ArrVar');
    console.debug(落下攻撃_基礎ダメージ詳細ArrVar);
    // 特殊落下攻撃を解析します。Object
    if ('特殊落下攻撃' in 選択中キャラクターデータVar) {
        myTalentDataObj = 選択中キャラクターデータVar['特殊落下攻撃'];
        let myMapKey = myTalentDataObj['条件'];    // 特殊＊＊に切り替わる条件です。必須です
        let myMapValue = makeSpecialTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
        特殊落下攻撃_基礎ダメージ詳細MapVar.set(myMapKey, myMapValue);
        console.debug('特殊落下攻撃_基礎ダメージ詳細MapVar');
        console.debug(特殊落下攻撃_基礎ダメージ詳細MapVar);
    }

    // 元素スキルを解析します。Object
    my天賦レベル = my元素スキルレベル;
    myデフォルト種類 = '元素スキルダメージ';
    myデフォルト元素 = キャラクター元素Var;
    myTalentDataObj = 選択中キャラクターデータVar['元素スキル'];
    元素スキル_基礎ダメージ詳細ArrVar = makeTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
    if ('一回押し' in myTalentDataObj) {
        let myWorkArr = makeTalentDetailArray(myTalentDataObj['一回押し'], my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
        元素スキル_基礎ダメージ詳細ArrVar = 元素スキル_基礎ダメージ詳細ArrVar.concat(myWorkArr);
    }
    if ('長押し' in myTalentDataObj) {
        let myWorkArr = makeTalentDetailArray(myTalentDataObj['長押し'], my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
        元素スキル_基礎ダメージ詳細ArrVar = 元素スキル_基礎ダメージ詳細ArrVar.concat(myWorkArr);
    }
    console.debug('元素スキル_基礎ダメージ詳細ArrVar');
    console.debug(元素スキル_基礎ダメージ詳細ArrVar);
    // 特殊元素スキルを解析します。Object
    if ('特殊元素スキル' in 選択中キャラクターデータVar) {
        myTalentDataObj = 選択中キャラクターデータVar['特殊元素スキル'];
        let myMapKey = talentDataObj['条件'];    // 特殊＊＊に切り替わる条件です。必須です
        let myMapValue = makeSpecialTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
        特殊元素スキル_基礎ダメージ詳細MapVar.set(myMapKey, myMapValue);
        console.debug('特殊元素スキル_基礎ダメージ詳細MapVar');
        console.debug(特殊元素スキル_基礎ダメージ詳細MapVar);
    }

    // 元素爆発を解析します。Object
    my天賦レベル = my元素爆発レベル;
    myデフォルト種類 = '元素爆発ダメージ';
    myデフォルト元素 = キャラクター元素Var;
    myTalentDataObj = 選択中キャラクターデータVar['元素爆発'];
    元素爆発_基礎ダメージ詳細ArrVar = makeTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
    console.debug('元素爆発_基礎ダメージ詳細ArrVar');
    console.debug(元素爆発_基礎ダメージ詳細ArrVar);
    // 特殊元素爆発を解析します。Object
    if ('特殊元素爆発' in 選択中キャラクターデータVar) {
        myTalentDataObj = 選択中キャラクターデータVar['特殊元素爆発'];
        let myMapKey = talentDataObj['条件'];    // 特殊＊＊に切り替わる条件です。必須です
        let myMapValue = makeSpecialTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
        特殊元素爆発_基礎ダメージ詳細MapVar.set(myMapKey, myMapValue);
        console.debug('特殊元素爆発_基礎ダメージ詳細MapVar');
        console.debug(特殊元素爆発_基礎ダメージ詳細MapVar);
    }

    // その他天賦を解析します。Array
    if ('その他天賦' in 選択中キャラクターデータVar) {
        選択中キャラクターデータVar['その他天賦'].forEach(element => {
            myTalentDataObj = element;
            let resultArr = makeTalentDetailArray(myTalentDataObj, null, null, null, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
            if (resultArr.length > 0) {
                その他_基礎ダメージ詳細ArrMapVar.set('キャラクター', resultArr);
                console.debug('その他_基礎ダメージ詳細ArrMapVar.get(キャラクター)');
                console.debug(その他_基礎ダメージ詳細ArrMapVar.get('キャラクター'));
            }
        })
    };

    // 命ノ星座を解析します。Object
    if ('命ノ星座' in 選択中キャラクターデータVar) {
        for (let i = 1; i <= $('#命ノ星座Input').val(); i++) {
            myTalentDataObj = 選択中キャラクターデータVar['命ノ星座'][i];
            let resultArr = makeTalentDetailArray(myTalentDataObj, null, null, null, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
            if (resultArr.length > 0) {
                if (その他_基礎ダメージ詳細ArrMapVar.has('キャラクター')) {
                    resultArr = その他_基礎ダメージ詳細ArrMapVar.get('キャラクター').concat(resultArr);
                }
                その他_基礎ダメージ詳細ArrMapVar.set('キャラクター', resultArr);
                console.debug('その他_基礎ダメージ詳細ArrMapVar.get(キャラクター)');
                console.debug(その他_基礎ダメージ詳細ArrMapVar.get('キャラクター'));
            }
        }
    }

    console.debug('ステータス変更系詳細ArrMapVar.get(キャラクター)');
    console.debug(ステータス変更系詳細ArrMapVar.get('キャラクター'));
    console.debug('天賦性能変更系詳細ArrMapVar.get(キャラクター)');
    console.debug(天賦性能変更系詳細ArrMapVar.get('キャラクター'));
}

// 武器データより
const setupBaseDamageDetailDataWeapon = function () {
    ステータス変更系詳細ArrMapVar.set('武器', []);
    天賦性能変更系詳細ArrMapVar.set('武器', []);
    その他_基礎ダメージ詳細ArrMapVar.set('武器', []);
    let my精錬ランク = $('#精錬ランクInput').val();
    if ('武器スキル' in 選択中武器データVar) {
        let resultArr = makeTalentDetailArray(選択中武器データVar['武器スキル'], my精錬ランク, null, null, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, '武器');
        if (resultArr.length > 0) {
            その他_基礎ダメージ詳細ArrMapVar.set('武器', resultArr);
            console.debug('その他_基礎ダメージ詳細ArrMapVar.get(武器)');
            console.debug(その他_基礎ダメージ詳細ArrMapVar.get('武器'));
        }
    }
    console.debug('ステータス変更系詳細ArrMapVar.get(武器)');
    console.debug(ステータス変更系詳細ArrMapVar.get('武器'));
    console.debug('天賦性能変更系詳細ArrMapVar.get(武器)');
    console.debug(天賦性能変更系詳細ArrMapVar.get('武器'));
}

// 聖遺物セットデータより
const setupBaseDamageDetailDataArtifactSet = function () {
    ステータス変更系詳細ArrMapVar.set('聖遺物セット', []);
    選択中聖遺物セット効果データArrVar.forEach(data => {
        let myArr = makeTalentDetailArray(data, null, null, null, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, '聖遺物セット');
        if (myArr.length != 0) {
            console.error(data);
        }
    });
    console.debug('ステータス変更系詳細ArrMapVar.get(聖遺物セット)');
    console.debug(ステータス変更系詳細ArrMapVar.get('聖遺物セット'));
}

// ダメージ計算Areaを更新します
const inputOnChangeResultUpdate = function () {
    if (!選択中キャラクターデータVar) return;
    if (!選択中武器データVar) return;
    if (!選択中敵データVar) return;

    Object.keys(ステータス詳細ObjVar).forEach(key => {
        let elem = document.getElementById(key + 'Input');
        if (elem) {
            ステータス詳細ObjVar[key] = Number(elem.value);
        }
    });

    let my元素熟知 = ステータス詳細ObjVar['元素熟知'];
    let my蒸発倍率 = calculate蒸発倍率(キャラクター元素Var, my元素熟知, ステータス詳細ObjVar);
    if (my蒸発倍率) {
        $('#元素反応蒸発Input+label').text('蒸発×' + Math.round(my蒸発倍率 * 100) / 100);
    }
    let my溶解倍率 = calculate溶解倍率(キャラクター元素Var, my元素熟知, ステータス詳細ObjVar);
    if (my溶解倍率) {
        $('#元素反応溶解Input+label').text('溶解×' + Math.round(my溶解倍率 * 100) / 100);
    }
    let my過負荷ダメージ = calculate固定値系元素反応ダメージ(キャラクター元素Var, my元素熟知, '過負荷', ステータス詳細ObjVar);
    if (my過負荷ダメージ) {
        $('#元素反応過負荷Label').text('過負荷' + Math.round(my過負荷ダメージ));
        $('#元素反応過負荷Label').show();
    } else {
        $('#元素反応過負荷Label').hide();
    }
    let my感電ダメージ = calculate固定値系元素反応ダメージ(キャラクター元素Var, my元素熟知, '感電', ステータス詳細ObjVar);
    if (my感電ダメージ) {
        $('#元素反応感電Label').text('感電' + Math.round(my感電ダメージ));
        $('#元素反応感電Label').show();
    } else {
        $('#元素反応感電Label').hide();
    }
    let my超電導ダメージ = calculate固定値系元素反応ダメージ(キャラクター元素Var, my元素熟知, '超電導', ステータス詳細ObjVar);
    if (my超電導ダメージ) {
        $('#元素反応超電導Label').text('超電導' + Math.round(my超電導ダメージ));
        $('#元素反応超電導Label').show();
    } else {
        $('#元素反応超電導Label').hide();
    }
    let my拡散ダメージ = calculate固定値系元素反応ダメージ(キャラクター元素Var, my元素熟知, '拡散', ステータス詳細ObjVar);
    if (my拡散ダメージ) {
        $('#元素反応拡散Label').text('拡散' + Math.round(my拡散ダメージ));
        $('#元素反応拡散Label').show();
    } else {
        $('#元素反応拡散Label').hide();
    }
    let my結晶吸収量 = calculate結晶シールド吸収量(キャラクター元素Var, my元素熟知, ステータス詳細ObjVar);
    if (my結晶吸収量) {
        $('#元素反応結晶Label').text('結晶' + Math.round(my結晶吸収量));
        $('#元素反応結晶Label').show();
    } else {
        $('#元素反応結晶Label').hide();
    }

    let validConditionValueArr = makeValidConditionValueArr('#オプションBox');

    let myダメージ計算 = ステータス詳細ObjVar['ダメージ計算'];
    if (myダメージ計算 == null) {
        myダメージ計算 = {};
        ステータス詳細ObjVar['ダメージ計算'] = myダメージ計算;
    }
    myダメージ計算['通常攻撃'] = [];
    myダメージ計算['重撃'] = [];
    myダメージ計算['落下攻撃'] = [];
    myダメージ計算['元素スキル'] = [];
    myダメージ計算['元素爆発'] = [];
    myダメージ計算['その他'] = [];

    // 通常攻撃ダメージを計算します
    let myDamageDetailObjArr = 通常攻撃_基礎ダメージ詳細ArrVar;
    // 条件にマッチしていたならば、myDamageDetailObjArrを置き換えます
    特殊通常攻撃_基礎ダメージ詳細MapVar.forEach((value, key) => {
        if (validConditionValueArr.includes(key)) {
            myDamageDetailObjArr = value;
        }
    });
    myDamageDetailObjArr.forEach(detailObj => {
        if (detailObj['条件'] != null) {
            if (checkConditionMatches(detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        myダメージ計算['通常攻撃'].push(calculateDamageFromDetail(detailObj, 通常攻撃_元素Var));
    });
    console.debug('通常攻撃');
    console.debug(myダメージ計算['通常攻撃']);

    // 重撃ダメージを計算します
    myDamageDetailObjArr = 重撃_基礎ダメージ詳細ArrVar;
    // 条件にマッチしていたならば、myDamageDetailObjArrを置き換えます
    特殊重撃_基礎ダメージ詳細MapVar.forEach((value, key) => {
        if (validConditionValueArr.includes(key)) {
            myDamageDetailObjArr = value;
        }
    });
    myDamageDetailObjArr.forEach(detailObj => {
        if (detailObj['条件'] != null) {
            if (checkConditionMatches(detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        myダメージ計算['重撃'].push(calculateDamageFromDetail(detailObj, 重撃_元素Var));
    });
    console.debug('重撃');
    console.debug(myダメージ計算['重撃']);

    // 落下攻撃ダメージを計算します
    myDamageDetailObjArr = 落下攻撃_基礎ダメージ詳細ArrVar;
    // 条件にマッチしていたならば、myDamageDetailObjArrを置き換えます
    特殊落下攻撃_基礎ダメージ詳細MapVar.forEach((value, key) => {
        if (validConditionValueArr.includes(key)) {
            myDamageDetailObjArr = value;
        }
    });
    myDamageDetailObjArr.forEach(detailObj => {
        if (detailObj['条件'] != null) {
            if (checkConditionMatches(detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        myダメージ計算['落下攻撃'].push(calculateDamageFromDetail(detailObj, 落下攻撃_元素Var));
    });
    console.debug('落下攻撃');
    console.debug(myダメージ計算['落下攻撃']);

    // 元素スキルダメージを計算します
    myDamageDetailObjArr = 元素スキル_基礎ダメージ詳細ArrVar;
    myDamageDetailObjArr.forEach(detailObj => {
        if (detailObj['条件'] != null) {
            if (checkConditionMatches(detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        myダメージ計算['元素スキル'].push(calculateDamageFromDetail(detailObj, null));
    });
    console.debug('元素スキル');
    console.debug(myダメージ計算['元素スキル']);

    // 元素爆発ダメージを計算します
    myDamageDetailObjArr = 元素爆発_基礎ダメージ詳細ArrVar;
    myDamageDetailObjArr.forEach(detailObj => {
        if (detailObj['条件'] != null) {
            if (checkConditionMatches(detailObj['条件'], validConditionValueArr) == 0) {
                return;
            }
        }
        myダメージ計算['元素爆発'].push(calculateDamageFromDetail(detailObj, null));
    });
    console.debug('元素爆発');
    console.debug(myダメージ計算['元素爆発']);

    // その他ダメージを計算します
    その他_基礎ダメージ詳細ArrMapVar.forEach((value, key) => {
        myDamageDetailObjArr = value;
        myDamageDetailObjArr.forEach(detailObj => {
            myダメージ計算['その他'].push(calculateDamageFromDetail(detailObj, null));
        });
    });
    console.debug('その他');
    console.debug(myダメージ計算['その他']);

    displayResultTable('通常攻撃ダメージResult', '通常攻撃', myダメージ計算['通常攻撃']);
    displayResultTable('重撃ダメージResult', '重撃', myダメージ計算['重撃']);
    displayResultTable('落下攻撃ダメージResult', '落下攻撃', myダメージ計算['落下攻撃']);
    displayResultTable('元素スキルダメージResult', '元素スキル', myダメージ計算['元素スキル']);
    displayResultTable('元素爆発ダメージResult', '元素爆発', myダメージ計算['元素爆発']);
    if (myダメージ計算['その他'].length > 0) {
        $('#その他ダメージResult').show();
        displayResultTable('その他ダメージResult', 'その他', myダメージ計算['その他']);
    } else {
        $('#その他ダメージResult').hide();
    }

    // デバッグ情報を出力します
    setDebugInfo();
}

function calculateStatusObj(statusObj) {
    // キャラクターのサブステータスを計上します
    let myレベル = $('#レベルInput').val();
    Object.keys(選択中キャラクターデータVar['ステータス']).forEach(key => {
        if (['基礎HP', '基礎攻撃力', '基礎防御力'].includes(key)) return;
        calculateStatus(statusObj, key, 選択中キャラクターデータVar['ステータス'][key][myレベル]);
    });

    // 武器のサブステータスを計上します
    let my武器レベル = $('#武器レベルInput').val();
    Object.keys(選択中武器データVar['ステータス']).forEach(key => {
        if (['基礎攻撃力'].includes(key)) return;
        calculateStatus(statusObj, key, 選択中武器データVar['ステータス'][key][my武器レベル]);
    });

    // 聖遺物のメインステータスを計上します
    $('select[name="聖遺物メイン効果Input"]').each(function () {
        let rarerityId = this.id.replace('メイン効果', 'レアリティ');
        let rarerityElem = document.getElementById(rarerityId);
        calculateStatus(statusObj, this.value, [聖遺物メイン効果MasterVar[rarerityElem.value][this.value]]);
    });

    // 聖遺物のサブステータスを計上します
    statusObj['HP上限'] += Number($('#聖遺物サブ効果HPInput').val());
    statusObj['HP乗算'] += Number($('#聖遺物サブ効果HPPInput').val());
    statusObj['攻撃力'] += Number($('#聖遺物サブ効果攻撃力Input').val());
    statusObj['攻撃力乗算'] += Number($('#聖遺物サブ効果攻撃力PInput').val());
    statusObj['防御力'] += Number($('#聖遺物サブ効果防御力Input').val());
    statusObj['防御力乗算'] += Number($('#聖遺物サブ効果防御力PInput').val());
    statusObj['元素熟知'] += Number($('#聖遺物サブ効果元素熟知Input').val());
    statusObj['会心率'] += Number($('#聖遺物サブ効果会心率Input').val());
    statusObj['会心ダメージ'] += Number($('#聖遺物サブ効果会心ダメージInput').val());
    statusObj['元素チャージ効率'] += Number($('#聖遺物サブ効果元素チャージ効率Input').val());

    // 元素共鳴を計上します
    選択中元素共鳴データArrVar.forEach(detailObj => {
        if ('詳細' in detailObj) {
            if ($.isArray(detailObj['詳細'])) {
                detailObj['詳細'].forEach(data => {
                    calculateStatus(statusObj, data['種類'], data['数値']);
                });
            } else {
                let data = detailObj['詳細'];
                calculateStatus(statusObj, data['種類'], data['数値']);
            }
        }
    });

    // バフデバフオプションを計上します
    let validBuffDebuffConditionValueArr = makeValidConditionValueArr('#バフデバフオプションBox');;
    バフデバフ詳細ArrVar.forEach(detailObj => {
        let number = checkConditionMatches(detailObj['条件'], validBuffDebuffConditionValueArr);
        if (number == 0) return;
        let myNew数値 = detailObj['数値'];
        if (number != 1) {
            myNew数値 = myNew数値.concat(['*', number]);
        }
        calculateStatus(statusObj, detailObj['種類'], myNew数値);
    });

    // チームバフを計上します
    statusObj['攻撃力'] += Number($('#チーム攻撃力Input').val());
    statusObj['攻撃力乗算'] += Number($('#チーム攻撃力PInput').val());
    statusObj['防御力'] += Number($('#チーム防御力Input').val());
    statusObj['防御力乗算'] += Number($('#チーム防御力PInput').val());
    statusObj['元素熟知'] += Number($('#チーム元素熟知Input').val());
    statusObj['会心率'] += Number($('#チーム会心率Input').val());
    statusObj['会心ダメージ'] += Number($('#チーム会心ダメージInput').val());
    statusObj['通常攻撃ダメージバフ'] += Number($('#チーム通常攻撃ダメージバフInput').val());
    statusObj['重撃ダメージバフ'] += Number($('#チーム重撃ダメージバフInput').val());
    statusObj['落下攻撃ダメージバフ'] += Number($('#チーム落下攻撃ダメージバフInput').val());
    statusObj['元素スキルダメージバフ'] += Number($('#チーム元素スキルダメージバフInput').val());
    statusObj['元素爆発ダメージバフ'] += Number($('#チーム元素爆発ダメージバフInput').val());
    statusObj[選択中キャラクターデータVar['元素'] + '元素ダメージバフ'] += Number($('#チーム自元素ダメージバフInput').val());
    statusObj['物理ダメージバフ'] += Number($('#チーム物理ダメージバフInput').val());

    // ステータス変更系詳細ArrMapVarの登録内容を計上します
    // * キャラクター 固有天賦 命ノ星座
    // * 武器 アビリティ
    // * 聖遺物 セット効果
    let validConditionValueArr = makeValidConditionValueArr('#オプションBox');
    console.debug('validConditionValueArr');
    console.debug(validConditionValueArr);
    let myPriority1KindArr = ['元素チャージ効率'];    // 攻撃力の計算で参照するステータス 草薙の稲光
    let myPriority1KindFormulaArr = [];
    let myPriority2KindFormulaArr = [];
    let myKindFormulaArr = [];
    ステータス変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(value => {
            if (value['対象']) return;  // 対象指定ありのものはスキップします
            let myNew数値 = value['数値'];
            if (value['条件']) {
                let number = checkConditionMatches(value['条件'], validConditionValueArr);
                if (number == 0) return;
                if (number != 1) {
                    myNew数値 = myNew数値.concat(['*', number]);
                }
            }
            if (myPriority1KindArr.includes(value['種類'])) { // 攻撃力の計算で参照されるものを先に計上するため…
                myPriority1KindFormulaArr.push([value['種類'], myNew数値, value['最大値']]);
            } else if (value['種類'].endsWith('%')) {  // 乗算系(%付き)のステータスアップを先回しします HP 攻撃力 防御力しかないはず
                myPriority2KindFormulaArr.push([value['種類'], myNew数値, value['最大値']]);
            } else {
                myKindFormulaArr.push([value['種類'], myNew数値, value['最大値']]);
            }
        });
    });
    // 攻撃力の計算で参照されるステータスアップを先に計上します
    myPriority1KindFormulaArr.forEach(entry => {
        calculateStatus(statusObj, entry[0], entry[1], entry[2]);
    });
    // 乗算系のステータスアップを計上します HP% 攻撃力% 防御力%
    myPriority2KindFormulaArr.sort(compareFunction);
    myPriority2KindFormulaArr.forEach(entry => {
        calculateStatus(statusObj, entry[0], entry[1], entry[2]);
    });

    // HP上限 攻撃力 防御力を計算します
    // これより後に乗算系(%付き)のステータスアップがあると計算が狂います
    statusObj['HP上限'] += statusObj['基礎HP'] * (statusObj['HP乗算']) / 100;
    statusObj['HP上限'] = Math.floor(statusObj['HP上限']);  // 切り捨て
    statusObj['攻撃力'] += statusObj['基礎攻撃力'] * (statusObj['攻撃力乗算']) / 100;
    statusObj['攻撃力'] = Math.floor(statusObj['攻撃力']);  // 切り捨て
    statusObj['防御力'] += statusObj['基礎防御力'] * (statusObj['防御力乗算']) / 100;
    statusObj['防御力'] = Math.floor(statusObj['防御力']);  // 切り捨て

    // それ以外のステータスアップを計上します
    myKindFormulaArr.sort(compareFunction);
    myKindFormulaArr.forEach(entry => {
        calculateStatus(statusObj, entry[0], entry[1], entry[2]);
    });

    // 天賦性能変更系詳細ArrMapVarの登録内容を反映します
    天賦性能変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(value => {
            if (value['対象']) return;  // 対象指定ありのものはスキップします
            if (value['条件']) {
                let number = checkConditionMatches(value['条件'], validConditionValueArr);
                if (number == 0) return;
            }
            if (value['種類'].endsWith('元素付与')) {
                let my元素 = value['種類'].replace('元素付与', '');
                通常攻撃_元素Var = my元素;
                重撃_元素Var = my元素;
                落下攻撃_元素Var = my元素;
            }
        });
    });
}

// ステータスを計算します
const inputOnChangeStatusUpdateSub = function (opt_baseUpdate = true) {
    if (!選択中キャラクターデータVar) return;
    if (!選択中武器データVar) return;
    // 初期化
    initステータス詳細ObjVar();

    // 敵関連データをセットします
    Object.keys(選択中敵データVar).forEach(propName => {
        if (propName in ステータス詳細ObjVar) {
            ステータス詳細ObjVar['敵' + propName] = Number(選択中敵データVar[propName]);
        }
    });
    ステータス詳細ObjVar['敵レベル'] = Number($('#敵レベルInput').val());
    ステータス詳細ObjVar['敵防御力'] = 0;

    // キャラクターの基本ステータスをセットします
    let myレベル = $('#レベルInput').val();
    let my武器レベル = $('#武器レベルInput').val();
    if (opt_baseUpdate) {
        ステータス詳細ObjVar['基礎HP'] = Number(選択中キャラクターデータVar['ステータス']['基礎HP'][myレベル]);
        ステータス詳細ObjVar['基礎攻撃力'] = Number(選択中キャラクターデータVar['ステータス']['基礎攻撃力'][myレベル]) + Number(選択中武器データVar['ステータス']['基礎攻撃力'][my武器レベル]);
        ステータス詳細ObjVar['基礎防御力'] = Number(選択中キャラクターデータVar['ステータス']['基礎防御力'][myレベル]);
    } else {
        ステータス詳細ObjVar['基礎HP'] = Number($('#基礎HPInput').val());
        ステータス詳細ObjVar['基礎攻撃力'] = Number($('#基礎攻撃力Input').val());
        ステータス詳細ObjVar['基礎防御力'] = Number($('#基礎防御力Input').val());
    }
    ステータス詳細ObjVar['HP上限'] = ステータス詳細ObjVar['基礎HP'];
    ステータス詳細ObjVar['攻撃力'] = ステータス詳細ObjVar['基礎攻撃力'];
    ステータス詳細ObjVar['防御力'] = ステータス詳細ObjVar['基礎防御力'];

    calculateStatusObj(ステータス詳細ObjVar);
}

// ステータスAreaを更新します
const inputOnChangeStatusUpdate = function () {
    inputOnChangeStatusUpdateSub(true);

    // ステータス詳細ObjVar⇒各Input要素 値をコピーします
    setObjectPropertiesToElements(ステータス詳細ObjVar, '', 'Input');

    inputOnChangeResultUpdate();
}

// ステータスAreaを更新します
const inputOnChangeStatusUpdateExceptBase = function () {
    inputOnChangeStatusUpdateSub(false);

    // ステータス詳細ObjVar⇒各Input要素 値をコピーします
    setObjectPropertiesToElements(ステータス詳細ObjVar, '', 'Input');

    inputOnChangeResultUpdate();
}

$(document).on('change', 'input[name="基礎ステータスInput"]', inputOnChangeStatusUpdateExceptBase);
$(document).on('change', 'input[name="ステータスInput"]', inputOnChangeResultUpdate);

// オプションBoxを再構成します
const inputOnChangeOptionUpdate = function () {
    if (!選択中キャラクターデータVar) return;
    if (!選択中武器データVar) return;

    let my条件付き詳細ObjArr = [];
    ['キャラクター', '武器', '聖遺物セット'].forEach(key => {
        if (天賦性能変更系詳細ArrMapVar.has(key)) {
            天賦性能変更系詳細ArrMapVar.get(key).forEach(detailObj => {
                if (detailObj['条件']) {
                    my条件付き詳細ObjArr.push(detailObj);
                }
            });
        }
        if (ステータス変更系詳細ArrMapVar.has(key)) {
            ステータス変更系詳細ArrMapVar.get(key).forEach(detailObj => {
                if (detailObj['条件']) {
                    my条件付き詳細ObjArr.push(detailObj);
                }
            });
        }
    });
    console.debug('my条件付き詳細ObjArr');
    console.debug(my条件付き詳細ObjArr);

    オプション条件MapVar.clear();
    オプション排他MapVar.clear();

    my条件付き詳細ObjArr.forEach(entry => {
        makeConditionExclusionMapFromStr(entry['条件'], オプション条件MapVar, オプション排他MapVar);
    });

    // オプションを作り直します
    $('#オプションBox').empty();
    appendInputForOptionElement('オプションBox', オプション条件MapVar, 'オプション');
    // オプションの状態を復元します
    オプションElementIdValue記憶Map.forEach((value, key) => {
        let elem = document.getElementById(key);
        if (elem) {
            if (elem instanceof HTMLInputElement) {
                elem.checked = value;
            } else {
                elem.selectedIndex = value;
                applyOptionVariable(elem);
            }
        }
    });

    inputOnChangeStatusUpdate();
};

// オプションElementから対応する固有変数を更新します
const applyOptionVariable = function (elem) {
    if (!選択中キャラクターデータVar) return;
    if (elem instanceof HTMLSelectElement) {
        let propName = elem.id.replace('Option', '');
        if ('固有変数' in 選択中キャラクターデータVar && propName in 選択中キャラクターデータVar['固有変数']) {
            if (elem.value) {
                let re = new RegExp('[^0-9]*([0-9\\.]+).*');
                let reRet = re.exec(elem.value);
                if (reRet) {
                    let propValue = Number(reRet[1]);
                    ステータス詳細ObjVar[propName] = propValue;
                }
            } else {    // 未選択の場合は初期値をセットします
                ステータス詳細ObjVar[propName] = Number(選択中キャラクターデータVar['固有変数'][propName]);
            }
        }
    }
}

// オプション 変更イベント
const オプションInputOnChange = function () {
    if ((this instanceof HTMLInputElement && this.checked) || (this instanceof HTMLSelectElement && this)) {
        let conditionName = this.id.replace('Option', '');
        オプション排他MapVar.forEach((value, key) => {
            if (key != conditionName) return;
            value.forEach(entry => {
                let elem = document.getElementById(entry + 'Option');
                if (elem instanceof HTMLInputElement) {
                    elem.checked = false;
                } else if (elem instanceof HTMLSelectElement) {
                    elem.value = '';
                }
            });
        });
    }

    オプションElementIdValue記憶Map.set(this.id, this instanceof HTMLInputElement ? this.checked : this.selectedIndex);    // チェック状態または選択要素のインデックスを保持します
    applyOptionVariable(this);
    inputOnChangeStatusUpdate();

    enable構成保存Button();
};

// 敵 変更イベント
const 敵InputOnChange = function () {
    選択中敵データVar = 敵MasterVar[$('#敵Input').val()];
    setObjectPropertiesToElements(選択中敵データVar, '敵', 'Input');
    setInputValue('#敵防御力Input', 0);
    inputOnChangeResultUpdate();
}

$(document).on('change', '#敵Input', 敵InputOnChange);
$(document).on('change', 'input[name="敵元素耐性Input"]', inputOnChangeResultUpdate);
$(document).on('change', '#敵防御力Input', inputOnChangeResultUpdate);

// 元素共鳴 変更イベント
const elementalResonanceInputOnChange = function (event) {
    if (event.currentTarget == $('#元素共鳴なしInput').get(0) && event.currentTarget.checked) {
        $('input[name="元素共鳴Input"]').each(function (index, element) {
            if (element != $('#元素共鳴なしInput').get(0)) {
                element.checked = false;
            }
        });
        選択中元素共鳴データArrVar = [];
        選択中元素共鳴データArrVar.push(元素共鳴MasterVar['元素共鳴なし']);
    } else {
        $('#元素共鳴なしInput').prop('checked', false);
        let count = 0;
        $('[name="元素共鳴Input"').each(function (index, element) {
            if (element.checked) count++;
        });
        if (count > 2) {
            event.currentTarget.checked = false;
        } else {
            選択中元素共鳴データArrVar = [];
            $('[name="元素共鳴Input"').each(function (index, element) {
                if (element.checked) {
                    選択中元素共鳴データArrVar.push(元素共鳴MasterVar[element.value]);
                }
            });
        }
    }
    $('#元素共鳴効果説明Box').empty();
    選択中元素共鳴データArrVar.forEach(data => {
        let my説明 = data['説明'];
        if (Array.isArray(my説明)) {
            my説明.join('<br>');
        }
        $('<p>', {
            html: my説明
        }).appendTo('#元素共鳴効果説明Box');
    });
    inputOnChangeStatusUpdate();
}
$(document).on('change', 'input[name="元素共鳴Input"]', elementalResonanceInputOnChange);
$(document).on('change', '#元素共鳴なしInput', elementalResonanceInputOnChange);

// 聖遺物サブ効果 変更イベント
const inputOnChangeArtifactSubUpdate = function () {
    if ($('#聖遺物詳細計算停止Config').prop('checked')) return;

    let priorityArr = [];
    let middlePriorityArr = [];
    let lowPriorityArr = [
        '会心率',
        '会心ダメージ',
        '元素チャージ効率',
        '元素熟知',
        '攻撃力%',
        'HP%',
        '防御力%',
        '攻撃力',
        'HP',
        '防御力'
    ];
    [
        '聖遺物優先するサブ効果1Input',
        '聖遺物優先するサブ効果2Input',
        '聖遺物優先するサブ効果3Input'
    ].forEach(elemId => {
        let priorityStatus = document.getElementById(elemId).value;
        if (priorityStatus) {
            if (middlePriorityArr.indexOf(priorityStatus) != -1) {
                middlePriorityArr = middlePriorityArr.filter(e => e != priorityStatus);
            }
            if (lowPriorityArr.indexOf(priorityStatus) != -1) {
                lowPriorityArr = lowPriorityArr.filter(e => e != priorityStatus);
            }
            if (priorityStatus.endsWith('%')) {
                let secondStatus = priorityStatus.replace('%', '');
                if (!middlePriorityArr.includes(secondStatus)) {
                    middlePriorityArr.push(secondStatus);
                }
                if (lowPriorityArr.indexOf(secondStatus) != -1) {
                    lowPriorityArr = lowPriorityArr.filter(e => e != secondStatus);
                }
            }
        }
    });
    priorityArr = middlePriorityArr.concat(lowPriorityArr);

    let workObj = {
        HP: 0,
        攻撃力: 0,
        防御力: 0,
        元素熟知: 0,
        HPP: 0,
        攻撃力P: 0,
        防御力P: 0,
        会心率: 0,
        会心ダメージ: 0,
        元素チャージ効率: 0
    };
    let myレアリティ補正 = 0;
    $('select[name="聖遺物レアリティInput"').each((index, element) => {
        if (element.value == 4) {   // ★4ひとつ当たり7%数値を下げます
            myレアリティ補正 += 7;
        }
    });
    let my優先するサブ効果Arr = [];
    let my優先するサブ効果倍率合計 = 0;
    Array.from(document.getElementsByName('聖遺物優先するサブ効果Input')).forEach(elem => {
        let propName = elem.value;
        if (propName) {
            let times = Number(document.getElementById(elem.id.replace('Input', '上昇回数Input')).value);
            let baseValue = Number(document.getElementById(elem.id.replace('Input', '基準値Input')).value);
            let targetValue = times * baseValue;
            let minIndex = 0;
            let minValue = 0;
            for (let i = 0; i < 4; i++) {
                if (baseValue >= 聖遺物サブ効果MasterVar[propName][i]) {
                    minIndex = i;
                    break;
                }
            }
            minValue = 聖遺物サブ効果MasterVar[propName][minIndex] * times;
            let resultValue = minValue;
            propName = propName.replace('%', 'P');
            workObj[propName] += resultValue * (100 - myレアリティ補正) / 100;
            if (!my優先するサブ効果Arr.includes(elem.value)) {
                my優先するサブ効果Arr.push(elem.value);
            }
            my優先するサブ効果倍率合計 += times;
        }
    });
    let 優先しないサブ効果倍率 = Math.max(0, 45 - my優先するサブ効果倍率合計);
    for (let i = 0; i < priorityArr.length; i++) {
        let status = priorityArr[i];
        let workStatus = status;
        if (status.endsWith('%')) {
            workStatus = status.replace('%', 'P');
        }
        let value = 聖遺物サブ効果MasterVar[status][3];
        let multi = Math.floor(優先しないサブ効果倍率 / (10 - my優先するサブ効果Arr.length));
        let mod = 優先しないサブ効果倍率 % (10 - my優先するサブ効果Arr.length);
        if (i < mod) {
            multi += 1;
        }
        workObj[workStatus] = value * multi * (100 - myレアリティ補正) / 100;
    }
    setInputValue('#聖遺物サブ効果HPInput', workObj['HP']);
    setInputValue('#聖遺物サブ効果攻撃力Input', workObj['攻撃力']);
    setInputValue('#聖遺物サブ効果防御力Input', workObj['防御力']);
    setInputValue('#聖遺物サブ効果元素熟知Input', workObj['元素熟知']);
    setInputValue('#聖遺物サブ効果HPPInput', workObj['HPP']);
    setInputValue('#聖遺物サブ効果攻撃力PInput', workObj['攻撃力P']);
    setInputValue('#聖遺物サブ効果防御力PInput', workObj['防御力P']);
    setInputValue('#聖遺物サブ効果会心率Input', workObj['会心率']);
    setInputValue('#聖遺物サブ効果会心ダメージInput', workObj['会心ダメージ']);
    setInputValue('#聖遺物サブ効果元素チャージ効率Input', workObj['元素チャージ効率']);
    inputOnChangeStatusUpdate();
};

// 聖遺物セット効果 変更イベント
const 聖遺物セットInputOnChange = function (opt_skipRearity = false) {
    選択中聖遺物セット効果データArrVar = [];
    if ($('#聖遺物セット効果1Input').val() == $('#聖遺物セット効果2Input').val()) {
        let myData = 聖遺物セット効果MasterVar[$('#聖遺物セット効果1Input').val()];
        選択中聖遺物セット効果データArrVar.push(myData['2セット効果']);
        if ('4セット効果' in myData) {
            選択中聖遺物セット効果データArrVar.push(myData['4セット効果']);
        }
    } else {
        選択中聖遺物セット効果データArrVar.push(聖遺物セット効果MasterVar[$('#聖遺物セット効果1Input').val()]['2セット効果']);
        選択中聖遺物セット効果データArrVar.push(聖遺物セット効果MasterVar[$('#聖遺物セット効果2Input').val()]['2セット効果']);
    }
    // レアリティを設定します
    if (!opt_skipRearity) {
        const ARTIFACT_RARITY_ARR = [[5, 5, 5, 5, 5], [4, 4, 5, 5, 5], [4, 4, 4, 5, 4]];
        let myRarity4SetNumber = 0;
        if (聖遺物セット効果MasterVar[$('#聖遺物セット効果1Input').val()]['レアリティ'] == 4) {
            myRarity4SetNumber++;
        }
        if (聖遺物セット効果MasterVar[$('#聖遺物セット効果2Input').val()]['レアリティ'] == 4) {
            myRarity4SetNumber++;
        }
        for (let i = 0; i < 5; i++) {
            $('#聖遺物レアリティ' + (i + 1) + 'Input').val(ARTIFACT_RARITY_ARR[myRarity4SetNumber][i]);
        }
    }
    // 説明Boxを再構成します
    //$('#聖遺物セット効果説明Box').empty();
    選択中聖遺物セット効果データArrVar.forEach(data => {
        //let my説明 = data['説明'];
        //if (Array.isArray(my説明)) {
        //    my説明.join('<br>');
        //}
        //$('<p>', {
        //    html: my説明
        //}).appendTo('#聖遺物セット効果説明Box');
        if ('オプション初期値' in data) {
            Object.keys(data['オプション初期値']).forEach(key => {
                let elemId = key + 'Option';
                let value = data['オプション初期値'][key];
                if (!オプションElementIdValue記憶Map.has(elemId)) {
                    オプションElementIdValue記憶Map.set(elemId, value);
                }
            });
        }
    });
    setupBaseDamageDetailDataArtifactSet();
    inputOnChangeOptionUpdate();
}

function initサブ効果詳細() {
    $('[name="聖遺物優先するサブ効果Input"]').each(function (index, element) {
        build聖遺物優先するサブ効果基準値(element.id);
    });
}

function build聖遺物優先するサブ効果基準値(elemId) {
    let statusName = $('#' + selectorEscape(elemId)).val();
    let my上昇傾向InputSelector = '#' + selectorEscape(elemId.replace('Input', '基準値Input'));
    $(my上昇傾向InputSelector).empty();
    if (!statusName) {
        return;
    }
    let selectedIndex = $(my上昇傾向InputSelector).prop('selectedIndex');
    let valueArr = 聖遺物サブ効果MasterVar[statusName];
    let valueMap = new Map();
    const divide = 3;
    for (let i = 0; i < valueArr.length; i++) {
        if (i > 0) {
            let diff = valueArr[i - 1] - valueArr[i];
            for (let j = 1; j < divide; j++) {
                let newValue = valueArr[i] + diff * (divide - j) / divide;
                newValue = Math.round(newValue * 10) / 10;
                valueMap.set(newValue, '約' + newValue);
            }
        }
        valueMap.set(valueArr[i], valueArr[i] + ' (T' + (i + 1) + ')');
    }
    valueMap.forEach((value, key) => {
        $('<option>', {
            text: '×' + value,
            value: key
        }).appendTo(my上昇傾向InputSelector);
    });
    if (selectedIndex > -1) {
        $(my上昇傾向InputSelector).prop('selectedIndex', selectedIndex);
    } else {
        $(my上昇傾向InputSelector).val(valueArr[1]);
    }
}

$(document).on('change', 'select[name="聖遺物メイン効果Input"]', inputOnChangeStatusUpdate);
$(document).on('change', 'select[name="聖遺物優先するサブ効果Input"]', function () {
    build聖遺物優先するサブ効果基準値(this.id);
    inputOnChangeArtifactSubUpdate();
});
$(document).on('change', 'select[name="聖遺物優先するサブ効果上昇回数Input"]', inputOnChangeArtifactSubUpdate);
$(document).on('change', 'select[name="聖遺物優先するサブ効果基準値Input"]', inputOnChangeArtifactSubUpdate);
$(document).on('change', 'select[name="聖遺物セット効果Input"]', 聖遺物セットInputOnChange);
$(document).on('change', 'input[name="聖遺物サブ効果Input"]', inputOnChangeStatusUpdate);
$(document).on('change', 'select[name = "聖遺物レアリティInput"]', inputOnChangeArtifactSubUpdate);

$(document).on('change', '#聖遺物サブ効果一括設定Toggle', function () {
    $('#聖遺物サブ効果一括設定Input').prop('disabled', !this.checked);
});
$(document).on('change', '#聖遺物サブ効果一括設定Input', function () {
    if (this.value) {
        $('#聖遺物サブ効果一括設定Toggle').prop('checked', false);
        $('#聖遺物サブ効果一括設定Input').prop('disabled', true);

        const 上昇回数Arr = [[5, 5, 5], [5, 5, 5], [7, 6, 5], [9, 8, 7], [11, 10, 9]];
        $('#聖遺物優先するサブ効果1上昇回数Input').val(上昇回数Arr[this.value][0]);
        $('#聖遺物優先するサブ効果2上昇回数Input').val(上昇回数Arr[this.value][1]);
        $('#聖遺物優先するサブ効果3上昇回数Input').val(上昇回数Arr[this.value][2]);

        inputOnChangeArtifactSubUpdate();
    }
});

////
const appendOptionElement = function (key, valueObj, selector) {
    if ('disabled' in valueObj && valueObj['disabled']) return;   // とりあえず無効レコードは追加しません
    let myText = key;
    if ('レアリティ' in valueObj) {
        myText = '★' + valueObj['レアリティ'] + ' ' + key;
    }
    $('<option>', {
        text: myText,
        value: key,
        disabled: ('disabled' in valueObj) && valueObj['disabled'],
        selected: ('selected' in valueObj) && valueObj['selected']
    }).appendTo(selector);
};

const appendOptionElements = function (data, selector) {
    $(selector).empty();
    Object.keys(data).forEach(key => {
        if ($.isArray(selector)) {
            selector.forEach(entry => {
                appendOptionElement(key, data[key], entry);
            });
        } else {
            appendOptionElement(key, data[key], selector);
        }
    });
};

// 武器・精錬ランク 変更イベント
const 精錬ランクInputOnChange = function () {
    setupBaseDamageDetailDataWeapon();
    inputOnChangeOptionUpdate();
};

// 武器 変更イベント
const 武器InputOnChange = function () {
    fetch(選択可能武器セットObjVar[$('#武器Input').val()]['import']).then(response => response.json()).then(data => {
        選択中武器データVar = data;
        console.debug('選択中武器データVar');
        console.debug(選択中武器データVar);

        if ('オプション初期値' in 選択中武器データVar) {
            Object.keys(選択中武器データVar['オプション初期値']).forEach(key => {
                let elemId = key + 'Option';
                let value = 選択中武器データVar['オプション初期値'][key];
                if (!オプションElementIdValue記憶Map.has(elemId)) {
                    オプションElementIdValue記憶Map.set(elemId, value);
                }
            });
        }

        let my精錬ランク = 0;
        if (おすすめセットArrVar.length > 0) {
            let myObj = おすすめセットArrVar[$('#おすすめセットInput').prop('selectedIndex')][1];
            if ('精錬ランク' in myObj) {
                my精錬ランク = myObj['精錬ランク'];
            }
        }
        if (my精錬ランク == 0) {
            if ('レアリティ' in 選択中武器データVar) {
                switch (選択中武器データVar['レアリティ']) {
                    case 5:
                        my精錬ランク = 1;
                        break;
                    case 4:
                        my精錬ランク = 3;
                        break;
                    case 3:
                        my精錬ランク = 5;
                        break;
                }
            }
        }

        $('#精錬ランクInput').val(my精錬ランク);

        setupBaseDamageDetailDataWeapon();
        inputOnChangeOptionUpdate();
    });
};
$(document).on('change', '#武器Input', 武器InputOnChange);
$(document).on('change', '#武器レベルInput', inputOnChangeStatusUpdate);
$(document).on('change', '#精錬ランクInput', 精錬ランクInputOnChange);

function getNormalAttackDefaultElement() {
    キャラクター武器Var == '法器' ? キャラクター元素Var : '物理';
}

// おすすめセット 変更イベント
const おすすめセットInputOnChange = function () {
    通常攻撃_基礎ダメージ詳細ArrVar = [];
    重撃_基礎ダメージ詳細ArrVar = [];
    落下攻撃_基礎ダメージ詳細ArrVar = [];
    元素スキル_基礎ダメージ詳細ArrVar = [];
    元素爆発_基礎ダメージ詳細ArrVar = [];
    その他_基礎ダメージ詳細ArrMapVar.clear();

    let is聖遺物サブ効果Includes = false;
    let is聖遺物レアリティIncludes = false;
    let entry = おすすめセットArrVar[$('#おすすめセットInput').prop('selectedIndex')][1];
    Object.keys(entry).forEach(key => {
        let isElemExists = false;
        ['Input', 'Option'].forEach(suffix => {
            let elem = document.getElementById(key + suffix);
            if (elem != null) {
                isElemExists = true;
                if (elem instanceof HTMLInputElement) {
                    if (elem.type == 'checkbox') {
                        elem.checked = entry[key];  // true or false
                    } else if (elem.type == 'number') {
                        elem.value = Number(entry[key]);    // number
                    } else {
                        elem.value = entry[key];    // string
                    }
                } else if (elem instanceof HTMLSelectElement) {
                    if (suffix == 'Input') {
                        elem.value = entry[key];
                    } else {
                        elem.selectedIndex = entry[key];
                    }
                }
                if (suffix == 'Option') {
                    オプションElementIdValue記憶Map.set(key + 'Option', entry[key]);
                } else if (elem.name == '聖遺物サブ効果Input') {
                    is聖遺物サブ効果Includes = true;
                } else if (elem.name == '聖遺物レアリティInput') {
                    is聖遺物レアリティIncludes = true;
                }
            }
        });
        if (!isElemExists) {
            オプションElementIdValue記憶Map.set(key + 'Option', entry[key]);
        }
    });

    setupBaseDamageDetailDataCharacter();
    initサブ効果詳細();
    if (!is聖遺物サブ効果Includes) {
        inputOnChangeArtifactSubUpdate();
    }
    聖遺物セットInputOnChange(opt_skipRearity = is聖遺物レアリティIncludes);
    武器InputOnChange();
};
$(document).on('change', '#おすすめセットInput', おすすめセットInputOnChange);

// 通常攻撃Lv. 元素スキルLv. 元素爆発Lv. 変更イベント
const 天賦レベルInputOnChange = function () {
    setupBaseDamageDetailDataCharacter();
    inputOnChangeOptionUpdate();
};

// 命ノ星座 変更イベント
const 命ノ星座InputOnChange = function () {
    setupBaseDamageDetailDataCharacter();
    inputOnChangeOptionUpdate();
};

function get説明(obj) {
    let result = '';
    if ('説明' in obj) {
        if ($.isArray(obj['説明'])) {
            obj['説明'].forEach(e => {
                result += e;
            });
        } else if (obj['説明'] instanceof String || typeof (obj['説明']) == 'string') {
            result = obj['説明'];
        }
    }
    return result;
}

// キャラクター 変更イベント
const キャラクターInputOnChange = function () {
    キャラクター名前Var = $('#キャラクターInput').val();
    let myキャラクターMaster = キャラクターMasterVar[キャラクター名前Var];
    let src = 'image2' in myキャラクターMaster ? myキャラクターMaster['image2'] : myキャラクターMaster['image'];
    $('#選択キャラクターImg').prop('src', src);
    $('#選択キャラクター名前Label').text(キャラクター名前Var);

    fetch(myキャラクターMaster.import).then(response => response.json()).then(data => {
        選択中キャラクターデータVar = data;
        console.debug('選択中キャラクターデータVar');
        console.debug(選択中キャラクターデータVar);

        キャラクター元素Var = 選択中キャラクターデータVar['元素'];
        キャラクター武器Var = 選択中キャラクターデータVar['武器'];
        通常攻撃名称Var = 選択中キャラクターデータVar['通常攻撃']['名前'];
        元素スキル名称Var = 選択中キャラクターデータVar['元素スキル']['名前'];
        元素爆発名称Var = 選択中キャラクターデータVar['元素爆発']['名前'];

        if ('固有変数' in 選択中キャラクターデータVar) {
            Object.keys(選択中キャラクターデータVar['固有変数']).forEach(key => {
                ステータス詳細ObjVar[key] = Number(選択中キャラクターデータVar['固有変数'][key]);
            });
        }

        オプションElementIdValue記憶Map.clear();
        if ('オプション初期値' in 選択中キャラクターデータVar) {
            Object.keys(選択中キャラクターデータVar['オプション初期値']).forEach(key => {
                let elemId = key + 'Option';
                let value = 選択中キャラクターデータVar['オプション初期値'][key];
                オプションElementIdValue記憶Map.set(elemId, value);
            });
        }

        // 命ノ星座selectの範囲(option)設定を行います for アーロイ
        if ('命ノ星座' in 選択中キャラクターデータVar) {
            $('#命ノ星座Input option').each((index, elem) => {
                elem.hidden = false;
            });
        } else {
            $('#命ノ星座Input option').each((index, elem) => {
                if (elem.value != 0) {
                    elem.hidden = true;
                }
            });
        }

        // 天賦レベルselectの範囲(option)設定を行います for アーロイ
        let max通常攻撃レベル = 11;
        let max元素スキルレベル = 13;
        let max元素爆発レベル = 13;
        for (let i = 11; i > 10; i--) {
            選択中キャラクターデータVar['通常攻撃']['詳細'].forEach(detailObj => {
                if ('数値' in detailObj) {
                    if ($.isPlainObject(detailObj['数値'])) {
                        if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max通常攻撃レベル >= i) {
                            max通常攻撃レベル = i - 1;
                        }
                    }
                }
            });
            選択中キャラクターデータVar['重撃']['詳細'].forEach(detailObj => {
                if ('数値' in detailObj) {
                    if ($.isPlainObject(detailObj['数値'])) {
                        if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max通常攻撃レベル >= i) {
                            max通常攻撃レベル = i - 1;
                        }
                    }
                }
            });
            選択中キャラクターデータVar['落下攻撃']['詳細'].forEach(detailObj => {
                if ('数値' in detailObj) {
                    if ($.isPlainObject(detailObj['数値'])) {
                        if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max通常攻撃レベル >= i) {
                            max通常攻撃レベル = i - 1;
                        }
                    }
                }
            });
        }
        for (let i = 13; i > 10; i--) {
            if ('詳細' in 選択中キャラクターデータVar['元素スキル']) {
                選択中キャラクターデータVar['元素スキル']['詳細'].forEach(detailObj => {
                    if ('数値' in detailObj) {
                        if ($.isPlainObject(detailObj['数値'])) {
                            if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max元素スキルレベル >= i) {
                                max元素スキルレベル = i - 1;
                            }
                        }
                    }
                });
            }
            if ('一回押し' in 選択中キャラクターデータVar['元素スキル']) {
                選択中キャラクターデータVar['元素スキル']['一回押し']['詳細'].forEach(detailObj => {
                    if ('数値' in detailObj) {
                        if ($.isPlainObject(detailObj['数値'])) {
                            if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max元素スキルレベル >= i) {
                                max元素スキルレベル = i - 1;
                            }
                        }
                    }
                });
            }
            if ('長押し' in 選択中キャラクターデータVar['元素スキル']) {
                選択中キャラクターデータVar['元素スキル']['長押し']['詳細'].forEach(detailObj => {
                    if ('数値' in detailObj) {
                        if ($.isPlainObject(detailObj['数値'])) {
                            if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max元素スキルレベル >= i) {
                                max元素スキルレベル = i - 1;
                            }
                        }
                    }
                });
            }
            選択中キャラクターデータVar['元素爆発']['詳細'].forEach(detailObj => {
                if ('数値' in detailObj) {
                    if ($.isPlainObject(detailObj['数値'])) {
                        if ((!(i in detailObj['数値']) || !detailObj['数値'][i]) && max元素爆発レベル >= i) {
                            max元素爆発レベル = i - 1;
                        }
                    }
                }
            });
        }
        $('#通常攻撃レベルInput option').each((index, elem) => {
            elem.hidden = elem.value > max通常攻撃レベル;
        });
        $('#元素スキルレベルInput option').each((index, elem) => {
            elem.hidden = elem.value > max元素スキルレベル;
        });
        $('#元素爆発レベルInput option').each((index, elem) => {
            elem.hidden = elem.value > max元素爆発レベル;
        });

        switch (キャラクター元素Var) {
            case '炎':
                $('#元素反応なしInput+label').show();
                $('#元素反応蒸発Input+label').show();
                $('#元素反応溶解Input+label').show();
                break;
            case '水':
                $('#元素反応なしInput+label').show();
                $('#元素反応蒸発Input+label').show();
                $('#元素反応溶解Input+label').hide();
                if ($('#元素反応溶解Input').is(':checked')) {
                    $('#元素反応なしInput').prop('checked', true);
                }
                break;
            case '氷':
                $('#元素反応なしInput+label').show();
                $('#元素反応蒸発Input+label').hide();
                $('#元素反応溶解Input+label').show();
                if ($('#元素反応蒸発Input').is(':checked')) {
                    $('#元素反応なしInput').prop('checked', true);
                }
                break;
            default:
                $('#元素反応なしInput').prop('checked', true);
                $('#元素反応なしInput+label').hide();
                $('#元素反応蒸発Input+label').hide();
                $('#元素反応溶解Input+label').hide();
                break;
        }

        let my命ノ星座 = 0;
        if (キャラクター名前Var in キャラクター所持状況ObjVar) {
            my命ノ星座 = キャラクター所持状況ObjVar[キャラクター名前Var];
            if (my命ノ星座 == null) {
                my命ノ星座 = 0;
            }
        }
        if ('命ノ星座' in 選択中キャラクターデータVar) {
            if (!(my命ノ星座 in 選択中キャラクターデータVar['命ノ星座'])) {
                my命ノ星座 = 0;
            }
        } else {
            my命ノ星座 = 0;
        }
        $('#命ノ星座Input').val(my命ノ星座);

        let my通常攻撃レベル = 8;
        let my元素スキルレベル = 8;
        let my元素爆発レベル = 8;
        if ('命ノ星座' in 選択中キャラクターデータVar) {
            for (let i = Number(my命ノ星座); i > 0; i--) {
                if ((i == 3 || i == 5) && i in 選択中キャラクターデータVar['命ノ星座']) {
                    let my説明 = get説明(選択中キャラクターデータVar['命ノ星座'][i]);
                    if (my説明.startsWith(元素スキル名称Var)) {
                        my元素スキルレベル = 11;
                    } else if (my説明.startsWith(元素爆発名称Var)) {
                        my元素爆発レベル = 11;
                    }
                }
            }
        }
        $('#通常攻撃レベルInput').val(my通常攻撃レベル);
        $('#元素スキルレベルInput').val(my元素スキルレベル);
        $('#元素爆発レベルInput').val(my元素爆発レベル);

        if ($('#全武器解放Config').prop('checked')) {
            選択可能武器セットObjVar = {};
            Object.keys(武器MasterVar).forEach(key => {
                Object.keys(武器MasterVar[key]).forEach(key2 => {
                    選択可能武器セットObjVar[key2] = 武器MasterVar[key][key2];
                });
            });
        } else {
            選択可能武器セットObjVar = 武器MasterVar[キャラクター武器Var];
        }
        appendOptionElements(選択可能武器セットObjVar, '#武器Input');

        setupおすすめセット();

        if (おすすめセットArrVar.length > 0) {
            おすすめセットInputOnChange();
            敵InputOnChange();
        } else {
            setupBaseDamageDetailDataCharacter();
            initサブ効果詳細();
            敵InputOnChange();
            武器InputOnChange();
        }
    });
};
$(document).on('change', '#キャラクターInput', キャラクターInputOnChange);
$(document).on('change', '#レベルInput', inputOnChangeStatusUpdate);
$(document).on('change', '#命ノ星座Input', 命ノ星座InputOnChange);
$(document).on('change', '#通常攻撃レベルInput', 天賦レベルInputOnChange);
$(document).on('change', '#元素スキルレベルInput', 天賦レベルInputOnChange);
$(document).on('change', '#元素爆発レベルInput', 天賦レベルInputOnChange);

// 構成保存ボタンを活性化します
$(document).on('change', '#レベルInput', enable構成保存Button);
$(document).on('change', '#命ノ星座Input', enable構成保存Button);
$(document).on('change', '#通常攻撃レベルInput', enable構成保存Button);
$(document).on('change', '#元素スキルレベルInput', enable構成保存Button);
$(document).on('change', '#元素爆発レベルInput', enable構成保存Button);
$(document).on('change', '#武器Input', enable構成保存Button);
$(document).on('change', '#武器レベルInput', enable構成保存Button);
$(document).on('change', '#精錬ランクInput', enable構成保存Button);
$(document).on('change', 'select[name="聖遺物セット効果Input"]', enable構成保存Button);
$(document).on('change', 'select[name="聖遺物メイン効果Input"]', enable構成保存Button);
$(document).on('change', 'select[name="聖遺物優先するサブ効果Input"]', enable構成保存Button);
$(document).on('change', 'select[name="聖遺物優先するサブ効果倍率Input"]', enable構成保存Button);
$(document).on('change', 'input[name="聖遺物サブ効果Input"]', enable構成保存Button);
$(document).on('change', 'select[name = "聖遺物レアリティInput"]', enable構成保存Button);
$(document).on('change', '#おすすめセットInput', enable構成保存Button);

$(document).on('change', '[name="チームInput"]', inputOnChangeStatusUpdate);

////////////////////////////////////////////////////////////////////////////////
function isHiddenHidableElement(selector, opt_default = false) {
    let isHidden = opt_default;
    if (selectorVisiblityStateMap.has(selector)) {
        isHidden = !selectorVisiblityStateMap.get(selector);
    }
    return isHidden;
}

// 指定要素の表示非表示を制御するイベント関数を返す関数です
const elementOnClickToggleOther = function (selector, triggerSelector) {
    return function () {
        $(selector).toggle();
        if ($(selector).is(':visible')) {
            $(triggerSelector).removeClass('closed');
        } else {
            $(triggerSelector).addClass('closed');
        }
    }
}

// 中段のオプション、ステータスを閉じたり開いたりします
$(document).on('click', '#condition-set', elementOnClickToggleOther('#condition-set+.tab-area', '#condition-set'));
$(document).on('click', '#option-set', elementOnClickToggleOther('#option-set+.hidable', '#option-set'));
$(document).on('click', '#status-set', elementOnClickToggleOther('#status-set+.tab-area', '#status-set'));

const resultTableVisibilityMap = new Map();

// 下段のダメージ計算表の2行目以降を閉じたり開いたりします
const resultTableOnClickToggle = function () {
    let tableId = this.id;
    let isVisible = false;
    if (resultTableVisibilityMap.has(tableId)) {
        isVisible = resultTableVisibilityMap.get(tableId);
    }
    resultTableVisibilityMap.set(tableId, !isVisible);
    console.log(resultTableVisibilityMap);
    elementalRectionOnChange();
};
$(document).on('click', '#通常攻撃ダメージResult', resultTableOnClickToggle);
$(document).on('click', '#重撃ダメージResult', resultTableOnClickToggle);
$(document).on('click', '#落下攻撃ダメージResult', resultTableOnClickToggle);
$(document).on('click', '#元素スキルダメージResult', resultTableOnClickToggle);
$(document).on('click', '#元素爆発ダメージResult', resultTableOnClickToggle);
$(document).on('click', '#その他ダメージResult', resultTableOnClickToggle);

const DAMAGE_RESULT_TABLE_ID_ARR = [
    '通常攻撃ダメージResult',
    '重撃ダメージResult',
    '落下攻撃ダメージResult',
    '元素スキルダメージResult',
    '元素爆発ダメージResult',
    'その他ダメージResult'
];

const elementalRectionOnChange = function () {
    let elementalReaction = $('input[name="元素反応Input"]:checked').val();
    DAMAGE_RESULT_TABLE_ID_ARR.forEach(tableId => {
        let isVisible = false;
        if (resultTableVisibilityMap.has(tableId)) {
            isVisible = resultTableVisibilityMap.get(tableId);
        }
        $('#' + selectorEscape(tableId) + ' tr.' + elementalReaction).each((index, element) => {
            if (element.className.indexOf('hidable') == -1) {
                element.style.display = "table-row";
            } else {
                if (isVisible) {
                    element.style.display = "table-row";
                } else {
                    element.style.display = "none";
                }
            }
        });
        ['noreaction', 'vaporize', 'melt'].forEach(className => {
            if (className != elementalReaction) {
                $('tr.' + className).hide();
            }
        });
    });
}
$(document).on('change', 'input[name="元素反応Input"]', elementalRectionOnChange);


function characterSelected(name) {
    $('#キャラクターInput').val(name);
    キャラクターInputOnChange();
}

// キャラクター選択
const selectCharacter = function () {
    characterSelected(this.alt);
}

// MAIN
$(document).ready(function () {
    Promise.all([
        fetch("data/CharacterMaster.json").then(response => response.json()).then(jsonObj => {
            キャラクターMasterVar = jsonObj;

            let ulElem = document.getElementById('キャラクター選択');
            Object.keys(キャラクターMasterVar).forEach(key => {
                if ('disabled' in キャラクターMasterVar[key] && キャラクターMasterVar[key]['disabled']) return;
                let liElem = document.createElement('li');
                ulElem.appendChild(liElem);
                let imgElem = document.createElement('img');
                imgElem.className = 'star' + キャラクターMasterVar[key]['レアリティ'];
                imgElem.src = 'image' in キャラクターMasterVar[key] ? キャラクターMasterVar[key]['image'] : キャラクターMasterVar[key]['image2'];
                imgElem.alt = key;
                imgElem.width = 75;
                imgElem.height = 75;
                liElem.appendChild(imgElem);

                let img2Elem = document.createElement('img');
                img2Elem.className = 'element';
                img2Elem.src = ELEMENT_IMG_SRC_MAP.get(キャラクターMasterVar[key]['元素']);
                img2Elem.alt = キャラクターMasterVar[key]['元素'];
                img2Elem.width = 22;
                img2Elem.height = 22;
                liElem.appendChild(img2Elem);

                imgElem.onclick = selectCharacter;
            });

            appendOptionElements(キャラクターMasterVar, "#キャラクターInput");

            let select = null;
            Object.keys(キャラクターMasterVar).forEach(key => {
                if (!select) select = key;
                else if ('selected' in キャラクターMasterVar[key] && キャラクターMasterVar[key]['selected']) select = key;
            });
            characterSelected(select);

            loadキャラクター所持状況();
            buildキャラクター所持状況List();
        }),
        fetch("data/SwordMaster.json").then(response => response.json()).then(jsonObj => {
            武器MasterVar["片手剣"] = jsonObj;
        }),
        fetch("data/ClaymoreMaster.json").then(response => response.json()).then(jsonObj => {
            武器MasterVar["両手剣"] = jsonObj;
        }),
        fetch("data/PolearmMaster.json").then(response => response.json()).then(jsonObj => {
            武器MasterVar["長柄武器"] = jsonObj;
        }),
        fetch("data/BowMaster.json").then(response => response.json()).then(jsonObj => {
            武器MasterVar["弓"] = jsonObj;
        }),
        fetch("data/CatalystMaster.json").then(response => response.json()).then(jsonObj => {
            武器MasterVar["法器"] = jsonObj;
        }),
        fetch("data/ArtifactMainMaster.json").then(response => response.json()).then(jsonObj => {
            聖遺物メイン効果MasterVar = jsonObj;
        }),
        fetch("data/ArtifactSubMaster.json").then(response => response.json()).then(jsonObj => {
            聖遺物サブ効果MasterVar = jsonObj;
        }),
        fetch("data/ArtifactSetMaster.json").then(response => response.json()).then(jsonObj => {
            聖遺物セット効果MasterVar = jsonObj;
            appendOptionElements(聖遺物セット効果MasterVar, ["#聖遺物セット効果1Input", "#聖遺物セット効果2Input"]);
        }),
        fetch("data/ElementalResonanceMaster.json").then(response => response.json()).then(jsonObj => {
            元素共鳴MasterVar = jsonObj;
        }),
        fetch("data/EnemyMaster.json").then(response => response.json()).then(jsonObj => {
            敵MasterVar = jsonObj;
            appendOptionElements(敵MasterVar, "#敵Input");
        }),
        fetch("data/ElementalReactionMaster.json").then(response => response.json()).then(jsonObj => {
            元素反応MasterVar = jsonObj;
        }),
        fetch("data/BuffDebuffMaster.json").then(response => response.json()).then(jsonObj => {
            バフデバフMasterVar = jsonObj;
            Object.keys(バフデバフMasterVar).forEach(key => {
                let myObj = バフデバフMasterVar[key];
                if ('disabled' in myObj && myObj['disabled']) return;
                let my条件 = '名前' in myObj ? myObj['名前'] : key;
                myObj['詳細'].forEach(detailObj => {
                    if (!('条件' in detailObj)) {
                        detailObj['条件'] = my条件;
                    }
                });
                バフデバフ詳細ArrVar = バフデバフ詳細ArrVar.concat(makeTalentDetailArray(myObj, null, null, null, null, null, null));
            });
            バフデバフオプション条件Map.clear();
            バフデバフ詳細ArrVar.forEach(detailObj => {
                makeConditionExclusionMapFromStr(detailObj['条件'], バフデバフオプション条件Map, バフデバフオプション排他Map);
            });
            $('#バフデバフオプションBox').empty();
            appendInputForOptionElement('バフデバフオプションBox', バフデバフオプション条件Map, 'バフデバフ', false);
        })
    ]).then(() => {
        キャラクターInputOnChange();
        inputOnChangeArtifactSubUpdate();
        聖遺物セットInputOnChange();
        敵InputOnChange();
    });
});

initキャラクター構成関連要素();

const toggle聖遺物詳細計算停止 = function () {
    if (this.checked) {
        $('select[name="聖遺物優先するサブ効果Input"]').prop('disabled', true);
        $('select[name="聖遺物優先するサブ効果倍率Input"]').prop('disabled', true);
    } else {
        $('select[name="聖遺物優先するサブ効果Input"]').prop('disabled', false);
        $('select[name="聖遺物優先するサブ効果倍率Input"]').prop('disabled', false);
    }
}

$(document).on('click', '#聖遺物詳細計算停止Config', toggle聖遺物詳細計算停止);

$(document).on('click', '#キャラクター所持状況保存Button', saveキャラクター所持状況);
$(document).on('click', '#ローカルストレージクリアInput', toggleローカルストレージクリア);
$(document).on('click', '#ローカルストレージクリアButton', clearローカルストレージ);

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// DEBUG
function detailToHtml(obj) {
    let myArr = [];
    Object.keys(obj).forEach(key => {
        if (obj[key]) myArr.push(key + '[' + obj[key] + ']');
    });
    return myArr.join(',');
}

// デバッグ情報を出力します
const setDebugInfo = function () {
    $('#debugInfo').empty();
    ステータス変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(entry => {
            $('<p>', {
                text: key + ':' + detailToHtml(entry)
            }).appendTo('#debugInfo');
        });
    });
    $('<hr>').appendTo('#debugInfo');
    天賦性能変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(entry => {
            $('<p>', {
                text: key + ':' + detailToHtml(entry)
            }).appendTo('#debugInfo');
        });
    });
    $('<hr>').appendTo('#debugInfo');
    その他_基礎ダメージ詳細ArrMapVar.forEach((value, key) => {
        value.forEach(entry => {
            $('<p>', {
                text: key + ':' + detailToHtml(entry)
            }).appendTo('#debugInfo');
        });
    });
    //$('<hr>').appendTo('#debugInfo');
    // オプション条件MapVar.forEach((value, key) => {
    //     if (value) {
    //         if ($.isArray(value)) {
    //             value.forEach(entry => {
    //                 $('<p>', {
    //                     text: key + ':' + entry
    //                 }).appendTo('#debugInfo');
    //             });
    //         } else {
    //             $('<p>', {
    //                 text: key + ':' + value
    //             }).appendTo('#debugInfo');
    //         }
    //     } else {
    //         $('<p>', {
    //             text: key
    //         }).appendTo('#debugInfo');
    //     }
    // });
    $('<hr>').appendTo('#debugInfo');
    オプション排他MapVar.forEach((value, key) => {
        if (value) {
            if ($.isArray(value)) {
                value.forEach(entry => {
                    $('<p>', {
                        text: key + ':' + entry
                    }).appendTo('#debugInfo');
                });
            } else {
                $('<p>', {
                    text: key + ':' + value
                }).appendTo('#debugInfo');
            }
        } else {
            $('<p>', {
                text: key
            }).appendTo('#debugInfo');
        }
    });
    $('<hr>').appendTo('#debugInfo');
    Object.keys(ステータス詳細ObjVar).forEach(key => {
        if (ステータス詳細ObjVar[key] != 9999) {
            $('<p>', {
                text: key + '=' + ステータス詳細ObjVar[key]
            }).appendTo('#debugInfo');
        }
    });
}
