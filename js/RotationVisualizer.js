function selectorEscape(val) {
    return val.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
}

const FACE_HTML_TEMPLATE = `<img src="$1" class="face" style="background-image:url($2); background-size:contain;">`;

const TEAM_COMPACT_HTML = `<table>
    <tr>
        <td colspan="2">$1</td>
    </tr>
    <tr>
        <td>$2</td>
        <td>$3</td>
    </tr>
</table>
`;

var CharacterMaster;
var WeaponMaster = [];
var ArtifactSetMaster;
var ArtifactMainMaster;
var ArtifactSubMaster;
var EnemyMaster;
var ElementalResonanceMaster;
var ElementalReactionMaster;
var OptionMaster1;
var OptionMaster2;
var TeamOptionMaster;
var characterMatchMap = new Map();

/**
 * 文字列の先頭からキャラクター名を抽出します.
 * 
 * @param {string} str 
 * @returns {string} キャラクター名部分文字列
 */
function analyzeCharacterNameStr(str) {
    let result;
    const str2 = str.toLowerCase();
    for (let entry of characterMatchMap.entries()) {
        entry[1].forEach(v => {
            if (str2.startsWith(v.toLowerCase())) {
                if (!result) {
                    result = v;
                } else if (result.length < v.length) {
                    result = v;
                }
            }
        });
    }
    return result;
}

const KQM_SPLIT_RE1 = new RegExp(/\s+>\s+/);
const KQM_SPLIT_RE2 = new RegExp(/(\/\*.*\*\/|\S+)/);

/**
 * KQM記法を解析します.
 * 
 * @param {*} kqm 
 * @returns {Map}
 */
function analyzeKqmNotation(kqm) {
    let result = new Map();

    kqm = kqm.replace(/\/\*(.*)\*\//g, function (match, p1) {
        return '/* ' + p1.trim().replace('>', '&gt;') + ' */';
    });
    kqm = kqm.trim().replace(/\n/g, ' > ');

    let start = 1;
    const kqmSplitted = kqm.split(KQM_SPLIT_RE1);
    console.log(kqmSplitted);
    kqmSplitted.forEach(e1 => {
        // 行頭のコメントは除去します
        if (e1.startsWith('/*')) {
            e1 = e1.replace(/^\/\*.+?\*\//, '');
        }

        // キャラクターを特定します
        const characterStr = analyzeCharacterNameStr(e1);
        let character;
        characterMatchMap.forEach((value, key) => {
            if (value.includes(characterStr)) {
                character = key;
            }
        });
        e1 = e1.substring(characterStr.length + 1);
        console.log(characterStr, character, e1);
        if (!character) return;
        if (!result.has(character)) {
            result.set(character, []);
        }

        let work = e1;
        while (work) {
            let reRet = KQM_SPLIT_RE2.exec(work);
            if (!reRet) {
                break;
            }
            work = work.substring(reRet[0].length).trim();
            const action = reRet[1];
            if (action.startsWith('/*') && action.endsWith('*/')) {
                result.get(character).push([start++, action]);
            } else {
                let subArr = [];
                let repeatTimesStr = '';
                const actionChars = action.split('');
                for (let i = 0; i < actionChars.length; i++) {
                    if (!$.isNumeric(actionChars[i])) {
                        break;
                    }
                    repeatTimesStr = repeatTimesStr + actionChars[i];
                }
                for (let i = 0; i < repeatTimesStr.length; i++) {
                    actionChars.shift();
                }
                actionChars.forEach(a => {
                    // N 通常攻撃
                    // C 重撃
                    // E 元素スキル
                    // Q 元素爆発
                    // D ダッシュ
                    // J ジャンプ
                    // W 歩き
                    if ('NEQ'.indexOf(a.toUpperCase()) != -1) { // 通常攻撃 元素スキル 元素爆発
                        subArr.push(a.toUpperCase());
                    } else if ('CDJW'.indexOf(a.toUpperCase()) != -1) { // 重撃 ダッシュ ジャンプ 歩き
                        if (subArr.length > 0 && subArr[subArr.length - 1].startsWith('N')) {
                            subArr[subArr.length - 1] = subArr[subArr.length - 1] + a;
                        } else {
                            subArr.push(a.toUpperCase());
                        }
                    } else if ($.isNumeric(a)) {
                        if (subArr[subArr.length - 1] == 'N') {
                            subArr[subArr.length - 1] = subArr[subArr.length - 1] + a;
                        }
                    }
                });
                let repeatTimes = 1;
                if (repeatTimesStr) {
                    repeatTimes = Number(repeatTimesStr);
                }
                for (let i = 0; i < repeatTimes; i++) {
                    subArr.forEach(a => {
                        result.get(character).push([start++, a]);
                    });
                }
            }
        }
    });

    return result;
}

function createElementCharacterLine(character) {
    const divElem = document.createElement('div');
    divElem.className = 'character-line';
    divElem.style.borderBottomColor = ELEMENT_COLOR[CharacterMaster[character]['元素']];
    divElem.style.borderImage = 'linear-gradient(135deg,' + ELEMENT_COLOR[CharacterMaster[character]['元素']] + ',#555555)';
    divElem.style.borderImageSlice = '1';

    const importVal = CharacterMaster[character]['import'];
    const src = importVal.replace(/^data\/characters/, 'images/characters/face').replace(/json$/, 'png');
    const backgroundImageUrl = 'images/star' + CharacterMaster[character]['レアリティ'] + '-bg.png';
    const imgHtml = FACE_HTML_TEMPLATE.replace('$1', src).replace('$2', backgroundImageUrl);

    const imgElem = document.createElement('img');
    imgElem.className = 'face';
    imgElem.src = importVal.replace(/^data\/characters/, 'images/characters/face').replace(/json$/, 'png');
    imgElem.alt = characterMatchMap.get(character)[1];
    imgElem.style.backgroundImage = 'url(' + backgroundImageUrl + ')';
    imgElem.style.backgroundSize = 'contain';
    divElem.appendChild(imgElem);

    const actionsDivElem = document.createElement('div');
    actionsDivElem.className = 'actions';
    divElem.appendChild(actionsDivElem);

    return divElem;
}

const NORMAL_ATTACK_SRC = {
    片手剣: 'images/characters/NormalAttack_sword.png',
    両手剣: 'images/characters/NormalAttack_claymore.png',
    長柄武器: 'images/characters/NormalAttack_polearm.png',
    弓: 'images/characters/NormalAttack_bow.png',
    法器: 'images/characters/NormalAttack_catalyst.png'
};

const ELEMENT_COLOR = {
    炎: '#d2655a',
    水: '#559cc9',
    風: '#3aaf7a',
    雷: '#b681df',
    草: '',
    氷: '#63beb4',
    岩: '#df8f37'
};

const TIME_UNIT = 48;
const ACTION_TIME = {
    C: 1.5 * TIME_UNIT,
    E: 1 * TIME_UNIT,
    Q: 1.5 * TIME_UNIT,
    D: 0.2 * TIME_UNIT,
    J: 0.3 * TIME_UNIT,
    W: 0.3 * TIME_UNIT
};
const NORMAL_ATTACK_TIME = {
    片手剣: 0.4 * TIME_UNIT,
    両手剣: 0.9 * TIME_UNIT,
    長柄武器: 0.4 * TIME_UNIT,
    弓: 0.4 * TIME_UNIT,
    法器: 0.75 * TIME_UNIT
};

const NORMAL_ATTACK_TIME_ARR = {
    片手剣: [0, 0, 0, 0, 4, 5, 6],
    両手剣: [0, 0, 0, 0, 225, 270],
    長柄武器: [0, 0, 0, 0, 4, 5, 6],
    弓: [0, 0, 0, 0, 4, 5, 6],
    法器: [0, 1, 0, 3, 4]
}

/**
 * 
 * @param {string} character 
 * @param {number} start 
 * @param {string} action 
 * @param {number} actionTime 
 * @returns {HTMLElement}
 */
function createElementAction(character, start, action, actionTime) {
    console.log(character, start, action, actionTime);
    const divElem = document.createElement('div');
    divElem.className = 'action';
    divElem.style.width = actionTime + 'px';
    divElem.style.left = start + 'px';
    divElem.style.backgroundColor = ELEMENT_COLOR[CharacterMaster[character]['元素']];

    const importVal = CharacterMaster[character]['import'];
    const imgDir = importVal.replace(/^data\/characters/, 'images/characters').replace(/.json$/, '/');
    let src;
    if (action.startsWith('N') || action == 'C') {
        src = NORMAL_ATTACK_SRC[CharacterMaster[character]['武器']];
    } else if (action == 'E') {
        src = imgDir + 'ElementalSkill.png';
    } else if (action == 'Q') {
        src = imgDir + 'ElementalBurst.png';
    }
    if (src) {
        const imgElem = document.createElement('img');
        imgElem.className = 'action';
        imgElem.src = src;
        imgElem.alt = action;
        if (actionTime < 64) {
            imgElem.style.width = actionTime + 'px';
            // imgElem.style.height = actionTime + 'px';
        }
        divElem.appendChild(imgElem);
    }

    const pElem = document.createElement('p');
    pElem.innerHTML = action;
    divElem.appendChild(pElem);

    return divElem;
}

SAVE_DATA_TEMPLATE = {
    id: '',
    name: '',
    data: '',
    description: '',
    sort_order: 0,
    updated_at: null
}

function displayTeam(data, opt_editable = false) {
    const divElem = document.createElement('div');
    divElem.className = 'team';
    divElem.id = data['id'];
}

function displayTeamCompact(data) {
    const divElem = document.createElement('div');
    if ('name' in data) {
        const nameElem = document.createElement('p');
        p.innerHTML = name;
        divElem.appendChild(nameElem);
    }
    if ('data' in data) {
        const faceElemArr = [];
        const analyzedMap = analyzeKqmNotation(data['data']);
        analyzedMap.forEach((value, key) => {
            faceElemArr.push(create)
        });

    }
    if ('description' in data) {

    }
}

function getElementColor(master) {
    return ELEMENT_COLOR[master['元素']];
}

function getFaceSrcUrl(master) {
    return master['import'].replace(/^data\/characters/, 'images/characters/face').replace(/json$/, 'png');
}

function getFaceBackgroundImageUrl(master) {
    return 'images/star' + master['レアリティ'] + '-bg.png';
}

const DATA_HTML_TEMPLATE = `<div class="data" id="data-$1">
    <div class="data-control">
        <p class="name" id="label-name-$1">$1</p>
        <input type="text" id="name-$1" minlength="1" maxlength="32" size="32" value="$1" style="display: none;">
        <button type="button" class="data-edit" id="edit-$1">EDIT</button>
        <button type="button" class="data-cancel" id="cancel-$1" style="display: none;">CANCEL</button>
        <button type="button" class="data-save" id="save-$1" style="display: none;">SAVE</button>
        <button type="button" class="data-remove" id="remove-$1">REMOVE</button>
    </div>
    <div class="rotation-area" id="rotation-area-$1" style="display: none;">
        <div class="flex">
            <textarea id="rotation-$1" name="rotation-$1" rows="8" cols="65" autocapitalize="words">$2</textarea>
            <label for="rotation-$1">ROTAION</label>
        </div>
    </div>
    <div class="description-area" id="description-area-$1" style="display: none;">
        <div class="flex">
            <textarea id="description-$1" name="description-$1" rows="8" cols="65">$3</textarea>
            <label for="description-$1">DESCRIPTION</label>
        </div>
    </div>
$4
    <fieldset class="description">$3</fieldset>
</div>`;
const DATA_LINE_HTML_TEMPLATE = `<div class="character-line" id="character-line-$1_$2" style="border-bottom-color: $3; border-image: linear-gradient(135deg, $3, rgb(85, 85, 85)) 1 / 1 / 0 stretch;">
<img class="face" src="$4" alt="$2" style="background-image: url($5); background-size: contain;">
<div class="actions"></div>
</div>`;

/**
 * 
 * @param {string} name 
 */
function getSavedData(name) {
    return JSON.parse(localStorage[SAVE_DATA_KEY_PREFIX + name]);
}

/**
 * EDITボタンがクリックされました.
 */
const editButtonOnClick = function () {
    const name = $(this).attr('id').replace('edit-', '');
    $('#label-name-' + selectorEscape(name)).hide();
    $('#name-' + selectorEscape(name)).show();
    $('#edit-' + selectorEscape(name)).hide();
    $('#cancel-' + selectorEscape(name)).show();
    $('#save-' + selectorEscape(name)).show();
    $('#rotation-area-' + selectorEscape(name)).show();
    $('#description-area-' + selectorEscape(name)).show();
}

/**
 * CANCELボタンがクリックされました.
 */
const cancelButtonOnClick = function () {
    const name = $(this).attr('id').replace('cancel-', '');
    const savedData = getSavedData(name);
    if (savedData) {
        $('#name-' + selectorEscape(name)).val(savedData['name']);
        $('#rotation-area-' + selectorEscape(name)).val(savedData['data']);
        $('#description-area-' + selectorEscape(name)).val(savedData['description']);
    }
    $('#label-name-' + selectorEscape(name)).show();
    $('#name-' + selectorEscape(name)).hide();
    $('#edit-' + selectorEscape(name)).show();
    $('#cancel-' + selectorEscape(name)).hide();
    $('#save-' + selectorEscape(name)).hide();
    $('#rotation-area-' + selectorEscape(name)).hide();
    $('#description-area-' + selectorEscape(name)).hide();
}

/**
 * SAVEボタンがクリックされました.
 * 
 * @param {string} suffix 
 */
function saveButtonOnClick(suffix) {
    const name = String($('#' + selectorEscape('name-' + suffix)).val()).trim();
    const data = String($('#' + selectorEscape('rotation-' + suffix)).val()).trim();
    const description = String($('#' + selectorEscape('description-' + suffix)).val()).trim();
    if (name && data) {
        if (name != suffix) {
            localStorage.removeItem(SAVE_DATA_KEY_PREFIX + suffix);
        }
        const key = SAVE_DATA_KEY_PREFIX + name;
        let valueObj = JSON.parse(JSON.stringify(SAVE_DATA_TEMPLATE));
        if (localStorage[key]) {
            valueObj = JSON.parse(JSON.stringify(SAVE_DATA_TEMPLATE));
        } else {
            valueObj = JSON.parse(JSON.stringify(SAVE_DATA_TEMPLATE));
        }
        let sortOrder = 0;
        valueObj['name'] = name;
        valueObj['data'] = data;
        valueObj['description'] = description;
        valueObj['sortOrder'] = sortOrder;
        valueObj['updated_at'] = null;
        localStorage.setItem(key, JSON.stringify(valueObj));
    }
}

const saveButtonNewOnClick = function () {
    const id = $(this).attr('id');
    const suffix = id.substring(id.indexOf('-') + 1);

    saveButtonOnClick(suffix)
};

function redrawData(dataObj, element) {

}

const saveButtonSavedDataOnClick = function () {
    const id = $(this).attr('id');
    const suffix = id.substring(id.indexOf('-') + 1);

    const name = $('#name-' + selectorEscape(suffix)).val();

    saveButtonOnClick(suffix);

    const dataObj = getSavedData(name);
    if (dataObj) {

    }

    $('#label-name-' + selectorEscape(suffix)).show();
    $('#name-' + selectorEscape(suffix)).hide();
    $('#edit-' + selectorEscape(suffix)).show();
    $('#cancel-' + selectorEscape(suffix)).hide();
    $('#save-' + selectorEscape(suffix)).hide();
    $('#rotation-area-' + selectorEscape(suffix)).hide();
    $('#description-area-' + selectorEscape(suffix)).hide();
};

/**
* 
* @param {object} dataObj 
* @param {HTMLElement} parent 
*/
function displayData(dataObj, parent, opt_editable = false) {
    const analyzedMap = analyzeKqmNotation(dataObj['data']);

    let html = DATA_HTML_TEMPLATE;
    html = html.replace(/\$1/g, dataObj['name']);
    html = html.replace(/\$2/g, dataObj['data']);
    let imgHtml = '';
    analyzedMap.forEach((value, key) => {
        const myMaster = CharacterMaster[key];
        if (!myMaster) return;
        let htmlSub = DATA_LINE_HTML_TEMPLATE;
        htmlSub = htmlSub.replace(/\$1/g, dataObj['name']);
        htmlSub = htmlSub.replace(/\$2/g, key);
        htmlSub = htmlSub.replace(/\$3/g, getElementColor(myMaster));
        htmlSub = htmlSub.replace(/\$4/g, getFaceSrcUrl(myMaster));
        htmlSub = htmlSub.replace(/\$5/g, getFaceBackgroundImageUrl(myMaster));
        imgHtml += htmlSub + '\n';
    });
    const description = dataObj['description'] ? dataObj['description'] : '';
    html = html.replace(/\$3/g, description);
    html = html.replace(/\$4/g, imgHtml);

    parent.insertAdjacentHTML('beforeend', html);

    const actionTimeMap = new Map();
    analyzedMap.forEach((value, key) => {
        value.forEach(action => {
            if (action[1].startsWith('/*') && action[1].endsWith('*/')) return;
            let actionTime = 0;
            if (action[1] in ACTION_TIME) {
                actionTime = ACTION_TIME[action[1]];
            } else {
                const nRe = new RegExp(/^N(\d*)([CDJW]*)/);
                let nRet = nRe.exec(action[1]);
                if (nRet) {
                    if (nRet[1]) {
                        actionTime = NORMAL_ATTACK_TIME[CharacterMaster[key]['武器']] * Number(nRet[1]);
                    } else {
                        actionTime = NORMAL_ATTACK_TIME[CharacterMaster[key]['武器']];
                    }
                    if (nRet[2]) {
                        if (nRet[2].indexOf('C') != -1) {
                            actionTime += NORMAL_ATTACK_TIME[CharacterMaster[key]['武器']] * 2;
                        }
                        actionTime += 0.2 * TIME_UNIT * nRet[2].length;
                    }
                }
            }
            console.log(action, actionTime, typeof actionTime);
            actionTimeMap.set(action[0], actionTime);
        });
    });

    const startMap = new Map();
    actionTimeMap.forEach((value, key) => {
        let newValue = 0;
        for (let i = 1; i < key; i++) {
            if (actionTimeMap.has(i)) {
                newValue += Number(actionTimeMap.get(i));
            }
        }
        startMap.set(key, newValue);
    });

    analyzedMap.forEach((value, key) => {
        value.forEach(action => {
            const elem = createElementAction(key, startMap.get(action[0]), action[1], actionTimeMap.get(action[0]));
            $('#' + selectorEscape('character-line-' + dataObj['name'] + '_' + key)).find('.actions').append(elem);
        });
    });

    $(document).on('click', '#edit-' + selectorEscape(dataObj['name']), editButtonOnClick);
    $(document).on('click', '#cancel-' + selectorEscape(dataObj['name']), cancelButtonOnClick);
    $(document).on('click', '#save-' + selectorEscape(dataObj['name']), saveButtonSavedDataOnClick);
}

const DATA_COMPACT_HTML_TEMPLATE = `<div class="data-compact" id="data-compact-$1">
<p class="name">$1</p>
$3
<div class="description">$4</div>
<button type="button" class="data-compact-edit" id="data-compact-edit-$1">EDIT</button>
<button type="button" class="data-compact-reset" id="data-compact-reset-$1" disabled>RESET</button>
<button type="button" class="data-compact-save" id="data-compact-save-$1" disabled>SAVE</button>
<button type="button" class="data-compact-remove" id="data-compact-remove-$1">REMOVE</button>
</div>`;
const DATA_COMPACT_IMG_HTML_TEMPLATE = `<img class="face" src="$1" alt="$2" style="background-image: url($3); background-size: contain;">`;

/**
 * 
 * @param {object} dataObj 
 * @param {HTMLElement} parent 
 */
function displayDataCompact(dataObj, parent) {
    const analyzedMap = analyzeKqmNotation(dataObj['data']);

    let html = DATA_COMPACT_HTML_TEMPLATE;
    html = html.replace(/\$1/g, dataObj['name']);
    let imgHtml = '';
    analyzedMap.forEach((value, key) => {
        const myMaster = CharacterMaster[key];
        if (!myMaster) return;
        let imgHtmlSub = DATA_COMPACT_IMG_HTML_TEMPLATE;
        imgHtmlSub = imgHtmlSub.replace(/\$1/g, getFaceSrcUrl(myMaster));
        imgHtmlSub = imgHtmlSub.replace(/\$2/g, key);
        imgHtmlSub = imgHtmlSub.replace(/\$3/g, getFaceBackgroundImageUrl(myMaster));
        imgHtml += imgHtmlSub + '\n';
    });
    html = html.replace(/\$3/g, imgHtml);
    const description = dataObj['description'] ? dataObj['description'] : '';
    html = html.replace(/\$4/g, description);

    parent.insertAdjacentHTML('beforeend', html);
}

const SAVE_DATA_KEY_PREFIX = 'genteam-';

/**
 * 
 * @returns 
 */
function loadSavedData() {
    const saveDataAreaElem = $('#save-data-area').get()[0];
    saveDataAreaElem.innerHTML = '';

    const savedDataArr = [];
    Object.keys(localStorage).filter(s => s.startsWith(SAVE_DATA_KEY_PREFIX)).forEach(key => {
        const savedData = JSON.parse(localStorage[key]);
        savedDataArr.push(savedData);
    });
    if (savedDataArr.length == 0) return;

    savedDataArr.sort((a, b) => a['sortOrder'] - b['sortOrder']);

    let sortOrder = 1;
    savedDataArr.forEach(savedData => {
        if (savedData['sortOrder'] == sortOrder) return;
        savedData['sortOrder'] = sortOrder++;
        localStorage[SAVE_DATA_KEY_PREFIX + savedData['name']] = JSON.stringify(savedData);
    });

    savedDataArr.forEach(savedData => {
        displayData(savedData, saveDataAreaElem);
    });
}

/**
 * init.
 */
async function init() {
    const responses = await Promise.all([
        'data/CharacterMaster.json',
        'data/SwordMaster.json',
        'data/ClaymoreMaster.json',
        'data/PolearmMaster.json',
        'data/BowMaster.json',
        'data/CatalystMaster.json',
        'data/ArtifactSetMaster.json',
        'data/ArtifactMainMaster.json',
        'data/ArtifactSubMaster.json',
        'data/EnemyMaster.json',
        'data/ElementalResonanceMaster.json',
        'data/ElementalReactionMaster.json',
        'data/OptionMaster1.json',
        'data/OptionMaster2.json',
        'data/TeamOptionMaster.json'
    ].map(url => fetch(url).then(resp => resp.json())));

    CharacterMaster = responses[0];
    WeaponMaster['片手剣'] = responses[1];
    WeaponMaster['両手剣'] = responses[2];
    WeaponMaster['長柄武器'] = responses[3];
    WeaponMaster['弓'] = responses[4];
    WeaponMaster['法器'] = responses[5];
    ArtifactSetMaster = responses[6];
    ArtifactMainMaster = responses[7];
    ArtifactSubMaster = responses[8];
    EnemyMaster = responses[9];
    ElementalResonanceMaster = responses[10];
    ElementalReactionMaster = responses[11];
    OptionMaster1 = responses[12];
    OptionMaster2 = responses[13];
    TeamOptionMaster = responses[14];

    Object.keys(CharacterMaster).forEach(key => {
        const importVal = CharacterMaster[key]['import'];
        const splitted = importVal.split('_');
        const mapValue = [];
        mapValue.push(key);
        const name1 = splitted[splitted.length - 1].replace('.json', '');
        mapValue.push(name1);
        const name2 = name1.split(/(?=[A-Z])/).join(' ');
        if (name2 != name1) {
            mapValue.push(name2);
        }
        if (name2.indexOf(' ') != -1) {
            const nameSplitted = name2.split(' ');
            mapValue.push(nameSplitted[0]);
            mapValue.push(nameSplitted[1]);
        }
        characterMatchMap.set(key, mapValue);
    });

    console.log(characterMatchMap);

    loadSavedData();
};

/**
 * 
 */
const rotationTextareaOnChange = function () {
    if ($(this).val()) {
        const resultAreaElem = document.getElementById('rotaion-result-area');
        $(resultAreaElem).html('');

        let analyzedMap = analyzeKqmNotation($(this).val());
        console.log(analyzedMap);

        const actionTimeMap = new Map();
        analyzedMap.forEach((value, key) => {
            value.forEach(action => {
                if (action[1].startsWith('/*') && action[1].endsWith('*/')) return;
                let actionTime = 0;
                if (action[1] in ACTION_TIME) {
                    actionTime = ACTION_TIME[action[1]];
                } else {
                    const nRe = new RegExp(/^N(\d*)([CDJW]*)/);
                    let nRet = nRe.exec(action[1]);
                    if (nRet) {
                        if (nRet[1]) {
                            actionTime = NORMAL_ATTACK_TIME[CharacterMaster[key]['武器']] * Number(nRet[1]);
                        } else {
                            actionTime = NORMAL_ATTACK_TIME[CharacterMaster[key]['武器']];
                        }
                        if (nRet[2]) {
                            if (nRet[2].indexOf('C') != -1) {
                                actionTime += NORMAL_ATTACK_TIME[CharacterMaster[key]['武器']] * 2;
                            }
                            actionTime += 0.2 * TIME_UNIT * nRet[2].length;
                        }
                    }
                }
                console.log(action, actionTime, typeof actionTime);
                actionTimeMap.set(action[0], actionTime);
            });
        });

        const startMap = new Map();
        actionTimeMap.forEach((value, key) => {
            let newValue = 0;
            for (let i = 1; i < key; i++) {
                if (actionTimeMap.has(i)) {
                    newValue += Number(actionTimeMap.get(i));
                }
            }
            startMap.set(key, newValue);
        });

        analyzedMap.forEach((value, key) => {
            const characterLineElem = createElementCharacterLine(key);
            resultAreaElem.appendChild(characterLineElem);
            value.forEach(action => {
                const elem = createElementAction(key, startMap.get(action[0]), action[1], actionTimeMap.get(action[0]));
                $(characterLineElem).find('.actions').append(elem);
            });
        });
    }
};

