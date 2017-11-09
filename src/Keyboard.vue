<template>
  <div>
    Eqt: <input type="number" v-model="eqt">
    Ratio: {{ratio(2)}}
    <table class="keyboard">
      <tr v-for="(krow,ridx) in keys" v-bind:key="krow.toString()">
        <td v-for="(key,kidx) in krow" v-bind:key="key">
          <small>{{key.idx}} : {{ratio(key.idx).toFixed(4)}}</small>
          <audio-key :keyName="key.k" :freq="(440 * ratio(key.idx))" />
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import AudioKey from './AudioKey.vue';

export default {
  components: {
    AudioKey
  },
  data() {
    return {
      eqt: 12,
      keys: [
         [
          {k:'Q',idx:17},
          {k:'W',idx:18},
          {k:'E',idx:19},
          {k:'R',idx:20},
          {k:'T',idx:21},
          {k:'Y',idx:22},
          {k:'U',idx:23},
          {k:'I',idx:24},
          {k:'O',idx:25},
          {k:'P',idx:26},
        ],
        [
          {k:'A',idx:8},
          {k:'S',idx:9},
          {k:'D',idx:10},
          {k:'F',idx:11},
          {k:'G',idx:12},
          {k:'H',idx:13},
          {k:'J',idx:14},
          {k:'K',idx:15},
          {k:'L',idx:16},
        ],
        [
          {k:'Z',idx:1},
          {k:'X',idx:2},
          {k:'C',idx:3},
          {k:'V',idx:4},
          {k:'B',idx:5},
          {k:'N',idx:6},
          {k:'M',idx:7},
        ],
      ]
    }
  },
  methods:{
    ratio:function(idx){

      var eqt = this.eqt;
      return idx == 1 ? 1 : Math.pow(Math.pow(2,(1.0/eqt)),idx-1);
      //return 1+((idx-1)/12);
    }
  },
  watch:{
    eqt:function(val){
      if(val == 0){
        this.eqt = 1;
      }
    }
  }
}
</script>

<style scoped>
.keyboard {
  width: 100%;
}
</style>
