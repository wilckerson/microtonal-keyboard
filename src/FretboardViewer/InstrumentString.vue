<template>
    <div class="instrument-string">
        <Fret v-for="(item, index) in parseInt(fretsCount)" :key="'fret_' + index" />
    </div>
</template>

<script>
import Fret from "./Fret"
export default {
    components: {
        Fret
    },
    data() {
        return {
            fretsCount: 5
        }
    }
}
</script>

<style>
.instrument-string {
    width: 100%;
    height: 1px;
    background-color: gray;
    margin-bottom: 12px;
}
</style>