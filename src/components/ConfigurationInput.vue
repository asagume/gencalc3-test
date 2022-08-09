<template>
    <fieldset>
        <legend>おまけ</legend>
        <input type="checkbox" id="全武器解放Config" v-model="configurationInput['全武器解放']">
        <label for="全武器解放Config">全ての武器が選択可能になる</label>
        <div style="color: chocolate; font-size: smaller;">
            キャラクター再選択後に有効になります
        </div>
        <hr>
        <input type="checkbox" id="聖遺物詳細計算停止Config" v-model="configurationInput['聖遺物詳細計算停止']" />
        <label for="聖遺物詳細計算停止Config">聖遺物サブ効果の自動計算を止める</label>
        <div style="color: chocolate; font-size: smaller;">
            聖遺物サブ効果が自動計算されなくなります。<br>
            手動で入力して下さい
        </div>
        <hr>
        <input type="checkbox" id="聖遺物サブ効果初期化Toggle">
        <label for="聖遺物サブ効果初期化Toggle">聖遺物サブ効果0初期化</label>
        <button type="button" id="聖遺物サブ効果初期化Button" disabled>実行</button>
    </fieldset>
</template>
<script lang="ts">
import { TAnyObject } from "@/master";
import { defineComponent, reactive } from "vue";

export default defineComponent({
    name: 'ConfigurationInput',
    emits: ['update:configuration-input'],
    setup() {
        const configurationInput = reactive({} as TAnyObject);
        configurationInput['全武器解放'] = false;
        configurationInput['聖遺物詳細計算停止'] = false;

        return {
            configurationInput,
        }
    },
});
</script>
<style scoped>
.description {
    text-align: left;
}
</style>
