<template>
  <div>
    Eqt: <input type="number" v-model="eqt"> 
    <span>Ratio: {{ratio(2)}}</span>
    <table class="keyboard">
      <tr v-for="(krow,ridx) in keys" v-bind:key="krow.toString()">
        <td v-for="(key,kidx) in krow" v-bind:key="key.toString()">
          <small>{{key.idx}} : {{ratio(key.idx).toFixed(4)}}</small>
          <audio-key :keyName="key.k" :freq="(440 * ratio(key.idx))" />
        </td>
      </tr>
    </table>
    <chartjs-line width="500" height="150" :labels="chartLabels" :data="chartData" bind="true"></chartjs-line>
  </div>
</template>

<script>
import AudioKey from "./AudioKey.vue";
import Vue from "vue";

require("chart.js");
require("hchs-vue-charts");

Vue.use(VueCharts);

export default {
  components: {
    AudioKey
  },
  data() {
    return {
      eqt: 12,
      keys: [
        [
          { k: "Q", idx: 17 },
          { k: "W", idx: 18 },
          { k: "E", idx: 19 },
          { k: "R", idx: 20 },
          { k: "T", idx: 21 },
          { k: "Y", idx: 22 },
          { k: "U", idx: 23 },
          { k: "I", idx: 24 },
          { k: "O", idx: 25 },
          { k: "P", idx: 26 }
        ],
        [
          { k: "A", idx: 8 },
          { k: "S", idx: 9 },
          { k: "D", idx: 10 },
          { k: "F", idx: 11 },
          { k: "G", idx: 12 },
          { k: "H", idx: 13 },
          { k: "J", idx: 14 },
          { k: "K", idx: 15 },
          { k: "L", idx: 16 }
        ],
        [
          { k: "Z", idx: 1 },
          { k: "X", idx: 2 },
          { k: "C", idx: 3 },
          { k: "V", idx: 4 },
          { k: "B", idx: 5 },
          { k: "N", idx: 6 },
          { k: "M", idx: 7 }
        ]
      ]
    };
  },
  computed: {
    chartData() {
      var data = [];
      for (var i = 1; i <= this.eqt; i++) {
        var v = this.ratio(i);
        data.push(v);
      }
data.push(2);
      return data;
    },
    chartLabels() {
      var data = [];
      for (var i = 1; i <= this.eqt; i++) {
        var v = i.toString();
        data.push(v);
      }
      data.push('O')
      return data;
    }
  },
  methods: {
    ratio: function(idx) {
      //var ratiosArr = [
      //0, 1, 2, 3/2, 5/4, 8/4, 13/8, 21/16, 34/32, 55/32
      // 0,1,5/4,21/16,3/2,13/8,2

      //0
      // ,1
      // ,2
      // ,1.5
      // ,1.25
      // ,1.625
      // ,1.3125
      // ,1.0625
      // ,1.71875
      // ,1.390625
      // ,1.125
      // ,1.8203125
      // ,1.47265625
      // ,1.19140625
      // ,1.927734375
      // ,1.559570313
      // ,1.26171875

      // 0
      // ,1
      // ,1.098
      // ,1.259
      // ,1.353
      // ,1.44
      // ,1.551
      // ,1.66
      // ,1.777
      // ,2

      //       ];
      //var eqt = this.eqt;
      //return idx == 1 ? 1 : Math.pow(Math.pow(2, 1.0 / this.eqt), idx - 1);
      //return idx == 1 ? 1 : Math.pow(Math.pow(2,(1.0/this.eqt)),idx-1);
      //return 1+((idx-1)/this.eqt);
      //return ratiosArr[idx] || 0;

      var v = Math.pow(1.618033,idx-1);
      while(v > 2){
        v = v/2;
      }
      return v;
      
      //return idx;
    }
  },
  watch: {
    eqt: function(val) {
      if (val == 0) {
        this.eqt = 1;
      }
    }
  }
};
</script>

<style scoped>
.keyboard {
  width: 100%;
}
</style>
