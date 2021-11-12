// マスターデータ
var キャラクターMasterVar;
var 武器MasterVar = {
    片手剣: null,
    両手剣: null,
    長柄武器: null,
    弓: null,
    法器: null
};
var 聖遺物メイン効果MasterVar;
var 聖遺物サブ効果MasterVar;
var 聖遺物セット効果MasterVar;
var 元素共鳴MasterVar;
var 敵MasterVar;
var 元素反応MasterVar;
var バフデバフMasterVar;

// 選択中のデータを保持します
var 選択中キャラクターデータVar;
var 選択中武器データVar;
var 選択中聖遺物セット効果データArrVar = [];
var 選択中元素共鳴データArrVar = [];
var 選択中敵データVar;

var 選択可能武器セットObjVar = {};

var キャラクター名前Var;
var キャラクター元素Var;
var キャラクター武器Var;
var 通常攻撃名称Var;
var 元素スキル名称Var;
var 元素爆発名称Var;
var 元素エネルギーVar;
var おすすめセットArrVar;

// 通常攻撃天賦で使用する元素を設定します
var 通常攻撃_元素Var;
var 重撃_元素Var;
var 落下攻撃_元素Var;

// とても重要なデータ群です
var 通常攻撃_基礎ダメージ詳細ArrVar = [];
var 重撃_基礎ダメージ詳細ArrVar = [];
var 落下攻撃_基礎ダメージ詳細ArrVar = [];
var 元素スキル_基礎ダメージ詳細ArrVar = [];
var 元素爆発_基礎ダメージ詳細ArrVar = [];
var その他_基礎ダメージ詳細ArrMapVar = new Map();
// key:条件,value:＊詳細Var for 雷電将軍
var 特殊通常攻撃_基礎ダメージ詳細MapVar = new Map();
var 特殊重撃_基礎ダメージ詳細MapVar = new Map();
var 特殊落下攻撃_基礎ダメージ詳細MapVar = new Map();
// 
var ステータス変更系詳細ArrMapVar = new Map();
var 天賦性能変更系詳細ArrMapVar = new Map();

// バフデバフBox用
var バフデバフ詳細ArrVar = [];
var バフデバフオプション条件Map = new Map();
var バフデバフオプション排他Map = new Map();

// オプションBox用
// checkboxとselectの描画用の情報を保持します
// checkboxの場合、value=null
// selectの場合、valueは配列
const オプション条件MapVar = new Map();
const オプション排他MapVar = new Map(); // 同時にcheckedにならない条件を保持します

// オプションの状態を記憶します。
const オプションElementIdValue記憶Map = new Map();

// hidable要素に紐づくセレクタとvisibility=true/falseを保持するMap
var selectorVisiblityStateMap = new Map();  // セレクタ, is visible

//
var ステータス詳細ObjVar = {
    レベル: 0,
    HP乗算: 0,
    攻撃力乗算: 0,
    防御力乗算: 0,
    基礎HP: 0,
    基礎攻撃力: 0,
    基礎防御力: 0,
    HP上限: 0,
    攻撃力: 0,
    防御力: 0,
    元素熟知: 0,
    会心率: 0,
    会心ダメージ: 0,
    与える治療効果: 0,
    受ける治療効果: 0,
    クールタイム短縮: 0,
    シールド強化: 0,
    元素チャージ効率: 100,
    炎元素ダメージバフ: 0,
    水元素ダメージバフ: 0,
    風元素ダメージバフ: 0,
    雷元素ダメージバフ: 0,
    草元素ダメージバフ: 0,
    氷元素ダメージバフ: 0,
    岩元素ダメージバフ: 0,
    物理ダメージバフ: 0,
    炎元素耐性: 0,
    水元素耐性: 0,
    風元素耐性: 0,
    雷元素耐性: 0,
    草元素耐性: 0,
    氷元素耐性: 0,
    岩元素耐性: 0,
    物理耐性: 0,
    通常攻撃ダメージバフ: 0,
    重撃ダメージバフ: 0,
    落下攻撃ダメージバフ: 0,
    元素スキルダメージバフ: 0,
    元素爆発ダメージバフ: 0,
    与えるダメージ: 0,
    敵レベル: 0,
    敵炎元素耐性: 0,
    敵水元素耐性: 0,
    敵風元素耐性: 0,
    敵雷元素耐性: 0,
    敵草元素耐性: 0,
    敵氷元素耐性: 0,
    敵岩元素耐性: 0,
    敵物理耐性: 0,
    敵防御力: 0,
    燃焼ダメージバフ: 0,
    蒸発ダメージバフ: 0,
    溶解ダメージバフ: 0,
    氷砕きダメージバフ: 0,
    感電ダメージバフ: 0,
    過負荷ダメージバフ: 0,
    超電導ダメージバフ: 0,
    拡散ダメージバフ: 0
};

// マスターデータの詳細[].種類からステータス詳細ObjVarのプロパティへの変換表です
const KIND_TO_PROPERTY_MAP = new Map([
    ['HP', 'HP上限'],
    ['HP%', 'HP乗算'],
    ['攻撃力', '攻撃力'],
    ['攻撃力%', '攻撃力乗算'],
    ['防御力', '防御力'],
    ['防御力%', '防御力乗算']
]);

// ステータス詳細ObjVarを初期化します
function initステータス詳細ObjVar() {
    Object.keys(ステータス詳細ObjVar).forEach(key => {
        if (選択中キャラクターデータVar) {
            if ('固有変数' in 選択中キャラクターデータVar) {
                if (key in 選択中キャラクターデータVar['固有変数']) {
                    return;
                }
            }
        }
        if ($.isPlainObject(ステータス詳細ObjVar[key])) {
            if (key == 'ダメージ計算') {
                Object.keys(ステータス詳細ObjVar[key]).forEach(subKey => {
                    ステータス詳細ObjVar[key][subKey] = [];
                });
            } else {
                console.error(initステータス詳細ObjVar.name, key);
            }
        } else {
            ステータス詳細ObjVar[key] = 0;
        }
    });
    ステータス詳細ObjVar['会心率'] = 5;
    ステータス詳細ObjVar['会心ダメージ'] = 50;
    ステータス詳細ObjVar['元素チャージ効率'] = 100;

    // 通常攻撃の元素
    通常攻撃_元素Var = '物理';
    重撃_元素Var = '物理';
    落下攻撃_元素Var = '物理';
    if (選択中キャラクターデータVar) {
        if (選択中キャラクターデータVar['武器'] == '法器') {
            通常攻撃_元素Var = 選択中キャラクターデータVar['元素'];
            重撃_元素Var = 選択中キャラクターデータVar['元素'];
            落下攻撃_元素Var = 選択中キャラクターデータVar['元素'];
        }
    }
}

var キャラクター所持状況ObjVar = {}

const ELEMENT_IMG_SRC_MAP = new Map([
    ['炎', 'images/element_pyro.png'],
    ['水', 'images/element_hydro.png'],
    ['風', 'images/element_aero.png'],
    ['雷', 'images/element_electro.png'],
    ['氷', 'images/element_cryo.png'],
    ['岩', 'images/element_geo.png']
]);

function buildキャラクター所持状況List() {
    $('#キャラクター所持状況List').empty();

    let ulElem = document.getElementById('キャラクター所持状況List');
    Object.keys(キャラクターMasterVar).forEach(key => {
        let myCharacterMaster = キャラクターMasterVar[key];
        if ('image' in myCharacterMaster || 'image2' in myCharacterMaster) {
            let src = 'image' in myCharacterMaster ? myCharacterMaster['image'] : myCharacterMaster['image2'];

            let liElem = document.createElement('li');
            ulElem.appendChild(liElem);

            let divElem = document.createElement('div');
            divElem.id = key + '_所持状況Input';
            liElem.appendChild(divElem);

            let imgElem = document.createElement('img');
            imgElem.src = src;
            imgElem.alt = key;
            imgElem.width = 100;
            imgElem.height = 100;
            divElem.appendChild(imgElem);

            let img2Elem = document.createElement('img');
            img2Elem.className = 'element';
            img2Elem.src = ELEMENT_IMG_SRC_MAP.get(myCharacterMaster['元素']);
            img2Elem.alt = myCharacterMaster['元素'];
            img2Elem.width = 30;
            img2Elem.height = 30;
            divElem.appendChild(img2Elem);

            let pElem = document.createElement('p');
            if (key in キャラクター所持状況ObjVar) {
                pElem.textContent = キャラクター所持状況ObjVar[key];
            }
            divElem.appendChild(pElem);

            if (!pElem.textContent) {
                imgElem.classList.add('darken');
                img2Elem.classList.add('darken');
            }
        }
    });

    $(document).on('click', '#キャラクター所持状況List li div', キャラクター所持状況OnClick);
}

const キャラクター所持状況OnClick = function () {
    let val = $('#' + selectorEscape(this.id) + ' p').text();
    if (val) {
        if (++val > 6) {
            val = null;
            $('#' + selectorEscape(this.id) + ' img').addClass('darken');
        }
    } else {
        val = 0;
        $('#' + selectorEscape(this.id) + ' img').removeClass('darken');
    }
    $('#' + selectorEscape(this.id) + ' p').text(val);

    キャラクター所持状況ObjVar[this.id.split('_')[0]] = val;

    $('#キャラクター所持状況保存Button').prop('disabled', false);
}

const loadキャラクター所持状況 = function () {
    if (localStorage['キャラクター所持状況']) {
        try {
            キャラクター所持状況ObjVar = JSON.parse(localStorage['キャラクター所持状況']);
        } catch (error) {
            キャラクター所持状況ObjVar = {};
        }
    } else {
        キャラクター所持状況ObjVar = {};
    }
    $('#キャラクター所持状況Button').prop('disabled', true);
}

const saveキャラクター所持状況 = function () {
    localStorage['キャラクター所持状況'] = JSON.stringify(キャラクター所持状況ObjVar);
    $('#キャラクター所持状況保存Button').prop('disabled', true);
    $('#ローカルストレージクリアInput').prop('checked', false);
    toggleローカルストレージクリア();
}

const clearローカルストレージ = function () {
    localStorage.clear();
    $('#ローカルストレージクリアInput').prop('checked', false);
    toggleローカルストレージクリア();
}

const toggleローカルストレージクリア = function () {
    let checked = $('#ローカルストレージクリアInput').prop('checked');
    $('#ローカルストレージクリアButton').prop('disabled', !checked);
}

//////////////////////
//////////////////////
var キャラクター構成ObjVar = null;

// おすすめセットをセットアップします
function setupおすすめセット() {
    おすすめセットArrVar = [];
    loadキャラクター構成();
    if (キャラクター構成ObjVar) {
        おすすめセットArrVar.push(['あなたの' + キャラクター構成ObjVar['キャラクター'], キャラクター構成ObjVar]);
    }
    if ('おすすめセット' in 選択中キャラクターデータVar) {
        Object.keys(選択中キャラクターデータVar['おすすめセット']).forEach(key => {
            おすすめセットArrVar.push([key, 選択中キャラクターデータVar['おすすめセット'][key]]);
        });
    }
    let selector = '#おすすめセットInput';
    $(selector).empty();
    おすすめセットArrVar.forEach(entry => {
        appendOptionElement(entry[0], entry[1], selector);
    });
}

const saveキャラクター構成 = function () {
    if (!($('#武器Input').val() in 武器MasterVar[選択中キャラクターデータVar['武器']])) return;

    let myキャラクター = $('#キャラクターInput').val();
    let key = '構成_' + myキャラクター;
    キャラクター構成ObjVar = {
        キャラクター: myキャラクター,
        レベル: $('#レベルInput').val(),
        命ノ星座: $('#命ノ星座Input').val(),
        通常攻撃レベル: $('#通常攻撃レベルInput').val(),
        元素スキルレベル: $('#元素スキルレベルInput').val(),
        元素爆発レベル: $('#元素爆発レベルInput').val(),
        武器: $('#武器Input').val(),
        武器レベル: $('#武器レベルInput').val(),
        精錬ランク: $('#精錬ランクInput').val(),
        聖遺物メイン効果1: $('#聖遺物メイン効果1Input').val(),
        聖遺物メイン効果2: $('#聖遺物メイン効果2Input').val(),
        聖遺物メイン効果3: $('#聖遺物メイン効果3Input').val(),
        聖遺物メイン効果4: $('#聖遺物メイン効果4Input').val(),
        聖遺物メイン効果5: $('#聖遺物メイン効果5Input').val(),
        聖遺物優先するサブ効果1: $('#聖遺物優先するサブ効果1Input').val(),
        聖遺物優先するサブ効果1倍率: $('#聖遺物優先するサブ効果1倍率Input').val(),
        聖遺物優先するサブ効果2: $('#聖遺物優先するサブ効果2Input').val(),
        聖遺物優先するサブ効果2倍率: $('#聖遺物優先するサブ効果2倍率Input').val(),
        聖遺物優先するサブ効果3: $('#聖遺物優先するサブ効果3Input').val(),
        聖遺物優先するサブ効果3倍率: $('#聖遺物優先するサブ効果3倍率Input').val(),
        聖遺物セット効果1: $('#聖遺物セット効果1Input').val(),
        聖遺物セット効果2: $('#聖遺物セット効果2Input').val()
    };

    $('#オプションBox input[type="checkbox"]').each((index, elem) => {
        let key = elem.id.replace('Option', '');
        let value = elem.checked;
        キャラクター構成ObjVar[key] = value;
    });
    $('#オプションBox select').each((index, elem) => {
        let key = elem.id.replace('Option', '');
        let value = elem.selectedIndex;
        キャラクター構成ObjVar[key] = value;
    });

    localStorage.setItem(key, JSON.stringify(キャラクター構成ObjVar));

    setupおすすめセット();
}

const clearキャラクター構成 = function () {
    let key = '構成_' + $('#キャラクターInput').val();
    if (localStorage[key]) {
        localStorage.removeItem(key);
    }

    setupおすすめセット();
}

const loadキャラクター構成 = function () {
    let key = '構成_' + $('#キャラクターInput').val();
    if (localStorage[key]) {
        キャラクター構成ObjVar = JSON.parse(localStorage[key]);
        Object.keys(キャラクター構成ObjVar).forEach(objKey => {
            $('#' + selectorEscape(objKey) + 'Input').val(キャラクター構成ObjVar[objKey]);
        });
        $('#構成保存Button').prop('disabled', true);
        $('#保存構成削除Button').prop('disabled', false);
    } else {
        キャラクター構成ObjVar = null;
        $('#構成保存Button').prop('disabled', false);
        $('#保存構成削除Button').prop('disabled', true);
    }
}

function changeキャラクター構成(elem) {
    if (!$('#構成保存Button').prop('disabled')) return;
    if (キャラクター構成ObjVar) {
        $('#構成保存Button').prop('disabled', false);
        return;
    }
    let key = elem.id.replace('Input', '');
    let value = null;
    if (elem instanceof HTMLSelectElement) {
        value = elem.value;
    } else if (elem instanceof HTMLInputElement) {
        switch (elem.type) {
            case 'number':
                value = elem.value;
                break;
            case 'checkbox':
                value = elem.checked;
                break;
        }
    }
    if (value != null && key in キャラクター構成ObjVar && value != キャラクター構成ObjVar[key]) {
        $('#構成保存Button').prop('disabled', false);
    }
}

const enable構成保存Button = function () {
    $('#構成保存Button').prop('disabled', false);
};

function initキャラクター構成関連要素() {
    $('#構成保存Button').prop('disabled', true);
    $('#保存構成削除Button').prop('disabled', true);

    $(document).on('click', '#構成保存Button', saveキャラクター構成);
    $(document).on('click', '#保存構成削除Button', clearキャラクター構成);
}