<template>
  <div>
    Eqt: <input type="number" step="any" v-model="eqt"> 
    <span>Ratio: {{ratio(2)}}</span>
    <table class="keyboard">
      <tr v-for="(krow,ridx) in keys" v-bind:key="krow.toString()">
        <td v-for="(key,kidx) in krow" v-bind:key="key.toString()">
          <!-- <small>{{key.idx}} : {{ratio(key.idx).toFixed(4)}}</small> -->
          <!-- <audio-key :keyName="key.k" :freq="(440 * ratio(key.idx))" /> -->

          <small>{{key.idx}} : {{parseFloat(freq(key.idx)).toFixed(3)}}</small>
          <audio-key :keyName="key.k" :freq="freq(key.idx)" />
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
      var max = 26; //this.eqt;
      for (var i = 1; i <= max; i++) {
        //var v = this.ratio(i);
        var v = this.freq(i);
        data.push(v);
      }
data.push(2);
      return data;
    },
    chartLabels() {
      var data = [];
      var max = 26; //this.eqt;
      for (var i = 1; i <= max; i++) {
        var v = i.toString();
        data.push(v);
      }
      data.push('O')
      return data;
    }
  },
  methods: {
    freq(idx){
       var freqBase = 432;
       var freqArr = [

         //Vector Equilibrium
//8 x 3 = 24
//8/6 => 4/3 = 1.3333
//6 x 4 = 24
//6/4 = 1.5
// 1
// 1/2
//sqrt(2) = 1.4142 => diagonal quadrado
//sqrt(3)/2 = 0.8660 => Altura triangulo equilatero
//sqrt(5)/2 = 1.1180 => diagonal, metade quadrado
// 36/14 = 1.2857 (9/7) => Arestas / Faces

//1
//1,0606601717798212866012665431573...
//1,0606601717798212866012665431573
//1.125
//1.193242...
//1.265625
//
// freqBase,
//  freqBase * Math.sqrt(9/8),
//  freqBase * (9/8),
//  freqBase * 1.1932,
//  freqBase * (81/64),
//  freqBase * 4/3,
//  freqBase * Math.sqrt(2),
//  freqBase * 3/2,
//  freqBase * (Math.sqrt(81/32)),
//  freqBase * (Math.sqrt(729/256)),
//  freqBase * 16/9,//(Math.sqrt(6561/2048)),
//  freqBase * 1.8984375,
// freqBase * 2

// freqBase * 1
// ,freqBase * 1.065382733
// ,freqBase * 1.135040368
// ,freqBase * 1.20925241
// ,freqBase * 1.288316638
// ,freqBase * 1.372550301
// ,freqBase * 1.462291391
// ,freqBase * 1.557899999
// ,freqBase * 1.659759759
// ,freqBase * 1.768279389
// ,freqBase * 1.883894329
// ,freqBase * 2



         //Intervalo numeros primos (Arranjados)
          // freqBase
          // //518.4,
          // ,2 * freqBase / (5/3)
          // ,2 * freqBase / (3/2)
          // ,freqBase * (7/5)
          // ,2 * freqBase / (7/5)
          // ,freqBase * (3/2)
          // //,freqBase * (11/7)
          // ,freqBase * (5/3)
          // ,freqBase * 2

         //Intervalo numeros primos
//          freqBase * 1,
// freqBase * 1.5,
// freqBase * 1.66666666666667,
// freqBase * 1.4,
//  freqBase * 1.57142857142857,
//  freqBase * 1.18181818181818,
//   freqBase * 1.30769230769231,
//   freqBase * 1.11764705882353,
// //  freqBase * 1.21052631578947,//<<---
//   freqBase * 1.26086956521739,


//  freqBase * 2,
// freqBase * 2 / 1.5,
// //freqBase * 2 / 1.66666666666667,
// //freqBase * 2 / 1.4,
//  //freqBase * 2 / 1.57142857142857,
// // freqBase * 2 / 1.18181818181818,
// // freqBase * 2 / 1.30769230769231,
//  freqBase * 2 / 1.11764705882353,
// // freqBase * 2 / 1.21052631578947,
// // freqBase * 2 / 1.26086956521739,
//  freqBase * 2 / 1.06896551724138,
// // freqBase * 2 / 1.19354838709677,
// // freqBase * 2 / 1.10810810810811,
// // freqBase * 2 / 1.04878048780488,
// // freqBase * 2 / 1.09302325581395,
// // freqBase * 2 / 1.12765957446809,
// // freqBase * 2 / 1.11320754716981,
//  freqBase * 2 / 1.03389830508475,
// // freqBase * 2 / 1.09836065573771,
// // freqBase * 2 / 1.05970149253731,
// // freqBase * 2 / 1.02816901408451,
// // freqBase * 2 / 1.08219178082192,




 //freqBase * 1.06896551724138,
// freqBase * 1.19354838709677,
// freqBase * 1.10810810810811,
// freqBase * 1.04878048780488,
// freqBase * 1.09302325581395,
// freqBase * 1.12765957446809,
// freqBase * 1.11320754716981,
// freqBase * 1.03389830508475,
// freqBase * 1.09836065573771,
// freqBase * 1.05970149253731,
// freqBase * 1.02816901408451,


          //432,486,576,648,768,864, //Pentatônica
         
         //Rearranjo Pentatônico
        //  432,324,243,
        //  864,648,486,
        //  765,657,576,
        //  876,768,687

//Rearranjo Pentatônico Normalizado
          //432,486,576,648,687,768,864
        //  ,432,468,486,576,648,687,768,864

//Montada baseada nas escalas acima
          // 432,486,543,576,648,687,768,864,

//Arranjo 3 digitos do 0 ao 9
        // 21,102,210
        // ,132,213,321
        // ,243,324,432
        // ,354,435,543
        // ,465,546,654
        // ,576,657,765
        // ,687,768,876
        // ,798,879,987

//Intervalo arranjo 3 digitos
//freqBase, freqBase * 1.1015037593985,freqBase * 1.12286689419795, freqBase * 1.23684210526316 //987
//,freqBase,freqBase * 1.117903930131,freqBase * 1.140625,  freqBase * 1.27510917030568 //876
//,freqBase,freqBase * 1.140625,freqBase * 1.16438356164384,  freqBase * 1.328125 //765
//,freqBase, freqBase * 1.1741935483871,freqBase * 1.1978021978022, freqBase * 1.40645161290323 //654
//freqBase,freqBase * 1.22881355932203,freqBase * 1.24827586206897,  freqBase * 1.53389830508475 //543
freqBase,freqBase * 1.33333333333333, freqBase * 1.33333333333333, freqBase * 1.77777777777778 //432
,freqBase, freqBase * 1.21590909090909, freqBase * 1.50704225352113, freqBase * 1.61363636363636 //321
,freqBase,freqBase * 1.02941176470588, freqBase * 1.21428571428571, freqBase * 1.25 //210
,freqBase,freqBase * 1.04357798165138, freqBase * 1.1978021978022, freqBase * 1.25 //910
,freqBase, freqBase * 1.03188775510204, freqBase * 1.21137206427689, freqBase * 1.25 //980




        //Progreção linear 100
        //400,425,450,475,500,525,550,575,600,625,650,675,700,725,750,775,800

        //Angulo interno sólidos geométricos
        //360,405,450,495,540,585,630,675,720

      //   freqBase,
      //   freqBase * 1.5,
      //   freqBase * 2,

      //   freqBase,
      //   freqBase * 1.25,
      //   //freqBase * 1.5,
      //   freqBase * 1.75,
      //   freqBase * 2,

      //   freqBase,
      //   freqBase * 1.125,
      //   //freqBase * 1.25,
      //   freqBase * 1.375,
      //   //freqBase * 1.5,
      //   freqBase * 1.625,
      //   //freqBase * 1.75,
      //   freqBase * 1.875,
      //   freqBase * 2,

      //   freqBase,
      //   freqBase * 1.0625,
      //   freqBase * 1.1875,
      //   freqBase * 1.3125,
      //   freqBase * 1.4375,
      //   freqBase * 1.5625,
      //   freqBase * 1.6875,
      //   freqBase * 1.8125,
      //   freqBase * 1.9375,
      //   freqBase * 2,






        // freqBase,
        // freqBase * 2,
        // freqBase * 3 / 2,
        // freqBase * 5 / 4,
        // freqBase * 7 / 4,
        // freqBase * 9 / 8,
        // freqBase * 11 / 8,
        // freqBase * 13 / 8,
        // freqBase * 15 / 8,
        // freqBase * 17 / 16,
        // freqBase * 19 / 16,
        // freqBase * 21 / 16,
        // freqBase * 23 / 16,
        // freqBase * 25 / 16,
        // freqBase * 27 / 16,
        // freqBase * 29 / 16,
        // freqBase * 31 / 16,
        // freqBase * 33 / 32,
        // freqBase * 35 / 32,
        // freqBase * 37 / 32,
        // freqBase * 39 / 32,
        // freqBase * 41 / 32,
        // freqBase * 43 / 32,
        // freqBase * 45 / 32,
        // freqBase * 47 / 32,
        // freqBase * 49 / 32,

      ];
      //freqArr = freqArr.sort();
      return freqArr[idx-1] || 0;
    },
    ratio(idx) {
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
      return idx == 1 ? 1 : Math.pow(Math.pow(2, 1.0 / this.eqt), idx - 1);
      //return idx == 1 ? 1 : Math.pow(Math.pow(2,(1.0/this.eqt)),idx-1);
      //return 1+((idx-1)/this.eqt);
      //return ratiosArr[idx] || 0;

      //var v = Math.pow(1.618033,idx-1);
      // var v = Math.pow(5,idx-1);
      // while(v > 2){
      //   v = v/2;
      // }
      // return v;

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
