<template>
    <div>
        <div class="data-panel">
            <label>Strings count: <input type="number" v-model="stringsCount" min="0" max="12" /></label>
        </div>
        <InstrumentString v-for="(item, index) in parseInt(stringsCount)" :key="'str_' + index" />
    </div>
</template>

<script>
import InstrumentString from "./InstrumentString"
export default {
    components: {
        InstrumentString
    },
    data() {
        return {
            stringsCount: 5
        }
    }
}
</script>

<style>
.data-panel {
    margin-bottom: 24px;
}
</style>