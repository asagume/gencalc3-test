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
                text: key + '=' + detailToHtml(entry)
            }).appendTo('#debugInfo');
        });
    });
    $('<hr>').appendTo('#debugInfo');
    天賦性能変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(entry => {
            $('<p>', {
                text: key + '=' + detailToHtml(entry)
            }).appendTo('#debugInfo');
        });
    });
    $('<hr>').appendTo('#debugInfo');
    conditionOptionMap.forEach((value, key) => {
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

// ダメージ計算結果テーブルを表示します
const displayResultTable = function (tableId, categoryName, damageResultArr) {
    let tableElem = document.getElementById(tableId);
    while (tableElem.firstChild) {
        tableElem.removeChild(tableElem.firstChild);
    }
    let theadElem = document.createElement('thead');
    tableElem.appendChild(theadElem);
    let trElem1 = document.createElement('tr');
    theadElem.appendChild(trElem1);
    let trElem2 = document.createElement('tr');
    theadElem.appendChild(trElem2);
    let isHidden = isHiddenHidableElement('#' + tableId + ' .hidable', true);
    let trElem3 = document.createElement('tr');
    trElem3.className = 'hidable';
    trElem3.hidden = isHidden;
    theadElem.appendChild(trElem3);
    let trElem4 = document.createElement('tr');
    trElem4.className = 'hidable';
    trElem4.hidden = isHidden;
    theadElem.appendChild(trElem4);

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

    damageResultArr.forEach(valueArr => {
        let thElem1 = document.createElement('th');
        thElem1.textContent = valueArr[0];
        trElem1.appendChild(thElem1);
        let tdElem2 = document.createElement('td');
        tdElem2.textContent = valueArr[1];
        trElem2.appendChild(tdElem2);
        let tdElem3 = document.createElement('td');
        tdElem3.textContent = valueArr[2] != null ? valueArr[2] : '-';
        trElem3.appendChild(tdElem3);
        let tdElem4 = document.createElement('td');
        tdElem4.textContent = valueArr[3] != null ? valueArr[3] : '-';
        trElem4.appendChild(tdElem4);
    });
}

// 防御補正を計算します
function calc防御補正(arg敵防御力, opt_防御無視 = 0) {
    let myレベル = Number($('#レベルInput').val().replace('+', ''));
    let my敵レベル = Number($('#敵レベルInput').val());
    let my防御無視 = opt_防御無視;
    if (my防御無視 > 0) {
        my防御無視 = my防御無視 / 100;    // 60(%) => 0.6
    }
    let my敵防御力 = arg敵防御力 / 100;    // -15(%) => -0.15
    let my防御補正 = (myレベル + 100) / ((1 - my防御無視) * (1 + my敵防御力) * (my敵レベル + 100) + myレベル + 100);
    return my防御補正;
}

// 元素耐性補正を計算します
function calc元素耐性補正(arg元素) {
    let mySelector = '#敵' + arg元素 + (arg元素 != '物理' ? '元素耐性Input' : '耐性Input');
    let my敵元素耐性 = Number($(mySelector).val());
    if (my敵元素耐性 < 0) {
        my敵元素耐性 = 100 - my敵元素耐性 / 2;
    } else if (my敵元素耐性 < 75) {
        my敵元素耐性 = 100 - my敵元素耐性;
    } else {
        my敵元素耐性 = 100 / (4 * my敵元素耐性 + 100)
    }
    return my敵元素耐性 / 100;
}

const DAMAGE_CATEGORY_ARRAY = ['通常攻撃ダメージ', '重撃ダメージ', '落下攻撃ダメージ', '元素スキルダメージ', '元素爆発ダメージ'];
function calculateDamageFromDetailSub(formula, argダメージバフ, arg会心率, arg会心ダメージ, isTargetEnemy, arg敵元素, arg敵防御力, arg防御無視, arg別枠乗算) {
    let my非会心Result = calculateFormulaArray(ステータス詳細ObjVar, formula, null);
    console.debug("%o => %o", formula, Math.round(my非会心Result));
    let my会心Result = null;
    let my期待値Result;
    if (argダメージバフ) {
        my非会心Result *= (100 + argダメージバフ) / 100;
    }
    if (isTargetEnemy) {
        if (arg敵元素) {
            my非会心Result *= calc元素耐性補正(arg敵元素);
        }
        my非会心Result *= calc防御補正(arg敵防御力, arg防御無視);
    }
    if (arg別枠乗算) {
        my非会心Result *= arg別枠乗算 / 100;
    }
    if (arg会心率 > 0) {
        my会心Result = my非会心Result * (100 + arg会心ダメージ) / 100;
        my会心Result = Math.round(my会心Result);
        let my会心率 = Math.min(100, Math.max(0, arg会心率));    // 0≦会心率≦100
        my期待値Result = (my会心Result * my会心率 / 100) + (my非会心Result * (100 - my会心率) / 100);
        my期待値Result = Math.round(my期待値Result);
        if (my会心率 == 100) {
            my非会心Result = null;
        } else {
            my非会心Result = Math.round(my非会心Result);
        }
    } else {
        my非会心Result = Math.round(my非会心Result);
        my期待値Result = my非会心Result;
    }
    console.debug(argダメージバフ, arg会心率, arg会心ダメージ, isTargetEnemy, arg敵元素, arg敵防御力, arg防御無視, arg別枠乗算, '=>', my期待値Result, my会心Result, my非会心Result);
    return [my期待値Result, my会心Result, my非会心Result];
}

function calculateDamageFromDetail(detailObj, opt_element = null) {
    let my元素 = detailObj['元素'] != null ? detailObj['元素'] : opt_element != null ? opt_element : null;
    let myダメージバフ = 0;
    let my会心率 = Number($('#会心率Input').val());
    let my会心ダメージ = Number($('#会心ダメージInput').val());
    let my別枠乗算 = 0; // for 宵宮
    let my敵防御力 = Number($('#敵防御力Input').val());
    let my防御無視 = 0; // for 雷電将軍
    let myHIT数 = detailObj['HIT数'] != null ? Number(detailObj['HIT数']) : 1;

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
                my元素 = valueObj['種類'].replace('元素付与', '');
            } else if (valueObj['種類'] == '防御無視') {   // 防御無視は先んじて適用します for 雷電将軍
                let myValue = calculateFormulaArray(ステータス詳細ObjVar, valueObj['数値'], valueObj['種類'], valueObj['最大値']);
                my防御無視 += myValue;
            } else {
                if (number != null && number != 1) {
                    let myNewValueObj = JSON.parse(JSON.stringify(valueObj));
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
            }
            let my対象カテゴリArr = value['対象'].split('.');
            if (my対象カテゴリArr[0] != detailObj['種類']) {
                return;
            } if (my対象カテゴリArr.length > 1 && my対象カテゴリArr[my対象カテゴリArr.length - 1] != detailObj['名前']) {
                return;
            }
            let myNewValue = value;
            let number = null;
            if (value['条件']) {
                number = checkConditionMatches(value['条件'], validConditionValueArr);
                if (number == 0) {
                    return;
                }
                if (number != null && number != 1) {
                    let myNew数値 = value['数値'].concat(['*', number]);
                    myNewValue = JSON.parse(JSON.stringify(value));
                    myNewValue['数値'] = myNew数値;
                    console.log(myNewValue['数値']);
                }
            }
            myステータス変更系詳細Arr.push(myNewValue);
        });
    });
    console.debug(detailObj['名前'] + ':myステータス変更系詳細Arr');
    console.debug(myステータス変更系詳細Arr);

    myステータス変更系詳細Arr.forEach(valueObj => {
        if (!valueObj['数値']) return;
        let myValue = calculateFormulaArray(ステータス詳細ObjVar, valueObj['数値'], valueObj['種類'], valueObj['最大値']);
        switch (valueObj['種類']) {
            case '会心率':      // for 辛炎 腐植の剣 甘雨 「漁獲」
                console.debug('my会心率', valueObj['数値'], my会心率, myValue);
                my会心率 += myValue;
                break;
            case '会心ダメージ':    // for 九条裟羅
                my会心ダメージ += myValue;
                break;
            case '別枠乗算':    // for 宵宮
                my別枠乗算 += myValue;
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

    let my計算Result;
    switch (detailObj['種類']) {
        case 'HP回復':
            myダメージバフ = ステータス詳細ObjVar['与える治療効果'];
            my計算Result = calculateDamageFromDetailSub(detailObj['数値'], myダメージバフ, null, null, false, null, null, null, null);
            break;
        case 'シールド':
            myダメージバフ = ステータス詳細ObjVar['シールド強化'];
            my計算Result = calculateDamageFromDetailSub(detailObj['数値'], myダメージバフ, null, null, false, null, null, null, null);
            break;
        case '元素創造物HP':    // for アンバー 甘雨
            my計算Result = calculateDamageFromDetailSub(detailObj['数値'], null, null, null, false, null, null, null, null);
            break;
        default:
            myダメージバフ += ステータス詳細ObjVar['与えるダメージ'];
            if (detailObj['ダメージバフ'] != null) {
                myダメージバフ += ステータス詳細ObjVar[detailObj['ダメージバフ']];
            } else if (DAMAGE_CATEGORY_ARRAY.includes(detailObj['種類'])) {
                myダメージバフ += ステータス詳細ObjVar[detailObj['種類'] + 'バフ'];
            }
            if (my元素 != null) {
                myダメージバフ += ステータス詳細ObjVar[my元素 == '物理' ? '物理ダメージバフ' : my元素 + '元素ダメージバフ'];
            }
            my計算Result = calculateDamageFromDetailSub(detailObj['数値'], myダメージバフ, my会心率, my会心ダメージ, true, my元素, my敵防御力, my防御無視, my別枠乗算);
            if (DAMAGE_CATEGORY_ARRAY.includes(detailObj['種類'])) {
                // 複数回HITするダメージについては、HIT数を乗算します
                if (myHIT数 > 1) {
                    my計算Result[0] *= myHIT数;
                    if (my計算Result[1]) {
                        my計算Result[1] *= myHIT数;
                    }
                    if (my計算Result[2]) {
                        my計算Result[2] *= myHIT数;
                    }
                }
            }
            break;
    }
    console.debug(my計算Result);

    my天賦性能変更詳細Arr.forEach(valueObj => {
        if (valueObj['種類'].endsWith('ダメージアップ')) {
            let myResultWork = calculateDamageFromDetailSub(valueObj['数値'], myダメージバフ, my会心率, my会心ダメージ, true, my元素, my敵防御力, my防御無視, my別枠乗算);
            my計算Result[0] += myResultWork[0];
            if (my計算Result[1] != null) {
                my計算Result[1] += myResultWork[1];
            }
            if (my計算Result[2] != null) {
                my計算Result[2] += myResultWork[2];
            }
        } else if (valueObj['種類'].endsWith('強化')) {
            let myResultWork = calculateDamageFromDetailSub(valueObj['数値'], myダメージバフ, my会心率, my会心ダメージ, true, my元素, my敵防御力, my防御無視, my別枠乗算);
            my計算Result[0] += myResultWork[0];
            if (my計算Result[1] != null) {
                my計算Result[1] += myResultWork[1];
            }
            if (my計算Result[2] != null) {
                my計算Result[2] += myResultWork[2];
            }
        }
    });

    if (detailObj['種類'] == 'シールド' && my元素 == '岩') {    // 岩元素シールドの吸収量150%を適用します
        my計算Result[0] *= 1.5;
        my計算Result[2] *= 1.5;
    }

    return [detailObj['名前'], my計算Result[0], my計算Result[1], my計算Result[2]];
}

// RESULT 計算結果
const inputOnChangeResultUpdate = function () {
    if (!selectedCharacterData) return;
    if (!selectedWeaponData) return;
    if (!selectedEnemyData) return;

    let validConditionValueArr = makeValidConditionValueArr('#オプションBox');

    // 通常攻撃ダメージを計算します
    let my通常攻撃ダメージResultArr = [];
    let myDamageDetailObjArr = 通常攻撃_基礎ダメージ詳細ArrVar;
    // 条件にマッチしていたならば、myDamageDetailObjArrを置き換えます
    特殊通常攻撃_基礎ダメージ詳細MapVar.forEach((value, key) => {
        if (validConditionValueArr.includes(key)) {
            myDamageDetailObjArr = value;
        }
    });
    myDamageDetailObjArr.forEach(detailObj => {
        my通常攻撃ダメージResultArr.push(calculateDamageFromDetail(detailObj, 通常攻撃_元素Var));
    });
    console.debug('通常攻撃');
    console.debug(my通常攻撃ダメージResultArr);
    displayResultTable('通常攻撃ダメージResult', '通常攻撃', my通常攻撃ダメージResultArr);

    // 重撃ダメージを計算します
    let my重撃ダメージResultArr = [];
    myDamageDetailObjArr = 重撃_基礎ダメージ詳細ArrVar;
    // 条件にマッチしていたならば、myDamageDetailObjArrを置き換えます
    特殊重撃_基礎ダメージ詳細MapVar.forEach((value, key) => {
        if (validConditionValueArr.includes(key)) {
            myDamageDetailObjArr = value;
        }
    });
    myDamageDetailObjArr.forEach(detailObj => {
        my重撃ダメージResultArr.push(calculateDamageFromDetail(detailObj, 重撃_元素Var));
    });
    console.debug('重撃');
    console.debug(my重撃ダメージResultArr);
    displayResultTable('重撃ダメージResult', '重撃', my重撃ダメージResultArr);

    // 落下攻撃ダメージを計算します
    // TODO

    // 元素スキルダメージを計算します
    let my元素スキルダメージResultArr = [];
    myDamageDetailObjArr = 元素スキル_基礎ダメージ詳細ArrVar;
    myDamageDetailObjArr.forEach(detailObj => {
        my元素スキルダメージResultArr.push(calculateDamageFromDetail(detailObj, null));
    });
    console.debug('元素スキル');
    console.debug(my元素スキルダメージResultArr);
    displayResultTable('元素スキルダメージResult', '元素スキル', my元素スキルダメージResultArr);

    // 元素爆発ダメージを計算します
    let my元素爆発ダメージResultArr = [];
    myDamageDetailObjArr = 元素爆発_基礎ダメージ詳細ArrVar;
    myDamageDetailObjArr.forEach(detailObj => {
        my元素爆発ダメージResultArr.push(calculateDamageFromDetail(detailObj, null));
    });
    console.debug('元素爆発');
    console.debug(my元素爆発ダメージResultArr);
    displayResultTable('元素爆発ダメージResult', '元素爆発', my元素爆発ダメージResultArr);

    // その他ダメージを計算します
    let myその他ダメージResultArr = [];
    その他_基礎ダメージ詳細ArrMapVar.forEach((value, key) => {
        myDamageDetailObjArr = value;
        myDamageDetailObjArr.forEach(detailObj => {
            myその他ダメージResultArr.push(calculateDamageFromDetail(detailObj, null));
        });
    });
    if (myその他ダメージResultArr.length > 0) {
        console.debug('その他');
        console.debug(myその他ダメージResultArr);
        displayResultTable('その他ダメージResult', 'その他', myその他ダメージResultArr);
    } else {
        $('#その他ダメージResult').hide();
    }

    // デバッグ情報を出力します
    setDebugInfo();
}

////
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

function compareFunction(a, b) {
    let arr = ['HP%', 'HP', 'HP上限', '防御力%', '防御力', '元素熟知', '会心率', '会心ダメージ', '与える治療効果', '受ける治療効果', '元素チャージ効率', '攻撃力%', '攻撃力'];
    let aIndex = arr.indexOf(a[0]);
    let bIndex = arr.indexOf(b[0]);
    return (aIndex != -1 ? aIndex : arr.length) - (bIndex != -1 ? bIndex : arr.length);
}

function calculateStatus(targetObj, kind, formulaArr, opt_max = null) {
    let result = calculateFormulaArray(targetObj, formulaArr, kind, opt_max);
    let statusName = kind;
    if (!$.isNumeric(result)) {
        console.error(targetObj, kind, formulaArr, result);
    }
    if (KIND_TO_PROPERTY_MAP.has(kind)) {
        statusName = KIND_TO_PROPERTY_MAP.get(kind);
    } else {
        switch (kind) {
            case '自元素ダメージバフ':
                statusName = selectedCharacterData['元素'] + '元素ダメージバフ';
                break;
            case '全元素ダメージバフ':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    let statusName = entry + '元素ダメージバフ';
                    targetObj[statusName] += result;
                });
                return;
            case '敵自元素耐性':
                statusName = '敵' + selectedCharacterData['元素'] + '元素耐性';
                break;
            case '敵全元素耐性':
                ['炎', '水', '風', '雷', '草', '氷', '岩'].forEach(entry => {
                    let statusName = '敵' + entry + '元素耐性';
                    targetObj[statusName] += result;
                });
                return;
        }
    }
    targetObj[statusName] += result;
    console.debug(calculateStatus.name, null, kind, formulaArr, '=>', result);
}

// 条件適用可能かチェックします
const checkConditionMatches = function (conditionStr, validConditionValueArr) {
    let my条件 = conditionStr.split('^')[0];
    if (validConditionValueArr.includes(my条件)) {
        let re = new RegExp('.+@[^0-9]*([0-9\\.]+).*');
        let reRet = re.exec(my条件);
        if (reRet) {
            return Number(reRet[1]);
        } else {
            return 1;
        }
    } else if (my条件.indexOf('@') != -1) {
        let my条件名 = my条件.split('@')[0];
        let re = new RegExp('[^0-9]*([0-9\\.]+).*');
        for (let i = 0; i < validConditionValueArr.length; i++) {
            if (validConditionValueArr[i].startsWith(my条件名 + '@')) {
                let condArr = validConditionValueArr[i].split('@');
                let reRet = re.exec(condArr[1]);
                if (reRet) {
                    return Number(reRet[1]);
                }
                break;
            }
        }
    }
    return 0;
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

// RESULT/INPUT ステータスを計算します
const inputOnChangeStatusUpdateSub = function (baseUpdate = true) {
    if (!selectedCharacterData) return;
    if (!selectedWeaponData) return;
    // 基礎
    initステータス詳細ObjVar();

    // 敵関連データをセットします
    Object.keys(selectedEnemyData).forEach(propName => {
        if (propName in ステータス詳細ObjVar) {
            ステータス詳細ObjVar['敵' + propName] = selectedEnemyData[propName];
        }
    });
    ステータス詳細ObjVar['敵防御力'] = 0;

    // キャラクターの基本ステータスをセットします
    let myレベル = $('#レベルInput').val();
    if (baseUpdate) {
        ステータス詳細ObjVar['基礎HP'] = selectedCharacterData['ステータス']['基礎HP'][myレベル];
        ステータス詳細ObjVar['基礎攻撃力'] = selectedCharacterData['ステータス']['基礎攻撃力'][myレベル] + selectedWeaponData['ステータス']['基礎攻撃力'][myレベル];
        ステータス詳細ObjVar['基礎防御力'] = selectedCharacterData['ステータス']['基礎防御力'][myレベル];
    } else {
        ステータス詳細ObjVar['基礎HP'] = Number($('#基礎HPInput').val());
        ステータス詳細ObjVar['基礎攻撃力'] = Number($('#基礎攻撃力Input').val());
        ステータス詳細ObjVar['基礎防御力'] = Number($('#基礎防御力Input').val());
    }
    ステータス詳細ObjVar['HP上限'] = ステータス詳細ObjVar['基礎HP'];
    ステータス詳細ObjVar['攻撃力'] = ステータス詳細ObjVar['基礎攻撃力'];
    ステータス詳細ObjVar['防御力'] = ステータス詳細ObjVar['基礎防御力'];

    // キャラクターのサブステータスを計上します
    Object.keys(selectedCharacterData['ステータス']).forEach(key => {
        if (['基礎HP', '基礎攻撃力', '基礎防御力'].includes(key)) return;
        calculateStatus(ステータス詳細ObjVar, key, selectedCharacterData['ステータス'][key][myレベル]);
    });

    // 武器のサブステータスを計上します
    let my武器レベル = $('#武器レベルInput').val();
    Object.keys(selectedWeaponData['ステータス']).forEach(key => {
        if (['基礎攻撃力'].includes(key)) return;
        calculateStatus(ステータス詳細ObjVar, key, selectedWeaponData['ステータス'][key][my武器レベル]);
    });

    // 聖遺物のメインステータスを計上します
    $('select[name="聖遺物メイン効果Input"]').each(function () {
        calculateStatus(ステータス詳細ObjVar, this.value, [artifactMainMaster['5'][this.value]]);
    });

    // 聖遺物のサブステータスを計上します
    ステータス詳細ObjVar['HP上限'] += Number($('#聖遺物サブ効果HPInput').val());
    ステータス詳細ObjVar['HP乗算'] += Number($('#聖遺物サブ効果HPPInput').val());
    ステータス詳細ObjVar['攻撃力'] += Number($('#聖遺物サブ効果攻撃力Input').val());
    ステータス詳細ObjVar['攻撃力乗算'] += Number($('#聖遺物サブ効果攻撃力PInput').val());
    ステータス詳細ObjVar['防御力'] += Number($('#聖遺物サブ効果防御力Input').val());
    ステータス詳細ObjVar['防御力乗算'] += Number($('#聖遺物サブ効果防御力PInput').val());
    ステータス詳細ObjVar['元素熟知'] += Number($('#聖遺物サブ効果元素熟知Input').val());
    ステータス詳細ObjVar['会心率'] += Number($('#聖遺物サブ効果会心率Input').val());
    ステータス詳細ObjVar['会心ダメージ'] += Number($('#聖遺物サブ効果会心ダメージInput').val());
    ステータス詳細ObjVar['元素チャージ効率'] += Number($('#聖遺物サブ効果元素チャージ効率Input').val());

    // 元素共鳴を計上します
    selectedElementalResonanceDataArr.forEach(detailObj => {
        if ('詳細' in detailObj) {
            if ($.isArray(detailObj['詳細'])) {
                detailObj['詳細'].forEach(data => {
                    calculateStatus(ステータス詳細ObjVar, data['種類'], data['数値']);
                });
            } else {
                let data = detailObj['詳細'];
                calculateStatus(ステータス詳細ObjVar, data['種類'], data['数値']);
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
        calculateStatus(ステータス詳細ObjVar, detailObj['種類'], myNew数値);
    });

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
        calculateStatus(ステータス詳細ObjVar, entry[0], entry[1], entry[2]);
    });
    // 乗算系のステータスアップを計上します HP% 攻撃力% 防御力%
    myPriority2KindFormulaArr.sort(compareFunction);
    myPriority2KindFormulaArr.forEach(entry => {
        calculateStatus(ステータス詳細ObjVar, entry[0], entry[1], entry[2]);
    });

    // HP上限 攻撃力 防御力を計算します
    // これより後に乗算系(%付き)のステータスアップがあると計算が狂います
    ステータス詳細ObjVar['HP上限'] += ステータス詳細ObjVar['基礎HP'] * (ステータス詳細ObjVar['HP乗算']) / 100;
    ステータス詳細ObjVar['HP上限'] = Math.round(ステータス詳細ObjVar['HP上限']);
    ステータス詳細ObjVar['攻撃力'] += ステータス詳細ObjVar['基礎攻撃力'] * (ステータス詳細ObjVar['攻撃力乗算']) / 100;
    ステータス詳細ObjVar['攻撃力'] = Math.round(ステータス詳細ObjVar['攻撃力']);
    ステータス詳細ObjVar['防御力'] += ステータス詳細ObjVar['基礎防御力'] * (ステータス詳細ObjVar['防御力乗算']) / 100;
    ステータス詳細ObjVar['防御力'] = Math.round(ステータス詳細ObjVar['防御力']);

    // それ以外のステータスアップを計上します
    myKindFormulaArr.sort(compareFunction);
    myKindFormulaArr.forEach(entry => {
        calculateStatus(ステータス詳細ObjVar, entry[0], entry[1], entry[2]);
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

    // ステータス詳細ObjVar⇒各Input要素 値をコピーします
    setObjectPropertiesToElements(ステータス詳細ObjVar, '', 'Input');
    inputOnChangeResultUpdate();
}

const inputOnChangeStatusUpdate = function () {
    inputOnChangeStatusUpdateSub(true);
}

const inputOnChangeStatusUpdateExceptBase = function () {
    inputOnChangeStatusUpdateSub(false);
}

$(document).on('change', 'input[name="基礎ステータスInput"]', inputOnChangeStatusUpdateExceptBase);
$(document).on('change', 'input[name="ステータスInput"]', inputOnChangeStatusUpdate);

const appendInputForOptionElement = function (parentElemId, optionMap, name, opt_checked = true) {
    optionMap.forEach((value, key) => {
        if (value) return;
        let elem = document.createElement('input');
        elem.type = 'checkbox';
        elem.checked = opt_checked;
        elem.value = value;
        elem.id = key + 'Option';
        elem.name = name;
        $('#' + parentElemId).append(elem);
        let labelElem = document.createElement('label');
        labelElem.htmlFor = elem.id;
        labelElem.textContent = key;
        elem.after(labelElem);
        elem.onchange = optionInputOnChange;
    });
    optionMap.forEach((value, key) => {
        if (!value) return;
        let divElem = document.createElement('div');
        $('#' + parentElemId).append(divElem);
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
            optionElem.selected = true;
        }
        let labelElem = document.createElement('label');
        labelElem.htmlFor = elem.id;
        labelElem.textContent = key;
        elem.before(labelElem);
        elem.onchange = optionInputOnChange;
        applyOptionVariable(elem);
    });
}

const inputOnChangeOptionUpdate = function () {
    if (!selectedCharacterData) return;
    if (!selectedWeaponData) return;

    setupBaseDamageDetailDataCharacter();
    setupBaseDamageDetailDataWeapon();
    setupBaseDamageDetailDataArtifactSet();

    let my条件付き詳細ObjArr = [];
    天賦性能変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(detailObj => {
            if (detailObj['条件']) {
                my条件付き詳細ObjArr.push(detailObj);
            }
        });
    });
    ステータス変更系詳細ArrMapVar.forEach((value, key) => {
        value.forEach(detailObj => {
            if (detailObj['条件']) {
                my条件付き詳細ObjArr.push(detailObj);
            }
        });
    });
    console.debug('my条件付き詳細ObjArr');
    console.debug(my条件付き詳細ObjArr);

    conditionOptionMap.clear();
    exclusionOptionMap.clear();

    my条件付き詳細ObjArr.forEach(entry => {
        makeConditionExclusionMapFromStr(entry['条件'], conditionOptionMap, exclusionOptionMap);
    });

    // オプションを作り直します
    $('#オプションBox').empty();
    appendInputForOptionElement('オプションBox', conditionOptionMap, 'オプション');
    // オプションの状態を復元します
    optionElemIdValueMap.forEach((value, key) => {
        let elem = document.getElementById(key);
        if (elem) {
            if (elem instanceof HTMLInputElement) {
                elem.checked = value;
            } else {
                elem.value = value;
            }
        }
    });

    inputOnChangeStatusUpdate();
};

// オプションElementから対応する固有変数を更新します
const applyOptionVariable = function (elem) {
    if (!selectedCharacterData) return;
    if (elem instanceof HTMLSelectElement) {
        let propName = elem.id.replace('Option', '');
        if ('固有変数' in selectedCharacterData && propName in selectedCharacterData['固有変数']) {
            if (elem.value) {
                let re = new RegExp('[^0-9]*([0-9\\.]+).*');
                let reRet = re.exec(elem.value);
                if (reRet) {
                    let propValue = Number(reRet[1]);
                    ステータス詳細ObjVar[propName] = propValue;
                }
            } else {    // 未選択の場合は初期値をセットします
                ステータス詳細ObjVar[propName] = Number(selectedCharacterData['固有変数'][propName]);
            }
        }
    }
}

const optionElemIdValueMap = new Map(); // オプションの状態を記憶します。
const optionInputOnChange = function () {
    optionElemIdValueMap.set(this.id, this instanceof HTMLInputElement ? this.checked : this.value);
    applyOptionVariable(this);
    inputOnChangeStatusUpdate();
};
// INPUT 敵
const enemyInputOnChange = function () {
    selectedEnemyData = enemyMaster[$('#敵Input').val()];
    setObjectPropertiesToElements(selectedEnemyData, '敵', 'Input');
    setInputValue('#敵防御力Input', 0);
    inputOnChangeResultUpdate();
}

$(document).on('change', '#敵Input', enemyInputOnChange);
$(document).on('change', '#敵レベルInput', inputOnChangeResultUpdate);
$(document).on('change', '#敵炎元素耐性Input', inputOnChangeResultUpdate);
$(document).on('change', '#敵水元素耐性Input', inputOnChangeResultUpdate);
$(document).on('change', '#敵風元素耐性Input', inputOnChangeResultUpdate);
$(document).on('change', '#敵雷元素耐性Input', inputOnChangeResultUpdate);
$(document).on('change', '#敵氷元素耐性Input', inputOnChangeResultUpdate);
$(document).on('change', '#敵岩元素耐性Input', inputOnChangeResultUpdate);
$(document).on('change', '#敵物理耐性Input', inputOnChangeResultUpdate);
$(document).on('change', '#敵防御力Input', inputOnChangeResultUpdate);

// INPUT 元素共鳴
const elementalResonanceInputOnChange = function (event) {
    if (event.currentTarget == $('#元素共鳴なしInput').get(0) && event.currentTarget.checked) {
        $('input[name="元素共鳴Input"]').each(function (index, element) {
            if (element != $('#元素共鳴なしInput').get(0)) {
                element.checked = false;
            }
        });
        selectedElementalResonanceDataArr = [];
        selectedElementalResonanceDataArr.push(elementalResonanceMaster['元素共鳴なし']);
    } else {
        $('#元素共鳴なしInput').prop('checked', false);
        let count = 0;
        $('[name="元素共鳴Input"').each(function (index, element) {
            if (element.checked) count++;
        });
        if (count > 2) {
            event.currentTarget.checked = false;
        } else {
            selectedElementalResonanceDataArr = [];
            $('[name="元素共鳴Input"').each(function (index, element) {
                if (element.checked) {
                    selectedElementalResonanceDataArr.push(elementalResonanceMaster[element.value]);
                }
            });
        }
    }
    $('#元素共鳴効果説明Box').empty();
    selectedElementalResonanceDataArr.forEach(data => {
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

// INPUT 聖遺物
const inputOnChangeArtifactSubUpdate = function () {
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
    let my優先するサブ効果Arr = [];
    let my優先するサブ効果倍率合計 = 0;
    Array.from(document.getElementsByName('聖遺物優先するサブ効果Input')).forEach(elem => {
        let propName = elem.value;
        if (propName) {
            let myValue = artifactSubMaster[elem.value];
            let myMagnification = Number(document.getElementById(elem.id.replace('Input', '倍率Input')).value);
            propName = propName.replace('%', 'P');
            workObj[propName] = workObj[propName] + (myValue * myMagnification) * 5;
            if (!my優先するサブ効果Arr.includes(elem.value)) {
                my優先するサブ効果Arr.push(elem.value);
            }
            my優先するサブ効果倍率合計 += myMagnification;
        }
    });
    let 優先しないサブ効果倍率 = Math.max(0, 10 - my優先するサブ効果倍率合計) / (10 - my優先するサブ効果Arr.length);
    Object.keys(workObj).forEach(key => {
        if (workObj[key] == 0) {
            let newKey = key;
            if (key != 'HP') newKey = key.replace(new RegExp('P$'), '%');
            let value = artifactSubMaster[newKey];
            workObj[key] = value * 4 * 優先しないサブ効果倍率;
        }
    });
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

const artifactSetInputOnChange = function () {
    selectedArtifactSetDataArr = [];
    if ($('#聖遺物セット効果1Input').val() == $('#聖遺物セット効果2Input').val()) {
        let myData = artifactSetMaster[$('#聖遺物セット効果1Input').val()];
        selectedArtifactSetDataArr.push(myData['2セット効果']);
        if ('4セット効果' in myData) {
            selectedArtifactSetDataArr.push(myData['4セット効果']);
        }
    } else {
        selectedArtifactSetDataArr.push(artifactSetMaster[$('#聖遺物セット効果1Input').val()]['2セット効果']);
        selectedArtifactSetDataArr.push(artifactSetMaster[$('#聖遺物セット効果2Input').val()]['2セット効果']);
    }
    $('#聖遺物セット効果説明Box').empty();
    selectedArtifactSetDataArr.forEach(data => {
        let my説明 = data['説明'];
        if (Array.isArray(my説明)) {
            my説明.join('<br>');
        }
        $('<p>', {
            html: my説明
        }).appendTo('#聖遺物セット効果説明Box');
        if ('オプション初期値' in data) {
            Object.keys(data['オプション初期値']).forEach(key => {
                let elemId = key + 'Option';
                let value = data['オプション初期値'][key];
                optionElemIdValueMap.set(elemId, value);
            });
        }
    });
    inputOnChangeOptionUpdate();
}
$(document).on('change', 'select[name="聖遺物メイン効果Input"]', inputOnChangeStatusUpdate);
$(document).on('change', 'select[name="聖遺物優先するサブ効果Input"]', inputOnChangeArtifactSubUpdate);
$(document).on('change', 'select[name="聖遺物優先するサブ効果倍率Input"]', inputOnChangeArtifactSubUpdate);
$(document).on('change', 'select[name="聖遺物セット効果Input"]', artifactSetInputOnChange);
$(document).on('change', 'input[name="聖遺物サブ効果Input"]', inputOnChangeStatusUpdate);

////
const appendOptionElement = function (key, data, selector) {
    if ('disabled' in data[key] && data[key]['disabled']) return;   // とりあえず無効レコードは追加しません
    $('<option>', {
        text: key,
        value: key,
        disabled: ('disabled' in data[key]) && data[key]['disabled'],
        selected: ('selected' in data[key]) && data[key]['selected']
    }).appendTo(selector);
};

const appendOptionElements = function (data, selector) {
    $(selector).empty();
    Object.keys(data).forEach(key => {
        if ($.isArray(selector)) {
            selector.forEach(entry => {
                appendOptionElement(key, data, entry);
            });
        } else {
            appendOptionElement(key, data, selector);
        }
    });
};

function afterBuffDebuffOptionChanged() {
    // ステータス計算
    // ダメージ計算表示
}

function afterOptionChanged() {
    // ステータス計算
    // ダメージ計算表示
}

function afterElementalResonanceChanged() {
    // ステータス計算
    // ダメージ計算表示
}

//
function afterEnemyChanged() {
    // ステータス計算
    // ダメージ計算表示
}

// 
function afterArtifactSetChanged() {
    setupBaseDamageDetailDataArtifactSet();
    // オプション表示
    // ステータス計算
    // ダメージ計算表示
}

function afterArtifactSubChanged() {
    // ステータス計算
    // ダメージ計算表示
}

function afterArtifactMainChanged() {
    // ステータス計算
    // ダメージ計算表示
}

function afterWeaponRankChanged() {
    setupBaseDamageDetailDataWeapon();
    // オプション表示
    // ステータス計算
    // ダメージ計算表示
}

function afterWeaponLevelChanged() {
    // nop
}

function afterWeaponChanged() {
    setupBaseDamageDetailDataWeapon();
    // オプション表示
    // ステータス計算
    // ダメージ計算表示
}

function afterTalentLevelChanged() {
    setupBaseDamageDetailDataCharacter();
    // ステータス計算
    // ダメージ計算表示
}

function afterConstellationChanged() {
    setupBaseDamageDetailDataCharacter();
    // オプション表示
    // ステータス計算
    // ダメージ計算表示
}

function afterLevelChanged() {
    // nop
}

function afterCharacterChanged() {
    setupBaseDamageDetailDataCharacter();
    // あとは武器の処理に任せる
}

// INPUT 武器
const weaponInputOnChange = function () {
    fetch(weaponMaster[selectedCharacterData['武器']][$('#武器Input').val()]['import']).then(response => response.json()).then(data => {
        selectedWeaponData = data;
        console.debug('selectedWeaponData');
        console.debug(selectedWeaponData);

        if ('オプション初期値' in selectedWeaponData) {
            Object.keys(selectedWeaponData['オプション初期値']).forEach(key => {
                let elemId = key + 'Option';
                let value = selectedWeaponData['オプション初期値'][key];
                optionElemIdValueMap.set(elemId, value);
            });
        }

        inputOnChangeOptionUpdate();
    });
};
$(document).on('change', '#武器Input', weaponInputOnChange);
$(document).on('change', '#武器レベルInput', inputOnChangeStatusUpdate);
$(document).on('change', '#精錬ランクInput', inputOnChangeOptionUpdate);

// とても大事なデータを作成しています
const makeTalentDetailArray = function (talentDataObj, level, defaultKind, defaultElement, statusChangeArrMap, talentChangeArrMap, inputCategory) {
    let resultArr = [];
    if ('詳細' in talentDataObj) {
        talentDataObj['詳細'].forEach(detailObj => {
            let my種類 = '種類' in detailObj ? detailObj['種類'] : defaultKind;
            let my数値 = null;
            if ('数値' in detailObj) {
                my数値 = detailObj['数値'];
                if (level != null && level in my数値) { // キャラクター|武器のサブステータス
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
                if (my条件.indexOf("@") != -1) {
                    console.log(my条件);
                }

            }
            let my最大値 = null;
            if ('最大値' in detailObj) {
                my最大値 = detailObj['最大値'];
                if (level != null && $.isPlainObject(my最大値) && level in my最大値) {   // 草薙の稲光
                    my最大値 = my最大値[level];
                }
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
                ダメージバフ: 'ダメージバフ' in detailObj ? detailObj['ダメージバフ'] : null
            }
            if (statusChangeArrMap != null) {
                if (resultObj['種類'] in ステータス詳細ObjVar || resultObj['種類'].endsWith('%') || new RegExp('[自全].+バフ').exec(resultObj['種類'])) { // ex,HP上限,攻撃力%
                    resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                    statusChangeArrMap.get(inputCategory).push(resultObj);
                    return;
                }
            }
            if (talentChangeArrMap != null) {
                if (resultObj['種類'].endsWith('強化') || resultObj['種類'].endsWith('付与') || resultObj['種類'].endsWith('アップ') || resultObj['種類'] == '防御無視') {   // ex.元素爆発強化,氷元素付与
                    resultObj['元素'] = '元素' in detailObj ? detailObj['元素'] : null;
                    talentChangeArrMap.get(inputCategory).push(resultObj);
                    return;
                }
            }
            resultArr.push(resultObj);
        });
    } else {
        console.error(talentDataObj, level, defaultKind, defaultElement, inputCategory);
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

function getNormalAttackDefaultElement() {
    キャラクター武器Var == '法器' ? キャラクター元素Var : '物理';
}

// キャラクターデータより
const setupBaseDamageDetailDataCharacter = function () {
    let my通常攻撃レベル = $('#通常攻撃レベルInput').val();
    let my元素スキルレベル = $('#元素スキルレベルInput').val();
    let my元素爆発レベル = $('#元素爆発レベルInput').val();

    ステータス変更系詳細ArrMapVar.set('キャラクター', []);
    天賦性能変更系詳細ArrMapVar.set('キャラクター', []);

    // 通常攻撃を解析します。Object
    let my天賦レベル = my通常攻撃レベル;
    let myデフォルト種類 = '通常攻撃ダメージ';
    let myデフォルト元素 = getNormalAttackDefaultElement();
    let myTalentDataObj = selectedCharacterData['通常攻撃'];
    通常攻撃_基礎ダメージ詳細ArrVar = makeTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
    console.debug('通常攻撃_基礎ダメージ詳細ArrVar');
    console.debug(通常攻撃_基礎ダメージ詳細ArrVar);
    // 特殊通常攻撃を解析します。Object
    特殊通常攻撃_基礎ダメージ詳細MapVar.clear();
    if ('特殊通常攻撃' in selectedCharacterData) {
        myTalentDataObj = selectedCharacterData['特殊通常攻撃'];
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
    myTalentDataObj = selectedCharacterData['重撃'];
    重撃_基礎ダメージ詳細ArrVar = makeTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
    console.debug('重撃_基礎ダメージ詳細ArrVar');
    console.debug(重撃_基礎ダメージ詳細ArrVar);
    // 特殊重撃を解析します。Object
    if ('特殊重撃' in selectedCharacterData) {
        myTalentDataObj = selectedCharacterData['特殊重撃'];
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
    myTalentDataObj = selectedCharacterData['落下攻撃'];
    落下攻撃_基礎ダメージ詳細ArrVar = makeTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
    console.debug('落下攻撃_基礎ダメージ詳細ArrVar');
    console.debug(落下攻撃_基礎ダメージ詳細ArrVar);
    // 特殊落下攻撃を解析します。Object
    if ('特殊落下攻撃' in selectedCharacterData) {
        myTalentDataObj = selectedCharacterData['特殊落下攻撃'];
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
    myTalentDataObj = selectedCharacterData['元素スキル'];
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
    if ('特殊元素スキル' in selectedCharacterData) {
        myTalentDataObj = selectedCharacterData['特殊元素スキル'];
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
    myTalentDataObj = selectedCharacterData['元素爆発'];
    元素爆発_基礎ダメージ詳細ArrVar = makeTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
    console.debug('元素爆発_基礎ダメージ詳細ArrVar');
    console.debug(元素爆発_基礎ダメージ詳細ArrVar);
    // 特殊元素爆発を解析します。Object
    if ('特殊元素爆発' in selectedCharacterData) {
        myTalentDataObj = selectedCharacterData['特殊元素爆発'];
        let myMapKey = talentDataObj['条件'];    // 特殊＊＊に切り替わる条件です。必須です
        let myMapValue = makeSpecialTalentDetailArray(myTalentDataObj, my天賦レベル, myデフォルト種類, myデフォルト元素, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
        特殊元素爆発_基礎ダメージ詳細MapVar.set(myMapKey, myMapValue);
        console.debug('特殊元素爆発_基礎ダメージ詳細MapVar');
        console.debug(特殊元素爆発_基礎ダメージ詳細MapVar);
    }

    let dummyArr;

    // その他天賦を解析します。Array
    if ('その他天賦' in selectedCharacterData) {
        selectedCharacterData['その他天賦'].forEach(element => {
            myTalentDataObj = element;
            dummyArr = makeTalentDetailArray(myTalentDataObj, null, null, null, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
            if (dummyArr.length > 0) {
                console.error(dummyArr);
            }
        })
    };

    // 命ノ星座を解析します。Object
    if ('命ノ星座' in selectedCharacterData) {
        for (let i = $('#命ノ星座Input').val(); i >= 1; i--) {
            myTalentDataObj = selectedCharacterData['命ノ星座'][i];
            dummyArr = makeTalentDetailArray(myTalentDataObj, null, null, null, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, 'キャラクター');
            if (dummyArr.length > 0) {
                console.error(dummyArr);
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
    if ('武器スキル' in selectedWeaponData) {
        let resultArr = makeTalentDetailArray(selectedWeaponData['武器スキル'], my精錬ランク, null, null, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, '武器');
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
    selectedArtifactSetDataArr.forEach(data => {
        let myArr = makeTalentDetailArray(data, null, null, null, ステータス変更系詳細ArrMapVar, 天賦性能変更系詳細ArrMapVar, '聖遺物セット');
        if (myArr.length != 0) {
            console.error(data);
        }
    });
    console.debug('ステータス変更系詳細ArrMapVar.get(聖遺物セット)');
    console.debug(ステータス変更系詳細ArrMapVar.get('聖遺物セット'));
}

// INPUT おすすめセット
const recommendationInputOnChange = function () {
    let entry = selectedCharacterData['おすすめセット'][$('#おすすめセットInput').val()];
    Object.keys(entry).forEach(key => {
        if (entry[key]) {
            $('#' + key + 'Input').val(entry[key]);
        } else {
            $('#' + key + 'Input').prop('selectedIndex', 0);
        }
    });
    inputOnChangeArtifactSubUpdate();
    artifactSetInputOnChange();
    weaponInputOnChange();
};
$(document).on('change', '#おすすめセットInput', recommendationInputOnChange);

// INPUT キャラクター
const characterInputOnChange = function () {
    fetch(characterMaster[$('#キャラクターInput').val()].import).then(response => response.json()).then(data => {
        selectedCharacterData = data;
        console.debug('selectedCharacterData');
        console.debug(selectedCharacterData);

        optionElemIdValueMap.clear();
        if ('オプション初期値' in selectedCharacterData) {
            Object.keys(selectedCharacterData['オプション初期値']).forEach(key => {
                let elemId = key + 'Option';
                let value = selectedCharacterData['オプション初期値'][key];
                optionElemIdValueMap.set(elemId, value);
            });
        }

        キャラクター名称Var = selectedCharacterData['名前'];
        キャラクター元素Var = selectedCharacterData['元素'];
        キャラクター武器Var = selectedCharacterData['武器'];
        通常攻撃名称Var = selectedCharacterData['通常攻撃']['名前'];
        元素スキル名称Var = selectedCharacterData['元素スキル']['名前'];
        元素爆発名称Var = selectedCharacterData['元素爆発']['名前'];
        if ('固有変数' in selectedCharacterData) {
            Object.keys(selectedCharacterData['固有変数']).forEach(key => {
                ステータス詳細ObjVar[key] = selectedCharacterData['固有変数'][key];
            });
        }

        appendOptionElements(weaponMaster[selectedCharacterData['武器']], '#武器Input');

        enemyInputOnChange();

        if ('おすすめセット' in selectedCharacterData) {
            appendOptionElements(selectedCharacterData['おすすめセット'], '#おすすめセットInput');
            recommendationInputOnChange();
        } else {
            weaponInputOnChange();
        }
    });
};
$(document).on('change', '#キャラクターInput', characterInputOnChange);
$(document).on('change', '#レベルInput', inputOnChangeOptionUpdate);
$(document).on('change', '#命ノ星座Input', inputOnChangeOptionUpdate);
$(document).on('change', '#通常攻撃レベルInput', inputOnChangeOptionUpdate);
$(document).on('change', '#元素スキルレベルInput', inputOnChangeOptionUpdate);
$(document).on('change', '#元素爆発レベルInput', inputOnChangeOptionUpdate);
