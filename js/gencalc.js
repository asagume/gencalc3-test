function setupAllEvent() {
    // 全般
    $(document).on('focus', 'input,select', function () {
        let value = this.value;
        if (this instanceof HTMLInputElement) {
            if (['checkbox', 'radio'].includes(this.type)) {
                value = this.checked;
            }
        }
        ELEMENT_VALUE_AT_FOCUS_MAP.set(this.id, value);
    });

    // キャラクター
    $(document).on('change', '#キャラクターInput', キャラクターInputOnChange);
    $(document).on('change', '#レベルInput', レベルInputOnChange);
    $(document).on('change', '#命ノ星座Input', 命ノ星座InputOnChange);
    $(document).on('change', '#通常攻撃レベルInput', 天賦レベルInputOnChange);
    $(document).on('change', '#元素スキルレベルInput', 天賦レベルInputOnChange);
    $(document).on('change', '#元素爆発レベルInput', 天賦レベルInputOnChange);

    // キャラクター画像 クリックイベント
    $(document).on('click', '#character-button', function () {
        const selector = '#character-select';
        let b = $(selector).is(':visible');
        if (!b) {
            if ($(selector).find('li').length == 0) {
                buildキャラクター選択リスト();
            }
            emSelectedItemInList('#キャラクター選択', $('#キャラクターInput').val());
        }
        toggleShowHide('#character-select');
    });

    // キャラクター選択 絞り込み
    $(document).on('click', '[name="element-type-input"]', function () {
        let elementType = null;
        if (this.checked) {
            elementType = $('#' + this.id + '+label img').prop('alt');
            Array.from(document.getElementsByName('element-type-input')).forEach(e => {
                if (e != this) {
                    e.checked = false;
                }
            });
        }
        buildキャラクター選択リスト(elementType);
        emSelectedItemInList('#キャラクター選択', $('#キャラクターInput').val());
    });

    // ℹ️ クリックイベント
    $(document).on('click', '#character-profile-i', function () {
        const selector = '#character-profile';
        let b = $(selector).prop('checked');
        $(selector).prop('checked', !b);

        $('.select-group1').removeClass('selected');
    });

    // おすすめセット
    $(document).on('change', '#おすすめセットInput', おすすめセットInputOnChange);
    // おすすめセット クリックイベント
    $(document).on('click', '#recomend-button', function () {
        toggleShowHide(this, '#おすすめセットInput');
    });

    // 天賦画像 クリックイベント
    $(document).on('click', '#talent1-button', function () {
        const selector = '#talent1-detail';
        let b = $(selector).prop('checked');
        $(selector).prop('checked', !b);

        $('.select-group1').removeClass('selected');
    });
    $(document).on('click', '#talent2-button', function () {
        const selector = '#talent2-detail';
        let b = $(selector).prop('checked');
        $(selector).prop('checked', !b);

        $('.select-group1').removeClass('selected');
    });
    $(document).on('click', '#talent3-button', function () {
        const selector = '#talent3-detail';
        let b = $(selector).prop('checked');
        $(selector).prop('checked', !b);

        $('.select-group1').removeClass('selected');
    });

    // 武器
    $(document).on('change', '#武器Input', 武器InputOnChange);
    $(document).on('change', '#武器レベルInput', 武器レベルInputOnChange);
    $(document).on('change', '#精錬ランクInput', 精錬ランクInputOnChange);

    // 武器画像 クリックイベント
    $(document).on('click', '#weapon-button', function () {
        const selector = '#weapon-detail-and-select';
        let b = $(selector).prop('checked');
        if (!b) {
            build武器選択リスト();
            emSelectedItemInList('#weapon-list', $('#武器Input').val());
        }
        $(selector).prop('checked', !b);

        $('.select-group1').removeClass('selected');
    });

    // 聖遺物
    $(document).on('change', '[name="聖遺物セット効果Input"]', 聖遺物セットInputOnChange);
    $(document).on('change', '[name="聖遺物メイン効果Input"]', 聖遺物メイン効果InputOnChange);
    $(document).on('change', '[name="聖遺物優先するサブ効果Input"]', 聖遺物優先するサブ効果InputOnChange);
    $(document).on('change', '[name="聖遺物優先するサブ効果上昇値Input"]', inputOnChangeArtifactSubUpdate);
    $(document).on('change', '[name="聖遺物優先するサブ効果上昇回数Input"]', inputOnChangeArtifactSubUpdate);
    $(document).on('change', '[name="聖遺物サブ効果Input"]', inputOnChangeStatusUpdate);
    $(document).on('change', '#聖遺物サブ効果直接入力Toggle', 聖遺物サブ効果直接入力モードToggleOnChange);
    $(document).on('change', '#厳選目安Toggle', 厳選目安ToggleOnChange);
    $(document).on('change', '#厳選目安Input', 厳選目安InputOnChange);

    // 聖遺物画像/スコア クリックイベント
    $(document).on('click', '#artifactset1-button', function () {
        const selector = '#artifactset-detail';
        let b = $(this).hasClass('selected');
        $('.select-group1').removeClass('selected');
        if (!b) {
            選択中聖遺物セット番号Var = 1;
            build聖遺物セットリスト();
            $(this).addClass('selected');
            emSelectedItemInList('#artifactset-list', [$('#聖遺物セット効果1Input').val(), $('#聖遺物セット効果2Input').val()]);
        }
        $(selector).prop('checked', !b);
    });
    $(document).on('click', '#artifactset2-button', function () {
        const selector = '#artifactset-detail';
        let b = $(this).hasClass('selected');
        $('.select-group1').removeClass('selected');
        if (!b) {
            選択中聖遺物セット番号Var = 2;
            build聖遺物セットリスト();
            $(this).addClass('selected');
            emSelectedItemInList('#artifactset-list', [$('#聖遺物セット効果1Input').val(), $('#聖遺物セット効果2Input').val()]);
        }
        $(selector).prop('checked', !b);
    });
    $(document).on('click', '#artifactstatus-button', function () {
        const selector = '#artifactstatus-detail';
        let b = $(selector).prop('checked');
        $('.select-group1').removeClass('selected');
        if (!b) {
            $(this).addClass('selected');
        }
        $(selector).prop('checked', !b);
    });

    // ステータス1
    $(document).on('change', '[name="ステータスInput"]', inputOnChangeStatusUpdate);
    $(document).on('change', 'input[name="ダメージバフ1Input"]', inputOnChangeStatusUpdate);
    $(document).on('change', 'input[name="ダメージバフ2Input"]', inputOnChangeStatusUpdate);
    $(document).on('change', 'input[name="ダメージアップInput"]', inputOnChangeStatusUpdate);
    $(document).on('change', 'input[name="元素反応ボーナスInput"]', inputOnChangeStatusUpdate);
    $(document).on('change', '#ステータス1補正入力Toggle', ステータス補正入力モードToggleOnChange);
    $(document).on('change', '#ステータス1補正初期化Toggle', buttonToggleCheckboxOnChange);
    $(document).on('click', '#ステータス1補正初期化Button', function () {
        ["ステータス", "基礎ステータス", "ダメージバフ1", "ダメージバフ2", "ダメージアップ", "元素反応ボーナス"].forEach(name => {
            $('[name="' + name + 'Input"]').val(0);
        });
        this.disabled = true;
        $('#ステータス1補正初期化Toggle').prop('checked', false);
        inputOnChangeStatusUpdate();
    });
    $(document).on('click', '#ダメージバフ1RowGroup', StatusRowGroupOnClick);
    $(document).on('click', '#ダメージバフ2RowGroup', StatusRowGroupOnClick);
    $(document).on('click', '#ダメージアップRowGroup', StatusRowGroupOnClick);
    $(document).on('click', '#元素反応ボーナスRowGroup', StatusRowGroupOnClick);

    // ステータス2 元素ステータス・耐性/その他
    $(document).on('change', 'input[name="耐性軽減Input"]', inputOnChangeStatusUpdate);
    $(document).on('change', '#ステータス2補正入力Toggle', ステータス補正入力モードToggleOnChange);
    $(document).on('change', '#ステータス2補正初期化Toggle', buttonToggleCheckboxOnChange);
    $(document).on('click', '#ステータス2補正初期化Button', function () {
        $('[name="耐性軽減Input"]').val(0);
        this.disabled = true;
        $('#ステータス2補正初期化Toggle').prop('checked', false);
        inputOnChangeStatusUpdate();
    });

    // 敵
    $(document).on('change', '#敵Input', 敵InputOnChange);
    $(document).on('change', '#敵レベルInput', inputOnChangeStatusUpdate);
    $(document).on('change', 'input[name="敵ステータスInput"]', inputOnChangeStatusUpdate);
    $(document).on('change', '#敵耐性補正入力Toggle', ステータス補正入力モードToggleOnChange);
    $(document).on('change', '#敵耐性補正初期化Toggle', buttonToggleCheckboxOnChange);
    $(document).on('click', '#敵耐性補正初期化Button', function () {
        $('[name="敵ステータスInput"]').val(0);
        this.disabled = true;
        $('#敵耐性補正初期化Toggle').prop('checked', false);
        inputOnChangeStatusUpdate();
    });

    // バフ/デバフ・元素共鳴
    $(document).on('change', '[name="元素共鳴Input"]', elementalResonanceInputOnChange);
    $(document).on('change', '#元素共鳴なしInput', elementalResonanceInputOnChange);

    // バフ/デバフ・ステータス調整
    $(document).on('change', '[name="ステータス調整Input"]', inputOnChangeStatusUpdate);

    // 構成保存ボタンを活性化します
    $(document).on('change', '#おすすめセットInput', enable構成保存Button);
    $(document).on('change', '#レベルInput', enable構成保存Button);
    $(document).on('change', '#命ノ星座Input', enable構成保存Button);
    $(document).on('change', '#通常攻撃レベルInput', enable構成保存Button);
    $(document).on('change', '#元素スキルレベルInput', enable構成保存Button);
    $(document).on('change', '#元素爆発レベルInput', enable構成保存Button);
    $(document).on('change', '#武器Input', enable構成保存Button);
    $(document).on('change', '#武器レベルInput', enable構成保存Button);
    $(document).on('change', '#精錬ランクInput', enable構成保存Button);
    $(document).on('change', '[name="聖遺物セット効果Input"]', enable構成保存Button);
    $(document).on('change', '[name="聖遺物メイン効果Input"]', enable構成保存Button);
    $(document).on('change', '[name="聖遺物優先するサブ効果Input"]', enable構成保存Button);
    $(document).on('change', '[name="聖遺物優先するサブ効果上昇値Input"]', enable構成保存Button);
    $(document).on('change', '[name="聖遺物優先するサブ効果上昇回数Input"]', enable構成保存Button);
    $(document).on('change', '[name="聖遺物サブ効果Input"]', enable構成保存Button);

    // 計算結果 元素反応
    $(document).on('change', 'input[name="元素反応Input"]', elementalReactionOnChange);

    // 計算結果 ダメージ
    $(document).on('click', '#通常攻撃ダメージResult', resultTableOnClickToggle);
    $(document).on('click', '#重撃ダメージResult', resultTableOnClickToggle);
    $(document).on('click', '#落下攻撃ダメージResult', resultTableOnClickToggle);
    $(document).on('click', '#元素スキルダメージResult', resultTableOnClickToggle);
    $(document).on('click', '#元素爆発ダメージResult', resultTableOnClickToggle);
    $(document).on('click', '#その他ダメージResult', resultTableOnClickToggle);

    // 中段のオプション、ステータスを閉じたり開いたりします
    $(document).on('click', '#characterweapon-open-close', elementOnClickToggleOther('#characterweapon-area', '#characterweapon-open-close'));
    $(document).on('click', '#artifact-open-close', elementOnClickToggleOther('#artifact-area', '#artifact-open-close'));
    $(document).on('click', '#status-open-close', elementOnClickToggleOther('#status-area', '#status-open-close'));
    $(document).on('click', '#condition-open-close', elementOnClickToggleOther('#condition-area', '#condition-open-close'));
    $(document).on('click', '#option-open-close', elementOnClickToggleOther('#option-area', '#option-open-close'));

    // 聖遺物詳細画面のスクリーンショットから取込
    $(document).on('change', '#artifact-detail-image', resizePinnedImage);
    $(document).on('click', '#artifact-detail-ocr-button', function () {
        document.getElementById('artifact-detail-image').click();
    });

    // 止血中
    $(document).on('click', '#聖遺物詳細計算停止Config', toggle聖遺物詳細計算停止);

    // キャラクター所持状況
    $(document).on('click', '#my-character-list', function () {
        // 初回表示時にリストを作成します
        if ($('#my-character-list + div').find('li').length == 0) {
            buildキャラクター所持状況List();
        }
        toggleShowHide(this, '#my-character-list + div');
    });
    $(document).on('click', '#キャラクター所持状況保存Button', saveキャラクター所持状況);

    // 武器所持状況
    $(document).on('click', '#my-weapon-list', function () {
        // 初回表示時にリストを作成します
        if ($('#my-weapon-list + div').find('li').length == 0) {
            build武器所持状況List();
        }
        toggleShowHide(this, '#my-weapon-list + div')
    });
    $(document).on('click', '#my-weapon-save-button', save武器所持状況);

    // ローカルストレージ
    $(document).on('click', '#ローカルストレージクリアInput', toggleローカルストレージクリア);
    $(document).on('click', '#ローカルストレージクリアButton', clearローカルストレージ);
}

// MAIN
$(document).ready(function () {
    setupAllEvent();

    initキャラクター構成関連要素();

    initステータス詳細ObjVar(ステータス詳細ObjVar);

    const myステータス補正入力モード = localStorage['ステータス補正入力モード'];
    if (myステータス補正入力モード != null) {
        if (myステータス補正入力モード == 'true') {
            applyステータス補正入力モード(true);
        } else {
            applyステータス補正入力モード(false);
        }
    } else {
        ステータス補正入力モードToggleOnChange();
    }
    const my聖遺物サブ効果直接入力モード = localStorage['聖遺物サブ効果直接入力モード'];
    if (my聖遺物サブ効果直接入力モード != null) {
        if (my聖遺物サブ効果直接入力モード == 'true') {
            apply聖遺物サブ効果直接入力モード(true);
        } else {
            apply聖遺物サブ効果直接入力モード(false);
        }
    } else {
        聖遺物サブ効果直接入力モードToggleOnChange();
    }

    Promise.all([
        fetch("data/CharacterMaster.json").then(response => response.json()).then(jsonObj => {
            キャラクターMasterVar = jsonObj;

            appendOptionElements(キャラクターMasterVar, "#キャラクターInput");

            let select = null;
            Object.keys(キャラクターMasterVar).forEach(key => {
                if (!select) select = key;
                else if ('selected' in キャラクターMasterVar[key] && キャラクターMasterVar[key]['selected']) select = key;
            });
            characterSelected(select);

            loadキャラクター所持状況();
            load武器所持状況();
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
            // 聖遺物サブ効果の小計の組み合わせを計算します
            // かなり高コストな処理です
            $('[name="聖遺物セット効果Input"]').prop('disabled', true);
            $('[name="聖遺物メイン効果Input"]').prop('disabled', true);
            $('[name="聖遺物優先するサブ効果Input"]').prop('disabled', true);
            $('[name="聖遺物優先するサブ効果上昇値Input"]').prop('disabled', true);
            $('[name="聖遺物優先するサブ効果上昇回数Input"]').prop('disabled', true);
            $('#聖遺物優先するサブ効果1上昇回数Input option').each((index, element) => {
                let n = element.value;
                if (n == 0) {
                    ARTIFACT_SUB_PATTERN_ARR_MAP.set(n, [[0, 0, 0, 0]]);
                } else {
                    ARTIFACT_SUB_PATTERN_ARR_MAP.set(n, resolvePartitionPattern(n, 4));
                }
                console.debug(n, new Date(), ARTIFACT_SUB_PATTERN_ARR_MAP.get(n));
            });
            Object.keys(聖遺物サブ効果MasterVar).forEach(statusName => {
                let subMap = new Map();
                ARTIFACT_SUB_PATTERN_ARR_MAP.forEach((arrArr, key) => {
                    let resultArr = [];
                    for (arr of arrArr) {
                        let result = 0;
                        for (let i = 0; i < arr.length; i++) {
                            result += 聖遺物サブ効果MasterVar[statusName][i] * arr[i];
                        }
                        resultArr.push(result.toFixed(1));
                    }
                    subMap.set(key, resultArr);
                });
                ARTIFACT_SUB_NAME_VALUE_ARR_MAP.set(statusName, subMap);
                console.debug(statusName, new Date(), ARTIFACT_SUB_NAME_VALUE_ARR_MAP.get(statusName));
            });
            $('[name="聖遺物セット効果Input"]').prop('disabled', false);
            $('[name="聖遺物メイン効果Input"]').prop('disabled', false);
            $('[name="聖遺物優先するサブ効果Input"]').prop('disabled', false);
            $('[name="聖遺物優先するサブ効果上昇値Input"]').prop('disabled', false);
            $('[name="聖遺物優先するサブ効果上昇回数Input"]').prop('disabled', false);
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
        fetch("data/BuffMaster.json").then(response => response.json()).then(jsonObj => {
            バフMasterVar = jsonObj;
            Object.keys(バフMasterVar).forEach(key => {
                let myMasterObj = バフMasterVar[key];
                if ('disabled' in myMasterObj && myMasterObj['disabled']) {
                    return;
                }
                let my条件 = '*' + ('名前' in myMasterObj ? myMasterObj['名前'] : key);
                myMasterObj['詳細'].forEach(detailObj => {
                    if ('条件' in detailObj) {
                        detailObj['条件'] = '*' + detailObj['条件'];
                    } else {
                        detailObj['条件'] = my条件;
                    }
                });
                バフ詳細ArrVar = バフ詳細ArrVar.concat(makeTalentDetailArray(myMasterObj, null, null, null, null, null, null));
            });
            バフオプション条件Map.clear();
            バフ詳細ArrVar.forEach(detailObj => {
                makeConditionExclusionMapFromStr(detailObj['条件'], バフオプション条件Map, バフオプション排他Map);
            });
            $('#バフオプションBox').empty();
            appendInputForOptionElement('バフオプションBox', バフオプション条件Map, 'バフ', false);
        }),
        fetch("data/DebuffMaster.json").then(response => response.json()).then(jsonObj => {
            デバフMasterVar = jsonObj;
            Object.keys(デバフMasterVar).forEach(key => {
                let myMasterObj = デバフMasterVar[key];
                if ('disabled' in myMasterObj && myMasterObj['disabled']) {
                    return;
                }
                let my条件 = '*' + ('名前' in myMasterObj ? myMasterObj['名前'] : key);
                myMasterObj['詳細'].forEach(detailObj => {
                    if ('条件' in detailObj) {
                        detailObj['条件'] = '*' + detailObj['条件'];
                    } else {
                        detailObj['条件'] = my条件;
                    }
                });
                デバフ詳細ArrVar = デバフ詳細ArrVar.concat(makeTalentDetailArray(myMasterObj, null, null, null, null, null, null));
            });
            デバフオプション条件Map.clear();
            デバフ詳細ArrVar.forEach(detailObj => {
                makeConditionExclusionMapFromStr(detailObj['条件'], デバフオプション条件Map, デバフオプション排他Map);
            });
            $('#デバフオプションBox').empty();
            appendInputForOptionElement('デバフオプションBox', デバフオプション条件Map, 'デバフ', false);
        })
    ]).then(function () {
        キャラクターInputOnChange();
    });
});


