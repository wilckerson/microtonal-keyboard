<template>
  <div>
    Base: <input type="number" step="any" v-model="base"> 
    Eqt: <input type="number" step="any" v-model="eqt"> 
    <span>Ratio: {{ratio(2)}}</span>
    <table class="keyboard">
      <tr v-for="(krow,ridx) in keys" v-bind:key="ridx">
        <td v-for="(key,kidx) in krow" v-bind:key="(ridx+kidx)">

          <template v-if="!freqBased">
            <small>{{key.idx}} : {{ratio(key.idx).toFixed(4)}}</small>
            <audio-key :keyName="key.k" :freq="(mainFreq * factor * ratio(key.idx))" />
          </template>
         <template v-if="freqBased">
           <small>{{key.idx}} : {{parseFloat(freq(key.idx)).toFixed(3)}}</small>
           <audio-key :keyName="key.k" :freq="freq(key.idx)" />
         </template>
        
        </td>
      </tr>
    </table>
    <chartjs-line :width="500" :height="150" :labels="chartLabels" :data="chartData" :bind="true"></chartjs-line>
    <div>Avg ratio: {{ratioAvg}}</div>
    <div>Ratios diff: {{ratioDiff}}</div>
    <div style="text-align:left;" v-if="!freqBased">
      <h4>Ratio List:</h4>
    <div v-for="ii in nEqt" v-bind:key="ii">{{ratio(ii)}}</div>
  </div>
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
      base: 2,
      ratioDiff: [],
      ratioAvg: 0,
      mainFreq: 432, ///8,
      factor: 1,
      freqBased: false,
      diffRoot: false,
      keys: [
        [
          { k: "Q", idx: 19 },
          { k: "W", idx: 20 },
          { k: "E", idx: 21 },
          { k: "R", idx: 22 },
          { k: "T", idx: 23 },
          { k: "Y", idx: 24 },
          { k: "U", idx: 25 },
          { k: "I", idx: 26 },
          { k: "O", idx: 27 },
          { k: "P", idx: 28 }
        ],
        [
          { k: "A", idx: 10 },
          { k: "S", idx: 11 },
          { k: "D", idx: 12 },
          { k: "F", idx: 13 },
          { k: "G", idx: 14 },
          { k: "H", idx: 15 },
          { k: "J", idx: 16 },
          { k: "K", idx: 17 },
          { k: "L", idx: 18 }
        ],
        [
          //{ k: "\\", idx: 0 },
          { k: "Z", idx: 1 },
          { k: "X", idx: 2 },
          { k: "C", idx: 3 },
          { k: "V", idx: 4 },
          { k: "B", idx: 5 },
          { k: "N", idx: 6 },
          { k: "M", idx: 7 },
          { k: "<", idx: 8 },
          { k: ">", idx: 9 }
        ]
      ]
    };
  },
  mounted: function() {
    var _this = this;
    window.addEventListener("keydown", e => {
      var keyName = String.fromCharCode(e.keyCode);
      var idx = parseInt(keyName);

      if (!isNaN(idx)) {
        _this.factor = _this.ratio(idx) || 1;
        //console.log("factor",_this.factor);
      }
    });
  },
  computed: {
    chartData() {
      var data = [];
      var arrDiff = [];
      var max = 26; //this.eqt;
      for (var i = 1; i <= max; i++) {
        var v = this.freqBased ? this.freq(i) : this.ratio(i);

        //var v = this.freq(i);

        data.push(v);

        if (i > 1) {
          var vAnterior = 0;
          if (this.diffRoot) {
            vAnterior = this.freqBased ? this.freq(1) : this.ratio(1);
          } else {
            vAnterior = this.freqBased ? this.freq(i - 1) : this.ratio(i - 1);
          }
          var vDiff = v / vAnterior;
          if (vDiff > 0) {
            arrDiff.push(vDiff);
          }
        }
      }
      data.push(2);

      this.ratioDiff = arrDiff;

      var sum = this.ratioDiff.reduce(function(a, b) {
        return a + b;
      });
      var avg = sum / this.ratioDiff.length;
      this.ratioAvg = avg;

      return data;
    },
    chartLabels() {
      var data = [];
      var max = 26; //this.eqt;
      for (var i = 1; i <= max; i++) {
        var v = i.toString();
        data.push(v);
      }
      data.push("O");
      return data;
    },
    nEqt: function() {
      return parseInt(this.eqt);
    }
  },
  methods: {
    freq(idx) {
      var freqBase = this.mainFreq;
      var freqArr = [
        /*
        //Bird Sing
        516,
        496,
        436,
        403,
        350

        //Phi circle angles
        //275.01, 412.51, 550.01, 687.51/2, 962.52/2, 1237.53/4, 1512.53/4
        //275.01, 412.51, 550.01, 687.51/2, 962.52/2, 1237.53/4, 1512.53/4, 1787.54/4, 2062.54/4, 2337.55/8, 2612.56/8
        // freqBase,
        // freqBase * 17/16,
        // freqBase * 9/8,
        // freqBase * 19/16,
        // freqBase * 5/4,
        // freqBase * 11/8,
        // freqBase * 3/2,
        // freqBase * 13/8,
        // freqBase * 7/4,
        // freqBase * 15/8,
        // freqBase * 2,
        // 2 * freqBase * 17/16,
        // 2 * freqBase * 9/8,
        // 2 * freqBase * 19/16,
        // 2 * freqBase * 5/4,
        // 2 * freqBase * 11/8,
        // 2 * freqBase * 3/2,
        // 2 * freqBase * 13/8,
        // 2 * freqBase * 7/4,
        // 2 * freqBase * 15/8,
        // 2 * freqBase * 2

        // 275,343.75,412.5,
        // 309.375,412.5,515.625,
        // 343.750,412.5,515.625,
        // 412.500,	515.625,	618.750,
        // 515.625,	618.750,	825

        //275,309.375,343.75,412.5,515.625,550

        // freqBase * 1
        // ,freqBase * 1.381953028
        // ,freqBase * 1.763906056
        // ,freqBase * 1.145859083
        // ,freqBase * 1.527812111
        // ,freqBase * 1.909765139
        // ,freqBase * 1.291718167
        // ,freqBase * 1.673671194
        // ,freqBase * 1.055624222
        // ,freqBase * 1.43757725
        // ,freqBase * 1.819530278
        // ,freqBase * 1.201483306
        // ,freqBase * 1.583436333
        // ,freqBase * 1.965389361
        // ,freqBase * 1.347342389
        // ,freqBase * 1.729295417
        // ,freqBase * 1.111248444
        // ,freqBase * 1.493201472
        // ,freqBase * 1.8751545
        // ,freqBase * 1.257107528
        // ,freqBase * 2

        //freqBase, freqBase * Math.pow(1.225,1), freqBase * Math.pow(1.225,2) , freqBase * Math.pow(1.225,3), freqBase * Math.pow(1.225,4), freqBase * Math.pow(1.225,5)
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
        //freqBase,freqBase * 1.33333333333333, freqBase * 1.33333333333333, freqBase * 1.77777777777778 //432
        //,freqBase, freqBase * 1.21590909090909, freqBase * 1.50704225352113, freqBase * 1.61363636363636 //321
        //,freqBase,freqBase * 1.02941176470588, freqBase * 1.21428571428571, freqBase * 1.25 //210
        //,freqBase,freqBase * 1.04357798165138, freqBase * 1.1978021978022, freqBase * 1.25 //910
        //,freqBase, freqBase * 1.03188775510204, freqBase * 1.21137206427689, freqBase * 1.25 //980
        //,freqBase, freqBase * 1.26829268292683, freqBase * 1.35064935064935, freqBase * 1.8780487804878, freqBase*2 //936
        // freqBase,
        // freqBase*1.1111, //40/36
        // freqBase*1.125, //9/8 N2
        // freqBase*1.1851, //64/54 N4
        // freqBase*1.3333, //4/3 N1
        // freqBase*1.40625, //45/32 N5
        // freqBase*1.481481, //80/54 N5
        // freqBase*1.5, //3/2 N2
        // freqBase*1.6875, //27/16 N3
        // freqBase*1.7777, //16/9 N1
        // freqBase*2
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
        */
      ];
      freqArr = freqArr.sort();
      return freqArr[idx - 1] || 0;
    },
    ratio(idx) {
      //#region
      /*
      //Gerando a série via código
      //-------------------------------------------
      // var a = 432,
      //   b = 324,
      //   c = 243;
      var a = 321,
        b = 213,
        c = 132;
      var r1 = normalizeRatio(a / b);
      var r2 = normalizeRatio(a / c);
      var r3 = normalizeRatio(b / c);

      var ratiosArr = [
        //Serie Harmônica
        //1,2,3/2,4/2,5/4,6/4,7/4,8/4,9/8,10/8,11/8,12/8,13/8,14/8,15/8,16/8
        1,
        2
      ];
      thresholdAdd(r1);
      thresholdAdd(r2);
      thresholdAdd(r3);

      function normalizeRatio(r) {
        while (r > 2) {
          r = r / 2;
        }
        return r;
      }

      function thresholdAdd(v) {
        var minDiff = 2;
        for (var i = 0; i < ratiosArr.length; i++) {
          var diff = Math.abs(ratiosArr[i] - v);
          if (diff < minDiff) {
            minDiff = diff;
          }
        }

        if (minDiff > 0.04) {
          ratiosArr.push(v);
        }
      }

      var nivel = this.eqt;
      for (var i = 2; i <= nivel; i++) {
        var nR1 = normalizeRatio(i / r1);
        thresholdAdd(nR1);

        var nR2 = normalizeRatio(i / r2);
        thresholdAdd(nR2);

        var nR3 = normalizeRatio(i / r3);
        thresholdAdd(nR3);
      }
*/
      //#endregion

      //#region
      var ratiosArr = [
        // 1,
        // 1.125,
        // 1.1874,
        // 1.333333,
        // 1.5,
        // 1.6875,
        // 1.7777777,
        // 2
        //LucyTunning
        // 1,
        // Math.pow(2,1/(2*Math.PI)),
        // Math.pow(2,1/Math.PI),
        // Math.pow(2,9/((2*Math.PI)-1)),
        // Math.pow(2,(1/2) + (1/(4*Math.PI))),
        // Math.pow(2,(1/2) + (3/(4*Math.PI))),
        // Math.pow(2,(1/2) + (5/(4*Math.PI))),
        // 2
        //Just
        //1,2,3/2,5/4,7/4,9/8,11/8,13/8,15/8
        // 1/2,2/2,3/2,4/2,5/2,6/2,7/2,8/2,9/2
        // ,1/3,2/3,3/3,4/3,5/3,6/3,7/3,8/3,9/3
        //1/2,3/5,2/3,3/4,5/6,1,6/5,4/3,3/2,5/3,2
        //1,3/5,4/5,3/4
        // 1,
        // 1.125,
        // 1.333333,
        // 1.5,
        // 1.7777777,
        // 2,
        // 1.125 * 1,
        // 1.125 * 1.125,
        // 1.125 * 1.333333,
        // 1.125 * 1.5,
        // 1.125 * 1.7777777,
        // 1.125 * 2,
        // 1.33333 * 1,
        // 1.33333 * 1.125,
        // 1.33333 *1.333333,
        // 1.33333 *1.5,
        // 1.33333 *1.7777777,
        // 1.33333 *2,
        // 1.5 * 1,
        // 1.5 * 1.125,
        // 1.5 *1.333333,
        // 1.5 *1.5,
        // 1.5 *1.7777777,
        // 1.5 *2,
        //  1,
        //  //2/1,
        //  //3/2,
        //  4/3,
        //  //5/4,
        //  6/5,
        //  7/6,
        //  8/7,
        //  //9/8,
        // 10/9,
        // //1,
        // 2,3/2,5/4,7/4,9/8,11/8
        //1,2, //1
        //2,3,4, //2
        //4,5,6,7,8
        //,10,12,14,16
        //,20,24,28,32
        //4
        //8,9,10,11,12,13,14,15,16,18//8
        //16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32//16
        //16/16,17/16,18/16,19/16,20/16,21/16,22/16,23/16,24/16,25/16,26/16,28/16,30/16,32/16//16
        //16/16,17/16,18/16,19/16,20/16,21/16,22/16,1.4545,23/16,1.5238,1.6,1.6842,1.77777,1.8823,32/16//16
        //1/2,
        //32/19,
        //32/17,
        //16/15,
        //16/11,
        //8/7,
        //8/5,
        //4/3,
        //1,
        //3/2,
        //5/4,
        //7/4,
        //9/8,
        //11/8,
        //13/8,
        //15/8,
        //17/16,
        //19/16
        //,2
        //Multiplicado por 1.5 e normalizado
        // 1,
        // 1.06787109375,
        // 1.125,
        // 1.20135498046875,
        // 1.265625,
        // 1.35152435302734375,
        // 1.423828125,
        // 1.5,
        // 1.601806640625,
        // 1.6875,
        // 1.802032470703125,
        // 1.8984375,
        // 2,
        // 1,
        // 1.0534979423868312757201646090535,
        // 1.1098579146132872698944944029535,
        // 1.1851851851851851851851851851852,
        // 1.2485901539399481786313062033227,
        // 1.33333333,
        // 1.404663923182441700960219478738,
        // //1.4798105528177163598593258706046,
        // 1.5,//--------------
        // 1.5802469135802469135802469135802,
        // 1.6647868719199309048417416044302,
        // 1.7777777777777777777777777777778,
        // 1.872885230909922267946959304984,
        // 2
        //SquareRootTunning
        //Raiz2
        // 1,
        // 1.118033989,
        // 1.224744871,
        // 1.322875656,
        // 1.414213562,
        // 1.5,
        // 1.58113883,
        // 1.658312395,
        // 1.732050808,
        // 1.802775638,
        // 1.870828693,
        // 1.936491673,
        // 2
        //Raiz3
        // 1
        // ,1.25992105
        // ,1.44224957
        // ,1.587401052
        // ,1.709975947
        // ,1.817120593
        // ,1.912931183
        // ,2

        //GoldNumber
        //1,
        // 1.05901505294051048425,
        // 1.1215128823545922236536778329841,
        // 1.1876990244802129902473260727688,
        // 1.2577911452873054174949852378148,
        // 1.3090153945445,
        // 1.3862670073534868864277525031741,
        // 1.4680776281821359517974306738722,
        // 1.5547163071300837714619976697815,
        // 1.618033,
        // 1.71352130315449300036248025,
        // 1.8146448535748479194150313051368,
        // 1.9217362156767924652488517475003,
        //2

        //Sequencia Fibonacci Normalizada
        // 1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765
        // 1,2,3/2,5/4,8/4,13/8,21/16,34/32,55/32,89/64,144/128,233/128,377/256,610/512,987/512,1597/1024,2584/2048,4181/4096,6765
        //1,1.2307,1.25,1.3333,1.5,1.6,1.625,2

        // 1,
        // //1.2, //6/5
        // 1.125, //9/8 (1.5/1.333)
        // //1.1851851851851851851851851851852, //32/27
        // 1.25, //5/4
        // //1.2485901539399481786313062033227, //8192/6561
        // 1.3333, //4/3 (2/1.5)
        // //Math.sqrt(2),
        // //1.4, //7/5
        // 1.5, //3/2
        // 1.66666, //5/3
        // //1.6875, //27/16 (1.125/1.333*2)
        // 1.77777, //16/9 (1.333/1.5*2)
        // //1.8984375, //243/128
        // 2

        //1, 1.041666666666667, 1.1111111111, 1.125, 1.2,  1.25, 1.33333333, 1.5, 1.666666666, 2
        //1,(2*Math.PI*(60/360)), 3/2,(Math.PI/2),2
        //2/Math.sqrt(3), Math.sqrt(2), 3/2, Math.sqrt(3),   1.0606601717798212*2, 2/Math.sqrt(3)*2
        //1, Math.sqrt(6)/2, 3*Math.sqrt(3)/4, 3/2, 2
        //1, 1.175570504584946, Math.sqrt(2), 1.6180339887498948482045868343656, Math.sqrt(3), 2
        //8192/6561
        // 1,
        // 2,

        // 3/3,
        // 4/3,
        // 5/3,
        // 6/3,

        //1,3/2,5/4,7/4,9/8,2,11/8,13/8,15/8,17/16,19/16,21/16,23/16,25/16,27/16,29/16,31/16,2//Root1(5,8,12,16)
        //3/2, 9/8, 15/8, 21/16, 27/16, 33/32, 39/32, 45/32, 51/32, 57/32, 63/32 //Root3(5,11)

        //5/4,15/8,25/16,(35/32)*2,2.5,
        //1.25,45/32,55/32,65/32,(75/64)*2,2.5//,(85/64)*2,(95/64)*2,105/64,115/64,125/64,//,45/32 //Root5(4,5,7)

        // 7/4,21/16,35/32,49/32,63/32 //Root7
        //9/8,25/16,45/32,63/32,81/64 //Root9
        // 11/8,33/32,55/32,77/64,99/64,121/64,143/128,165/128,187/128,209/128,231/128,253/128,(1.0313*2)//Root11

        // 1,
        // ////1.058823529,
        // ////1.0625,
        // ////1.0666666664,
        // ////1.1718750002929688,
        // ////1.11,
        // //256/243,
        // 1.125,
        // //1.1851851848888888,
        // //32/27,
        // ////1.2,
        // //1.25,
        // //1.333333333,
        // //1.5,
        // //1.6875,
        // 1.77777777,
        // //1.875,
        // 2

        //Serie harmonica de acordo com Helmholtz Roughness function
        //1,2,3/2,4/3,5/3,5/4,7/4,6/5,8/5,9/5,7/6,7/5,8/7,9/8

        //Serie harmonica de acordo com Euler's Gradus function
        //1,2,3/2,4/3,5/4,5/3,6/5,9/8,8/5,7/4,7/6,8/7,9/5,7/5,9/7

        //Serie harmonica de acordo com aparecimento (notas normalizadas)
        //1,1.5,2,1.25,1.5,1.75,2,1.125,1.25,1.375,1.5,1.675,1.75,1.875,2

        //Serie harmonica complemetnar de acordo com aparecimento (notas normalizadas)
        //1,1.5,1.33333,1.25,1.2,1.166666,1.142857,1.125,1.11111,1.1

        //Major scale Just Intonation
        //1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2

        // 1,
        // 1.125,
        // 1.25,
        // 1.33333,
        // 1.5,
        // 1.66666,
        // 2
        //1.111111111, 1.142857, 1.16666, 1.2, 1.285714, 1.4, 1.6, 1.75, 1.8,

        //Acima e abaixo (Abaixo tem todas as notas de Last of Moicans)
        //0.5, 1/(3/2) ,1/(4/3), 1/(5/4), 1/(9/8), 1, 1,
        //1, 9/8, 5/4, 4/3, 3/2,2
        
        //Diagrama Tonal
        //1/(9/8), 1/(5/4), 1/(4/3), 1/(3/2), 1/2,0,0, 
        1, 9/8, 5/4, 4/3, 3/2, 27/16, 15/8,2,0,
        9/8, 81/64, 45/32, 3/2, 27/16, 243/128,135/64,(9/8)*2,0,
        5/4, 45/32, 25/16, 5/3, 15/8, 135/64, 75/32, (5/4)*2,0,
        //3/2, 27/16, 15/8, 2, 9/4, 81/32, 45/16, (3/2)*2

      ];

      // Array.prototype.unique = function() {
      //   return this.filter(function(value, index, self) {
      //     return self.indexOf(value) === index;
      //   });
      // };
      //ratiosArr = ratiosArr.unique();
      //ratiosArr = ratiosArr.sort();
      //===================================
      return ratiosArr[idx-1] || 0;

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

      //#endregion

      var eqt = this.eqt;
      var etqRatio = Math.pow(this.base, 1.0 / this.eqt); //1.059486755451824;
      return idx == 1 ? 1 : Math.pow(etqRatio, idx - 1);

      //return idx == 1 ? 1 : Math.pow(Math.pow(2,(1.0/this.eqt)),idx-1);
      //return 1+((idx-1)/this.eqt);
      //return ratiosArr[idx-1] || 0;

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
