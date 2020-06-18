<template>
  <div>
    <p>
      <button v-on:click="setPhi">φ</button>
      <button v-on:click="setPi">π</button>
      Base:
      <input type="number" step="0.0001" v-model="base" />
      Eqt:
      <input type="number" step="1" v-model="eqt" />
      <span>Ratio: {{ratio(2)}}</span>
      <span>
        DiffRoot:
        <input type="checkbox" v-model="diffRoot" />
      </span>
      <span>
        MainFreq:
        <input type="text" v-model="mainFreq" />
      </span>
      <br />
      <span>
        Normalize:
        <input type="checkbox" v-model="normalize" />
        <input type="number" v-model="equivalence" step="0.0001" />
      </span>
      <span>
        Repeat
        <input type="checkbox" v-model="repeatScale" />
        <input type="number" v-model="repeatScaleValue" step="1" />
      </span>
      <span>
        Chart:
        <input type="checkbox" v-model="showChart" />
      </span>
      <span>
        Sort:
        <input type="checkbox" v-model="applySort" />
      </span>
      <span>
        guitarStringLength:
        <input type="number" v-model="guitarStringLength" step="1" />
      </span>
       <span>
        Test:
        <input type="number" v-model="testValue" step="0.0001" />
      </span>
    </p>
    <!-- <div>
      1.25 ({{Math.pow(ratio(2),5)-1.25}})
    </div>
    <div>
      1.5 ({{Math.pow(ratio(2),9)-1.5}})
    </div>
    <div>
      2 ({{(Math.pow(ratio(2),15)-2).toFixed(18)}})
    </div>-->
    <div>
      <!-- Erro ({{((Math.pow(ratio(2),15)-2) + Math.pow(ratio(2),9) + Math.pow(ratio(2),5))}}) -->
    </div>

    <table class="keyboard">
      <tr v-for="(krow,ridx) in keys" v-bind:key="ridx + base">
        <td v-for="(key,kidx) in krow" v-bind:key="(ridx+''+kidx)">
          <template v-if="!freqBased">
            <small>{{key.idx}} : {{parseFloat(ratio(key.idx)).toFixed(4)}}</small>

            <!-- Distancia do fret em relação ao inicio do braço -->
            <small >({{(guitarStringLength-(guitarStringLength/ratio(key.idx))).toFixed(3)}}cm)</small>
            <!-- <small >({{(65-(65/ratio(key.idx))).toFixed(2)}}cm)</small> -->

            <!-- Distancia entre frets em relação ao inicio do braço -->
            <!-- <small v-if="key.idx > 1">({{(   (65-(65/ratio(key.idx)))  -  (65-(65/ratio(key.idx-1)))  ).toFixed(2)}}cm)</small>
            <small v-else>({{(65-(65/ratio(key.idx))).toFixed(2)}}cm)</small>-->

            <!-- <div>{{getFreq(key.idx)}}</div> -->
            <audio-key
              :keyName="key.k"
              :idx="key.idx"
              :freq="(mainFreq * factor * ratio(key.idx))"
              :text="text(key.idx)"
              :color="color(key.idx)"
              @onChangeActive="onChangeActive"
            />
          </template>
          <template v-if="freqBased">
            <small>{{key.idx}} : {{parseFloat(freq(key.idx)).toFixed(3)}}</small>
            <audio-key :keyName="key.k" :freq="freq(key.idx)"  :color="color(key.idx)" @onChangeActive="onChangeActive" />
          </template>
        </td>
      </tr>
    </table>
    <div v-if="showChart">
      <chartjs-line
        :width="500"
        :height="150"
        :labels="chartLabels()"
        :data="chartData"
        :bind="true"
        style="display:inline-block;"
      ></chartjs-line>
      <chartjs-line
        :width="500"
        :height="150"
        :labels="chartLabels()"
        :data="ratioDiff"
        :bind="true"
        style="display:inline-block;"
      ></chartjs-line>
    </div>
    <div>ActiveRatio: {{activeRatio}}</div>
    <div>Avg ratio: {{ratioAvg}}</div>
    <div>Ratios diff: {{ratioDiff}}</div>
    <div style="text-align:left;" v-if="!freqBased">
      <h4 style="display:inline-block;">Ratio List:</h4>
      <span>
        <input type="checkbox" v-model="ratioListIdx" />Idx
      </span>
      <span style="margin-left:20px;">
        <input type="checkbox" v-model="inCents" />In cents
      </span>
      <!-- <div v-for="ii in (this.ratiosArr.length)" v-bind:key="ii">{{ratio(ii)}}</div> -->
      <div v-for="ii in Math.max(73,nEqt)" v-bind:key="ii">
        <span v-if="ratioListIdx">{{ii}}:</span>
        <span>{{inCents ? ratioToCents(ratio(ii)) : ratio(ii)}}</span>
      </div>
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
      base: 2,//1.4950347693089112,//Math.pow(5,1/4),
      ratioDiff: [],
      //ratiosArr:[],
      ratioAvg: 0,
      mainFreq: 110, //440
      factor: 1,
      freqBased: false,
      diffRoot: false,
      equivalence: 2,//2.0125,
      normalize: false,
      repeatScale: false,
      repeatScaleValue: 1.4950347693089112,//2,
      applySort: false,
      activeKeys: [],
      activeRatio: "",
      scaleRefIdx: 1,
      scaleCount: 12,
      showChart: false,
      ratioListIdx: true,
      inCents: false,
      guitarStringLength: 65, //65
      testValue: 1,
      keys: [
        // [
        //   { k: "1", idx: 28 },
        //   { k: "2", idx: 29 },
        //   { k: "3", idx: 30 },
        //   { k: "4", idx: 31 },
        //   { k: "5", idx: 32 },
        //   { k: "6", idx: 33 },
        //   { k: "7", idx: 34 },
        //   { k: "8", idx: 35 },
        //   { k: "9", idx: 36 },
        // ],
        // [
        //   { k: "Q", idx: 19 },
        //   { k: "W", idx: 20 },
        //   { k: "E", idx: 21 },
        //   { k: "R", idx: 22 },
        //   { k: "T", idx: 23 },
        //   { k: "Y", idx: 24 },
        //   { k: "U", idx: 25 },
        //   { k: "I", idx: 26 },
        //   { k: "O", idx: 27 },
        // ],
        // [
        //   { k: "A", idx: 10 },
        //   { k: "S", idx: 11 },
        //   { k: "D", idx: 12 },
        //   { k: "F", idx: 13 },
        //   { k: "G", idx: 14 },
        //   { k: "H", idx: 15 },
        //   { k: "J", idx: 16 },
        //   { k: "K", idx: 17 },
        //   { k: "L", idx: 18 }
        // ],
        // [
        //   //{ k: "\\", idx: 0 },
        //   { k: "Z", idx: 1 },
        //   { k: "X", idx: 2 },
        //   { k: "C", idx: 3 },
        //   { k: "V", idx: 4 },
        //   { k: "B", idx: 5 },
        //   { k: "N", idx: 6 },
        //   { k: "M", idx: 7 },
        //   { k: "<", idx: 8 },
        //   { k: ">", idx: 9 }
        // ]
      ]
    };
  },
  mounted: function() {
    var _this = this;
    //Transposição nos números
    // window.addEventListener("keydown", e => {
    //   var keyName = String.fromCharCode(e.keyCode);
    //   var idx = parseInt(keyName);

    //   if (!isNaN(idx)) {
    //     _this.factor = _this.ratio(idx) || 1;
    //     //console.log("factor",_this.factor);
    //   }
    // });

    this.keys = this.mountKeyboardKeys();
  },
  computed: {
    chartData() {
      var data = [];
      var arrDiff = [];
      var max = Math.max(73, this.eqt); //Math.max(this.ratiosArr.length,this.eqt);
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

      if (this.ratioDiff.length) {
        var sum = this.ratioDiff.reduce(function(a, b) {
          return a + b;
        });
        var avg = sum / this.ratioDiff.length;
        this.ratioAvg = avg;
      }

      return data;
    },

    nEqt: function() {
      return parseInt(this.eqt);
    }
  },
  methods: {
    mountKeyboardKeys() {
      var keyboardKeys = [
        ["Z", "X", "C", "V", "B", "N", "M", "<", ">"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O"],
        ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
      ];

      var result = [];
      var keyNumber = 1;
      for (let i = 0; i < keyboardKeys.length; i++) {
        const linha = keyboardKeys[i];

        var linhaResult = [];
        for (let j = 0; j < linha.length; j++) {
          const itemLinha = linha[j];

          linhaResult.push({ k: itemLinha, idx: keyNumber });
          keyNumber++;
        }

        result = [linhaResult].concat(result);
      }

      return result;
    },
    ratioToCents(ratio) {
      var cents = 1200 * Math.log2(parseFloat(ratio));
      return cents;
    },
    centsToRatio(cents) {
      var ratio = Math.pow(2, cents / 1200);
      return ratio;
    },
    setPhi() {
      this.base = (Math.sqrt(5) + 1) / 2;
    },
    setPi() {
      this.base = Math.PI;
    },
    chartLabels() {
      var data = [];
      var max = Math.max(73, this.eqt); //this.eqt;
      //var max = Math.max(this.ratiosArr.length,this.eqt);
      for (var i = 1; i <= max; i++) {
        var v = i.toString();
        data.push(v);
      }
      data.push("O");
      return data;
    },
    freq(idx) {
      var freqBase = this.mainFreq;
      var freqArr = [
        // 4*325,
        // 4*200.86,
        // 4*124.140
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
        // 165/2,
        // 165*1.125/2, //9/8
        // 165*1.3333/2, //4/3
        // 165*1.5/2, //3/2
        // 165*1.6666/2, //5/3
        // 165,
        // 165*1.125, //9/8
        // 165*1.3333, //4/3
        // 165*1.5, //3/2
        // 165*1.6666, //5/3
        // 165*2,
        // 0,
        // 0,
        // 0,
        // 165*1.125, //9/8
        // 165*1.125*1.125, //9/8
        // 165*1.125*1.3333, //4/3
        // 165*1.125*1.5, //3/2
        // 165*1.125*1.6666, //5/3
        // 165*1.125*2,
        // 184*1.5/2,
        // 184*1.6666/2,
        // 184,
        // 184*1.125,
        // 184*1.333,
        // 184*1.5,
        // 184*1.6666,
        // 0,
        // 142,
        // 157,
        // 184,
        // 207,
        // 244,
        // 278,
        // 312,
        // 130,
        // 141,
        // 165,
        // 141,
        // 165,
        // 221,
        // 250,
        // 274,
        // 250,
        // 221,
        // 183,
        // 165,
        // 141,
        // 120
        // 206.621
        //  ,311.929
        // ,414.09
        // ,517.452
        // ,623.653
        // ,724.333
        // ,831.331
        // ,936.366
        // ,1136.32
        // ,1236.48
        // ,1343.97
        // 17857
        // ,6501
        // ,3239
        // ,1659
        // ,920
        // ,601
        // ,407
        // ,263
        // ,152
        // ,86
        // ,44
        // ,27
        // 100,
        // 200,
        // 300,
        // 500,
        // 800,
        // 1300,
        // 2100,
        // 3400,
        // 5500,
        // 8900
        // 200,
        // 201,
        // 202,
        // 204,
        // 208,
        // 216,
        // 232,
        // 264,
        // 328,
        // 0,0,0,0,
        //The Timaeus Locris Scale
        // 384,
        // 432,
        // 486,
        // 512,
        // 576,
        // 648,
        // 729,
        // 768,
        // 864,
        // 972,
        // 1024,
        // 1152,
        // 1296,
        // 1458,
        // 1536,
        // 1728,
        // 1944,
        // 2048,
        // 2187,
        // 2304,
        // 2592,
        // 2916,
        // 3072,
        // 3456,
        // 3888,
        // 4374

        100,
        100+(this.base*1),
        100+(this.base*2),
        100+(this.base*3),
        100+(this.base*4),
        100+(this.base*5),
        100+(this.base*6),
        100+(this.base*7),
        100+(this.base*8),
        100+(this.base*9),
        100+(this.base*10),
        100+(this.base*11),
        100+(this.base*12),
        100+(this.base*13),
        100+(this.base*14),
        100+(this.base*15),
        100+(this.base*16),
        100+(this.base*17),
        100+(this.base*18),
        100+(this.base*19),
        100+(this.base*20),
        100+(this.base*21),
        100+(this.base*22),
        100+(this.base*23),
        100+(this.base*24),
      ];
      //freqArr = freqArr.sort();
      return freqArr[idx - 1] || 0;
    },
    ratio(idx) {
      var PHI = (1 + Math.sqrt(5)) / 2; //1.618033988749895

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
        //          1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765
        // ,10946
        // ,17711
        // ,28657
        // ,46368
        // ,75025
        // ,121393
        // ,196418
        // ,317811
        // ,514229
        // ,832040

        //1,2,3/2,5/4,8/4,13/8,21/16,34/32,55/32,89/64,144/128,233/128,377/256,610/512,987/512,1597/1024,2584/2048,4181/4096,6765
        //8/4,13/8,21/16,34/32,1
        //2,55/32,89/64,144/128,1
        //1,1.2307,1.25,1.3333,1.5,1.6,1.625,2
        //  1
        //  ,1.11111111
        //  ,1.125
        //  ,1.2
        // , 1.333333333
        //  ,1.5
        //  ,1.666666667
        //  ,1.777777777
        //  ,1.8
        //  ,2

        // 1
        // ,1.857142857
        // ,1.909090909
        // ,2

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
        // //2, 2/(9/8), 2/(5/4), 2/(4/3), 2/(3/2), 2/(27/16), 2/(15/8), 2/2,0,
        // 2/2, 2/(15/8),2/(27/16),2/(3/2),2/(4/3),2/(5/4), 2/(9/8), 2,0,
        // 1, 9/8, 5/4, 4/3, 3/2, 27/16, 15/8,2,0,
        // 9/8, 81/64, 45/32, 3/2, 27/16, 243/128,135/64,(9/8)*2,0,
        // //5/4, 45/32, 25/16, 5/3, 15/8, 135/64, 75/32, (5/4)*2,0,
        // //3/2, 27/16, 15/8, 2, 9/4, 81/32, 45/16, (3/2)*2

        // 2/2, 2/(15/8),2/(27/16),2/(3/2),2/(4/3),
        // 2/(5/4), 2/(9/8), 2,
        //4/(15/8),4/(27/16),4/(3/2),4/(4/3),4/(5/4), 4/(9/8), 4,

        //1, 9/8, 5/4, 4/3, 3/2,27/16, 15/8,2,
        //2*1, 2*9/8,2* 5/4,2* 4/3,2* 3/2,2* 27/16,2* 15/8,2*2,
        //9/8, 81/64, 45/32, 3/2, 27/16, 243/128,135/64,(9/8)*2,0,
        //Math.sqrt(2)
        //135/96,
        //1.4814703125,
        //1.58023499999012353125
        //1.42221777778,
        //1.58026662716
        //         1,
        // 1.0666666666666667,
        // 1.125,
        // 1.1851851851851851,
        // 1.25,
        // 1.3333333333333333,
        // (4/3)*1.0666666666666667,
        // (4/3)*1.125,
        // (4/3)*1.1851851851851851,
        // (4/3)*1.25,
        // (4/3)*1.3333333333333333,
        // (4/3)*(4/3)*1.0666666666666667,
        // (4/3)*(4/3)*1.125,

        // 2*        1,
        // 2*1.0666666666666667,
        // 2*1.125,
        // 2*1.1851851851851851,
        // 2*1.25,
        // 2*1.3333333333333333,
        // 2*(4/3)*1.0666666666666667,
        // 2*(4/3)*1.125,
        // 2*(4/3)*1.1851851851851851,
        // 2*(4/3)*1.25,
        // 2*(4/3)*1.3333333333333333,
        // 2*(4/3)*(4/3)*1.0666666666666667,
        // 2*(4/3)*(4/3)*1.125,
        //1.4814814814814814,1.3333333333333333,1.1851851851851851, 1.1111111111111112,
        //1.5,1.3333333333333333,1.1851851851851851,1.0666666666666667,
        //1, 1.125, 1.25, 1.3333333333333333, 1.5,
        //1.422186657778,

        //1,2,
        //3/2,4/3,5/4,6/5,7/6,8/7,9/8,10/9,11/10,12/11
        //2/(3/2), 2/(4/3), 2/(5/4), 2/(6/5), 2/(7/6), 2/(8/7), 2/(9/8), 2/(10/9), 2/(11/10), 2/(12/11)

        //Por3
        // 1
        // ,2
        // ,3
        // ,1.333333333
        // ,1.666666667
        // ,2
        // ,2.333333333
        // ,2.666666667
        // ,3
        //1,2,3,4,5,6,7,8,9,
        //2,4,6,8,10,12,14,16,18,
        //3,6,9,12,15,18,21,24,27

        //Pseudo Arabic
        // 1,
        // 16/15,
        // 5/4,
        // 4/3,
        // 3/2,
        // 8/5,
        // 15/8,

        // 1,
        // 16/15,
        // 5/4,
        // 4/3,
        // 3/2,
        // //25/16,
        // 8/5,
        // 5/3,
        // 15/8,
        // 2

        // 1,
        // 5/4,
        // 4/3,
        // 3/2,
        // 5/3,
        // 2,
        // 2*5/4,
        // 2*4/3,
        // 2*3/2,
        // 2*5/3,
        // 4

        // 1,
        // 1.125, //9/8
        // 1.25, //5/4
        // 1.5, //3/2
        // 1.6875, //27/16
        // 2,

        // 1,
        // 1.05349794238,
        // 1.125,
        // 32/27,
        // 1.33333,
        // 1.5, //1.125
        // //1.666666, //1.25
        // 1.6877637,
        // 1.777777,
        // 1.8984375,
        // 2, //1.5
        // 2.25 //1.6875

        ////Diamante série Harmônica
        // 1,
        // 1.125, //9/8
        // 1.25, //5/4
        // 1.33333333, //4/3
        // 1.5, //3/2
        // 1.666666666, //5/3
        // 1.875, //27/19,
        // 2,
        // 0,

        // // 1.125*1,
        // // 1.125*1.125, //9/8
        // // 1.125*1.25, //5/4
        // // 1.125*1.3333, //4/3
        // // 1.125*1.5, //3/2
        // // 1.125*1.6666, //5/3
        // // 1.125*1.875, //27/19,
        // // 1.125*2,
        // // 0,

        // 1.25*1,
        // 1.25*1.125, //9/8
        // 1.25*1.25, //5/4
        // 1.25*1.3333, //4/3
        // 1.25*1.5, //3/2
        // 1.25*1.6666, //5/3
        // 1.25*1.875, //27/19,
        // 1.25*2,
        // 0,

        // 1.33333333*1,
        // 1.33333333*1.125, //9/8
        // 1.33333333*1.25, //5/4
        // 1.33333333*1.33333333, //4/3
        // 1.33333333*1.5, //3/2
        // 1.33333333*1.666666666, //5/3
        // 1.33333333*1.875, //27/19,
        // 1.33333333*2,
        // 0,

        // 1.5*1,
        // 1.5*1.125, //9/8
        // 1.5*1.25, //5/4
        // 1.5*1.3333, //4/3
        // 1.5*1.5, //3/2
        // 1.5*1.6666, //5/3
        // 1.5*1.875, //27/19,
        // 1.5*2,
        // 0,

        // 1.666666666*1,
        // 1.666666666*1.125, //9/8
        // 1.666666666*1.25, //5/4
        // 1.666666666*1.33333333, //4/3
        // 1.666666666*1.5, //3/2
        // 1.666666666*1.666666666, //5/3
        // 1.666666666*1.875, //27/19,
        // 1.666666666*2,
        // 0,

        // 1,1.125,1.25, 1.3333,1.5,1.6666,//1.875,2,
        // /*1.265625,*/ /*1.40625,*/ /*1.6875,*/ /*1.0546875,*/
        // 1.5625, 1.0416666, 1.171875,
        // 1.777777, /*1.111111,*/
        // 1.3888888,
        // /*1.7578125*/

        // 1.851843631482,2

        //1,
        //2,
        //3/2,
        //4/2,
        //5/3,
        // 5/4,
        // 6/5,
        //  7/6,
        //  7/5,
        //  7/4,
        // 8/5,
        // 8/6,
        // 8/7
        // 9/8,
        // 9/7,
        // 9/6,
        // 9/5,

        // 11/2,
        // 11/3,
        // 11/4,
        // 11/5,
        // 11/6,
        // 11/7,
        // 11/8,
        // 11/9,
        // 11/10

        // 1,
        // //8/7, //8/7
        // 1.25, //5/4
        // 1.33333333, //4/3
        // 1.5, //3/2
        // //1.6,
        // 1.75, //7/4
        // 2

        // 1,
        // Math.pow(2,1/12),
        // Math.pow(2,1/12)*Math.pow(2,1/12),
        // Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12),
        // Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12),1.25,
        // Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12),4/3,
        // Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12),
        // Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12),1.5,
        // Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12)*Math.pow(2,1/12),
        // 2

        //1,2,4/3,3/2,5/4,1.5555555,7/4,16/9,9/8//,11/8,13/8,15
        //1,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32
        // 8*1,
        // 8*1/2,
        // 8*1/3,
        // 8*1/4,
        // 8*1/5,
        // 8*1/6,
        // 8*1/7,
        // 8*1/8

        // 1,
        // 1.5,
        // 0.5*2,
        // 0.5*2.5,
        // 0.5*3,
        // 0.5*3.5,
        //  0.5*4,
        // 0.5*4.5,
        // 0.5*5,
        // 0.5*5.5,
        // 0.5*6,
        // 0.5*6.5,
        // 0.5*7,
        // 0.5*7.5,
        // 0.5*8,

        // 4,
        // 4.5,
        // 5,
        // 5.5,
        // 6,
        // 6.5,
        // 7,
        // 7.5,
        // 8

        // 1,
        // 1.2360687328379581875029742903884,
        // //1.618033,
        // 1.5278659122996356532938132787012,
        // 1.88888,
        // 2

        // 1,
        // 1.0534979423868312757201646090535,
        // 1.1851851851851851851851851851852,
        // 1.33333,
        // 1.404663923182441700960219478738,
        // 1.5802469135802469135802469135802,
        // 1.777777,
        // 2

        //Pytagoream 1.5
        // 1
        // ,1.06787109375
        // ,1.125
        // ,1.20135498046875
        // ,1.265625
        // ,1.3515243530273438
        // ,1.423828125
        // ,1.5
        // ,1.601806640625
        // ,1.6875
        // ,1.802032470703125
        // ,1.8984375
        // ,2
        // ,2*1.06787109375
        // ,2*1.125
        // ,2*1.20135498046875
        // ,2*1.265625
        // ,2*1.3515243530273438
        // ,2*1.423828125
        // ,2*1.5
        // ,2*1.601806640625
        // ,2*1.6875
        // ,2*1.802032470703125
        // ,2*1.8984375

        // 4*4/8,
        // 4*5/8,
        // 4*6/8,
        // 4*7/8,
        // 4*8/8,

        // 5*4/8,
        // 5*5/8,
        // 5*6/8,
        // 5*7/8,
        // 5*8/8,

        // 6*4/8,
        // 6*5/8,
        // 6*6/8,
        // 6*7/8,
        // 6*8/8,

        // 7*4/8,
        // 7*5/8,
        // 7*6/8,
        // 7*7/8,
        // 7*8/8,

        // 8*4/8,
        // 8*5/8,
        // 8*6/8,
        // 8*7/8,
        // 8*8/8,
        //4/4,5/4,6/4,7/4,8/4,9/4,10/4,11/4,12/4
        //8/8,9/8,10/8,11/8,12/8,13/8,14/8,15/8,16/8

        //Computational Approach to Musical Consonance and Dissonance
        //https://www.frontiersin.org/articles/10.3389/fpsyg.2018.00381/full
        //1, 2/1, 3/2, 4/3, 5/3, 5/4, 7/4, 6/5, 7/5, 8/5, 9/5, 7/6, 9/7, 11/6, 8/7, 10/7, 9/8

        // 1,
        // 1*(3/2),
        // 1*(3/2)*(4/3),
        // 1*(3/2)*(4/3)*(5/4),
        // 1*(3/2)*(4/3)*(5/4)*(6/5),
        // 1*(3/2)*(4/3)*(5/4)*(6/5)*(7/6),
        // 1*(3/2)*(4/3)*(5/4)*(6/5)*(7/6)*(8/7),
        // 1*(3/2)*(4/3)*(5/4)*(6/5)*(7/6)*(8/7)*(9/8),
        // 1*(3/2)*(4/3)*(5/4)*(6/5)*(7/6)*(8/7)*(9/8)*(10/9),

        //Arranjo geometrico
        //https://www.youtube.com/watch?v=SU2JztST_TY
        // 0,0,0,0,0,0,0,0,0,
        // 0,0,0,0,1,Math.pow(Math.pow(2,1/12),7),Math.pow(Math.pow(2,1/12),14),Math.pow(Math.pow(2,1/12),21),Math.pow(Math.pow(2,1/12),28),
        // 0,0,0,0,0,0,0,0,0,

        // 0,0,0,0,0.5,0,0,0,0,
        // Math.pow(Math.pow(2,1/12),-12),Math.pow(Math.pow(2,1/12),10),Math.pow(Math.pow(2,1/12),7),Math.pow(Math.pow(2,1/12),3),1,Math.pow(Math.pow(2,1/12),4),Math.pow(Math.pow(2,1/12),7),Math.pow(Math.pow(2,1/12),11),Math.pow(Math.pow(2,1/12),12),
        // 0,0,0,0,Math.pow(Math.pow(2,1/12),4),Math.pow(Math.pow(2,1/12),8),Math.pow(Math.pow(2,1/12),11),Math.pow(Math.pow(2,1/12),15),Math.pow(Math.pow(2,1/12),16),

        // 1, 3,  5,  7,  9,  11, 13, 15, 17,
        // 3, 9,  15, 21, 27, 33, 39, 45, 51,
        // 5, 15, 25, 35, 45, 55, 65, 75, 85,

        //1, 1.25, 1.5, 1.875,2.25,2.8125,3.375, 4.21875, 5.0625
        //1, 5/4, 3/2, 1.6875, 2.109375, 2.53125, 2.84765625

        //,1
        // ,1.125
        // ,1.25
        // ,1.40625
        // ,1.5
        // ,1.6875
        // ,1.875
        // ,2
        // ,2*1.125
        // ,2*1.25
        // ,2*1.40625
        // ,2*1.5
        // ,2*1.6875
        // ,2*1.875
        // ,2*2

        // 1,
        // 10/9,
        // 5/4,
        // 4/3,
        // 3/2,
        // 5/3,
        // 15/8,
        // 2,
        // 2.25,

        // (5/4)*1,
        // (5/4)*10/9,
        // (5/4)*5/4,
        // (5/4)*4/3,
        // (5/4)*3/2,
        // (5/4)*5/3,
        // (5/4)*15/8,
        // (5/4)*2,
        // (5/4)*2.25,

        // (3/2)*1,
        // (3/2)*10/9,
        // (3/2)*5/4,
        // (3/2)*4/3,
        // (3/2)*3/2,
        // (3/2)*5/3,
        // (3/2)*15/8,
        // (3/2)*2,
        // (3/2)*2.25
        //1,9,18,27,36,45,54,63,72,81,90,99,108,117,126,135,144

        //1,2,4,8,7,5
        // 1
        // ,1
        // ,2
        // ,3
        // ,5
        // ,8
        // ,4
        // ,3
        // ,7
        // ,1
        // ,8
        // ,9
        // ,8
        // ,8
        // ,7
        // ,6
        // ,4
        // ,1
        // ,5
        // ,6
        // ,2
        // ,8
        // ,1
        // ,9

        //1,2
        //2*Math.PI*1/4,2*Math.PI*2/4,2*Math.PI*3/4,2*Math.PI
        //1/3,2/3,3/3,
        //1/4,2/4,3/4,4/4
        //1/5,2/5,3/5,4/5,5/5
        //1/6,2/6,3/6,4/6,5/6,6/6
        //1/7,2/7,3/7,4/7,5/7,6/7,7/7
        //1/8,2/8,3/8,4/8,5/8,6/8,7/8,8/8
        //1/9,2/9,3/9,4/9,5/9,6/9,7/9,8/9,9/9
        //1/10,2/10,3/10,4/10,5/10,6/10,7/10,8/10,9/10,10/10
        //1/11,2/11,3/11,4/11,5/11,6/11,7/11,8/11,9/11,10/11,11/11
        //1/12,2/12,3/12,4/12,5/12,6/12,7/12,8/12,9/12,10/12,11/12,12/12
        //1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16
        //2,2.2857142857142857142857142857143,2.66666666,3.2,4,5,6,7,8
        //1.33333/1.5, 1.454545375/1.5, 1.6/1.5, 1.777777/1.5,             1.333333325, 1.454545375, 1.6, 1.77777775, 2
        //8,9,10,11,12,13,14,15,16
        //4/(8/4)*2,4/(7/4)*2,4/(6/4)*2,4/(5/4)*2,4,5,6,7,8
        //1,1.125, 1.25, 1.3125, 1.5, 1.6875, 1.875, 2
        //1,1.125, 1.25, 1.333333333, 1.5, 1.66666666, 1.875, 2

        //1, Math.pow(2*Math.PI*(60/360),1),Math.pow(2*Math.PI*(60/360),2),Math.pow(2*Math.PI*(60/360),3),Math.pow(2*Math.PI*(60/360),4),Math.pow(2*Math.PI*(60/360),5)
        //1, 2*Math.PI*(60/360),1.25,2*Math.PI*(60/360)*1.25, 1.33333, 2*Math.PI*(60/360)*1.3333333,1.5, 2*Math.PI*(60/360)*1.5
        //Triangulo Equilatero
        //1, Math.sqrt(3)/3*2,Math.sqrt(3),Math.sqrt(3)/3*Math.PI,2
        // 1,
        // 1.0471975511965976,
        // 1.1026577908435842,
        // 1.1547005383792515,
        // 1.1547005383792515*1.0471975511965976,
        // 1.1547005383792515*1.0471975511965976*1.0471975511965976,
        // 1.5,
        // 1.7320508075688772,
        // 1.8137993642342176,
        // 2

        //3
        // 1
        // ,1.333333333
        // ,1.666666667
        // ,2.0
        // ,2.333333333
        // ,2.666666667
        // ,3.0
        // ,3.333333333
        // ,3.666666667

        //4
        // ,1.0
        // ,1.25
        // ,1.5
        // ,1.75
        // ,2.0
        // ,2.25
        // ,2.5
        // ,2.75
        // ,3.0

        //5
        // ,1.
        // ,1.2
        // ,1.4
        // ,1.6
        // ,1.8
        // ,2.
        // ,2.2
        // ,2.4
        // ,2.6

        //6
        // ,1
        // ,1.166666667
        // ,1.333333333
        // ,1.5
        // ,1.666666667
        // ,1.833333333
        // ,2.
        // ,2.166666667
        // ,2.333333333

        //7
        // ,1.
        // ,1.142857143
        // ,1.285714286
        // ,1.428571429
        // ,1.571428571
        // ,1.714285714
        // ,1.857142857
        // ,2.

        // ,1.
        // ,1.083333333
        // ,1.166666667
        // ,1.25
        // ,1.333333333
        // ,1.416666667
        // ,1.5
        // ,1.583333333
        // ,1.666666667
        // ,1.75
        // ,1.833333333
        // ,1.916666667
        // ,2.

        //24
        // 1
        // ,1.041666667
        // //,1.083333333
        // ,1.125
        // ,1.166666667
        // ,1.208333333
        // ,1.25
        // //,1.291666667
        // ,1.333333333
        // //,1.375
        // ,1.416666667
        // //,1.458333333
        // ,1.5
        // //,1.541666667
        // ,1.583333333
        // //,1.625
        // ,1.666666667
        // //,1.708333333
        // ,1.75
        // //,1.791666667
        // ,1.833333333
        // //,1.875
        // ,1.916666667
        // //,1.958333333
        // ,2

        // 1/18,1/15,1/12,1/9,1/6,1/3,2/3,3/3,4/3,//5/3,
        // 1/6,1/5,1/4,1/3,1/2,1,2,3,4,//5,
        // 3/6,3/5,3/4,3/3,3/2,3,6,9,12,//15

        //1,1/2,1/3,1/4,1/5,1/6,1/7,1/8,1/9,1/10

        // 16*0.083333333
        // ,16*0.076923077
        // ,16*0.071428571
        // ,16*0.066666667
        // ,16*0.0625
        // ,16*0.058823529
        // ,16*0.055555556
        // ,16*0.052631579
        // ,16*0.05
        // ,16*0.047619048
        // ,16*0.045454545
        // ,16*0.043478261
        // ,16*0.041666667

        //1,1.043478255652174, 1.0909090712727274, 1.1428571428571428, 1.1999999904000003, 1.263157885894737, 1.3333333333333335, 1.4117646847058827, 1.4999999880000001, 1.5999999952000001, 1.7142856902857144, 1.8461538332307696, 2

        // 1.000000	,1.125000	,1.250000	,1.500000
        // ,1.066667	,1.200000	,1.333333	,1.600000
        // ,1.142857	,1.285714	,1.428571	,1.714286
        // ,1.230769	,1.384615	,1.538462	,1.846154
        // ,1.333333	,1.500000	,1.666667	,2
        // ,1.454545	,1.636364	,1.818182	,	1.090909*2

        // 1,2,3,4,5,6,7,0,0,
        // 2,9/5,7/4,5/3,8/5,3/2,10/7,7/5,4/3,9/7,5/4,6/5,7/6,8/7,9/8,10/9,1,

        //1.6,X
        //2,1.66666,1.33333     ,1.8,1.5,1.2      ,1.75,1.4,1.1666666/*m*/   ,1.666666,1.33333,1.11111/*m*/   ,1.5,1.25,1
        //2,1.66666,1.33333,1.11111     ,1.8,1.5,1.2,1      ,1.75,1.4,1.1666666,0.933333/*mX*/   ,1.666666,1.33333,1.11111,0.88888/*m*/   ,1.5,1.25,1
        //2,1.66666,1.33333,1.11111,0.888888,0.740740,0.592592,0.49382716,0.3950617

        //Escala pitagóreca
        // 1
        // ,1.125
        // ,1.265625
        // ,1.423828125
        // ,1.5
        // ,1.6875
        // ,1.8984375
        // ,2*1
        // ,2*1.125
        // ,2*1.265625
        // ,2*1.423828125
        // ,2*1.5
        // ,2*1.6875
        // ,2*1.8984375,

        // //Escala pentatônica pitagórica
        // 1.06787109375
        // ,1.20135498046875
        // ,1.3515243530273438
        // ,1.601806640625
        // ,1.802032470703125

        // 1
        // ,1.25
        // ,1.5
        // ,1.875
        // ,2.25
        // ,2.8125
        // ,3.375
        // ,4
        // ,4*1.25
        // ,4*1.5
        // ,4*1.875
        // ,4*2.25
        // ,4*2.8125
        // ,4*3.375
        // ,4*4

        //1
        // 1.125
        // ,1.25
        // ,1.40625
        // ,1.5
        // ,1.6875
        // ,1.875
        // ,2
        // ,1.125*2

        //***************************************************************
        //Wilckerson Scale \o/
        //7 primeiras notas normalizadas encontrada a partir da multiplicação por 1.25 e 1.2 de
        //forma alternada, formando com isso triades maiores e menores sucessivas
        //Para soar mais diatônica, começa a partir da segunda nota.
        // 1,
        // 10/9,
        // 5/4,
        // 4/3,
        // 3/2,
        // 5/3,
        // 16/9,
        // 2,
        // 0,2,
        // 2*10/9,
        // 2*5/4,
        // 2*4/3,
        // 2*3/2,
        // 2*5/3,
        // 2*16/9,
        // 2*2,
        //***************************************************************

        // 1
        // ,1.125
        // ,1.25
        // ,1.3333333333333333
        // ,1.5
        // ,1.6875
        // ,1.875
        // ,2*1
        // ,2*1.125
        // ,2*1.25
        // ,2*1.3333333333333333
        // ,2*1.5
        // ,2*1.6875
        // ,2*1.875
        // ,2*2
        //

        //1,10/9,5/4,4/3,1.5,5/3, 15/8,2,2*9/8
        //9/8,5/4,1.40625,1.5,1.6875,15/8,2,2*9/8
        //1,1.1111111111111112, 1.25, 1.3333333333333333,1.40625, 1.5, 1.6666666666666667, 1.875, 2
        // 1,9/8,4/3,1.5,16/9,2,
        // 2*9/8,2*4/3,2*1.5,2*16/9,2*2

        //2, 1.5, 1.3333333333333333, 1.265625,0.8009033203125,// 1.25, 1.2, 1.1666666666666667, 1.1428571428571428, 1.125,1

        //Divisão de uma corda
        //2/2, 2/1, 0,0,0,0,0,0,0,
        //3/3, 3/2, 3/1, 0,0,0,0,0,0,
        //4/4,4/3,4/2,4/1, 0,0,0,0,0,
        // 5/5,5/4,5/3,5/2,5/1, 0,0,0,0,
        // 6/6,6/5,6/4,6/3,6/2,6/1, 0,0,0,
        // 7/7,7/6,7/5,7/4,7/3,7/2,7/1, 0,0,
        //8/8,8/7,8/6,8/5,8/4,8/3,8/2,8/1, 0,
        //9/9,9/8,9/7,9/6,9/5,9/4,9/3,9/2,9/1,
        //10/10, 10/9 ,10/8,10/7,10/6,10/5,10/4,10/3,10/2,10/1,
        //22/22,22/21,22/20,22/19,22/18,22/17,22/16,22/15,22/14,22/13,22/12,22/11

        //,2*4/3,2*4/2
        //6/12,6/11,6/10,6/9,6/8,6/7,6/6,12/11,12/10,12/9,12/8,12/7,12/6
        //,2*6/5,2*6/4,2*6/3

        //8/8,8/7,8/6,8/5,8/4
        //10/10,10/9,10/8,10/7,10/6,10/5
        //12/12,12/11,12/10,12/9,12/8,12/7,12/6
        //14/14,14/13,14/12,14/11,14/10,14/9,14/8,14/7

        //20/20, 20/19, 20/18, 20/17, 20/16, 20/15, 20/14, 20/13, 20/12, 20/11, 20/10

        // 1,4/3,3/2,2
        // ,1,5/4,8/5,2
        // ,1,8/7,7/4,2
        // ,1,9/8,16/9,2
        // ,1,11/8,16/11,2
        // ,1,16/13,13/8,2

        //1,1.2,1.5,1.8,2.25,2.7,3.375,4.05,5.0625

        // (1/3)/9, (1/3)/7, (1/3)/5, (1/3)/3, 1/3, 1, 5/3, 7/3, 9/3
        // ,1/9,    1/7,     1/5,      1/3,    1,   3, 5,   7,   9
        // ,3/9,    3/7,     3/5,      3/3,    3,   9, 15,  21,  27

        //1,1.1111111111111112, 1.25, 1.3333333333333333, 1.5, 1.6666666666666667, 1.7777777777777777, 2
        //1, 1.1111111111111112, 1.25, 1.3333333333333333, 1.4814814814814816, 1.6666666666666667, 1.777777777777778, 2

        // 1.3499999999999999
        // ,1.5
        // ,1.6874999999999998
        // ,1.7999999999999998
        // ,2
        // ,2*1.125
        // ,2*1.2
        // ,0,0

        // ,1.423828125
        // ,1.58203125
        // ,1.77978515625
        // ,1.8984375
        // ,2*1.0546875
        // ,2*1.1865234375
        // ,2*1.265625
        // ,0,0

        //1,2,3/2,4/3,5/3,5/4,6/5,7/4,7/5,7/6
        //1,2,3/2,5/4,7/4,9/8,11/8,13/8
        //1,9/8,5/4,1.40625,3/2,1.6875,15/8,2

        //Escala Pitagórica: (Gerador *= 1.5)
        //1, 1.125, 1.265625, 1.3333333333333333, 1.5, 1.6875, 1.7777777777777777, 2,0
        //Escala Pitagórica Versão pentatônica:
        //1, 1.125, 1.265625, 1.5, 1.6875, 2

        //Escala Pitagórica Invertida: (Gerador /= 1.5)
        //,1,1.125, 1.265625, 1.3333333333333335, 1.5, 1.6875, 1.8984375, 2

        //Escala gerador 4/3
        //1, 1.125, 1.265625, 1.33333, 1.5, 1.6875, 1.8984375, 2

        // 1,10/9, 5/4, 4/3, 3/2, 5/3, 15/8, 2,0
        // ,1.125*1,1.125*10/9, 1.125*5/4, 1.125*4/3, 1.125*3/2, 1.125*5/3, 1.125*15/8, 1.125*2,0
        // ,1.25*1,1.25*10/9, 1.25*5/4, 1.25*4/3, 1.25*3/2, 1.25*5/3, 1.25*15/8, 1.25*2,0
        // ,(4/3)*1,(4/3)*10/9,(4/3)* 5/4, (4/3)*4/3, (4/3)*3/2, (4/3)*5/3, (4/3)*15/8, (4/3)*2,0
        // ,1.5*1,1.5*10/9, 1.5*5/4, 1.5*4/3, 1.5*3/2, 1.5*5/3, 1.5*15/8, 1.5*2,0

        //August temperament
        // (296.011+1200)/1200,
        // (400+1200)/1200,
        // (488.032+1200)/1200,
        // (592.021+1200)/1200,
        // (696.011+1200)/1200,
        // (800+1200)/1200,
        // 1.758375,//(888.032+1200)/1200,
        // 1.86675,//(992.021+1200)/1200,
        // 1.975,//(1096.011+1200)/1200,
        // 2.0833325,//(1200+1200)/1200,
        // (88.032+2400)/1200,
        // 2.4934//(192.021+2400)/1200,

        // 1,1.069510852527154, 1.128355339633198, 1.197866192160352, 1.2673777131317887, 1.3368885656589427, 1.4104508589843259, 1.4973820379662985 //, 1.5842129503058469, 1.6711100386293953, 1.663110765896775, 2.000038769768404
        // ,1.5780337699226763452737888590816,
        // 1.6695884464479505801819851406628,
        // 1.7724211272598369372562920950018,
        // 1.8700327255726975222066386161758,
        // 2
        // 1,
        // //1.069510852527154,
        // 9/8,
        // 6/5,//1.197866192160352,
        // //5/4,
        // 4/3,
        // //1.4104508589843259,
        // 3/2,
        // //1.5780337699226763452737888590816,
        // 5/3,
        // 16/9,
        // //15/8,
        // 2

        //1,10/9, 1.2500000000000002, 1.3333333333333333, 1.5, 1.666666666, 1.875, 2
        //,2*10/9, 2*1.2500000000000002, 2*1.3333333333333333, 2*1.5, 2*1.666666666, 2*1.875, 2*2

        // |--|--|--|--|--|--|--|--|
        //16/15,6/5,4/3,8/5,2,2.4

        //16/16,16/15,16/14,16/13,16/12,16/11,16/10,16/9,16/8
        //10/10,10/9,10/8,10/7,10/6,10/5
        //1.06666666,1.3333, 1.6, 1.777777777,2
        //1, 1.272727272727, 1.5, 2

        //1,1.125,1.2,1.25,1.333333,1.5,1.6666666,1.7777777,1.875,
        //  1, 1.025, 1.05, 1.16, 1.21, 1.26, 1.31,0,0,
        //  1,1.25,1.5,1.875,2,0,0,0,0

        // 1,1.125, 1.25, 1.375, 1.5, 1.625, 1.75, 1.875, 2,
        // (1.125)*1,(1.125)*1.125, (1.125)*1.25, (1.125)*1.375, (1.125)*1.5, (1.125)*1.625, (1.125)*1.75, (1.125)*1.875, (1.125)*2,
        // (1.25)*1,(1.25)*1.125, (1.25)*1.25, (1.25)*1.375, (1.25)*1.5, (1.25)*1.625, (1.25)*1.75, (1.25)*1.875, (1.25)*2
        //1, 1.125, 1.25, 1.125, 1.265625, 1.40625, 1.265625, 1.423828125, 1.58203125,
        //1, 1.125, 1.25, 1.4063, 1.5625, 1.757875, 1.953125, 2.19734375

        //4/3,5/4,6/5,7/6,8/7,9/8,10/9

        //EDO 53
        // //1,9,17,22,31,40,48
        // 1,
        // //Math.pow(Math.pow(2,1/53),2),
        // //Math.pow(Math.pow(2,1/53),3),
        // //Math.pow(Math.pow(2,1/53),4),
        // //////////Math.pow(Math.pow(2,1/53),5),
        // //Math.pow(Math.pow(2,1/53),6),
        // //Math.pow(Math.pow(2,1/53),7),
        // //Math.pow(Math.pow(2,1/53),8),
        // Math.pow(Math.pow(2,1/53),9),
        // //Math.pow(Math.pow(2,1/53),10),
        // //Math.pow(Math.pow(2,1/53),11),
        // //Math.pow(Math.pow(2,1/53),12),
        // //////////Math.pow(Math.pow(2,1/53),13),
        // //Math.pow(Math.pow(2,1/53),14),
        // //Math.pow(Math.pow(2,1/53),15),
        // //Math.pow(Math.pow(2,1/53),16),
        // Math.pow(Math.pow(2,1/53),17),
        // //Math.pow(Math.pow(2,1/53),18),
        // //Math.pow(Math.pow(2,1/53),19),
        // //Math.pow(Math.pow(2,1/53),20),
        // //Math.pow(Math.pow(2,1/53),21),
        // Math.pow(Math.pow(2,1/53),22),
        // //Math.pow(Math.pow(2,1/53),23),
        // //Math.pow(Math.pow(2,1/53),24),
        // //Math.pow(Math.pow(2,1/53),25),
        // //////////Math.pow(Math.pow(2,1/53),26),
        // //Math.pow(Math.pow(2,1/53),27),
        // //Math.pow(Math.pow(2,1/53),28),
        // //Math.pow(Math.pow(2,1/53),29),
        // //Math.pow(Math.pow(2,1/53),30),
        // Math.pow(Math.pow(2,1/53),31),
        // //Math.pow(Math.pow(2,1/53),32),
        // //Math.pow(Math.pow(2,1/53),33),
        // //Math.pow(Math.pow(2,1/53),34),
        // //Math.pow(Math.pow(2,1/53),35),
        // //////////Math.pow(Math.pow(2,1/53),36),
        // //Math.pow(Math.pow(2,1/53),37),
        // //Math.pow(Math.pow(2,1/53),38),
        // //Math.pow(Math.pow(2,1/53),39),
        // Math.pow(Math.pow(2,1/53),40),
        // //Math.pow(Math.pow(2,1/53),41),
        // //Math.pow(Math.pow(2,1/53),42),
        // //Math.pow(Math.pow(2,1/53),43),
        // //////////Math.pow(Math.pow(2,1/53),44),
        // //Math.pow(Math.pow(2,1/53),45),
        // //Math.pow(Math.pow(2,1/53),46),
        // //Math.pow(Math.pow(2,1/53),47),
        // Math.pow(Math.pow(2,1/53),48),
        // //Math.pow(Math.pow(2,1/53),49),
        // //Math.pow(Math.pow(2,1/53),50),
        // //Math.pow(Math.pow(2,1/53),51),
        // //Math.pow(Math.pow(2,1/53),52),
        // 2,

        // //Escala diatônica Maior
        // 1, 1.125, 1.25, 1.3333333333333333, 1.5, 1.6666666666666667, 1.875, 2,0
        // //Escala diatônica Menor
        // ,1,1.125, 1.2, 1.35, 1.5, 1.6, 1.8, 2,0

        //JI Limit-3
        //1, 9/8, 4/3, 3/2, 16/9 , 2

        //JI Limit-5
        //1, 16/15, 6/5, 5/4, 8/5, 5/3, 15/8, 2

        //JI Limit-7
        //1, 8/7, 7/6, 9/7, 7/5, 10/7, 14/9, 12/7, 7/4, 2
        //8/7, 10/7,  12/7, //M
        //1, 1.125, 1.25, 1.3333333333333, 1.5, 1.6666666666666667, 1.875015625, 2,0, //8/7,  9/7,10/7, 14/9, 12/7,1.9047619047619047619047619047619, 2.142875, 2*8/7, //M
        //7/6,7/5,7/4, //m
        //1, 1.1020408163265307, 1.2, 1.3333333333333333, 1.5, 1.6, 1.8, 2 //7/6,9/7,7/5,14/9,7/4,1.866666, 2.1, 2*7/6 //escalinha
        //1,  9/7, 14/9, 2

        //JI LIMIT-11
        //1, 14/11, 11/8, 16/11, 11/7, 2

        //JI Limit-13
        //1, 16/13, 13/8, 2

        // (1)*1, (1)*1.125, (1)*1.25,
        // (4/3)*1, (4/3)*1.125, (4/3)*1.25,
        // (16/9)*1, (16/9)*1.125, (16/9)*1.25,
        // (64/27)*1, (64/27)*1.125, (64/27)*1.25,
        // (256/81)*1, (256/81)*1.125, (256/81)*1.25,
        // (1024/243)*1, (1024/243)*1.125, (1024/243)*1.25,
        //1/8,1/9,1/10,1/11,1/12,1/13,1/14,1/15,1/16
        //,1,9,10,11,12,13,14,15,16

        //4/4,5/4,6/4,7/4,2
        //1,8/7,8/6,8/5,2,16/7,0,0,0
        // 1, Math.pow(1.5,2)/2,Math.pow(1.5,4)/4,Math.pow(1.5,6)/8,Math.pow(1.5,1),Math.pow(1.5,3)/2,Math.pow(1.5,5)/4,2,1.125*2,0,
        // 1,9/8,5/4,4/3,3/2,5/3,16/9,2
        //1,8/7,5/4,4/3,3/2,8/5,7/4,2

        // 1.25
        // ,1.3333
        // ,1.406
        // ,1.5
        // ,1.563
        // ,1.667
        // ,1.778
        // ,1.875
        // ,2
        // ,2.083
        // ,2.22222
        // ,2.344
        // ,1.25*2

        //Derivative 12tone
        //1,16/15, 9/8, 6/5, 5/4, 4/3, 64/45, 3/2, 8/5, 5/3, 16/9, 15/8, 2

        // 1, 1.25, 1.5
        // ,16/15, 16/15* 1.25, 16/15 * 1.5
        // ,9/8, 9/8* 1.25, 9/8 * 1.5
        // ,6/5, 6/5* 1.25, 6/5 * 1.5
        // ,5/4, 5/4* 1.25, 5/4 * 1.5
        // ,4/3, 4/3* 1.25, 4/3 * 1.5
        // , 25/18,  25/18* 1.25,  25/18 * 1.5
        // , 3/2,  3/2* 1.25,  3/2 * 1.5

        // 1,9/8, 5/4, 45/32, 3/2, 27/16, 15/8, 2,0
        // ,1,16/15,6/5,4/3,3/2,8/5,9/5,2

        //1,16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 27/16, 9/5, 15/8, 2,0

        //1, 6/5,45/32,  8/5, 8/5*10/9
        //1, 6/5, 45/32,1.609325408935547 //8/5, 16/9

        /*
1.2
1.171875,
1.1444091796875,
1.117587089538574
1.091393642127514
1.06581410364015
1.040834085586084
*/
        // 1,
        // 1.2,
        // 1.2 * 1.171875,
        // 1.2 * 1.171875 * 1.1444091796875,
        // 1.2 * 1.171875 * 1.1444091796875 * 1.117587089538574,
        // 1.2 * 1.171875 * 1.1444091796875 * 1.117587089538574 * 1.091393642127514,
        // 1.2 * 1.171875 * 1.1444091796875 * 1.117587089538574 * 1.091393642127514 * 1.06581410364015,
        // 1.2 * 1.171875 * 1.1444091796875 * 1.117587089538574 * 1.091393642127514 * 1.06581410364015 * 1.040834085586084,

        //5/5,6/5,/*7/5,*/8/5,9/5,10/5,//11/5,12/5,13/5
        //6/6, /*7/6,*/ 8/6, 9/6, 10/6, /*11/6,*/ 12/6,
        ///*7/7,*/8/7,9/7,10/7,/*11/7,*/12/7/*,13/7,14/7*/,16/7
        //8/8,9/8,10/8,/*11/8,*/12/8,/*13/8,14/8,*/15/8,16/8
        //9/9,10/9/*,11/9*/,12/9/*,13/9,14/9*/,15/9,16/9/*,17/9*/,18/9
        //10/10,12/10,15/10,16/10,18/10,20/10
        //12/12,14/12,15/12,16/12,18/12,20/12,21/12,24/12
        //1,16/15, 10/9, 6/5, 5/4, 4/3, 25/18, 3/2, 8/5, 5/3, 16/9, 15/8, 2
        // ,2*16/15, 2*10/9, 2*6/5, 2*5/4, 2*4/3, 2*25/18, 2*3/2, 2*8/5, 2*5/3, 2*16/9, 2*15/8, 2

        ///*1,2,3,4,5,6,7,8,9,10,11,*/12/12,13/12,14/12,15/12,16/12,17/12,18/12,19/12,20/12,21/12,22/12,23/12,24/12/*,25,26,27,28*/
        //3,6,9,12,15,18,21,24,27

        //Grave fica legal
        //12/12,13/12,14/12,15/12,16/12,17/12,18/12,19/12,20/12//,21/12,22/12,23/12,24/12
        //,4/3*12/12, 4/3*13/12, 4/3*14/12, 4/3*15/12, 4/3*16/12, 4/3*17/12, 4/3*18/12, 4/3*19/12, 4/3*20/12//,21/12,22/12,23/12,24/12
        //16/16, 17/16, 18/16, 19/16, 20/16, 21/16, 22/16, 24/16, 26/16, 27/16, 28/16, 30/16, 32/16

        // Math.pow(1.618033,0)
        // ,Math.pow(1.618033,3)
        // ,Math.pow(1.618033,6)
        // ,Math.pow(1.618033,9)
        // ,Math.pow(1.618033,12)
        // ,Math.pow(1.618033,15)
        // ,Math.pow(1.618033,18)
        // ,Math.pow(1.618033,21)
        // ,Math.pow(1.618033,24)
        // ,Math.pow(1.618033,27)
        // ,Math.pow(1.618033,30)
        // ,Math.pow(1.618033,33)
        // ,Math.pow(1.618033,36)

        //1,  1.5, 1.5 * 1.5
        //4/3, 4/3*1.25, 4/3 * 1.5,

        // Math.pow(1.25,0),
        // Math.pow(1.25,1),
        // Math.pow(1.25,36),
        // Math.pow(1.25,1+0),
        // Math.pow(1.25,1+1),
        // Math.pow(1.25,1+36),
        // Math.pow(1.25,2+0),
        // Math.pow(1.25,2+1),
        // Math.pow(1.25,2+36),
        // Math.pow(1.25,3+0),
        // Math.pow(1.25,3+1),
        // Math.pow(1.25,3+36),

        //3/24, 3/23, 3/22, 3/21, 3/20, 3/19, 3/18, 3/17, 3/16, 3/15, 3/14, 3/13, 4, //3/11, 3/10, 3/9, 3/8, 3/7, 3/6, 3/5, 3/4, 3/3,3/2,3,4,5,6,7,8
        //4/8, 4/7, 4/6, 4/5, 4/4,
        // 5/10, 5/9, 5/8, 5/7, 5/6, 5/5,
        //6/12, 6/11, 6/10, 6/9, 6/8, 6/7, 6/6,0,0,
        //7/14, 7/13, 7/12, 7/11, 7/10, 7/9, 7/8, 7/7
        //8/16, 8/15, 8/14, 8/13, 8/12, 8/11, 8/10, 8/9, 8/8
        //,9/18, 9/17, 9/16, 9/15, 9/14, 9/13, 9/12, 9/11, 9/10, 9/9
        //12/24, 12/23, 12/22, 12/21, 12/20, 12/19, 12/18, 12/17, 12/16, 12/15, 12/14, 12/13, 4

        //1,2,3,5,8,13,21,34
        //1, 1.066666666, 1.111111, 1.2, 1.25, 1.3333333, 1.38888875, 1.5, 1.5625, 1.6,  1.666666, 1.8, 1.875,
        //2, 2*1.066666666, 2*1.111111, 2*1.2, 2*1.25, 2*1.3333333, 2*1.38888875, 2*1.5, 2*1.5625, 1.6,  1.666666, 1.8, 1.875, 2,0,0,0

        // 1,  5/4, 3/2,
        //  8/6,5/3,2,
        //  13/12, 13/10, 13/8,
        //  21/20, 21/16,
        //  34/32,34/24, 8/5,   34/20,34/26, 34/21,
        //      21/13, 2

        //Famílias Overtones
        //1, 3/2, 2,
        //,1, 4/3, 2,
        //1, 5/4, 5/3, 2,
        //,1, 6/5, 6/4, 6/3
        //1, 7/6, 7/5, 7/4, 2
        //1, 8/7, 8/6, 8/5, 2
        //1, 9/8, 9/7, 9/6, 9/5, 2
        //1, 10/9, 10/8, 10/7, 10/6, 2
        //1, 11/10, 11/9, 11/8, 11/7, 11/6, 2
        //,1, 12/11, 12/10, 12/9, 12/8, 12/7, 2
        //1, 13/12, 13/11, 13/10, 13/9, 13/8, 13/7, 2
        //1, 14/13, 14/12, 14/11, 14/10, 14/9, 14/8, 2

        //Geradores Normalizados
        //1, 1.125, 1.265625, 1.423828125, 1.5, 1.6875, 1.8984375 (3/2)
        //1, 1.0534976497751514153817100885416, 1.1851848562963045185185, 1.3333333, 1.4046635329984186321831084042094,  1.5802464750577887418370123182716,  1.7777777, (4/3)
        //1, 1.220703125, 1.25, 1.52587890625, 1.5625, 1.9073486328125, 1.953125 (5/4)
        //1, 1.157407407, 1.3395919, 1.3888888888, 1.607510287, 1.66666666, 1.9290123456,   //(5/3)
        //1, 1.0368, 1.2, 1.24416, 1.44, 1.492992, 1.728,    //(6/5)
        //1, 1.0806970, 1.166666666,  1.26081318, 1.361111111111, 1.587962962, 1.85262345,   //(7/6)

        //1, 1.125, 1.265625, 1.423828125, 1.601806640625, 1.802032470703125

        //GregTom2 https://www.youtube.com/watch?v=1EP0KvbxW8o
        // Math.pow(2,0/118),
        // Math.pow(2,7/118),
        // Math.pow(2,11/118), //Minor second
        // Math.pow(2,17/118),
        // Math.pow(2,21/118), //Second
        // Math.pow(2,27/118),
        // Math.pow(2,31/118), //Minor third
        // Math.pow(2,34/118),
        // Math.pow(2,38/118), //Major third
        // Math.pow(2,49/118), //Fourth
        // Math.pow(2,59/118), //Flat fifth
        // Math.pow(2,69/118), //Fifth
        // Math.pow(2,76/118),
        // Math.pow(2,80/118), //Flat sixth
        // Math.pow(2,87/118), //Sixth
        // Math.pow(2,97/118), //Flat seventh
        // Math.pow(2,107/118), //Seventh
        // Math.pow(2,114/118),
        // Math.pow(2,118/118), //Octave

        // 1, 2, 3, 4, 5, 6, 7, 8, 9,
        // 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5
        // ,1.25, 2.25, 3.25, 4.25, 5.25, 6.25
        //7, 8, 9, 10, 11, 12, 13, 14
        //,7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5, 15.5
        //1, 1.0534977777777779, 1.125, 1.185185, 1.265625, 4/3, 1.4238283474731792, 1.5, 1.601806640625, 1.5802469135802468, 1.6875, 1.777777, 1.8984375

        //Comma: 1,0136432647705078125
        //1, 1.125, 1,265625, 1,423828125, 1,601806640625, 1,802032470703125, 2,027286529541015625
        //1, 1.1098579146132872698944944029535, 1.2485901539399481786313062033227, 1.404663923182441700960219478738, 1.5802469135802469135802469135802, 1.77777, 2

        //1, 1.1096513271331787109375, 1.2483577430248260498046875, 1.4044024609029293060302734375, 1.5799527685157954692840576171875, 1.7774468645802699029445648193359,   2

        //8/8, 9/8, 10/8, 11/8, 12/8, 13/8, 14/8, 16/8, 0,
        //16/16, 16/15, 16/14, 16/13, 16/12, 16/11, 16/10, 16/9, 16/8

        //1, 1.0625, 1.125, 1.25, 1.5, 0, 0, 0,0,
        //4/3, 1.6, 16/9, 1.8823529411764706, 2

        //1, 1.25, 1.5, 1.75, 2, 1, 1.166666666, 1.3333333, 1.5, 1.6666666, 1.83333333, 2, 1, 1.2, 1.4, 1.6, 1.8, 2
        //2, 2.25, 2.5, 2.75, 3
        //1, 9/8, 5/4, 11/8, 3/2, 13/8, 7/4, 15/8, 2
        // 12/12, 14/12, 16/12, 18/12, 20/12, 22/12, 24/12
        //18/18, 20/18, 22/18, 24/18, 26/18, 28/18, 30/18, 32/18, 34/18, 36/18
        //18/9, 18/10, 18/11, 18/12, 18/13, 18/14, 18/15, 18/16, 18/17, 18/18
        // 0,9863567352294921875
        //3, 4, 5
        //1, 1.125, 1.265625, 1.5, 1.6875, 1.8984375, 2.25, 2.53125, 2.84765625, 3
        //Gerador 18/17
        //1.03755 = 83/80 Aporx 28/27
        //8,1,9,10,11,12,13,14,15,16,17,18,19

        // 1, 1.5,
        // 1.125, 1.6875,
        // 1.25, 1.875,
        // 1.375, 1.03125,
        // 1.5, 1.125,
        // 1.625, 1.21875,
        // 1.75, 1.3125,
        // 1.875, 1.40625

        // 1, 1.25, 1.5,
        // 1.125, 1.40625, 1.6875,
        // 1.25, 1.5, 1.875,
        // //4/3, 5/3, 2
        // //1.35, 1.6875, 2.025
        // 1.40625, 1.40625*1.25, 1.40625*1.5

        //1
        //1.125
        //1.25
        //1.40625
        //1.5
        //1.6875
        // 1.875
        // ,2
        // ,2.25
        // ,2.5
        // ,2.8125
        // ,3
        // ,1.6875*2

        // /*1.125*/ 1, 1.1111111111111112, 1.25, 1.3333333333333333, 1.5, 1.6666666666666667, 1.7777777777777777,
        // ///*1.25*/ 1, 1.125, 1.2, 1.35, 1.5, 1.6, 1.8,
        // //*1.40625*/ 1, 1.0666666666666667, 1.2, 1.3333333333333333, 1.4222222222222223, 1.6, 1.7777777777777777 ,
        // /*1.5*/ 1, 1.125, 1.25, 1.3333333333333333, 1.5, 1.6666666666666667, 1.875,
        // ///*1.6875*/ 1, 1.1111111111111112, 1.1851851851851851, 1.3333333333333333, 1.4814814814814814, 1.6666666666666667, 1.7777777777777777,
        // ///*1.875*/ 1, 1.0666666666666667, 1.2, 1.3333333333333333, 1.5, 1.6, 1.8,

        //Campo harmonico
        // Math.pow(2, (0)/12)
        // ,Math.pow(2, (4)/12)
        // ,Math.pow(2, (7)/12)

        // ,Math.pow(2, (2+0)/12)
        // ,Math.pow(2, (2+3)/12)
        // ,Math.pow(2, (2+7)/12)

        // ,Math.pow(2, (4+0)/12)
        // ,Math.pow(2, (4+3)/12)
        // ,Math.pow(2, (4+7)/12)

        // ,Math.pow(2, (5+0)/12)
        // ,Math.pow(2, (5+4)/12)
        // ,Math.pow(2, (5+7)/12)

        // ,Math.pow(2, (7+0)/12)
        // ,Math.pow(2, (7+4)/12)
        // ,Math.pow(2, (7+7)/12)

        // ,Math.pow(2, (9+0)/12)
        // ,Math.pow(2, (9+3)/12)
        // ,Math.pow(2, (9+7)/12)

        // ,Math.pow(2, (11+0)/12)
        // ,Math.pow(2, (11+3)/12)
        // ,Math.pow(2, (11+6)/12)

        // ,Math.pow(2, (12+0)/12)
        // ,Math.pow(2, (12+4)/12)
        // ,Math.pow(2, (12+7)/12)

        // 1,
        // 9/8,
        // 5/4,
        // 4/3,
        // 3/2,
        // 5/3,
        // 15/8,0,0,

        // 16/15,
        // 6/5,
        // 4/3,
        // 1.42222222222222,
        // 8/5,
        // 16/9,
        // 2, 0,0,

        // 9/8,
        // 5/4,
        // 1.42222222222222,
        // 1.5,
        // 5/3,
        // 15/8,
        // 2*16/15,0,0,

        // 5/4,
        // 1.42222222222222,
        // 3/2,
        // 5/3,
        // 15/8,
        // 2*16/15,
        // 2*6/5

        //Carl Lumma’s VRWT temperament
        //http://ripnread.com/?page_id=25
        // 1,
        // 18/17,
        // 9/8,
        // 19/16,
        // 323/256,
        // 171/128,
        // 24/17,
        // 3/2,
        // 27/17,
        // 27/16,
        // 57/32,
        // 513/272,
        // 2

        // Math.pow(2, 0/53)
        // ,Math.pow(2, 9/53)
        // ,Math.pow(2, 17/53)
        // ,Math.pow(2, 22/53)
        // ,Math.pow(2, 31/53)
        // ,Math.pow(2, 39/53)
        // ,Math.pow(2, 48/53)
        // ,Math.pow(2, 53/53),0

        // ,Math.pow(2, (9+0)/53)
        // ,Math.pow(2, (9+9)/53)
        // ,Math.pow(2, (9+17)/53)
        // ,Math.pow(2, (9+22)/53)
        // ,Math.pow(2, (9+31)/53)
        // ,Math.pow(2, (9+39)/53)
        // ,Math.pow(2, (9+48)/53)
        // ,Math.pow(2, (9+53)/53),0

        // ,Math.pow(2, (17+0)/53)
        // ,Math.pow(2, (17+9)/53)
        // ,Math.pow(2, (17+17)/53)
        // ,Math.pow(2, (17+22)/53)
        // ,Math.pow(2, (17+31)/53)
        // ,Math.pow(2, (17+39)/53)
        // ,Math.pow(2, (17+48)/53)
        // ,Math.pow(2, (17+53)/53),0

        //53 ET
        // 1
        // // ,1.0131641430249148
        // // ,1.02650158071141
        //  ,1.040014594335196
        //  //,1.0537054952030234
        //  ,1.0675766250480145
        // // ,1.0816303564302026
        // // ,1.0958690931423392
        // // ,1.1102952706210487
        //  ,1.1249113563633906
        // // ,1.1397198503489092
        // // ,1.1547232854672367
        // // ,1.169924227951327
        // // ,1.1853252778163912
        //  ,1.200929069304613
        // // ,1.2167382713357167
        // // ,1.2327555879634677
        //  ,1.2489837588381818
        // // ,1.2654255596753232
        // // ,1.282083802730272
        // // ,1.29896133727934
        // // ,1.3160610501071197
        //  ,1.3333858660002496
        //  //,1.3509387482476765
        // // ,1.3687226991475083
        // // ,1.3867407605205335
        //  ,1.4049960142305051
        // // ,1.4234915827112706
        // // ,1.442230629500844
        // // ,1.461216359782506
        // // ,1.4804520209330283
        //  ,1.4999409030781148
        // // ,1.519686339655155
        // // ,1.5396917079833847
        //  ,1.5599604298415533
        // // ,1.5804959720531948
        //  ,1.601301847079605
        // // ,1.622381613620621
        // // ,1.6437388772233152
        //  ,1.6653772908986955
        //  ,1.6873005557465313
        // // ,1.7095124215883966
        // // ,1.7320166876090548
        //  ,1.7548172030062796
        // // ,1.777917867649235
        //  ,1.8013226327455212
        // // ,1.8250355015169994
        // // ,1.849060529884516
        //  ,1.8734018271616406
        // // ,1.8980635567575332
        // // ,1.923049936889068
        //  ,1.9483652413023287
        // // ,1.9740138000036054
        // ,2

        //a + b + c = L : b/a = phi c/b = phi
        //32.5; 20.086; 12.4140;
        //1/(32.5/65), 1/(20.086/65), 1/(12.4140/65)

        //Fibonacci Limit 8
        // 2/3, 2/5, 2/8,
        // 3/2, 3/5, 3/8,
        // 5/2, 5/3, 5/8,
        // 8/2, 8/3, 8/5
        //--- Normalizado----
        // 1
        // ,1.2
        // ,1.25
        // ,1.3333333333333333
        // ,1.5
        // ,1.6
        // ,1.6666666666666667
        // ,2

        //Fibonacci Limit 13
        // 2/3, 2/5, 2/8, 2/13,
        // 3/2, 3/5, 3/8, 3/13,
        // 5/2, 5/3, 5/8, 5/13,
        // 8/2, 8/3, 8/5, 8/13,
        // 13/2, 13/3, 13/5, 13/8
        //--- Normalizado----
        // 1
        // ,1.0833333333333333
        // ,1.2
        // ,1.2307692307692308
        // ,1.25
        // ,1.3
        // ,1.3333333333333333
        // ,1.5
        // ,1.5384615384615385
        // ,1.6
        // ,1.625
        // ,1.6666666666666667
        // ,1.8461538461538463
        // ,2
        // 1, 1.2, 1.25, 1.5
        // ,1.0833333333333333, 1.3, 1.625
        // ,1.2307692307692308, 1.5384615384615385, 1.8461538461538463
        // ,1.333333, 1.6, 1.666666, 2

        //http://www.huygens-fokker.org/bpsite/833cent.html
        // 1
        // ,1.059
        // ,1.1459
        // ,1.2361
        // ,1.309
        // ,1.412
        // ,1.5279
        // ,1.618
        // //Extenção da escala
        // ,1.713462
        // ,1.8540662
        // //,2.0000098000000004

        //N * 13/12 * 14/13 * ...
        // 1
        // ,1.0833333333333333
        // ,1.1666666666666667
        // ,1.25
        // ,1.3333333333333335
        // ,1.4166666666666667
        // ,1.5000000000000002
        // ,1.5833333333333335
        // ,1.666666666666667
        // ,1.7500000000000004
        // ,1.8333333333333337
        // ,1.9166666666666672
        // ,2.0000000000000004
        // 1,
        // 1*2/1,
        // 1*2/1*3/2,
        // 1*2/1*3/2*4/3,
        // 1*2/1*3/2*4/3*5/4,

        //,1.618033
        // 1,
        // 1.618033,
        // 1.618033*1.618033,
        // 1.618033*1.618033*1.618033,
        // 1.618033*1.618033*1.618033*1.618033,

        //(1/1),
        //(1/2),

        //3,4,5,6,
        //1/3, 1/4, 1/5, 1/6

        //1, 1.4907407405, 1.5,

        // 1
        // ,1.0666666666666667
        // ,1.125
        // ,1.1851851851851851
        // ,1.25
        // ,1.3333333333333333
        // ,1.42222222222222
        // ,1.5
        // ,1.6
        // ,1.6875
        // ,1.7777777777777777
        // ,1.875
        // ,2
        // ,2.1333333
        // ,2.25
        // ,2.4
        // ,2.53125
        // ,2.6666666
        // ,2.8125
        // ,3

        // 1,
        // 1.066666666,
        // 1.11111111,
        // 1.185185185,
        // 1.25,
        // 1.3333333333,
        // 1.422222222,
        // 1.5,
        // 1.6,
        // 1.66666666,
        // 1.7777777,
        // 1.875,
        // 2

        // Math.log2(1),
        // Math.log2(1.2),
        // Math.log2(1.25),
        // Math.log2(1.3333333),
        // Math.log2(1.5),
        // Math.log2(2),
        //Math.pow(2,0),
        // Math.pow(2,0.2630344058337938),
        // Math.pow(2,0.32192809488736235),
        // Math.pow(2,0.4150374632114674),
        // Math.pow(2,0.5849625007211562),
        //Math.pow(2,1),

        //3,4,5
        //1,2,
        //3/2,
        //4/3,
        //5/4, 5/3,
        //6/5,
        //7/6, 7/5, 7/4
        //9/8, 9/7, 9/6, 9/5,
        //12/11, 12/10, 12/9, 12/8, 12/7, 12/6,
        //30/29, 30/28, 30/27, 30/26, 30/25, 30/24, 30/23, 30/22, 30/21, 30/20, 30/19, 30/18, 30/17, 30/16, 30/15

        //15/15, 16/15, 17/15, 18/15, 19/15, 20/15, 21/15, 22/15, 23/15, 24/15, 25/15, 26/15, 27/15, 28/15, 29/15

        //Ciclo 5
        // 1
        // ,1.06787109375
        // ,1.125
        // ,1.20135498046875
        // ,1.265625
        // ,1.3515243530273438
        // ,1.423828125
        // ,1.5
        // ,1.601806640625
        // ,1.6875
        // ,1.802032470703125
        // ,1.8984375
        // ,2.0272865295410157

        //Ciclo 4
        // 1
        // ,1.0534979423868311
        // ,1.1098579146132868
        // ,1.1851851851851851
        // ,1.2485901539399478
        // ,1.3333333333333333
        // ,1.4046639231824414
        // ,1.4798105528177157
        // ,1.5802469135802468
        // ,1.6647868719199304
        // ,1.7777777777777777
        // ,1.8728852309099218
        // ,1.9730807370902874

        //Media Ciclo 4 e 5
        // 1
        // ,1.06068451806841555
        // ,1.1174289573066434
        // ,1.19327008282696755
        // ,1.2571075769699739
        // ,1.34242884318033855
        // ,1.4142460240912207
        // ,1.48990527640885785
        // ,1.5910267771026234
        // ,1.6761434359599652
        // ,1.78990512424045135
        // ,1.8856613654549609
        // ,2

        //Triade Gerador 5/3
        //1, 1.2461850531623906, 1.4954220637948685

        //Primeiras 19 notas do gerador 5/3
        // 1
        // ,1.0384875443019923
        // ,1.0767038859323053
        // ,1.116326588934614
        // ,1.1574074074074077
        // ,1.2019531762754543
        // ,1.2461850531623906
        // ,1.2920446631187663
        // ,1.3395919067215367
        // ,1.388888888888889
        // ,1.4423438115305451
        // ,1.4954220637948685
        // ,1.5504535957425194
        // ,1.607510288065844
        // ,1.6666666666666667
        // ,1.730812573836654
        // ,1.794506476553842
        // ,1.8605443148910232
        // ,1.929012345679013
        // ,2

        //1, 1.25, 1.5, 1.75, 2, 2*1.25, 2*1.5, 2*1.75, 2*2,
        //1, 1.5, 2, 2.5, 3, 3*1.5, 3*2, 3*2.5, 3*3
        //1, 3, 5, 7, 9, 11, 13, 15, 0,
        //1, 1/3, 1/5, 1/7, 1/9, 1/11, 1/13, 1/15

        // 1,   1/2, 1/3,0,0,0,0,0,0,
        // 3/2, 3/3, 3/4,0,0,0,0,0,0,
        // 5/4, 5/5, 5/6,0,0,0,0,0

        //EDL - Equal division of length => N/N, N+1/N, N+2/N, ... N+N/N
        // 6/6, 7/6, 8/6, 9/6, 10/6, 11/6, 12/6, 0,0,
        // 1, Math.pow(2,1/6),  Math.pow(2,2/6),  Math.pow(2,3/6),   Math.pow(2,4/6),  Math.pow(2,5/6), 2

        //2/2, 2/1,
        //3/3, 3/2, 3/1,
        //4/4, 4/3, 4/2, 4/1,
        //5/5, 5/4, 5/3, 5/2, 5/1,
        //6/6, 6/5, 6/4, 6/3, 6/2, 6/1,
        //7/7, 7/6, 7/5, 7/4, 7/3, 7/2, 7/1,
        //8/8, 8/7, 8/6, 8/5, 8/4, 8/3, 8/2, 8/1,
        //9/9, 9/8, 9/7, 9/6, 9/5, 9/4, 9/3, 9/2, 9/1,
        //10/10, 10/9, 10/8, 10/7, 10/6, 10/5,
        //11/11, 11/10, 11/9, 11/8, 11/7, 11/6,
        //12/12, 12/11, 12/10, 12/9, 12/8, 12/7,

        //20/20, 20/19, 20/18, 20/17, 20/16, 20/15, 20/14, 20/13, 20/12, 20/11
        //24/24, 24/23, 24/22, 24/21, 24/20, 24/19, 24/18, 24/17, 24/16, 24/15, 24/14, 24/13,
        //30/30, 30/29, 30/28, 30/27, 30/26, 30/25, 30/24, 30/23, 30/22, 30/21, 30/20, 30/19, 30/18, 30/17, 30/16

        //Escala baião derivado dá 20 EDL
        // 1
        // ,1.1111111111111112
        // ,1.1764705882352942
        // ,1.3333333333333333
        // ,1.6666666666666667

        // 1
        // ,1.0546875
        // ,1.125
        // ,1.25
        // //,1.265625
        // ,1.40625
        // ,1.5
        // ,1.6875
        // ,1.875
        // ,2

        //Expansão da escala
        // 1,
        //     1.0546875, 1.318359375, //1.58203125,
        //   1.125, 1.40625, 1.6875,
        //   1.171875, /*1.46484375,*/ 1.7578125,
        // 1.25, 1.5625, 1.875,
        //   1.40625, 1.7578125, 1.0546875,
        //     /*1.46484375,*/ //1.8310546875, //1.0986328125,
        // 1.5, 1.875, 1.125,
        //   1.5625, /*1.953125,*/ 1.171875,
        //     1.6875, 1.0546875, //1.265625,
        //     1.7578125, /*1.0986328125,*/ 1.318359375,
        // 1.875, 1.171875, 1.40625,
        //     //1.953125, /*1.220703125,*/ //1.46484375,
        // 2

        //Eagle 53
        //http://www.johnsmusic7.com/index.html
        //1, 1.067577, 1.124911, 1.200929, 1.248984, 1.333386, 1.404996, 1.499941, 1.601302, 1.665377, 1.801323, 1.873402, 2

        // 1,
        // Math.pow(2,1/5),
        // Math.pow(2,1/4),
        // Math.pow(2,1/3),
        // Math.pow(2,1/2),
        // 2,

        // 0.03333333333333333
        // ,0.034482758620689655
        // ,0.03571428571428571
        // ,0.037037037037037035
        // ,0.038461538461538464
        // ,0.04
        // ,0.041666666666666664
        // ,0.043478260869565216
        // ,0.045454545454545456
        // ,0.047619047619047616
        // ,0.05
        // ,0.05263157894736842
        // ,0.05555555555555555
        // ,0.058823529411764705
        // ,0.0625
        // ,0.06666666666666667

        //1,1.0344827586206897, 1.0714285714285714, 1.1111111111111112, 1.153846153846154, 1.2, 1.25, 1.3043478260869565, 1.3636363636363638, 1.4285714285714286, 1.5, 1.5789473684210527, 1.6666666666666665, 1.7647058823529411, 1.875,

        //PiScale
        //Originada pelos valores normalizados da sequencia
        //Math.pow(2, 1/Math.PI), Math.pow(2, 2/Math.PI), ...
        //Possui valores bem próximos de 22EDO
        // 1
        // ,1.0337503640712502
        // ,1.0665548629319561
        // ,1.100400362775978
        // ,1.1353198981895751
        // ,1.1713475520614622
        // ,1.2085184888491003
        // ,1.2468689889006384
        // ,1.2889512712251872
        // ,1.329854183551027
        // ,1.37205508772038
        // ,1.415595173534411
        // ,1.460516937890113
        // ,1.506864226259005
        // ,1.5546822754821001
        // ,1.6071533682947414
        // ,1.6581539412295527
        // ,1.7107729399418867
        // ,1.7650617227174745
        // ,1.8210732776193015
        // ,1.8788622742061083
        // ,1.9384851168921098
        // ,2

        //Sequencia harmoniosa
        // 2-Math.cos(((0* (90/3))*Math.PI/180)),
        // 2-Math.cos(((1* (90/3))*Math.PI/180)),
        // 2-Math.cos(((2* (90/3))*Math.PI/180)),
        // 2-Math.cos(((3* (90/3))*Math.PI/180)),

        //Acorde menor
        // 2-Math.cos(((0* (90/4))*Math.PI/180)),
        // 2-Math.cos(((1* (90/4))*Math.PI/180)),
        // 2-Math.cos(((2* (90/4))*Math.PI/180)),
        // 2-Math.cos(((3* (90/4))*Math.PI/180)),
        // 2-Math.cos(((4* (90/4))*Math.PI/180)),

        //Phi Spiral 1
        // 1,
        // Math.pow(PHI, 31),
        // Math.pow(PHI, 52),
        // Math.pow(PHI, 73),
        // Math.pow(PHI, 94),
        // Math.pow(PHI, 115),
        // Math.pow(PHI, 136),
        // Math.pow(PHI, 157),
        // Math.pow(PHI, 178),
        // Math.pow(PHI, 199),
        // Math.pow(PHI, 220),
        // Math.pow(PHI, 241),
        // Math.pow(PHI, 262),
        // Math.pow(PHI, 283),
        //Escala normalizada da espiral
        // 1
        // ,1.0722040642140198
        // ,1.1127587247450947
        // ,1.1964332262033575
        // ,1.2416866858349842
        // ,1.3350559959056876
        // ,1.3855526732743007
        // ,1.4354462623597775
        // ,1.4897400650262265
        // ,1.601761884735638
        // ,1.662346349629162
        // ,1.787347393398149
        // ,1.8549513777604896
        // //,1.994435462056465

        //Phi Spiral 2
        // Math.pow(PHI,39),
        // Math.pow(PHI,60),
        // Math.pow(PHI,81),
        // Math.pow(PHI,102),
        // Math.pow(PHI,123),
        // Math.pow(PHI,144),
        // Math.pow(PHI,165),
        // Math.pow(PHI,186),
        // Math.pow(PHI,207),
        // Math.pow(PHI,228),
        // Math.pow(PHI,249),

        //Progressão bonita [1,2,5]
        // 1.053678423166275
        // ,1.5740864946574218
        // ,1.1757611421980738
        // ,1.7564654397264015
        // ,1.3119887748567554
        // ,1.9599754215696419
        // ,1.4640001983159179

        // 39
        // ,60
        // ,81
        // ,102
        // ,123
        // ,144
        // ,165
        // ,186
        // ,207
        // ,228
        // ,249

        // 1,
        // 1.35,
        // 1.7,
        // 2.05,
        // 2.4,
        // 2.75

        // Math.pow(PHI,99),
        // Math.pow(PHI,120),
        // Math.pow(PHI,141),
        // Math.pow(PHI,162),
        // Math.pow(PHI,183),
        // Math.pow(PHI,204),
        // Math.pow(PHI,225),
        // Math.pow(PHI,246),
        // Math.pow(PHI,267),
        // Math.pow(PHI,288),
        // Math.pow(PHI,309),
        // Math.pow(PHI,330),
        // Math.pow(PHI,351),
        // Math.pow(PHI,372),

        // 99,
        // 120,
        // 141,
        // 162,
        // 183,
        // 204,
        // 225,
        // 246,
        // 267,
        // 288,
        // 309,
        // 330,
        // 351,
        // 372

        // 1,
        // 1.075195547424201,
        // 1.1158633567392826,
        // 1.199771312699899,
        //   1.2451510309134591518118099743192,
        // 1.3387808443088047,
        // 1.4394512027776392,
        // 1.4938964868686737,
        // 1.606230850993854,
        // 1.6669843484582993,
        // 1.792334149088196,

        // 39
        // ,60
        // ,81
        // ,102
        // ,123
        // ,144
        // ,165
        // ,186
        // ,207
        // ,228
        // ,249

        // //Expansão 2
        // 1,
        //   //1.041665,
        //   1.04817625,
        //   //1.111111111,//c
        // //1.125,
        // (9/8 + 10/9)/2,
        //   //1.171875,
        //   1.1785300925666666666666666666667,
        // 1.25,
        //   //1.265625,//c
        // 1.33333333,
        //   //1.38888888,//c
        //   //1.40625,
        //   1.3975683333333333333333333333333,
        // 1.5,
        //   1.5625,
        // //1.66666666,
        //   //1.6875, //c
        //   //(5/3+1.6875)/2,
        //   1.67968541666666666665,
        //   //1.7777777,
        //   1.7677951388888888888888885,
        // 1.875,

        // 1,
        //   //9/8,
        // 7/6,
        // 6/5,
        // 5/4,
        // 4/3,
        // 7/5,
        // 3/2,
        // 5/3,
        // 7/4,
        // //2

        //Sequencia x1.5
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

        //Overtones 16:32
        // 1
        // ,1.0625
        // ,1.125
        // ,1.1875
        // ,1.25
        // ,1.3125
        // ,1.375
        // ,1.4375
        // ,1.5
        // ,1.5625
        // ,1.625
        // ,1.6875
        // ,1.75
        // ,1.8125
        // ,1.875
        // ,1.9375

        // 1,
        // 9/8,
        // 8/7,
        // 7/6,
        // 6/5,
        // 5/4,
        // 4/3,
        // 1.5,
        // 9/8*1.5,
        // 8/7*1.5,
        // 7/6*1.5,
        // 6/5*1.5,
        // 5/4*1.5,

        //19EDO
        // 1
        // ,1.0371550444461919
        // ,1.0756905862201822
        // ,1.1156579177615433
        // ,1.1571102372827193
        // ,1.2001027195781024
        // ,1.2446925894640224
        // ,1.290939197947404
        // ,1.3389041012244711
        // ,1.388651142614655
        // ,1.4402465375387574
        // ,1.4937589616544842
        // ,1.5492596422666538
        // ,1.6068224531337627
        // ,1.6665240127970866
        // ,1.7284437865632087
        // ,1.7926641922757087
        // ,1.8592707100168093
        // ,1.9283519958849866

        //Balafon West Africa
        //1, 35/32, 7/6, 48/35, 32/21, 5/3, 9/5

        //Chinese WellTempered
        //http://www.microtonal-synthesis.com/scale_indian_shruti.html
        // 1/1,18/17,9/8,6/5,54/43,4/3,27/19,3/2,27/17,27/16,9/5,36/19

        //Indian shruti scale
        //http://www.microtonal-synthesis.com/scale_indian_shruti.html
        //1, 256/243, 16/15, 10/9, 9/8, 32/27, 6/5, 5/4, 81/64, 4/3, 27/20, 45/32, 729/512, 3/2, 128/81, 8/5, 5/3, 27/16, 16/9, 9/5, 15/8, 243/128

        //Wendy Carlos Super Just Intonation scale
        //http://www.microtonal-synthesis.com/scale_carlos_super_just.html
        //1, 17/16, 9/8, 6/5, 5/4, 4/3, 11/8, 3/2, 13/8, 5/3, 7/4, 15/8

        //Escala Árabe gerada por 1,1.25,1.5,1.875 e o inverso onde o 1.875 equivale a 2
        // 1
        //     ,1.0666666666
        // ,1.25
        //     ,1.3333333333
        // ,1.5
        //     ,1.6
        // ,1.875

        //Trabalhando com Well temperament a partir da expansão de triades invertidas
        // 1
        // ,1.0606601717798212866012665431573
        //   ,1.125//--
        //   ,1.1858541225631422494995850791623
        // ,1.25
        //   ,1.3333333
        // ,1.4142135623730950488016887242097
        // ,1.5
        //   ,1.6
        //   ,1.6865480854231356437327432236974
        //   ,1.77777777777//--
        // ,1.8856180831641267317355849656129

        // 1,
        // //1.166666666666666,
        // 1.3333333333333,
        // //1.5,
        // 1.6666666666666,
        // //1.83333333333333,
        // //2

        // 1,3/2,3
        // ,1,4/3,2,4
        // ,1, 5/4, 5/3, 5/2, 5
        // ,1, 6/5, 6/4, 6/3, 6/2, 6
        // ,1, 7/6, 7/5, 7/4, 7/3, 7/2, 7
        //1, 8/7, 8/6, 8/5, 8/4, 8/3, 8/2, 8
        //,1, 9/8, 9/7, 9/6, 9/5, 9/4, 9/3, 9/2, 9
        //1, 10/9, 10/8, 10/7, 10/6, 10/5, 10/4, 10/3, 10/2, 10
        //1, 11/10, 11/9, 11/8, 11/7, 11/6, 11/5, 11/4, 11/3, 11/2, 11
        //,1, 12/11, 12/10, 12/9, 12/8, 12/7, 12/6, 12/5, 12/4, 12/3, 12/2, 12
        //1, 14/13, 14/12, 14/11, 14/10, 14/9, 14/8, 14/7, 14/6, 14/5, 14/4, 14/3, 14/2, 14
        //1, 15/14, 15/13, 15/12, 15/11, 15/10, 15/9, 15/8, 15/7, 15/6, 15/4, 15/3, 15/2, 15
        //1, 16/15, 16/14, 16/13, 16/12, 16/11, 16/10, 16/9, 16/8, 16/7, 16/6, 16/4, 16/3, 16/2, 16
        //1, 19/18, 19/17, 19/16, 19/15, 19/14, 19/13, 19/12, 19/11, 19/10, 19/9, 19/8, 19/7, 19/6, 19/5, 19/4, 19/3, 19/2, 19

        // 1
        // ,Math.pow(2,1/4)
        // ,Math.pow(2,1/3)
        // ,Math.pow(2, 9/15)

        //JI 12 (Acordes well tempered)
        //1, 1.041665, 10/9, 1.171875, 5/4, 4/3, 1.3888888, 3/2, 1.5625, 5/3, 16/9, 15/8
        //1,16/15,10/9,6/5,5/4,4/3,64/45,3/2,8/5,5/3,7/4,15/8

        //6ED3 Triade muito afinada, perdendo apenas para a Wndy Carlos Gamma de 20ED3/2
        //Wendy Carlos Beta 11ED3/2 (Aproximadamente igual a 19EDO, so que mais afinada na triade) (31ED_PI) (13ED_PHI)
        //Base 3 eqt 24  (Pareceida com Wendy Carlos Alhpa 9ED3/2, só que com melhor consonancia oitavar ) (48ED9) (25ED_PI)
        //Base 4 eqt 31
        //Base Phi^3 eqt 1 (Normalizado)
        //Base Phi^48 eqt 1 (Normalizado)
        //5ED_PHI
        //15ED3 Norm 3

        //Harmonic diferences
        //2, 1.5, 1.3333333333333333, 1.25, 1.2, 1.1666666666666667, 1.1428571428571428, 1.125, 1.1111111111111112, 1.1, 1.0909090909090908, 1.0833333333333333, 1.0769230769230769, 1.0714285714285714, 1.0666666666666667, 1.0625, 1.0588235294117647, 1.0555555555555556, 1.0526315789473684, 1.05, 1.0476190476190477, 1.0454545454545454, 1.0434782608695652, 1.0416666666666667, 1.04, 1.0384615384615385

        //Scale from Timbre
        //1, 1.16666, 1.25, 1.33333, 1.41, 1.5, 1.6666, 1.76, 2

        // 1,1.25,1.5,
        // 1.4285714285714286,1.7142857142857142,1.0714285714285714*2,
        // 1.25, 1.4285714285714286, 1.0714285714285714*2,
        // 1, 1.5, 1.7142857142857142,
        // 1.25, 1.5, 1.0714285714285714*2,
        // 1, 1.4285714285714286, 1.7142857142857142

        //Hexany octahedron
        //http://www.musicandvirtualflowers.co.uk/tunes/mus_geom/musical_geometry.htm
        // 1, 15/14,  5/4, 10/7, 3/2,  12/7,

        // 24/24, 25/24, 26/24, 10/9, 28/24, 29/24, 30/24, 31/24, 32/24,
        // 24/24 *(3/2), 25/24 *(3/2), 26/24 *(3/2), 10/9 *(3/2), 28/24 *(3/2), 29/24 *(3/2), 30/24 *(3/2), 31/24 *(3/2), 32/24 *(3/2),
        // 24/24 *(2), 25/24 *(2), 26/24 *(2), 10/9 *(2), 28/24 *(2), 29/24 *(2), 30/24 *(2), 31/24 *(2), 32/24 *(2),
        //24/24 *(4/3)*(4/3), 25/24 *(4/3)*(4/3), 26/24 *(4/3)*(4/3), 27/24 *(4/3)*(4/3), 28/24 *(4/3)*(4/3), 29/24 *(4/3)*(4/3), 30/24 *(4/3)*(4/3), 31/24 *(4/3)*(4/3), 32/24 *(4/3)*(4/3),

        // 1, 1.041666666, 1.06666666, 10/9, 1.2, 1.25, 4/3, 1.44, 1.5,//1.6,
        // 1 *1.25, 1.041666666*1.25,  1.06666666*1.25, 10/9 * 1.25, 1.2 *1.25, 1.25 *1.25, 4/3 *1.25, 1.44*1.25, 1.5*1.25, //1.6*1.25,
        // 1 *1.5, 1.041666666*1.5,  1.06666666*1.5, 10/9 * 1.5, 1.2 *1.5, 1.25 *1.5, 4/3 *1.5, 1.44*1.5, 1.5*1.5,// 1.6*1.5,
        // 1
        // ,1.0596340226670484
        // ,1.122824261993551
        // ,1.1897827894843862
        // ,1.2607343233213621
        // ,1.3359169825354342
        // ,1.4155830861532472
        // ,1.5000000000000002
        // ,1.589451034000573
        // ,1.6842363929903268
        // ,1.7846741842265796
        // ,1.8911014849820438
        // ,2.0038754738031517
        // ,1
        // ,1.057371263440564
        // ,1.1180339887498947
        // ,1.1821770112539696
        // ,1.2499999999999996
        // ,1.3217140793007047
        // ,1.397542485937368
        // ,1.4777212640674615
        // ,1.562499999999999
        // ,1.6521425991258802
        // ,1.7469281074217091
        // ,1.8471515800843261
        // ,1.953124999999998
        // ,2.06517824890735

        //15ED3 => Muito legal!!!
        //

        //1, 16/15,  1.2, 1.28, 4/3, 1.44, 1.6, 1.92
        //1, 1.04166666, 10/9, 1.25, 4/3, 1.3888888, 5/3, 16/9

        //1,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32

        //Ponto de parada: 7elementos, 8, 15, 16
        //1
        // 1/2
        // ,1/3
        // ,1/5
        // ,1/7
        // ,1/9
        // ,1/11
        // ,1/13
        //  ,1/15
        //  ,1/17
        //  ,1/19
        //  ,1/21
        //  ,1/23
        //  ,1/25
        //  ,1/27
        //  ,1/29
        //  ,1/31

        // 1
        // ,1.125
        // ,1.25
        // ,1.375
        // ,1.5
        // ,1.625
        // ,1.75
        // ,1.875
        // ,2

        // ,1.25 * 1
        // ,1.25 * 1.125
        // ,1.25 * 1.25
        // ,1.25 * 1.375
        // ,1.25 * 1.5
        // ,1.25 * 1.625
        // ,1.25 * 1.75
        // ,1.25 * 1.875
        // ,1.25 * 2

        // ,1.5 * 1
        // ,1.5 * 1.125
        // ,1.5 * 1.25
        // ,1.5 * 1.375
        // ,1.5 * 1.5
        // ,1.5 * 1.625
        // ,1.5 * 1.75
        // ,1.5 * 1.875
        // ,1.5 * 2

        //Números primos
        // 2
        // ,3
        // ,5
        // ,7
        // //,11
        // //,13
        // ,17
        // //,19
        // ,53
        // ,1.4142

        // 2
        // ,3
        // ,5
        // ,7
        //   ,11
        //   ,13
        //   ,17
        //   ,19
        //  ,23
        //   ,29
        //   ,31
        //   ,37
        //  ,41
        //  ,43
        //   ,47
        //   ,53

        //  ,59
        //  ,61
        //  ,67
        //  ,71
        //  ,73
        //  ,79
        //  ,83
        //  ,89
        //  ,97
        // ,101
        // ,103
        // ,107
        // ,109
        // ,113
        // ,127
        // ,131
        // ,137
        // ,139
        // ,149
        // ,151
        // ,157
        // ,163
        // ,167
        // ,173
        // ,179
        // ,181
        // ,191
        // ,193
        // ,197
        // ,199
        // ,211
        // ,223
        // ,227
        // ,229
        // ,233
        // ,239
        // ,241
        // ,251
        // ,257
        // ,263
        // ,269
        // ,271
        // ,277
        // ,281
        // ,283
        // ,293

        // 1,
        // Math.pow(this.base, Math.log2(9/8)),
        // Math.pow(this.base, Math.log2(5/4)),
        // Math.pow(this.base, Math.log2(4/3)),
        // Math.pow(this.base, Math.log2(3/2)),
        // Math.pow(this.base, Math.log2(5/3)),
        // Math.pow(this.base, Math.log2(15/8)),
        // Math.pow(this.base, Math.log2(2)),

        //Dissonance Curve
        //1, 2, 3/2, 4/3, 5/3, 5/4, 6/5, 7/4, 7/5, 7/6, 8/5, 8/7, 9/5, 9/7, 9/8
        // 1
        // ,2
        // ,1.5
        // ,4/3
        // ,5/3
        // ,5/4
        // ,6/5
        // ,1.6
        // ,1.8
        // ,1.4286

        // Math.pow(2, (0+0)/31),
        // Math.pow(2, (0+2)/31),
        // Math.pow(2, (0+4)/31),
        // Math.pow(2, (0+6)/31),
        // Math.pow(2, (0+8)/31),
        // Math.pow(2, (0+10)/31),
        // Math.pow(2, (0+12)/31),
        // Math.pow(2, (0+14)/31),
        // Math.pow(2, (0+16)/31),

        // Math.pow(2, (13+0)/31),
        // Math.pow(2, (13+2)/31),
        // Math.pow(2, (13+4)/31),
        // Math.pow(2, (13+6)/31),
        // Math.pow(2, (13+8)/31),
        // Math.pow(2, (13+10)/31),
        // Math.pow(2, (13+12)/31),
        // Math.pow(2, (13+14)/31),
        // Math.pow(2, (13+16)/31),

        // Math.pow(2, (23+0)/31),
        // Math.pow(2, (23+2)/31),
        // Math.pow(2, (23+4)/31),
        // Math.pow(2, (23+6)/31),
        // Math.pow(2, (23+8)/31),
        // Math.pow(2, (23+10)/31),
        // Math.pow(2, (23+12)/31),
        // Math.pow(2, (23+14)/31),
        // Math.pow(2, (23+16)/31),

        // Math.pow(2, (31+0)/31),
        // Math.pow(2, (31+2)/31),
        // Math.pow(2, (31+4)/31),
        // Math.pow(2, (31+6)/31),
        // Math.pow(2, (31+8)/31),
        // Math.pow(2, (31+10)/31),
        // Math.pow(2, (31+12)/31),
        // Math.pow(2, (31+14)/31),
        // Math.pow(2, (31+16)/31),

        //Composição numérica
        // 1, 5/4, 6/5, 3/2,
        // 1, 7/6, 8/7, 4/3,
        // 1, 9/8, 10/9, 5/4,

        //1, 16/15, 9/8, 6/5, 5/4, 4/3, 1.41424142, 3/2, 8/5, 5/3, 16/9, 15/8, 2

        //Otonal 32
        // 1
        // //,1.03125
        // ,1.0625
        // //,1.09375
        // ,1.125
        // //,1.15625
        // ,1.1875
        // //,1.21875
        // ,1.25
        // //,1.28125
        // //,1.3125
        // ,1.34375
        // //,1.375
        // ,1.40625
        // //,1.4375
        // //,1.46875
        // ,1.5
        // //,1.53125
        // //,1.5625
        // ,1.59375
        // //,1.625
        // ,1.65625
        // //,1.6875
        // //,1.71875
        // ,1.75
        // //,1.78125
        // //,1.8125
        // //,1.84375
        // ,1.875
        // //,1.90625
        // //,1.9375
        // //,1.96875
        // ,2

        // 1,17,9,19,5,21, 11,23,3,25,13,27,7,29,15,31,
        // 33,35,37,39,41,43,45,47,51,53,55,57,59,61,63
        // 1/177147,
        // 1/59049,
        // 1/19683,
        // 1/6561,
        // 1/2187,
        // 1/729,
        // 1/243,
        // 1/81,
        // 1/27,
        // 1/9,
        // 1/3,
        // 1,
        // 3,
        // 9,
        // 27,
        // 81,
        // 243,
        // 729,
        // 2187,
        // 6561,
        // 19683,
        // 59049,
        // 177147,

        //Herry Patch 43 Tone Scale
        //1, 81/80, 33/32, 21/20, 16/15, 12/11, 11/10, 10/9, 9/8, 8/7, 7/6, 32/27, 6/5, 11/9, 5/4, 14/11, 9/7, 21/16, 4/3, 27/20, 11/8, 7/5, 10/7, 16/11, 40/27, 3/2, 32/21, 14/9, 11/7, 8/5, 18/11, 5/3, 27/16, 12/7, 7/4, 16/9, 9/5, 20/11, 11/6, 15/8, 40/21, 64/33, 160/81

        //2, Math.PI, Math.PI-2

        //Augusto Novaro - Natural System
        //1, 21/20, 16/15, 10/9, 9/8, 8/7, 7/6, 6/5, 5/4, 9/7, 4/3, 7/5, 10/7, 3/2, 14/9, 8/5, 5/3, 12/7, 7/4, 16/9, 9/5, 15/8, 40/21
        //Augusto Novaro - Natural Approximated
        //1, 1.0494, 1.0697, 1.117, 1.1224, 1.1443, 1.1665, 1.2007, 1.2479, 1.2845, 1.3348, 1.4007, 1.4983, 1.5572, 1.6027, 1.6657, 1.7145, 1.7479, 1.7818, 1.8697, 1.9060

        //1, 3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049, 177147, 531441,

        //1, 3, 5, 7, 11, 13, 17, 19, 23, 29

        //Hercala harmonica baseada nos números com maiores divisores
        // 18/18	//6
        // //,19/18	//2
        // ,20/18	//6
        // ,21/18	//4
        // ,22/18	//4
        // //,23/18	//2
        // ,24/18	//8
        // //,25/18	//3
        // ,26/18	//4
        // ,27/18	//4
        // ,28/18	//6
        // //,29/18	//2
        // ,30/18	//8
        // //,31/18	//2
        // ,32/18	//6
        // ,33/18	//4
        // ,34/18	//4
        // ,35/18	//4

        // Math.pow(5/3 ,-4),Math.pow(5/3 ,-3), Math.pow(5/3 ,-2),Math.pow(5/3 ,-1), 1, Math.pow(5/3 ,1),  Math.pow(5/3 ,2),  Math.pow(5/3 ,3),  Math.pow(5/3 ,4)
        //Math.pow(3/2 ,-9), Math.pow(3/2 ,-8),  Math.pow(3/2 ,-7),  Math.pow(3/2 ,-6),  Math.pow(3/2 ,-5), Math.pow(3/2 ,-4),Math.pow(3/2 ,-3), Math.pow(3/2 ,-2),Math.pow(3/2 ,-1),
        //1, Math.pow(3/2 ,1),  Math.pow(3/2 ,2),  Math.pow(3/2 ,3),  Math.pow(3/2 ,4),  Math.pow(3/2 ,5),  Math.pow(3/2 ,6),  Math.pow(3/2 ,7),  Math.pow(3/2 ,8),  Math.pow(3/2 ,9)

        //  (1)*1, (1)*10/9, (1)*1.25, (1)*4/3, (1)*1.5, (1)*5/3, (1)*1.875, 2,
        //  (Math.pow(10/9,1/3))*1, (Math.pow(10/9,1/3))*10/9, (Math.pow(10/9,1/3))*1.25, (Math.pow(10/9,1/3))*4/3, (Math.pow(10/9,1/3))*1.5, (Math.pow(10/9,1/3))*5/3, (Math.pow(10/9,1/3))*1.875, 2,
        //  (Math.pow(10/9,2/3))*1, (Math.pow(10/9,2/3))*10/9, (Math.pow(10/9,2/3))*1.25, (Math.pow(10/9,2/3))*4/3, (Math.pow(10/9,2/3))*1.5, (Math.pow(10/9,2/3))*5/3, (Math.pow(10/9,2/3))*1.875, 2,

        //(16/15)*1, (16/15)*1.25, (16/15)*1.5, (16/15)*1.75,
        //(1)*1, (1)*1.25, (1)*4/3, (1)*1.5, (1)*5/3, (1)* 2,
        //(1.25)*1, (1.25)*1.25, (1.25)*4/3, (1.25)*1.5, (1.25)*5/3, (1.25)* 2,
        //(4/3)*1, (4/3)*1.25, (4/3)*4/3, (4/3)*1.5, (4/3)*5/3, (4/3)* 2,
        //(1.5)*1, (1.5)*1.25, (1.5)*4/3, (1.5)*1.5, (1.5)*5/3, (1.5)* 2,
        //(this.base)*1, (this.base)*1.25, (this.base)*4/3, (this.base)*1.5, (this.base)*5/3, (this.base)* 2,
        //(Math.pow(this.base,2))*1, (Math.pow(this.base,2))*1.25, (Math.pow(this.base,2))*4/3, (Math.pow(this.base,2))*1.5, (Math.pow(this.base,2))*5/3, (Math.pow(this.base,2))* 2,
        //(Math.pow(this.base,3))*1, (Math.pow(this.base,3))*1.25, (Math.pow(this.base,3))*4/3, (Math.pow(this.base,3))*1.5, (Math.pow(this.base,3))*5/3, (Math.pow(this.base,3))* 2,
        //(25/24)*1, (25/24)*1.25, (25/24)*4/3, (25/24)*1.5, (25/24)*5/3, (25/24)*2,
        //(16/15)*1, (16/15)*1.25, (16/15)*4/3, (16/15)*1.5, (16/15)*5/3, (16/15)*2,

        //1, 1.5, 1.125, 5/3, 1.25, 1.875, 1.40625, 1.0546875,

        //===================================================================================
        //Ratios of the 17 frets on the neck of "Baglama" ("saz") according to Yalçýn Tura
        //  1
        //  ,18/17
        //  ,12/11
        //  ,9/8
        //  ,81/68
        //  ,27/22
        //  ,81/64
        //  ,4/3
        //  ,24/17
        //  ,16/11
        //  ,3/2
        //  ,27/17
        //  ,18/11
        //  ,27/16
        //  ,16/9
        //  ,32/17
        //  ,64/33
        //  ,2/1

        // 1
        // ,1.040041911525952

        //  ,(1.2009369551760027 / 1.040041911525952)/1.040041911525952
        //  ,1.2009369551760027 / 1.040041911525952
        //  //,1.040041911525952 * Math.pow(1.1547005383792515, 3/4)

        // ,1.2009369551760027
        // ,1.2490247664834064

        // //,1.33333333333
        // //  ,1.2490247664834064 * Math.pow(1.1547005383792515, 1/5)
        // //  ,1.2490247664834064 * Math.pow(1.1547005383792515, 2/5)
        // //  ,1.2490247664834064 * Math.pow(1.1547005383792515, 3/5)
        // //  ,1.2490247664834064 * Math.pow(1.1547005383792515, 4/5)
        //  //,1.4422495703074085 / Math.pow(1.1547005383792515, 1/3)
        //  //,1.2490247664834064 * Math.pow(1.1547005383792515, 3/4)

        //  ,(1.4422495703074085 / 1.040041911525952)/1.040041911525952
        //  ,1.4422495703074085 / 1.040041911525952

        // ,1.4422495703074085

        // //,1.7320508075688774
        // //,1.5

        // 1
        // ,1.040041911525952
        //   ,1.074569931823542
        // ,1.110244236874139
        // ,1.1547005383792515
        // ,1.2009369551760027
        // ,1.2490247664834064
        //   ,1.2904907420478493
        // ,1.3333333333333335
        // ,1.3867225487012695
        // ,1.4422495703074085
        // 1
        //   ,1.0416666666666667
        //   ,1.0416666666666667 * 1.0666666666666
        // ,1.2
        //   //,1.0416666666666667 * 1.2
        // ,1.25
        //   //,1.0416666666666667 * 1.25
        // ,1.3333333
        //   ,1.0416666666666667 * 1.3333333

        // 1
        // ,1.618033988749895
        // ,2.618033988749895
        // ,1.4120226591665965
        // ,2.284700655416562
        // ,1.2322411048610529
        // ,1.993807989999907
        // ,1.0753496982869866
        // ,1.739952361620289
        // ,2.815302059907276
        // ,1.5184181405091886
        // ,2.4568521604782805
        // ,1.3250901003291566
        // ,2.144040820488583
        // ,1.1563769736059133
        // ,1.8710572471021079

        //Dedução da escala de 12 a partir da escala de 7 deduzida a partir da pentatônica
        //1, 1.041666666, 10/9, 1.185185185185185, 1.2500000000000002, 4/3, 1.40625, 1.5, 1.5625, 5/3, 16/9, 15/8, 2
        //1, 16/15, 10/9, 1.2, 1.25, 4/3, 1.4, 1.5, 1.6, 5/3, 9/5, 15/8 //Utilizando as menores frações (Contém Wolf Tone!)

        // 1, 6/5, 5/4, 4/3, 3/2, 8/5, 5/3, 2,0
        // ,4/3, 4/3*6/5, 4/3*5/4, 4/3*4/3, 4/3*3/2, 4/3*8/5, 4/3*5/3, 4/3*2,0
        // ,1.5, 1.5*6/5, 1.5*5/4, 1.5*4/3, 1.5*3/2, 1.5*8/5, 1.5*5/3, 1.5*2,0

        // 1
        // ,1.0507566386532194
        // ,1.1111111111111111
        // ,1.166666666666666666
        // ,1.22222222222222
        // ,1.2808866897642726
        // ,4/3
        // ,1.4142135623730951
        // ,1.5
        // ,1.5614183643114203
        // ,1.6666666666666
        // ,1.75
        // ,1.8333333333333333
        // ,1.9033903060212396

        //=================================
        //  17-tone Well Temperament  de acordo com  o artigo "The 17-tone Puzzle — And the Neo-medieval Key That Unlocks It" by George Secor
        //http://www.anaphoria.com/Secor17puzzle.pdf?fbclid=IwAR2hUXDh3JRK_JvRLLIsOlVhEZS2iGDRjcprZrzzbPhJywi1QicAqxbAxdY
        // 1
        // ,1.03930303
        // ,1.087272727
        // ,1.131863636
        // ,1.174420455
        // ,1.226609848
        // ,1.281117424
        // ,1.329284091
        // ,1.38380303
        // ,1.447670455
        // ,1.504568182
        // ,1.561140152
        // ,1.633193182
        // ,1.702965909
        // ,1.766996212
        // ,1.842488636
        // ,1.927526515

        //La Monte Young's - The Well-Tuned Piano By Kyle Gann https://www.kylegann.com/wtp.html
        //1/1,	567/512,	9/8,	147/128,	21/16,	1323/1024,	189/128,	3/2,	49/32,	7/4,	441/256,	63/32

        //Teste Well tempered 14EDO (22ED3)
        //1, 10/9, 11/9, 4/3, 1.5, 5/3, 11/6,
        //1, 10/9, 1.185185185, 12/9, 15/9, 16/9,
        //Math.sqrt(2)/(4/3), (Math.sqrt(2)/(4/3)) * 10/9, (Math.sqrt(2)/(4/3)) * 11/9, Math.sqrt(2), Math.sqrt(2)*1.125, (Math.sqrt(2)/(4/3)) * 5/3, (Math.sqrt(2)/(4/3)) * 11/6
        //1, 1.5, 10/9, 5/3, 1.25, 1.875, Math.sqrt(2)
        //Math.sqrt(2)* 1, Math.sqrt(2)*1.5, Math.sqrt(2)*10/9, Math.sqrt(2)*5/3, Math.sqrt(2)*1.25, Math.sqrt(2)*1.875, Math.sqrt(2)*Math.sqrt(2)
        //1, 1.052, 1.11111, 1.166666, 1.222222, 1.273148, 1.33333333, Math.sqrt(2), 1.5, 1.5674, 1.666666666, 1.75, 1.833333333333, 1.914
        //1, 9/8, 5/4,  4/3, 3/2, 5/3, 15/8,
        //Math.sqrt(1.0400419)* 1, Math.sqrt(1.0400419)*9/8, Math.sqrt(1.0400419)* 5/4, Math.sqrt(1.0400419)* 4/3, Math.sqrt(1.0400419)*3/2, Math.sqrt(1.0400419)*5/3, Math.sqrt(1.0400419)*15/8,
        //Math.sqrt(1.081687177)* 1, Math.sqrt(1.081687177)*9/8, Math.sqrt(1.081687177)* 5/4, Math.sqrt(1.081687177)* 4/3, Math.sqrt(1.081687177)*3/2, Math.sqrt(1.081687177)*5/3, Math.sqrt(1.081687177)*15/8,
        //Math.sqrt(9/8), (9/8)*Math.sqrt((5/4) / (9/8)), (5/4)*Math.sqrt((4/3) / (5/4)),  (4/3)*Math.sqrt((3/2) / (4/3)), (3/2)*Math.sqrt((5/3) / (3/2)), (5/3)*Math.sqrt((15/8) / (5/3)),  (15/8)*Math.sqrt((2) / (15/8)),

        //1
        //,1.0606601717798212
        //,1.125//,1.118033//1.125//
        //,1.222222//,1.1858541225631423
        // ,1.11803398
        // ,1.1852
        // ,1.25
        //,1.25
        //,1.2909944487358054
        // ,1.3333333333333333
        // ,1.414213562373095
        // ,1.5
        // ,1.5811388300841898
        // ,1.6666666666666667
        // ,1.7677669529663687
        // ,1.875
        // ,1.9364916731037083

        //14 tones 7 Limit Just Intonation http://www.dbdoty.com/OM/OMTuning.html
        //1, 15/14, 9/8, 7/6, 5/4, 9/7, 4/3, 7/5, 3/2, 14/9, 5/3, 7/4, 15/8, 27/14,

        //Interessante pq? 12Ed3 normalizado
        // 1
        // ,1.2009369551760027
        // ,1.4422495703074085
        // ,1.7320508075688774
        // ,1.040041911525952
        // ,1.2490247664834064
        // ,1.5
        // ,1.801405432764004
        // ,1.0816871777305563
        // ,1.299038105676658
        // ,1.5600628672889283
        // ,1.8735371497251099
        // ,1.1250000000000002
        // ,1.665391149
        // ,4/3//1.351013259

        //Interessante (Carlos Alpha Almost Just )
        //1, 1.0416666666, 1.0850694444, 1.152, 1.2, 1.25, 1.3020833333, 1.3563368, 1.44 //v1
        //1, 1.0416666666, 1.07584, 1.152, 1.1925, 1.25, 1.3020833333, 1.3448, 1.44 //v2
        //1, 1.0416666666, 1.0850694444, 1.152, 1.2, 1.25, 1.3020833333, 1.346688, 1.44 //v3
        //1, 1.0416666666, 1.11825, 1.142, 1.21, 1.25, 1.3020833333, 1.33333, 1.44 //v4

        //16 Well Tempered (oitava 1.4859942891) (oitava 1,141428)
        // 1
        // ,1.0442737824274138
        // ,1.0905077326652575
        // //,1.1387886347566913
        // //,1.1892071150027206
        // //,1.2418578120734836
        // //,1.296839554651009
        // //,1.354255546936892
        // //,1.414213562373094

        //1, 1.06666666666, 1.111111111, 1.2, 1.25, 4/3, 1.44

        //=============================================
        //22 Srutis indiano
        //=============================================
        // ,1
        // ,1.5
        // ,1.125
        // ,1.6875
        // ,1.265625
        // ,1.8984375
        // ,1.4222222222222 //,1.423828125
        // ,1.0666666666666 //,1.06787109375
        // ,1.6 //,1.601806640625
        // ,1.2 //,1.20135498046875
        // ,1.8 //,1.802032470703125
        // //,1.35 //,1.3515243530273438
        //------------------------------------------
        // ,1
        // ,1.333333333333
        // ,1.7777777777768888
        // ,1.1851851851842963
        // ,1.5802469135786665
        // ,1.0546875 //,1.0534979423855142
        // ,1.40625 //,1.4046639231803346
        // ,1.875 //,1.8728852309066444
        // ,1.25 //,1.2485901539374509
        // ,5/3 //,1.664786871916185
        // ,10/9 //,1.1098579146105123
        // ,1.481481 //,1.4798105528136465
        // //,1.975308 //,1.9730807370843688
        //=============================================

        // 1
        // ,1.0546875
        // ,1.06666666666666
        // ,1.111111
        // ,1.125
        // ,1.185185185
        // ,1.2
        // ,1.25
        // ,1.265625
        // ,1.33333
        // ,1.40625
        // ,1.4222222222222
        // ,1.481481481
        // ,1.5
        // ,1.58203125
        // ,1.6
        // ,1.666666
        // ,1.6875
        // ,1.77777777
        // ,1.875
        // ,1.8962962962
        // ,1.975308641

        //15Ed3 normalizado e ordenado
        // 1
        // ,1.075989624725346
        // ,1.157753672516591
        // ,1.2457309396155178
        // ,1.3403935662256536
        // ,1.4422495703074092
        // ,1.5518455739153607
        // ,1.669769736708878
        // ,1.7966549123791256
        // ,1.9331820449317647
        // ,1.0400419115259532
        // ,1.1190743060814419
        // ,1.2041123426403475
        // ,1.2956123876847447
        // ,1.394065486814418
        // ,1.5000000000000024
        // ,1.6139844370880216
        // ,1.7366305087748892
        // ,1.8685964094232796
        //,2*1.0052951746692418

        //19 welltempered (oitava 1.118033)
        // 1,
        // 1.03583333,
        // 1.0733452

        //22 Weell tempered (oitava 1,0648)
        // 1,
        // 1.035798

        //22 Weell tempered v2 (oitava 1.3333333)
        // 1
        // ,1.040041911525952
        // ,1.0816871777305563
        // ,1.125
        // ,9/8 * 1.0357441686167614
        // ,9/8 * 1.0727659828236265
        // ,9/8 * 1.1111111109999998
        // ,1.299

        //1, 1.066666, 1.11803, 1.185185, 1.25

        //1, 1.25, 1.5, 1.75, 2,
        //2/ 1, 2/1.25, 2/1.5, 2/1.75, 2/2,
        //12/12, 13/12, 14/12, 15/12, 16/12, 17/12, 18/12, 19/12, 20/12, 21/12, 22/12, 23/12, 24/12,
        //2/(12/12), 2/(13/12), 2/(14/12), 2/(15/12), 2/(16/12), 2/(17/12), 2/(18/12), 2/(19/12), 2/(20/12), 2/(21/12), 2/(22/12), 2/(23/12), 2/(24/12)

        //12 weelTempered (Derivada do lambdoma 1,16/9, 4/3,3/2, 9/8, 2)
        //1, 1.0534979423868311, 1.125, 1.1851851851851851, 1.265625, 1.3333333333333333, 1.4046639231824416, 1.5, 1.5802469135802468, 1.6875, 1.7777777777777777, 1.8856613654549612, 2

        //Muito Legal!!!! Apesar de não ser oitavada (https://en.xen.wiki/w/88cET)
        //(Gerador) 1.052193343278766 => Terceira nota de 45EdPI => Aprox 11Ed7/4 ou 88cents e 41ed8

        //Maior
        //1, 1.125, 1.25, 1.5, 1.5625, 1.875,

        //Menor
        //1, 1.125, 1.2, 1.44, 1.5, 1.8,

        //Diamond
        //1, 1.2, 1.25, 1.3333333333333333, 1.5, 1.6, 1.6666666666666667,

        //1, 1.0666666666666667, 1.125, 1.2, 1.25, 1.28, 1.3333333333333333, 1.44, 1.5, 1.5625, 1.6, 1.6666666666666665, 1.7777777777777777, 1.8, 1.875, 1.92

        //Extented Diamon
        //1 ,16/15 ,10/9 ,9/8 ,6/5 ,5/4 ,4/3 ,3/2 ,8/5 ,5/3 ,16/9 ,9/5 ,15/8

        //Golden cents progression (https://en.xen.wiki/w/Generating_a_scale_through_successive_divisions_of_the_octave_by_the_Golden_Ratio)
        //1, 1.0590, 1.1459, 1.2361,  1.3090,  1.4120, 1.5279
        //0, 66.844, 108.156, 175,241.844, 283.1566, 350, 391.3126, 458.1567,525, 566.3127, 633.1567,700, 741.3127, 808.1567, 849.4686, 916.3127, 983.1567,1024.4693,1091.3133, 1132.6253, 1200
        //0.000000, 66.873708, 175.077641, 283.281573, 350.155281, 458.359214, 566.563146, 633.436854, 741.640786, 808.514495, 916.718427, 1024.922359, 1091.796068, 1200.000000

        //Decatonic major Pajara22 Edo
        //0, 109.091, 218.182, 381.818, 490.909, 600, 709.091, 872.727, 981.818, 1090.909
        //1, 1.0650411453664965, 1.134312641323579, 1.2467581783474724, 1.3278487582622387, 1.4142135623730951, 1.5061956322626746, 1.655506298971982, 1.7631823248185694, 1.8778617227147314
        //1, 16/15, 9/8, 5/4, 4/3, 1.4142135623730951, 3/2, 5/3, 7/4, 15/8
        //Triades da escala decatônica
        // 1,                    1.2467583092848906 , 1.5061955531706115
        // ,1.0650410894399605 , 1.3278488279891056 , 1.655506559769621
        // ,1.1343125221954624 , 1.4142135623730947 , 1.7631825099920417
        // ,1.2467583092848906 , 1.5061955531706115 , 1.877861821323412
        // ,1.3278488279891056 , 1.655506559769621  , 2
        // ,1.4142135623730947 , 1.7631825099920417 , 2*1.0650410894399605
        // ,1.5061955531706115 , 1.877861821323412  , 2*1.1343125221954624
        // ,1.655506559769621  , 2                  , 2*1.2467583092848906
        // ,1.7631825099920417 , 2*1.0650410894399605 , 2*1.3278488279891056
        // ,1.877861821323412  , 2*1.1343125221954624 , 2*1.4142135623730947

//https://en.xen.wiki/w/12-22h
//1, 109.09091, 218.18182, 327.27273, 436.36364, 490.90909, 600.00000, 709.09091, 818.18182, 927.27273, 1036.36364, 1145.45455, 2/1, 
//1, 1.065041089999228, 1.1343125233867437, 1.2080894463075924, 1.286664900712002, 1.3278488272918372, 1.4142135623730951, 1.5061955539615324, 1.6041601545431816, 1.7084964795280002, 1.819618952816345, 1.9379689528907738

        //Mathematics of the scale of twelve true fifths was discovered in 1962 by a German-American musicologist Maria Renold
        //1, 3/4*Math.sqrt(2), 9/8, 27/32*Math.sqrt(2), 81/64, 4/3, Math.sqrt(2), 3/2, 9/8*Math.sqrt(2), 27/16, 81/64*Math.sqrt(2), 243/128

        //Escala diatonica variável
        //1,Math.pow(this.base,2)/2, Math.pow(this.base,4)/4, 2/Math.pow(this.base,1), Math.pow(this.base,1), Math.pow(this.base,3)/2, Math.pow(this.base,5)/4

        //1, Math.pow(5,2/4)/2, ((2/Math.pow(5,2/4))*2)/Math.pow(5,1/4), 2/Math.pow(5,1/4),
        //12/12, 13/12, 14/12, 15/12, 16/12, 17/12
        //7/7, 8/7, 9/7, 10/7 //(Gerador 1.5 interessante)
        //18/18, 19/18, 20/18, 21/18, 22/18, 23/18, 24/18, 25/18, 26/18
        //24/24, 25/24, 26/24, 27/24, 28/24, 29/24, 30/24, 31/24, 32/24, 33/24, 34/24, 35/24

        //1, 1.11111, 1.22222222, 1.333333
        //1, Math.pow(this.repeatScaleValue,2)/2, Math.pow(this.repeatScaleValue,4)/4, 2/this.repeatScaleValue
        //1, 1.090909090909, 1.2, 1.33333
        //1, 32/27, 4/3

        //1, 256/243, 9/8, 32/27, 81/64, 4/3, Math.sqrt(2), 1.5, 128/81, 1.6875, 16/9, 243/128

        //https://en.xen.wiki/w/Arcturus (Gerador 3)
        // 1
        // ,1.1343052784801546
        // ,1.2250497105589648
        // ,1.323053697988112
        // ,1.4288980052583449
        // ,1.5432098580246913
        // ,1.66666666
        // ,1.8905087899048896
        // ,2.041749509431277
        // ,2.205089487826495
        // ,2.381496665904588
        // ,2.5720164197530866
        // ,2.7777777555555554

        //1,6685

        //https://en.xen.wiki/w/Armodue_theory
        //Semi-equalized Armodue
        // 0
        // ,77.42
        // ,154.84
        // ,232.26
        // ,309.68
        // ,387.10
        // ,464.52
        // ,541.94
        // ,619.35
        // ,696.77
        // ,774.19
        // ,851.61
        // ,929.03
        // ,967.74
        // ,1045.16
        // ,1122.58
//         1
// ,1.0457345379256116
// ,1.0935607238104925
// ,1.1435742182075628
// ,1.1958750566609282
// ,1.2505678497940804
// ,1.3077619925490385
// ,1.367571882994946
// ,1.430108890487043
// ,1.4955142597767768
// ,1.563910913408831
// ,1.6354356563904051
// ,1.7102315504424894
// ,1.7489026668813836
// ,1.8288879222280738
// ,1.9125312662689065

//Armodue semi-equilized with other temperaments
// 1
// ,1.0458607114007321
// ,1.0938246276516452
// ,1.1439882032233906
// ,1.1964523160572604
// ,1.2513224704286998
// ,1.3087090091142815
// ,1.3687273352888094
// ,1.399760922774874
// ,1.4639549544842747
// ,1.5310929701555498
// ,1.601309982987543
// ,1.6747471979804458
// ,1.7515522958962118
// ,1.8318797302415974
// ,1.915891037871058
        //Armodue Just
        // 1/1
        // ,16/15
        // ,10/9
        // ,9/8
        // ,6/5
        // ,5/4
        // ,4/3
        // ,45/32
        // ,64/45
        // ,3/2
        // ,8/5
        // ,5/3
        // ,7/4
        // ,16/9
        // ,9/5
        // ,15/8

        //1, Math.pow(this.base,1), Math.pow(this.base,2)/2, Math.pow(this.base,3)/2, Math.pow(this.base,4)/4, Math.pow(this.base,5)/4, Math.pow(this.base,6)/8, Math.pow(this.base,7)/16, Math.pow(this.base,8)/16, Math.pow(this.base,9)/32, Math.pow(this.base,10)/32, Math.pow(this.base,11)/64, Math.pow(this.base,12)/128,
        //2, Math.pow(this.base,-1)*2, Math.pow(this.base,-2)*4, Math.pow(this.base,-3)*4, Math.pow(this.base,-4)*8, Math.pow(this.base,-5)*8, Math.pow(this.base,-6)*16, Math.pow(this.base,-7)*32, Math.pow(this.base,-8)*32, Math.pow(this.base,-9)*64, Math.pow(this.base,-10)*64, Math.pow(this.base,-11)*128, Math.pow(this.base,-12)*256,
        //22 Well Tempered
        // 1
        // ,1.0305212051751822
        // ,(1.0619739543157098 + 1.0687333468374218)/2
        // ,1.1013523765938058
        // ,1.1349669784499998
        // ,1.169607538466329
        // ,1.2053053701222993
        // ,1.249998579071398
        // ,1.2881500421719225
        // ,1.3274659339054713
        // ,1.367981794037265
        // ,(1.40973424704899 + 1.418707110355458)/2
        // ,1.4620077611541067
        // ,1.50663
        // ,1.5526141633530846
        // ,1.6000018187906777
        // ,1.6593305311475257
        // ,1.709975298742123
        // ,1.7621658056795249
        // ,1.8159492297873598
        // ,(1.8713741888174138 + 1.8832853591863405)/2
        // ,1.9407654980374835

        //1, Math.pow(this.base,1/4), Math.pow(this.base,2/4), Math.pow(this.base,3/4), Math.pow(this.base,4/4), Math.pow(this.base,5/4), Math.pow(this.base,6/4), Math.pow(this.base,7/4), 0,
        //1*this.repeatScaleValue, Math.pow(this.base,1/4)*this.repeatScaleValue, Math.pow(this.base,2/4)*this.repeatScaleValue, Math.pow(this.base,3/4)*this.repeatScaleValue, Math.pow(this.base,4/4)*this.repeatScaleValue, Math.pow(this.base,5/4)*this.repeatScaleValue, Math.pow(this.base,6/4)*this.repeatScaleValue, Math.pow(this.base,7/4)*this.repeatScaleValue,
        // //1,02058
        // //0,9837

        // 1, 1.125, 1.2000000000000002, 1.25, 1.3333333333333333, 1.5, 1.6666666666666667, 1.8000000000000003, 2,
        // 1.25, 1.3333333333333333, 1.5, 1.6666666666666667, 1.8000000000000003, 2, 2* 1.125, 2*1.2000000000000002, 2*1.25,
        // 1.5, 1.6666666666666667, 1.8000000000000003, 2, 2*1.125, 2*1.2000000000000002, 2*1.25, 2*1.3333333333333333, 2*1.5

        //Lambdoma 7x7
        //1, 1.0666666666666667, 1.09375, 1.125, 1.1428571428571428, 1.1666666666666665, 1.2000000000000002, 1.25, 1.2800000000000002, 1.3061224489795917, 1.3125, 1.3333333333333333, 1.4000000000000001, 1.4285714285714284, 1.5, 1.5238095238095237, 1.53125, 1.5625, 1.6, 1.6666666666666665, 1.7142857142857142, 1.75, 1.7777777777777777, 1.8285714285714285, 1.875

        // 1,
        // (1.0666666666666667+1.09375)/2,
        // (1.125+1.1428571428571428)/2,
        // (1.1666666666666665+1.2000000000000002)/2,
        // (1.25+1.2800000000000002)/2,
        // (((1.3061224489795917 + 1.3125)/2) + 1.3333333333333333)/2,
        // (1.4000000000000001+1.4285714285714284)/2,
        // (1.5 + ((1.5238095238095237 + 1.53125)/2))/2,
        // (1.5625 + 1.6)/2,
        // 1.6666666666666665,
        // (((1.7142857142857142+1.75)/2)+1.7777777777777777)/2,
        // (1.8285714285714285 + 1.875)/2
        //1, 8/7, 5/4, 4/3, 3/2, 8/7*3/2, 1.875

        // 1, 2,
        // 3, 3/2,
        // 4, 4/2, 4/3,
        // 5, 5/2, 5/3, 5/4,
        // 6, 6/2, 6/3, 6/4, 6/5,
        // 7, 7/2, 7/3, 7/4, 7/5, 7/6,
        // 8, 8/2, 8/3, 8/4, 8/5, 8/6, 8/7,
        // 9, 9/2, 9/3, 9/4, 9/5, 9/6, 9/7, 9/8,
        // 10, 10/2, 10/3, 10/4, 10/5, 10/6, 10/7, 10/8, 10/9,
        // 11, 11/2, 11/3, 11/4, 11/5, 11/6, 11/7, 11/8, 11/9, 11/10,
        // 12, 12/3, 12/3, 12/4, 12/5, 12/6, 12/7, 12/8, 12/9, 12/10, 12/11

        //Progressão muito legal!!!
        //1, 2 //Normalize 5 Repeat 3

        //Teste 15 welltempered
        // 1, 8/7, 4/3, 3/2, 7/4, 2,
        // 1.09375*1, 1.09375*8/7, 1.09375*4/3, 1.09375*3/2, 1.09375*7/4, 1.09375*2,
        // 1.0472941*1, 1.0472941*8/7, 1.0472941*4/3, 1.0472941*3/2, 1.0472941*7/4, 1.0472941*2,

        //1, 1.040041911,1.0816871777305,8/7,1.040041911*8/7,1.0816871777305*8/7, 4/3,1.386722548701269409686, 1.4422495703074,
        //3/2, 1.040041911*1.5, 1.0816871777305*1.5,7/4,1.040041911*7/4,1.0816871777305*7/4
        //1, Math.sqrt(4/3), 4/3, 3/2, Math.sqrt(4/3)*1.5, 2,

        //Gerador genérico
        //==============================================
        //   1, this.base, 2/this.base, 2,0,0,0,0,0,
        //  (this.base)*1, (this.base)*this.base, (this.base)*(2/this.base), (this.base)*2,0,0,0,0,0,
        //  (2/this.base)* 1, (2/this.base)*this.base, (2/this.base)*2/this.base, (2/this.base)*2,0,0,0,0,0,

        //1, 1.1547, 1.33333209, //1.5, 1.732051615138131
        //1, this.base
        //1, 1.2505655196145855 //1.4955178823482058

        //12 Oriental WeellTempered
        // 1
        // ,1.0534977580247056
        // ,1.125
        // ,1.1851850370370447
        // ,1.2485899042219397
        // ,1.3333332333333359
        // ,1.404663642249682
        // ,1.4999999625
        // ,1.580246676543225
        // ,1.6647864973429227
        // ,1.777777600000007
        // ,1.8728848095107882

        //Gerador
        // 1, Math.pow(Math.pow(this.base,2)/2,1/3), Math.pow(Math.pow(this.base,2)/2,2/3),
        // Math.pow(this.base,2)/2, Math.pow(Math.pow(this.base,2)/2,1/3)*(Math.pow(this.base,2)/2), Math.pow(Math.pow(this.base,2)/2,2/3)*(Math.pow(this.base,2)/2),
        // 2/(this.base), (Math.pow(Math.pow(this.base,2)/2,1/3)*2)/(this.base), (Math.pow(Math.pow(this.base,2)/2,2/3))*2/(this.base),
        // this.base, this.base*Math.pow(Math.pow(this.base,2)/2,1/3), this.base*Math.pow(Math.pow(this.base,2)/2,2/3),
        // Math.pow(this.base,3)/2, Math.pow(Math.pow(this.base,2)/2,1/3)*(Math.pow(this.base,3)/2), Math.pow(Math.pow(this.base,2)/2,2/3)*(Math.pow(this.base,3)/2),

        //19 WellTempered
        // 1
        // ,1.0378908155562134
        // ,1.0772173450159417
        // ,1.1180339887498947
        // ,1.1603972084031946
        // ,1.2043656049987448
        // ,1.2043656049987448*1.0378908155562134
        // ,1.2043656049987448*1.0772173450159417
        // ,1.337480609952844
        // ,1.388158841054579
        // ,1.440757311663705
        // ,1.4953487812212205419118989941409
        // ,1.5520087660826822
        // ,1.6108156439799475
        // ,1.6718507624410548
        // ,1.7351985513182235
        // ,1.800946639579631
        // ,1.800946639579631*1.0378908155562134
        // ,1.800946639579631*1.0772173450159417

        //Pythagorean Comma
        //Math.pow(2,7), Math.pow(1.5, 12)

        // 1, 1.0666666666666667, 1.125, 1.2000000000000002, 1.25, 1.2800000000000002, 1.3333333333333333, 1.5, 1.5625,
        // 1.25*1, 1.25*1.0666666666666667, 1.25*1.125, 1.25*1.2000000000000002, 1.25*1.25, 1.25*1.2800000000000002, 1.25*1.3333333333333333, 1.25*1.5, 1.25*1.5625,
        // 1.5*1, 1.5*1.0666666666666667, 1.5*1.125, 1.5*1.2000000000000002, 1.5*1.25, 1.5*1.2800000000000002, 1.5*1.3333333333333333, 1.5*1.5, 1.5*1.5625,

        // 1
        // ,(1.125 + 1.1098579146132868)/2
        // ,(1.265625 + 1.2485901539399475)/2
        // ,4/3
        // ,1.5
        // //,(1.5 + 1.4798105528177155)/2
        // ,(1.6875 + 1.6647868719199301)/2
        // ,(1.8984375 + 1.8728852309099215)/2

        //Bom para 19EDO
        //---------------------------------------------------
        // 1
        // ,Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),8)

        // ,1.2* 1
        // ,1.2* Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,1.2* Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,1.2* Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,1.2* Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,1.2* Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,1.2* Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,1.2* Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,1.2* Math.pow(Math.pow(this.base,1/this.eqt),8)

        // ,1.5* 1
        // ,1.5* Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,1.5* Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,1.5* Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,1.5* Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,1.5* Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,1.5* Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,1.5* Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,1.5* Math.pow(Math.pow(this.base,1/this.eqt),8)

        // ,1.8* 1
        // ,1.8* Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,1.8* Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,1.8* Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,1.8* Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,1.8* Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,1.8* Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,1.8* Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,1.8* Math.pow(Math.pow(this.base,1/this.eqt),8)

        // ,2.25* 1
        // ,2.25* Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,2.25* Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,2.25* Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,2.25* Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,2.25* Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,2.25* Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,2.25* Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,2.25* Math.pow(Math.pow(this.base,1/this.eqt),8)
        //--------------------------------------------------------------

        //Bom com 21EDO
        // 1
        // ,Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),8)

        // ,(1.25)* 1
        // ,(1.25)* Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,(1.25)* Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,(1.25)* Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,(1.25)* Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,(1.25)* Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,(1.25)* Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,(1.25)* Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,(1.25)* Math.pow(Math.pow(this.base,1/this.eqt),8)

        // ,(1.5)* 1
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),8)

        // ,(1.75)* 1
        // ,(1.75)* Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,(1.75)* Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,(1.75)* Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,(1.75)* Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,(1.75)* Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,(1.75)* Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,(1.75)* Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,(1.75)* Math.pow(Math.pow(this.base,1/this.eqt),8)

        // 1
        // ,Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,Math.pow(Math.pow(this.base,1/this.eqt),8)

        // ,(1.2)* 1
        // ,(1.2)* Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,(1.2)* Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,(1.2)* Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,(1.2)* Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,(1.2)* Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,(1.2)* Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,(1.2)* Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,(1.2)* Math.pow(Math.pow(this.base,1/this.eqt),8)

        // ,(1.5)* 1
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,(1.5)* Math.pow(Math.pow(this.base,1/this.eqt),8)

        // ,(1.8)* 1
        // ,(1.8)* Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,(1.8)* Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,(1.8)* Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,(1.8)* Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,(1.8)* Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,(1.8)* Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,(1.8)* Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,(1.8)* Math.pow(Math.pow(this.base,1/this.eqt),8)

        // ,(2)* 1
        // ,(2)* Math.pow(Math.pow(this.base,1/this.eqt),1)
        // ,(2)* Math.pow(Math.pow(this.base,1/this.eqt),2)
        // ,(2)* Math.pow(Math.pow(this.base,1/this.eqt),3)
        // ,(2)* Math.pow(Math.pow(this.base,1/this.eqt),4)
        // ,(2)* Math.pow(Math.pow(this.base,1/this.eqt),5)
        // ,(2)* Math.pow(Math.pow(this.base,1/this.eqt),6)
        // ,(2)* Math.pow(Math.pow(this.base,1/this.eqt),7)
        // ,(2)* Math.pow(Math.pow(this.base,1/this.eqt),8)

        //Prime Harmonic
        //1/1, 17/16, 37/32, 19/16, 5/4, 11/8, 23/16, 3/2, 13/8, 7/4, 29/16, 31/16

        //17 Unequal Tempered
        // 1
        // ,1.0343916737038537
        // ,1.0699661346278597
        // ,1.164335916513186
        // ,1.2043793774355849
        // ,1.2458
        // ,1.288645147100261
        // ,1.3329638105193877
        // ,1.3788066669498158
        // ,1.450529684792127
        // ,1.5004158284092517
        // ,1.55201764
        // ,1.6053941242575052
        // ,1.6606063151450532
        // ,1.7177173456860806
        // ,1.8692180390322457
        // ,1.933503575912

        // 1
        // ,(1.0534979423868314 + 1.06787109375)/2
        // ,1.125
        // ,1.1851851851851851
        // ,(1.2485901539399482 + 1.265625)/2
        // ,1.3333333333333333
        // ,(1.4046639231824418 + 1.423828125)/2
        // ,1.5
        // ,(1.5802469135802468 + 1.601806640625)/2
        // ,1.6875
        // ,1.7777777777777777
        // ,(1.8728852309099222 + 1.8984375)/2

        // 1
        // ,1.1157192200000001
        // ,1.2000038130101958
        // ,1.3388673182487616
        // ,1.4938
        // ,1.666661370836
        // ,1.7925656958746305

        //  1
        //  ,Math.pow(this.base, 2)/2
        //  //,2/Math.pow(this.base, 3)*8
        //  ,2/this.base
        //  ,this.base
        //  //,Math.pow(this.base, 3)/4
        //  ,2/Math.pow(this.base, 2)*4

        // ,Math.pow(Math.pow(this.base, 2)/2,1/3) * 1
        // ,Math.pow(Math.pow(this.base, 2)/2,1/3) * (Math.pow(this.base, 2)/2)
        // //,Math.pow(Math.pow(this.base, 2)/2,1/3) * (2/Math.pow(this.base, 3)*8)
        // ,Math.pow(Math.pow(this.base, 2)/2,1/3) * (2/this.base)
        // ,Math.pow(Math.pow(this.base, 2)/2,1/3) * (this.base)
        // //,Math.pow(Math.pow(this.base, 2)/2,1/3) * (Math.pow(this.base, 3)/4)
        // ,Math.pow(Math.pow(this.base, 2)/2,1/3) * (2/Math.pow(this.base, 2)*4)

        // ,Math.pow(Math.pow(this.base, 2)/2,2/3) * 1
        // ,Math.pow(Math.pow(this.base, 2)/2,2/3) * (Math.pow(this.base, 2)/2)
        // //,Math.pow(Math.pow(this.base, 2)/2,2/3) * (2/Math.pow(this.base, 3)*8)
        // ,Math.pow(Math.pow(this.base, 2)/2,2/3) * (2/this.base)
        // ,Math.pow(Math.pow(this.base, 2)/2,2/3) * (this.base)
        // //,Math.pow(Math.pow(this.base, 2)/2,2/3) * (Math.pow(this.base, 3)/4)
        // ,Math.pow(Math.pow(this.base, 2)/2,2/3) * (2/Math.pow(this.base, 2)*4)

        // ,Math.pow(Math.pow(this.base, 2)/2,3/4) * 1
        // ,Math.pow(Math.pow(this.base, 2)/2,3/4) * (Math.pow(this.base, 2)/2)
        // ,Math.pow(Math.pow(this.base, 2)/2,2/3) * (2/Math.pow(this.base, 3)*8)
        // ,Math.pow(Math.pow(this.base, 2)/2,3/4) * (2/this.base)
        // ,Math.pow(Math.pow(this.base, 2)/2,3/4) * (this.base)
        // ,Math.pow(Math.pow(this.base, 2)/2,2/3) * (Math.pow(this.base, 3)/4)
        // ,Math.pow(Math.pow(this.base, 2)/2,3/4) * (2/Math.pow(this.base, 2)*4)

        // ,Math.pow(1.1157192200000001, 1/3)*1
        // ,Math.pow(1.1157192200000001, 1/3)*1.1157192200000001
        // ,Math.pow(1.1157192200000001, 1/3)*1.2000038130101958
        // ,Math.pow(1.1157192200000001, 1/3)*1.3388673182487616
        // ,Math.pow(1.1157192200000001, 1/3)*1.4938
        // ,Math.pow(1.1157192200000001, 1/3)*1.666661370836
        // ,Math.pow(1.1157192200000001, 1/3)*1.7925656958746305

        // ,Math.pow(1.1157192200000001, 2/3)*1
        // ,Math.pow(1.1157192200000001, 2/3)*1.1157192200000001
        // ,Math.pow(1.1157192200000001, 2/3)*1.2000038130101958
        // ,Math.pow(1.1157192200000001, 2/3)*1.3388673182487616
        // ,Math.pow(1.1157192200000001, 2/3)*1.4938
        // ,Math.pow(1.1157192200000001, 2/3)*1.666661370836
        // ,Math.pow(1.1157192200000001, 2/3)*1.7925656958746305

        // 1
        // ,Math.pow(this.base,1/11)
        // ,Math.pow(this.base,2/11)
        // ,Math.pow(this.base,3/11)
        // ,Math.pow(this.base,4/11)
        // ,Math.pow(this.base,5/11)
        // ,Math.pow(this.base,6/11)
        // ,Math.pow(this.base,7/11)
        // ,Math.pow(this.base,8/11)
        // ,Math.pow(this.base,9/11)
        // ,Math.pow(this.base,10/11)
        // ,Math.pow(this.base,11/11)
        // // ,Math.pow(this.base,12/11)
        // // ,Math.pow(this.base,13/11)
        // // ,Math.pow(this.base,14/11)
        // // ,Math.pow(this.base,15/11)
        // // ,Math.pow(this.base,16/11)
        // // ,Math.pow(this.base,17/11)
        // // ,Math.pow(this.base,18/11)
        // ,this.base*Math.pow(4/3,1/8)
        // ,this.base*Math.pow(4/3,2/8)
        // ,this.base*Math.pow(4/3,3/8)
        // ,this.base*Math.pow(4/3,4/8)
        // ,this.base*Math.pow(4/3,5/8)
        // ,this.base*Math.pow(4/3,6/8)
        // ,this.base*Math.pow(4/3,7/8)

        //Interessante (Temperamento diferente baseado nas divisão dos intervalos)
        // 1
        // ,Math.pow(4/3,1/8)
        // ,Math.pow(4/3,2/8)
        // ,Math.pow(4/3,3/8)
        // ,Math.pow(4/3,4/8)
        // ,Math.pow(4/3,5/8)
        // ,Math.pow(4/3,6/8)
        // ,Math.pow(4/3,7/8)
        // ,Math.pow(4/3,8/8)
        // ,(4/3) * Math.pow(1.25,1/6)
        // ,(4/3) * Math.pow(1.25,2/6)
        // ,(4/3) * Math.pow(1.25,3/6)
        // ,(4/3) * Math.pow(1.25,4/6)
        // ,(4/3) * Math.pow(1.25,5/6)
        // ,(4/3) * Math.pow(1.25,6/6)
        // ,(5/3) * Math.pow(1.2,1/5)
        // ,(5/3) * Math.pow(1.2,2/5)
        // ,(5/3) * Math.pow(1.2,3/5)
        // ,(5/3) * Math.pow(1.2,4/5)

//CAdeia de quintas intercaladas com terça maior
//1,  25/24, 1.152, 1.2, 1.25, 125/96, 1.3824, 1.44
//1, 25/24, 1.0850694, 1.13028067, /*1.177375699*/ 1.188634022, 1.25, 125/96, 1.3563368055, 1.412850839
//1, 25/24, 1.0758438, 1.120647960, 1.177375699, 1.25, 125/96, 4/3, 1.412850839

//19 subset finetuned
// 1
// ,1.0400328069626328
// ,1.0675252146862264
// //,1.081668239558573
// ,1.1102612455335032
// ,1.1547081196540383
// ,1.200934326906333
// ,1.2490110989901737
// ,1.2820276751547421
// ,1.3333508415949649
// ,1.38672861845
// ,1.4422432575419675
// ,1.4999803034643038
// ,1.601266795480842
// ,1.66537
// ,1.7320394357313598
// ,1.8013778361136608
// ,1.9230162612282458

//CPS Hexany (4,2) = 1, 3, 5, 7
//https://en.wikipedia.org/wiki/Hexany
//1*3, 1*5, 1*7, 3*5, 3*7, 7*5
// 1, 5/4, 7/4, //1*3, 3*5, 3*7 Hamonic
// 1, 7/5, 7/4, //1*5, 1*7, 5*7 SubHarmonic
// 1, 3/2, 7/4, // 1*5, 3*5, 5*7 Harmonic
// 1, 7/6, 7/4, // 1*3, 1*7, 3*7 SubHarmonic
// 1, 7/6, 5/3, // 1*3, 1*5, 1*7 Harmonic
// 1, 7/6, 7/5, // 3*5, 3*7, 5*7 SubHarmonic
// 1, 5/4, 3/2, // 1*7, 3*7, 5*7 Harmonic
// 1, 5/4, 5/3, // 1*3, 1*5, 3*5 SubHarmonic

//1, 7/6, 6/5, 5/4, 4/3, 7/5, 3/2, 5/3, 7/4,
// 1, 12/7, 5/3, 8/5, 3/2, 10/7, 4/3, 6/5, 8/7

// 1
// ,3
// ,1.5811387712794926
// ,4.743416313838478
// ,2.499999814043224
// ,1.3176155447250877
// ,3.952846634175263
// ,2.0833330234053844
// ,1.0980128722643934
// ,3.29403861679318
// ,1.7361107237011897
// ,5.208332171103568
// ,2.74503197647805
// ,1.446758828803807
// ,4.34027648641142
// ,2.287526476912609
// ,1.205632267658303
// ,3.6168968029749085
// ,1.9062719223001576

//MOS
// 1
// ,1.0999434961596022
// ,1.222222222222222
// ,1.3443753841950685
// ,1.4938271604938274
// ,1.6431254695717503
// ,1.8257887517146776
// ,2.008264462809917

//1, Math.sqrt(this.base)/(this.base/(2/this.base)), Math.sqrt(this.base), 2/this.base, this.base, Math.sqrt(4/this.base), Math.sqrt(4/this.base) * (this.base/(2/this.base))
//1, 2/this.base, this.base

// 1, 4/3, 3/2, 2,
// 1.25*1, 1.25*4/3, 1.25*3/2, 1.25*2,
// 1.171875732422*1, 1.171875732422*4/3, 1.171875732422*3/2, 1.171875732422*2,
// 1.125*1, 1.125*4/3, 1.125*3/2, 1.1225*2,
// 1,
// Math.pow(1.118033988749895,1),
// Math.pow(1.118033988749895,2),
// Math.pow(1.118033988749895,2)* 16/15,
// Math.pow(1.118033988749895,3)* 16/15,
// Math.pow(1.118033988749895,4)* 16/15,
// 16/9,
// 1, 1.6770509831248422/1.5, 1.25, 4/3, 3/2, 1.6770509831248422, 15/8, 2
// ,1
// ,1.1180339887498947
// ,1.2499999999999998
// ,1.337480609952844
// ,1.4953487812212205
// ,1.6718507624410548
// ,1.8691859765265255,

// 1
// ,1.1215115859159155
// ,1.257788237343632
// ,1.3354053616550763
// ,1.4976725849904013
// ,1.6796571559753737
// ,1.8837549607929576

// ,1.7833074799371251
// ,1.1907191850938197
// ,1.0617092146412235
// ,1.4106240808096404
// ,1.59009278399985

//22EDO scales
//Superpyth[5], pentatonic - 45454
// 1,
// Math.pow(2, 4/22),
// Math.pow(2, 9/22),
// Math.pow(2, 13/22),
// Math.pow(2, 18/22),
// Math.pow(2, 22/22),
//Superpyth[7], diatonic - 4144414
// 1,
// Math.pow(2, 4/22),
// Math.pow(2, 5/22),
// Math.pow(2, 9/22),
// Math.pow(2, 13/22),
// Math.pow(2, 17/22),
// Math.pow(2, 18/22),
//Math.pow(2, 22/22),
//Porcupine[7] - 3334333
// 1,
// Math.pow(2, 3/22),
// Math.pow(2, 6/22),
// Math.pow(2, 9/22),
// Math.pow(2, 13/22),
// Math.pow(2, 16/22),
// Math.pow(2, 19/22),
//Porcupine[8] - 33333331
// 1,
// Math.pow(2, 3/22),
// Math.pow(2, 6/22),
// Math.pow(2, 9/22),
// Math.pow(2, 12/22),
// Math.pow(2, 15/22),
// Math.pow(2, 18/22),
// Math.pow(2, 21/22),

//1, 16/15, 9/8, 6/5, 5/4, 4/3, 3/2 / (16/15), 3/2, 5/3 / (16/15), 5/3, 2

//Selected 15EDO
//1, 25/24, 12/11, 8/7, 6/5, 5/4, 4/3, 7/5, 10/7, 3/2,  8/5, 5/3, 7/4, 11/6, 48/25, 2
// 1, 25/24, 12/11, 8/7, 6/5, 5/4, 1.3125, 11/8, 36/25, 1.5277777,  8/5, 5/3, 7/4, 11/6, 48/25 //(Interessante!!!, possui varias inversões de acordes)
// 1, 8/7, 4/3, 3/2, (8/7)*3/2,

// 1,
// 1.220703125,
// 5/4,
// 1.28,
// 2/1.28,
// 1.6,
// 2/1.220703125,
// 2

//Reverse equal temperament
// 2,
// 2/(32/(32-(64-(64/(Math.pow(this.base, 1/this.eqt)))))),
// 2/(32/(32-(64-(64/(Math.pow(this.base, 2/this.eqt)))))),
// 2/(32/(32-(64-(64/(Math.pow(this.base, 3/this.eqt)))))),
// 2/(32/(32-(64-(64/(Math.pow(this.base, 4/this.eqt)))))),
// 2/(32/(32-(64-(64/(Math.pow(this.base, 5/this.eqt)))))),
// 2/(32/(32-(64-(64/(Math.pow(this.base, 6/this.eqt)))))),
// 2/(32/(32-(64-(64/(Math.pow(this.base, 7/this.eqt)))))),
// 2/(32/(32-(64-(64/(Math.pow(this.base, 8/this.eqt)))))),
// 2/(32/(32-(64-(64/(Math.pow(this.base, 9/this.eqt)))))),
// 2/(32/(32-(64-(64/(Math.pow(this.base, 10/this.eqt)))))),
// 2/(32/(32-(64-(64/(Math.pow(this.base, 11/this.eqt)))))),
// 2/(32/(32-(64-(64/(Math.pow(this.base, 12/this.eqt)))))),

/*Codigo para gerar sequencia N
var r = "";
var n = 50;
var nn = parseInt(n/2);
for(var i = 0; i <= nn; i++)
{
    r += `${n}/${n-i}, `
}
console.log(r)
*/
 // 1, 
  //2,
          //3, 3/2,
           //4, 4/2, 4/3,
           //5, 5/2, 5/3, 5/4,
           //6, 6/2, 6/3, 6/4, 6/5,
         // 7, 7/2, 7/3, 7/4, 7/5, 7/6,
           //8, 8/2, 8/3, 8/4, 8/5, 8/6, 8/7, 8/8,
           //9, 9/2, 9/3, 9/4, 9/5, 9/6, 9/7, 9/8,
           //10, 10/2, 10/3, 10/4, 10/5, 10/6, 10/7, 10/8, 10/9,
           //11, 11/2, 11/3, 11/4, 11/5, 11/6, 11/7, 11/8, 11/9, 11/10,
           //12, 12/3, 12/3, 12/4, 12/5, 12/6, 12/7, 12/8, 12/9, 12/10, 12/11
           //13, 13/2, 13/3, 13/4, 13/5, 13/6, 13/7, 13/8, 13/9, 13/10, 13/11, 13/12,
           //14, 14/2, 14/3, 14/4, 14/5, 14/6, 14/7, 14/8, 14/9, 14/10, 14/11, 14/12, 14/13, 
           //20, 20/2, 20/3, 20/4, 20/5, 20/6, 20/7, 20/8, 20/9, 20/10, 20/11, 20/12, 20/13, 20/14, 20/15, 20/16, 20/17, 20/18, 20/19,
           //28, 28/2, 28/3, 28/4, 28/5, 28/6, 28/7, 28/8, 28/9, 28/10, 28/11, 28/12, 28/13, 28/14, 28/15, 28/16, 28/17, 28/18, 28/19, 28/20, 28/21, 28/22, 28/23, 28/24, 28/25, 28/26, 28/27
          // 50/50, 50/49, 50/48, 50/47, 50/46, 50/45, 50/44, 50/43, 50/42, 50/41, 50/40, 50/39, 50/38, 50/37, 50/36, 50/35, 50/34, 50/33, 50/32, 50/31, 50/30, 50/29, 50/28, 50/27, 50/26, 50/25
           

//http://www.anaphoria.com/centaur.html
//Centaur 19
//1, 21/20, 35/32, 9/8, 7/6, 6/5, 5/4, 21/16, 4/3, 7/5, 35/24, 3/2, 14/9, 8/5, 5/3, 7/4, 9/5, 15/8, 63/32

//Phi divisions of guitar string
// 65/65
// ,65/40.17223382
// ,65/24.82782107
// ,65/15.34444667
// ,65/9.483395374
// ,65/5.861064252
// ,65/3.622339131
//  ,65/2.23873007
//  ,65/1.38361212

// ,65/(40.17223382+15.34444667)
// ,65/(40.17223382+9.483395374)
// ,65/(40.17223382+5.861064252)
// ,65/(40.17223382+3.622339131)
//  ,65/(40.17223382+2.23873007)
//  ,65/(40.17223382+1.38361212)

// ,65/(24.82782107 + 9.483395374)
// ,65/(24.82782107 + 5.861064252)
// ,65/(24.82782107 + 3.622339131)
//  ,65/(24.82782107 + 2.23873007)
//  ,65/(24.82782107 + 1.38361212)

// ,65/(15.34444667 + 5.861064252)
// ,65/(15.34444667 + 3.622339131)
//  ,65/(15.34444667 + 2.23873007)
//  ,65/(15.34444667 + 1.38361212)

// ,65/(9.483395374 + 3.622339131)
//  ,65/(9.483395374 + 2.23873007)
//  ,65/(9.483395374 + 1.38361212)

//  ,65/(5.861064252 + 2.23873007)
//  ,65/(5.861064252 + 1.38361212)
// //,65/(40.17223382+15.34444667+5.861064252)
// //,65/(40.17223382+15.34444667+5.861064252+2.23873007)

 //Escala hexatônica legal para 30ed3
// 1
// ,1.0759896247253458
// ,1.2009369551760023
// ,1.4960443215903987
// ,1.6097281681605375
// ,1.7966549123791213

// 1
// ,1.0594630943592953
// ,1.1892071150027212
// ,1.498307076876682
// ,1.5874010519682
// ,1.7817974362806794

//Integer triangles
//https://en.wikipedia.org/wiki/Integer_triangle
// 3,4,5, 
// 13,14,15,
// 5,12,13,
// 6,25,29,
// 7,15,20,
// 9,10,17,
// 68,85,87,
// 127,131,158,
// 113,243,290,
// 145,207,328,
// 327,386,409,
// 135,352,377,
// 132,366,366,

// 1,
// 1 * 1.5,
// 1 * 1.5 * (5/3),
// 1 * 1.5 * (5/3) * 1.5,
// 1 * 1.5 * (5/3) * 1.5 * (5/3),
// 1 * 1.5 * (5/3) * 1.5 * (5/3) * 1.5,
// 1 * 1.5 * (5/3) * 1.5 * (5/3) * 1.5 * (5/3),
// 1 * 1.5 * (5/3) * 1.5 * (5/3) * 1.5 * (5/3) * 1.5,

// 1
// ,1.0991312225591843
// ,1.208089444404447
// ,1.3278488279891056
// ,1.5061955531706088
// ,1.6555065597696181
// ,1.8196189489943297

//Legal: Repeat Math.sqrt(2)
// 1,
// 1.0298572716643797,
// 1.06066017177982,
// 1.2137487898581,
// 1.25,
// 1.373199999

//Magic[16] 19edo Repeat 1.2457309396155174
// 1,
// 1.0345743207503675,
// 1.070333333,
// 1.1161231697263,
// 1.2041,

// 1, 
// 1.0650410894399627,
// 1.0991312225591843,
// 1.1706199147119116,
// //1.2080894444044472,
// 1.2467583092848906,
// 1.2866648980094315,
// 1.3703509847201234,
// 1.4142135623730947,


//Legal Repeat 1.4142135623730947
// 1, 
// 1.0650410894399627,
//  1.2467583092848906,
//ou
// 1, 
// 1.0650410894399627,
//  1.2467583092848906,
// 1.3278488279891056,

//Legal, subset 22edo
// 1
// ,1.0991312225591843
// ,1.208089444404447
// ,1.3278488279891056
// ,1.3703509847201212
// ,1.4594801056814455
// ,1.5061955531706088
// ,1.6555065597696181
// ,1.8196189489943297

//Golden Ratio Diatônica \o/ (L/s = PHI)
// 1
// ,1.117564
// ,1.248949294096
// ,1.3377620783991666
// ,1.4950347393840864
// ,1.6707970034850368
// ,1.867222582402752

// ,Math.pow(this.repeatScaleValue, 1) * 1
// ,Math.pow(this.repeatScaleValue, 1) * 1.117564
// ,Math.pow(this.repeatScaleValue, 1) * 1.248949294096
// ,Math.pow(this.repeatScaleValue, 1) * 1.3377620783991666
// ,Math.pow(this.repeatScaleValue, 1) * 1.4950347393840864
// ,Math.pow(this.repeatScaleValue, 1) * 1.6707970034850368
// ,Math.pow(this.repeatScaleValue, 1) * 1.867222582402752


//Golden Pentatônica \o/ (L/s = PHI)
1
,1.117564
,1.3377620783991666
,1.4950347393840864
,1.7896073784028579

//Golden Pentatônica Reversa
,1
,1.177778248966296
,1.3031164676231177
,1.5347822314363007
,1.698112528190552


//Golden Diatônica Reversa (Pelog? 16EDO aproxima bem)
// 1
// ,1.087803
// ,1.1833153668090002
// ,1.3559385958344639
// ,1.4749940723645174
// ,1.6045029769003392
// ,1.7453831517811198

//Legal Repeat: 1,4142135623730951
// 1,
// 1.060660171779821,
// 1.24721912892464712,

//Repeat: 1,4142135623730951
// 1,
// 1.064844316803016,
// 1.133893419027682,
// 1.24721912892464712/1.064844316803016,
// 1.24721912892464712,

// 1
// ,(1.3377620783991666 / 1.248949294096)
// ,1.1472766320999999
//,1.117564
// ,1.117564 * (1.3377620783991666 / 1.248949294096)
 //,1.248949294096
// ,1.3377620783991666
// ,1.3957807689071022


// 1
// ,1.5
// ,1.1174033085417048
// ,1.6761049628125573
// ,1.2485901539399484
// ,1.8728852309099226
// ,1.3951787690250947
// ,1.039318248343856
// ,1.5589773725157843
// ,1.1613376493271939
// ,1.742006473990791
// ,1.2976825316922527
// ,1.946523797538379
// ,1.450034754349699
// ,1.0801824213405413
// ,1.620273632010812
// ,1.2069994114345108
// ,1.8104991171517657
// ,1.3487051357448123

//Golden Mavila (Anti diatonic)
// 1,
//   Math.pow(1.087803,0.5),
// Math.pow(1.087803,1),
//   Math.pow(1.087803,1.5),
// Math.pow(1.087803,2),
//   Math.pow(1.087803,2) * Math.pow(1.145881,1/3),
//   Math.pow(1.087803,2) * Math.pow(1.145881,2/3),
// Math.pow(1.087803,2) * Math.pow(1.145881,1),
//   Math.pow(1.087803,2.5) * Math.pow(1.145881,1),
// Math.pow(1.087803,3) * Math.pow(1.145881,1),
//   Math.pow(1.087803,3.5) * Math.pow(1.145881,1),
// Math.pow(1.087803,4) * Math.pow(1.145881,1),
//   Math.pow(1.087803,4.5) * Math.pow(1.145881,1),
// Math.pow(1.087803,5) * Math.pow(1.145881,1),
//   Math.pow(1.087803,5) * Math.pow(1.145881,1) * Math.pow(1.145881,1/3),
//   Math.pow(1.087803,5) * Math.pow(1.145881,1) * Math.pow(1.145881,2/3),

//Acorde 3:4:5:6:7 (7/3 ^ 9 ~= 2)
// 1
// ,1.080059738892306
// ,1.1665290395761165
// ,1.259921049894873
// ,1.3607900001743767
// ,1.4697344922755984
// ,1.587401051968199
// ,1.714487965706145
// ,1.85174942457458
// ,1.3332645197880582 * 1
// ,1.3332645197880582 * 1.080059738892306
// ,1.3332645197880582 * 1.1665290395761165
// ,1.3332645197880582 * 1.259921049894873
// ,1.3332645197880582 * 1.3607900001743767
// ,1.3332645197880582 * 1.4697344922755984
// ,1.3332645197880582 * 1.587401051968199
// ,1.3332645197880582 * 1.714487965706145
// ,1.3332645197880582 * 1.85174942457458
// ,1.6665290395761165 * 1
// ,1.6665290395761165 * 1.080059738892306
// ,1.6665290395761165 * 1.1665290395761165
// ,1.6665290395761165 * 1.259921049894873
// ,1.6665290395761165 * 1.3607900001743767
// ,1.6665290395761165 * 1.4697344922755984
// ,1.6665290395761165 * 1.587401051968199
// ,1.6665290395761165 * 1.714487965706145
// ,1.6665290395761165 * 1.85174942457458
// ,2.333058079152233 * 1
// ,2.333058079152233 * 1.080059738892306
// ,2.333058079152233 * 1.1665290395761165
// ,2.333058079152233 * 1.259921049894873
// ,2.333058079152233 * 1.3607900001743767
// ,2.333058079152233 * 1.4697344922755984
// ,2.333058079152233 * 1.587401051968199
// ,2.333058079152233 * 1.714487965706145
// ,2.333058079152233 * 1.85174942457458

//Combinação 24 possibilidades intervalos tetrade
// 1, 1, 1, 1, 1, 1, 1, 1, 1,
// 5/4, 5/4, 5/4, 5/4, 5/4, 5/4, 0, 0 ,0,
// 5/4 * 6/5, 5/4 * 6/5, 5/4 * 7/6, 5/4 * 7/6, 5/4 * 8/7, 5/4 * 8/7, 0, 0 ,0,
// 5/4 * 6/5 * 7/6, 5/4 * 6/5 * 8/7, 5/4 * 7/6 * 6/5, 5/4 * 7/6 * 8/7, 5/4 * 8/7 * 6/5, 5/4 * 8/7 * 7/6, 0, 0 ,0,
// 1, 1, 1, 1, 1, 1, 1, 1, 1,
// 6/5, 6/5, 6/5, 6/5, 6/5, 6/5, 0, 0, 0,
// 6/5 * 5/4, 6/5 * 5/4, 6/5 * 7/6, 6/5 * 7/6, 6/5 * 8/7, 6/5 * 8/7, 0, 0, 0,
// 6/5 * 5/4 * 7/6, 6/5 * 5/4 * 8/7, 6/5 * 7/6 * 5/4, 6/5 * 7/6 * 8/7, 6/5 * 8/7 * 5/4, 6/5 * 8/7 * 7/6, 0, 0, 0,
// 1, 1, 1, 1, 1, 1, 1, 1, 1,
// 7/6, 7/6, 7/6, 7/6, 7/6, 7/6, 0, 0, 0,
// 7/6 * 5/4, 7/6 * 5/4, 7/6 * 6/5, 7/6 * 6/5, 7/6 * 8/7, 7/6 * 8/7, 0, 0, 0,
// 7/6 * 5/4 * 6/5, 7/6 * 5/4 * 8/7, 7/6 * 6/5 * 5/4, 7/6 * 6/5 * 8/7, 7/6 * 8/7 * 5/4, 7/6 * 8/7 * 6/5, 0, 0, 0,
// 1, 1, 1, 1, 1, 1, 1, 1, 1,
// 8/7, 8/7, 8/7, 8/7, 8/7, 8/7, 0, 0, 0,
// 8/7 * 5/4, 8/7 * 5/4, 8/7 * 6/5, 8/7 * 6/5, 8/7 * 7/6, 8/7 * 7/6, 0, 0, 0,
// 8/7 * 5/4 * 6/5, 8/7 * 5/4 * 7/6, 8/7 * 6/5 * 5/4, 8/7 * 6/5 * 7/6, 8/7 * 7/6 * 5/4, 8/7 * 7/6 * 6/5, 0, 0, 0,
//  Escala de valores únicos
//1,1.1428571428571428,1.1666666666666667,1.2,1.25,1.3333333333333333,1.3714285714285714,1.4,1.4285714285714284,1.4583333333333333,1.5,1.6,1.6666666666666667,1.7142857142857142,1.75

//BolherPierce
// 1
// ,1.0881822434633168
// ,1.1841405949888573
// ,1.2885607692309615
// ,1.402188948700565
// ,1.5258371159564506
// ,1.6603888560010875
// ,1.8068056703447535
// ,1.966133847857996
// ,2.1395119415112775
// ,2.3281789044302985
// ,2.5334829434069297
// ,2.7568911531326
// ,3.000000000000003
// ,this.repeatScaleValue * 1
// ,this.repeatScaleValue * 1.0881822434633168
// ,this.repeatScaleValue * 1.1841405949888573
// ,this.repeatScaleValue * 1.2885607692309615
// ,this.repeatScaleValue * 1.402188948700565
// ,this.repeatScaleValue * 1.5258371159564506
// ,this.repeatScaleValue * 1.6603888560010875
// ,this.repeatScaleValue * 1.8068056703447535
// ,this.repeatScaleValue * 1.966133847857996
// ,this.repeatScaleValue * 2.1395119415112775
// ,this.repeatScaleValue * 2.3281789044302985
// ,this.repeatScaleValue * 2.5334829434069297
// ,this.repeatScaleValue * 2.7568911531326
// ,this.repeatScaleValue * 3.000000000000003

//Golden scales
//Golden Pentatonic
//1, 1.117564, 1.117564*1.197034, 1.117564*1.197034*1.117564, 1.117564*1.197034*1.117564*1.197034
//1, 1.117564, 1.117564*1.197034, 1.117564*1.197034*1.117564, 1.117564*1.197034*1.117564*1.197034

//1,
//Math.pow(1.117564, 1/3),
//Math.pow(1.117564, 2/3),
//1.117564,
//1.117564*Math.pow(1.117564 , 1/3), 
//1.117564*Math.pow(1.117564 , 2/3), 
//1.117564*Math.pow(1.117564 , 3/3), 
//1.117564*Math.pow(1.197034 , 4/4), 
//1.117564*Math.pow(1.197034 , 4/4) * Math.pow(1.117564, 1/3), 
//1.117564*Math.pow(1.197034 , 4/4) * Math.pow(1.117564, 2/3), 
//Repeat: 1.4950347693089112

//Escala de MOS11 (19edo)
// 1
// ,1.0371550444461919
// ,1.1571102372827198
// ,1.2001027195781029
// ,1.244692589464023
// ,1.388651142614656
// ,1.4402465375387585
// ,1.6068224531337645
// ,1.6665240127970886

// ,1.2001027195781029
// ,1.244692589464023
// ,1.388651142614656
// ,1.4402465375387585
// ,1.6068224531337645
// ,1.6665240127970886
// ,1.7284437865632105
// ,1.9283519958849897
// ,1.9999999999999993

// ,1.6068224531337645
// ,1.6665240127970886
// ,1.7284437865632105
// ,1.9283519958849897
// ,1.9999999999999993
// ,2 * 1.0371550444461919
// ,2 * 1.1571102372827198
// ,2 * 1.2001027195781029
// ,2 * 1.244692589464023

//1,
//1.6696270355495002637284476040757,
//1.6696270355495002637284476040757 * 1.6028419541275202531793096999126,

//Matriz 7x7
// 1
// ,1.066666667
// ,1.09375
// ,1.125
// ,1.142857143
// ,1.166666667
// ,1.2
// ,1.25
// ,1.28
// ,1.306122449
// ,1.3125
// ,1.333333333
// ,1.4
// ,1.428571429
// ,1.5
// ,1.523809524
// ,1.53125
// ,1.5625
// ,1.6
// ,1.666666667
// ,1.714285714
// ,1.75
// ,1.777777778
// ,1.828571429
// ,1.875

//Golden 19
// 1
// ,1.0265864277123251
// ,1.07111
// ,1.117564
// ,1.1472760343340247
// ,1.197033509
// ,1.248949294
// ,1.2821543942091507
// ,1.337761557
// ,1.3733283931813633
// //,Math.sqrt(1.395780769 * 1.432889781)
// ,1.395780769
// ,1.495034156
// ,1.534781773579949
// ,1.601346035
// ,1.670796352
// ,1.7152168587116252
// ,1.78960668
// //,Math.sqrt(1.8371859291265378 * 1.867221854)
// ,1.867221854
// ,1.9168646126081688


// 1
// ,1.117564
// ,1.248949294
// ,1.337761557
// ,1.495034156
// ,1.670796352
// ,1.867221854

// ,1.2821547034209912
// ,1.4328899389739767
// ,1.6013462117595134
// ,1.7152179408777324
// ,1.9168658228790822
// ,1.0711101182400191
// ,1.197034108180789

// ,1.1660330343874241
// ,1.3031165420421473
// ,1.4563161351907903
// ,1.5598747755642075
// ,1.743259893678638
// ,1.948204499819073
// ,2.177243213635803


//4, 4/(4/3), 4/(5/3), 4/(7/3)

//1, 1.25, 1.5, 2, 2.5, 3, 4, 0, 0,
//1, 1.25, 5/3, 25/12, 25/9, 125/36
//1, 4/3, 5/3, 2, 7/3, 8/3, //3

//Sequencia de padovan
///*1, 1, 1, 2,*/ 2, 3, 4, 5, 7, 9, 12, 16, 21, 28, 37, 49, 65, 86, 114, 151, 200, 265

// 1
// ,1.0433717363454582
// ,1.1175644807212748
// ,1.1660351927281667
// ,1.2489503685698122

//1
//,1.117564
//,1.3377620783991666
//,1.4950347393840864
//,1.3377620783991666*1.3377620783991666

// ,Math.pow(this.testValue, 1) * 1
// ,Math.pow(this.testValue, 1) * 1.117564
// ,Math.pow(this.testValue, 1) * 1.3377620783991666
// ,Math.pow(this.testValue, 1) * 1.4950347393840864
// ,Math.pow(this.testValue, 1) * 1.3377620783991666*1.3377620783991666

// ,Math.pow(this.testValue, 2) * 1
// ,Math.pow(this.testValue, 2) * 1.117564
// ,Math.pow(this.testValue, 2) * 1.3377620783991666
// ,Math.pow(this.testValue, 2) * 1.4950347393840864
// ,Math.pow(this.testValue, 2) * 1.3377620783991666*1.3377620783991666

// ,1.117564 * 1.117564
// ,1.117564 * 1.117564 * this.testValue
// //,(2/ (1.117564 * 1.117564))
// ,(2/ (1.117564 * 1.117564)) * this.testValue
// ,(2/ (1.117564 * 1.117564)) * this.testValue * this.testValue

// ,Math.pow(this.testValue, 3) * 1
// ,Math.pow(this.testValue, 3) * 1.117564
// ,Math.pow(this.testValue, 3) * 1.3377620783991666
// ,Math.pow(this.testValue, 3) * 1.4950347393840864
// ,Math.pow(this.testValue, 3) * 1.3377620783991666*1.3377620783991666

// ,Math.pow(this.testValue, 4) * 1
// ,Math.pow(this.testValue, 4) * 1.117564
// ,Math.pow(this.testValue, 4) * 1.3377620783991666
// ,Math.pow(this.testValue, 4) * 1.4950347393840864
// ,Math.pow(this.testValue, 4) * 1.3377620783991666*1.3377620783991666

// ,Math.pow(this.testValue, 5) * 1
// ,Math.pow(this.testValue, 5) * 1.117564
// ,Math.pow(this.testValue, 5) * 1.3377620783991666
// ,Math.pow(this.testValue, 5) * 1.4950347393840864
// ,Math.pow(this.testValue, 5) * 1.3377620783991666*1.3377620783991666


]; //AQUI!

      //CentsToRatios
      //ratiosArr = ratiosArr.map(v => this.centsToRatio(v))

      //MAtrix
      // var mm = [1, 5/4, 1.5, 7/4, 2];
      // ratiosArr = [
      //   mm[0]*mm[0], mm[1]*mm[0], mm[2]*mm[0], mm[3]*mm[0], mm[4]*mm[0], 0,0,0,0,
      //   mm[0]*mm[1], mm[1]*mm[1], mm[2]*mm[1], mm[3]*mm[1], mm[4]*mm[1], 0,0,0,0,
      //   mm[0]*mm[2], mm[1]*mm[2], mm[2]*mm[2], mm[3]*mm[2], mm[4]*mm[2], 0,0,0,0,
      // ]

      //Tentativa MOS Golden
      // var intervalRatiosArr = [0,1200];
      // var intervalConstant = PHI;
      // for (let interation = 0; interation < this.eqt; interation++) {

      //   var newRatioArr = [];
      //   for (let ratioIdx = 0; ratioIdx < intervalRatiosArr.length; ratioIdx++) {

      //     if(ratioIdx+1 < intervalRatiosArr.length){
      //       const el1 = intervalRatiosArr[ratioIdx];
      //       const el2 = intervalRatiosArr[ratioIdx+1];

      //       var diff = el2 - el1;

      //       if(newRatioArr.length == 0 || (newRatioArr.length > 0 && newRatioArr[newRatioArr.length-1].toFixed(4) != diff.toFixed(4))){
      //         var newRatioDiff = (diff / intervalConstant) + el1;
      //         newRatioArr.push(newRatioDiff);
      //       }
      //     }
      //   }

      //   intervalRatiosArr = intervalRatiosArr.concat(newRatioArr);
      //   intervalRatiosArr.sort((a,b) => a-b);
      // }
      // ratiosArr = intervalRatiosArr.map(e => this.centsToRatio(e));

        //Generator
      if (false) {
        var init = 1;
        var cc = init;
        ratiosArr = [];
        ratiosArr.push(cc);
        var start = 0;
        var r = this.eqt + 1; //53 + start ;

        //Formula: s = 1200 / (Xs + (YL)*phi) e L = PHI*s
        var nRatio = this.repeatScaleValue;;
        var sCents = 1200 / (2 + 5*nRatio);
        var Lcents = nRatio * sCents;
        var s = this.centsToRatio(sCents);
        var L = this.centsToRatio(Lcents);
        console.log("s:"+s);
        console.log("L:"+L);

        //var s = this.centsToRatio(192.4290089296681593); 
        //var s = this.centsToRatio(175.0777162687612); 
        //var L = this.centsToRatio(311.356486605497760);
        //var L = this.centsToRatio(283.2815224874925);
        
        //var arrIntervals = [ s,L,s,L,s ] //Pentatônica (2L 3s)
        var arrIntervals = [ L,L,s,L,L,L,s ] //Diatônica (5L 2s)
        //var arrIntervals = [ L,s,L,s,L ] //Anti-Pentatônica (3L 2s)
        //var arrIntervals = [ s,s,L,s,s,s,L ] //Anti-Diatônica (2L 5s)
        
        //var arrIntervals = [ s, L, s, s, L, s, L, s, s, L, s ] 
        
        //var arrIntervals = [ 1.0606601717798212, 1.0606601717798214, 1.0540925533894598, 1.0540925533894598, 1.06666664, 1.0606601982963262, 1.0606601717798212, 1.0666666666666667, 1.0540925533894596, 1.054092553384848, 1.0606601717844617, 1.0606601717798212, 1.0606601717798212, 1.0606601717798214, 1.0540925533894598, 1.0540925533894598, 1.06666664, 1.0606601982963262, 1.0606601717798212, 1.0666666666666667, 1.0540925533894596, 1.054092553384848, 1.0606601717844617, 1.0606601717798212, 1.0606601717798212, 1.0606601717798214, 1.0540925533894598 ]
        //var arrIntervals = [1.041665, 1.066668373336064, 1.0546875, 1.0666666666666667, 1.0666666666666667, 1.0416666, 1.0800000691200045, 1.0416666666666667, 1.0666666666666667, 1.0666666666666667, 1.0546875, 1.0666666666666667, 1.041665, 1.066668373336064, 1.0546875, 1.0666666666666667, 1.0666666666666667, 1.0416666, 1.0800000691200045, 1.0416666666666667, 1.0666666666666667, 1.0666666666666667, 1.0546875, 1.0666666666666667, 1.041665, 1.066668373336064, 1.0546875 ];
        //arrIntervals = this.smooth(arrIntervals);
        //arrIntervals = this.averageItemsByValue(arrIntervals, Math.pow(2,1/12));
        //arrIntervals = this.averageItemsByValue(arrIntervals, Math.pow(2,1/12));
        //arrIntervals = this.averageItemsByValue(arrIntervals, Math.pow(2,1/12));

        // var arrIntervals = [1.125, 1.1851851851851851,1.125, 1.1851851851851851, 1.125]; //Pentatônica ChingLing
        //var arrIntervals = [ 1.25, 1.2 ];  //Geradora Wilckerson's Scale (Na verdade é só uma escala pitagórica com mais itens entre as quintas =/)
        //var arrIntervals = [1.0546875, 1.0666666666666667, 1.1111111111111112, 1.0125, 1.1111111111111112, 1.0666666666666667]
        //var arrIntervals = [ 1.25115 ];  //Gerador de uma quinta que harmoniza muito bem com a 3M. Para 5a perfeita: (6^1/8)
        //var arrIntervals = [  1.2, 1.0416666666666666, 1.2 ];
        //var arrIntervals = [  1.2,1.25 ];
        //var arrIntervals = [  9/8, 32/27 ]//9/8, 16/15,10/9 ];
        //var arrIntervals = [  9/8, 32/27, 9/8, 32/27, 9/8 ]; //JI LIMIT-3
        //var arrIntervals = [  16/15, 1.0546875, 16/15,1.0416666666,16/15,16/15, 1.0546875, 16/15,1.0416666666,16/15,1.0546875, 16/15  ]; //JI LIMIT-5
        //var arrIntervals = [  9/8, 9/8, 256/243, 9/8, 9/8, 256/243, 9/8 ];
        //var arrIntervals = [  1.5 ];
        //var arrIntervals = [  1.5, 5/3 ];
        //var arrIntervals = [  1.0400419115259512, 1.0345637159435739];
        //var arrIntervals = [  1.4983070768766814987992807320298 ];
        //var arrIntervals = [1.040041911525952, 1.0674995157120024, 1.040041911525952, 1.040041911525952, 1.040041911525952, 1.0674995157120026, 1.040041911525952, 1.040041911525952];
//         var arrIntervals = [
// 1.036038002584053
// ,1.0415862958033848
// ,1.036038002584053
// ,1.036038002584053
// ,1.036038002584053
// ,1.036038002584053
// ,1.0415862958033848
// ,1.036038002584053
// ,1.036038002584053
// ,1.0415862958033848
// ,1.036038002584053
// ,1.036038002584053
// ,1.0415862958033848
// ,1.036038002584053
// ,1.036038002584053
// ,1.036038002584053
// ,1.036038002584053
// ,1.0415862958033848
//         ];
        //arrIntervals = this.smooth(arrIntervals);
        //arrIntervals = this.smooth(arrIntervals);
        //arrIntervals = this.smooth(arrIntervals);
        //var arrIntervals = [   1.1211111111111 ];
        //var arrIntervals = [   1.5, 1.33333333, 1.25, 1.2 ];
        //var arrIntervals = [
        ////1,4953487812212205419118989941409 //3M
        ////1,4998119262282671416907020643464 //3m
        ////1,4981532695504099431340682489127 //4a
        //1.498324210775315825107190007886 //Media
        // ];
        //var arrIntervals = [5/4,6/5,7/6,8/7,9/8]

        //var arrIntervals = [  /*2, 3/2, 4/3, 5/4, 6/5,*/ 7/6, 8/7, 9/8, 10/9, 11/10, 12/11 ];

        // Harm: 1,2, 3/2, 4/3, 5/4, 6/5, 7/6, 8/7, 9/8, 10/9, 11/10, 12/11,  13/12 , 14/13, 15/14 , 16/15, 17/16, 18/17
        // 2   -> 3/2 , 4/3 D3()
        // 3/2 -> 5/4 , 6/5 D3(7/6 , 8/7,9/8)
        // 4/3 -> 32/27,9/8 (7/6 , 8/7) D3(9/8 , 10/9, 16/15)
        // 5/4 -> 9/8 , 10/9 D3(11/10 , 12/11, 25/24)
        // 6/5 -> 11/10 , 12/11
        // 7/6 -> 13/12 , 14/13
        // 8/7 -> 15/14 , 16/15
        // 9/8 -> 17/16, 18/17

        for (var i = start; i < this.eqt; i += 1) {
          // cc *= Math.pow(2,1/12);
          //cc = (i+1)*13;
          //cc += 0.25
          //cc = Math.pow(2*Math.PI*(60/360),i);
          //cc = Math.pow(1.618033,(23*i));
          //cc *= 1.618033;
          //cc *= 8/7; //interessante os padroes de triades, mas se colocar ordenado gera notas muito proximas
          //cc  *= 1.875;
          //cc = Math.pow(1.059463094359295264561825294946, i);
          //cc = (1/i);
          //cc = i + 1;
          //cc = 32/(i+1);
          //cc = (24+i)/24;
          //cc *= 1.4953487812212205419118989941409;

          //Familia Undertone
          //cc = 30/Math.max(1,30-i+1);

          //cc = Math.pow(1.25115,i);
          //cc = Math.pow( PHI, i),
          //cc = ( (8 * (i*i)) + (4 * i) + 1) / ((i-1) * (i - 1));
          //cc = 30 / (30-i);
          //if(cc > 2 || cc < 0){ cc = 0;}

          //Interval
           var interval = arrIntervals[(i % arrIntervals.length)]
           cc *= interval;//(i % 2 == 0 ? (1.25) :(1.2))
          ratiosArr.push(cc);

          //cc = Math.pow( PHI, i);
          //ratiosArr.push(cc);
          // cc = Math.pow( PHI, i+12);
          // ratiosArr.push(cc);
          // cc = Math.pow( PHI, i+21);
          //ratiosArr.push(cc);
        }
        //ratiosArr.push(2);
      }

      //Generator2
      if (false) {
        ratiosArr = [];
        var start = 1;
        var value = start;

        var qtd = this.eqt;
        for (let i = 0; i < qtd; i++) {

          //Overtone
          var v = (parseFloat(this.eqt) + i) / parseFloat(this.eqt);
          ratiosArr.push(v);
          //var v = (parseFloat(this.eqt)) / (parseFloat(this.eqt)-i);

//Under
          var v = 1/((parseFloat(this.eqt) + i) / parseFloat(this.eqt));
          ratiosArr.push(v);

          //ratiosArr.push(value / start);
          //value += 2;
        }

        
          // for (let k = 0; k < 9; k++) {
          //   ratiosArr.push(ratiosArr[k] * 4/3);            
          // }

          //  for (let k = 0; k < 9; k++) {
          //   ratiosArr.push(ratiosArr[k] * 5/3);            
          // }

          // for (let k = 0; k < 9; k++) {
          //   ratiosArr.push(ratiosArr[k] * 2);            
          // }
          
      }

      //Generator3
      if (false) {
        ratiosArr = [];
        var start = 1;
        var value = start;

        var shift = 3;
        var qtd = 9;
        //var lineRatios = [1, Math.pow(1.5, 14/20), Math.pow(1.5, 28/20), Math.pow(1.5, 42/20)]; //Gamma 1ed1.0627073611568032
        //var lineRatios = [1, Math.pow(2, 14/34), Math.pow(2, 28/34), Math.pow(2, 42/34)]; //34ed8
        //var lineRatios = [1,Math.pow(2, 9/22), Math.pow(2, 18/22), Math.pow(2, 27/22), Math.pow(2, 36/22)]; //11ed2
        //var lineRatios = [1, Math.pow(2, 13/31), Math.pow(2, 23/31), Math.pow(2, 38/31)]; //31ed4
        //var lineRatios = [1, Math.pow(2, 13/31), Math.pow(2, 26/31), Math.pow(2, 39/31)]; //31ed4
        //var lineRatios = [1, Math.pow(2, 10/31), Math.pow(2, 18/31), Math.pow(2, 25/31)]; //31ed4
        //var lineRatios = [1, Math.pow(2, 7/31), Math.pow(2, 14/31), Math.pow(2, 21/31)]; //31ed4
        //var lineRatios = [1, Math.pow(2, 8/31), Math.pow(2, 21/31), Math.pow(2, 31/31)]; //31ed4
        //var lineRatios = [1, Math.pow(2, 13/41), Math.pow(2, 26/41), Math.pow(2, 39/41)]; //41ed4 KiteTunning
        //var lineRatios = [1, Math.pow(2, 17/53), Math.pow(2, 31/53), Math.pow(2, 48/53)]; //53ed8 Top!
        //var lineRatios = [ 1,Math.pow(2, 11/34), Math.pow(2, 20/34), Math.pow(2, 31/34), Math.pow(2, 40/34)]; //34ed4
        //var lineRatios = [ Math.pow(2, 6/19), Math.pow(2, 11/19), Math.pow(2, 17/19), Math.pow(2, 22/19)]; //19edo
        
        //var lineRatios = [1, Math.pow(3, 13/28), Math.pow(3, 26/28), Math.pow(3, 39/28)]; //28ed3 ou 53ed8
        //var lineRatios = [Math.pow(1.154775,1), Math.pow(1.154775,2), Math.pow(1.154775,3), Math.pow(1.154775,4)]; //28ed3 ou 53ed8
        // var lineRatios = [1,/* Math.pow(3, 13/30),*/ Math.pow(3, 27/30), Math.pow(3, 42/30), Math.pow(3, 56/30)]; //30ed3
        //var lineRatios = [1, Math.pow(PHI, 11/18), Math.pow(PHI, 22/18), Math.pow(PHI, 33/18)]; //9edPHI (apox 26ed4)
        //var lineRatios = [1, Math.pow(2, 11/27), Math.pow(2, 22/27), Math.pow(2,33/27)]; // 27ed4
        //var lineRatios = [1, Math.pow(2, 9/27), Math.pow(2, 18/27), Math.pow(2,27/27)]; // 27ed4
        // var lineRatios = [1, 4/3, 3/2, 2]; 
        //var lineRatios = [1, 1.125, 3/2, 2]; 
        // var lineRatios = [1, 4/3, 8/5, 2]; 
        //var lineRatios = [1, 1.19161105815061963775, 1.19161105815061963775*1.19161105815061963775, 2];        
        //var lineRatios = [1, 1.2, 1.5, 2];        
        //var lineRatios = [1, 1.25, 1.4953487812212205, 1.4953487812212205*1.25, 2.25];     
        //var lineRatios = [1, 1.2467583092848906, 1.5061955531706115,  1.877861821323412];     
        //var lineRatios = [1, 4/3, 5/3, 7/3];
        //var lineRatios = [1, 1.25, 1.5, 1.75];        
        //var lineRatios = [1, 4/3, 5/3, 2]; 
        //var lineRatios = [1, 1.2, 5/3, 2]; 
        //var lineRatios = [1, 1.2, 1.4, 1.6]; 
        //var lineRatios = [1, 4/3, 16/9, (16*4)/(9*3)]; 
        //var lineRatios = [1, Math.sqrt(1.8068056703447524), 1.8068056703447524, 1.8068056703447524*Math.sqrt(1.8068056703447524)]; 
        //var lineRatios = [1, 1.5, 2.25, 2.25*1.5]; 
        //var lineRatios = [1, 1.4950347393840864, 1.4950347393840864*1.4950347393840864, 1.4950347393840864*1.4950347393840864*1.4950347393840864]; 
        //var lineRatios = [1, Math.sqrt(1.5), 1.5, Math.sqrt(1.5)*1.5]; 
        //var lineRatios = [1, 1.4969014140728691, 1.4969014140728691*1.4969014140728691, 1.4969014140728691*1.4969014140728691*1.4969014140728691]; 
        //var lineRatios = [1, 1.49534812, 1.49534812*1.49534812, 1.49534812*1.49534812*1.49534812]; 
        //var lineRatios = [1, 5/4, 1.49534812, 1.49534812*1.25, 1.49534812*1.49534812];
        //var lineRatios = [1, 5/4, 1.5, 1.5*1.25, 1.5*1.5];
        //var lineRatios = [1, Math.0(2,10/17), Math.pow(2,20/17), Math.pow(2,30/17)];
        //var lineRatios = [1, 1.2, 1.4, 1.6, 1.8];
        //var lineRatios = [1, 4/3, 5/3, 2];
        //var lineRatios = [1, 7/6, 4/3];
        
        //Especify value
        var lineRatios = [1, Math.pow(this.repeatScaleValue,1), Math.pow(this.repeatScaleValue,2), Math.pow(this.repeatScaleValue,3)];

        //Afinações legais
        //45Ed(PI^2) ou 19Ed(PHI^2) (string step 4.5)
        //31EdPI (string step 6)

        //N from Scale
        //var n = this.repeatScaleValue;
        //var lineRatios = [1,Math.pow(this.base, n/this.eqt), Math.pow(this.base, (n*2)/this.eqt), Math.pow(this.base, (n*3)/this.eqt),Math.pow(this.base, (n*4)/this.eqt)]; 
        //var lineRatios = [1,Math.pow(this.base, (n*2)/this.eqt)/2,Math.pow(this.base, n/this.eqt),  Math.pow(this.base, (n*4)/this.eqt)/4, Math.pow(this.base, (n*3)/this.eqt)]; 

        //var lineRatios = [1, Math.pow(n, 1), Math.pow(n, 2), Math.pow(n, 3)]; 
        //var lineRatios = [1, Math.pow(2, n/41), Math.pow(2, (n*2)/41), Math.pow(2, (n*3)/41)]; 
        //var lineRatios = [1, Math.pow(2, n/19), Math.pow(2, (n*2)/19), Math.pow(2, (n*3)/19)]; 
        //var lineRatios = [1, Math.pow(2, 6/19), Math.pow(2, 12/19), Math.pow(2, 18/19)]; 
        //var lineRatios = [1, Math.pow(PHI*PHI, 6/21), Math.pow(PHI*PHI, 12/21), Math.pow(PHI*PHI, 18/21)]; 

        //var lineRatios = [1, 1.25, 1.5, 1.75]; 
         

        for (let l = 0; l < lineRatios.length; l++) {
          const vLine = lineRatios[l];

          for (let i = 0; i < qtd; i++) {
            //Equal temperament
            var v = Math.pow(this.base, (i-shift)/this.eqt); 

            //Overtones
            //var v = (parseFloat(this.eqt)+i)/parseFloat(this.eqt);
            //Undertones
            //var v = (parseFloat(this.eqt))/Math.max(1,(parseFloat(this.eqt)-i));
            
            ratiosArr.push(v * vLine);
          }
        }        
      }

      //Generator4
      if (false) {
        ratiosArr = [];
        var start = 1;
        var value = start;

        var shift = 3;
        var qtd = 9;
        //var lineRatios = [1, 2, 3, 4];
        //var lineRatios = [1, 1.25, 1.5, 1.75];
        //var lineRatios = [1, 4/3, 1.5, 2];
        var lineRatios = [1, 1.324717957244746, 1.4950347693089112,2]
        //var lineRatios = [1, 4/3, 5/3, 7/3];
        //var lineRatios = [1, Math.pow(1.3077590684505787,1), Math.pow(1.3077590684505787,2), Math.pow(1.3077590684505787,3)];
        //var lineRatios = [1, Math.pow(1.3373293784088067,1), Math.pow(1.3373293784088067,2), Math.pow(1.3373293784088067,3)];
        //var lineRatios = [1, Math.pow(1.2505655196145855,1), Math.pow(1.2505655196145855,2), Math.pow(1.2505655196145855,3)];
        //var lineRatios = [1, Math.pow(2,5/31), 1.4955142597767768, Math.pow(2,23/31)]; //Possibilidade de afinação para 31ed4
        //var lineRatios = [1, Math.pow(2,23/31), Math.pow(2,46/31), Math.pow(2,23*3/31)];
        //var lineRatios = [1, 1.4955142597767768, 1.4955142597767768*1.4955142597767768, 1.4955142597767768*1.4955142597767768*1.4955142597767768];
        //var lineRatios = [1, 1.2505678497940804, 1.4955142597767768, 1.7489046221194926];
        //var lineRatios = [1, 1.3373293784088152, 1.3373293784088152*1.3373293784088152, 1.3373293784088152* 1.3373293784088152* 1.3373293784088152];
        //var lineRatios = [1, 1.2505655196145855, 1.2505655196145855*1.2505655196145855, 1.2505655196145855*1.2505655196145855*1.2505655196145855];
        //var lineRatios = [1, Math.pow(1.2080894444044472,1), Math.pow(1.2080894444044472,2), Math.pow(1.2080894444044472,3)]
           //Especify value
        //var lineRatios = [1, Math.pow(this.repeatScaleValue,1), Math.pow(this.repeatScaleValue,2), Math.pow(this.repeatScaleValue,3)];

        //var colRatios = [1, 3/2, 4/3, 5/3, 5/4, 6/5, 7/6, 7/5, 7/4];
        //var colRatios = [1, 1.0935599087586103, 1.19587327404414, 1.307759068450572, 1.430112887573051, 1.5639141188489016, 1.710233781114704,1.870243097631694,2,0,0,0,0];
        
        //Porcupine 15 Mode 22edo (Afinação do violão em 23/04/2020)
        //var lineRatios = [1, Math.pow(1.2080894444044472,1), Math.pow(1.2080894444044472,2), Math.pow(1.2080894444044472,3)];
//         var colRatios = [
// 1
// ,1.034563715943573
// ,1.070322082346974
// ,1.1638841804365203
// ,1.2041123426403462
// ,1.2457309396155174
// ,1.2887880299545085
// ,1.333333333333333
// ,1.4498865336988227
// ,1.5000000000000004
// ,1.5518455739153598
// ,1.6054831235204612
// ,1.6609745861540228
// ,1.718384039939344
// ,1.8685964094232765
// ,1.9331820449317632
//         ];
        // var colRatios = [1, 1.143572939715946, 1.3077590684505704, 1.4955178823482058,1.710233781114704,2,0,0,0];
        //var colRatios = [1, 25/24, 12/11, 8/7, 6/5, 5/4];
        //var colRatios = [1, 1.05, 1.125, 1.185185 ,1.25, 4/3, 1.4,];
        var colRatios = [
        1
,1.0590169943749475
,1.2360679774997896
,1.3090169943749475
,1.5278640450004204
,1.618033988749895
,1.8885438199983173
];
        //var colRatios = [36/36, 37/36, 38/36, 39/36, 40/36, 41/36, 42/36, 43/36, 44/36];
//         var colRatios = [
//           //Armodue
//           1
// ,1.0457345379256116
// ,1.0935607238104925
// ,1.1435742182075628
// ,1.1958750566609282
// ,1.2505678497940804
// ,1.3077619925490385
// ,1.367571882994946
// ,1.430108890487043
// ,1.4955142597767768
// ,1.563910913408831
// ,1.6354356563904051
// ,1.7102315504424894
// ,1.7489026668813836
// ,1.8288879222280738
// ,1.9125312662689065
// ]

//var lineRatios = [1,colRatios[this.repeatScaleValue], Math.pow(colRatios[this.repeatScaleValue],2), Math.pow(colRatios[this.repeatScaleValue],3),Math.pow(colRatios[this.repeatScaleValue],4)]; 

        for (let l = 0; l < 4; l++) {
          const vLine = lineRatios[l];

          for (let i = 0; i < qtd; i++) {
            var v = colRatios[i] || 0;
            ratiosArr.push(v * vLine);
          }
        }        
      }

      //Generator5
      if (false) {
        ratiosArr = [1];
        var qtd = this.eqt;
               
        for (let i = 2; i <= qtd; i++) {
          var v = i;
          ratiosArr.push(v);
        }
               
      }

      //Well Tempered Generator - WTG
      //base: PHI edt: 4 norm: 1.5 repeat sort
      //base: 5 eqt: 13 norm: 3 repeat 3 sort
      //base: 1.2013911007785754  eqt: 6 norm 2 sort, //Escala de 11 tons     
      //WTG 1.143572939715946 (base9)
      //WTG 1.2458005985895744 (base9)
      //1.4950347693089112
      if (false) {
        ratiosArr = [1];

//ratiosArr.push(2/this.base);

        //Over
        for (let index = 1; index < this.eqt; index++) {
          ratiosArr.push(Math.pow(this.base,index))
          //ratiosArr.push(Math.pow(this.base, index + 1) / 1.2);
          //ratiosArr.push(Math.pow(this.base, index + 1));
        }

        //Under
        for (let index = 1; index < this.eqt; index++) {
          ratiosArr.unshift(Math.pow(this.base,-index))

          //ratiosArr.push(Math.pow(this.base, -(index + 1)) * 1.2);
          //ratiosArr.push(Math.pow(this.base, -(index + 1)));
        }


        // if(this.repeatScale){
        //   ratiosArr.push(Math.sqrt(this.repeatScaleValue));
        // }
      }

      //Well Tempered Generator - WTG2
      if (false) {
        ratiosArr = [1];

        //Over
        for (let index = 1; index <= this.eqt; index++) {
          var b = Math.pow(this.base, index);
          //ratiosArr.push(1)
          ratiosArr.push(b / this.formantPartials(this.base)[1]);
          ratiosArr.push(b);
        }

        //Under
        //   for (let index = 0; index < this.eqt; index++) {
        //     var b = Math.pow(this.base,-index);
        //     ratiosArr.push(1)
        // ratiosArr.push((this.formantPartials(b)[0]))
        // ratiosArr.push(b)
        // //ratiosArr.push((b*(this.formantPartials(b)[0])))

        //   }
      }

      // if (this.normalize) {
      //   for (var i = 0; i < ratiosArr.length; i++) {
      //     var v = ratiosArr[i] || 1;
      //     ratiosArr[i] = this.normalizeValue(v);
      //   }
      // }

//For WTG
 if ( this.normalize) {
        for (var i = 0; i < ratiosArr.length; i++) {
          var v = ratiosArr[i] || 1;
          ratiosArr[i] = this.normalizeValue(v);
        }
      }

        if (this.applySort) {
        Array.prototype.unique = function() {
          return this.filter(function(value, index, self) {
            return self.indexOf(value) === index;
          });
        };
        ratiosArr = ratiosArr.unique();
        ratiosArr = ratiosArr.sort((a, b) => a - b);
      }

      //Gerar repetição da escala (oitava)
      if (this.repeatScale) {
        var base = this.repeatScaleValue;
        var numOct = 9;
        var octArr = [];
        for (var t = 0; t < numOct; t++) {
          for (let i = 0; i < ratiosArr.length; i++) {
            const element = ratiosArr[i];
            octArr.push(element * Math.pow(base, t + 1));
          }
        }
        ratiosArr = ratiosArr.concat(octArr);
      }

      //  if (this.normalize) {
      //   for (var i = 0; i < ratiosArr.length; i++) {
      //     var v = ratiosArr[i] || 1;
      //     ratiosArr[i] = this.normalizeValue(v);
      //   }
      // }


     

      //Jump
      //  var jumpArr = [];
      //  var j = 1;
      //  for(var i=0; i< ratiosArr.length;i+=j){

      //    var v = ratiosArr[i];
      //    jumpArr.push(v);
      //  }
      //  ratiosArr = jumpArr;

      // if(this.normalize){
      //   v = this.normalizeValue(v);
      // }

    

      //===================================
      // ratiosArr = this.smooth(ratiosArr);
      // ratiosArr = this.smooth(ratiosArr);
      // ratiosArr = this.smooth(ratiosArr);
      // ratiosArr = this.smooth(ratiosArr);

      //this.ratiosArr = ratiosArr;
      //window.ratiosArr = ratiosArr
      //console.log(ratiosArr);

      //Partials da fração      //
      //  var rPartials = this.formantPartials(this.base);
      //  ratiosArr = [1, rPartials[0], this.base ]
       //ratiosArr = [1, rPartials[0], this.base, rPartials[0]*2 ]

      //AQUI!
      return ratiosArr[idx-1] || 0;

      //#endregion

      //Log Scale
      //   var v = Math.log2( (1 * idx));
      //   var v = Math.pow(this.base, Math.log2(idx));
      //   var v = 1+Math.log2(1+((idx-1)/this.eqt));
      //   //v = 1+((idx-1)/36)
      //  if(v < 1){ v = 1}
      //  if(this.normalize){
      //   v = this.normalizeValue(v);
      // }
      //     return v;

      //Mapped Equal temperament
      // var mapArr = [1,2,5];
      // var mapIdx = mapArr[(idx-1) % mapArr.length];
      // idx = mapIdx;
      //idx = idx + mapIdx;

      //Ls Mapped Steps
      if(false && idx > 1){
        //var mode = "2 2 1 2 2 2 1"; //Diatônica 12ed2
        //var mode = "3 3 3 3 3 3 3 1"; //Porcupine[8] 22edo
        //var mode = "3 3 3 3 3 3 4"; //Porcupine[7] 22edo
        var mode = "1 2 1 2 1 2 1 2 1 2 1 2 1 2 1"; //Porcupine[15] 22edo
        //var mode = "3 1 3 1 3 1 1 3 1 3 1 1"; //Superpyth[12] 22edo
        //var mode = "1 3 1 1 3 1 3 1 1 3 1"; //kleismic[11] 19edo
        //var mode = "4 1 1 4 1 1 4 1 1 1"; //magic[10] 19edo
        //var mode = "1 1 6 1 1 1 6 1 1";  //liese[9]  19edo
        //var mode = "5 1 1 5 1 1 5 1 1 1"; //Magic[10]
        //var mode = "5 1 1"; //Magic[10]
        //var mode = "1 2 1 2";  //Legal: posui acorde 1 1.2 1.6 e 1 1.3333 1.6
        //var mode = "1 2 1 1";  //Legal: posui acorde 1 1.2 1.6 e 1 1.3333 1.6
        //var mode = "1 2"; //Porcupine[10] 15edo
        //var mode = "6 2"; 
        

        var mapArr = mode.split(' ');
        var cIdx = idx-1;
        var mapSum = 0;
        for (let mapIdx = 0; mapIdx < cIdx; mapIdx++) {
          const mapValue = mapArr[mapIdx % mapArr.length];
          mapSum += parseInt(mapValue);        
        }
        idx = mapSum+1;
      }

      //Equal temperament
      if (true) {
        var eqt = this.eqt;
        var etqRatio = Math.pow(this.base, 1.0 / this.eqt); //1.059486755451824;
        var v = idx == 1 ? 1 : Math.pow(etqRatio, idx - 1);
        //v = 1/Math.pow(1.5,1) * v

        if (this.normalize) {
          v = this.normalizeValue(v);
        }
        return v;
      }

      //Linear
      if (false) {

        //Overtones
        var v = (this.eqt - 1 + idx) / this.eqt;

        //Undertones
        //var v = this.eqt/(this.eqt - 1 + idx) ;
        //var v = 1/v;
        if (this.normalize) {
          v = this.normalizeValue(v);
        }
        return v;
      }

      // if(true){
      //   var v = Math.log(Math.pow(this.base,idx));
      //   return v;
      // }

      //Linear Up and Down
      // if (true) {
      //   if(idx <= this.base){
      //     var v = (this.eqt - 1 + idx) / this.eqt;
      //     //var v = 1/v;
      //     if (this.normalize) {
      //       v = this.normalizeValue(v);
      //     }
      //     return v;
      //   }
      //   else
      //   {
      //     return 0;
      //   }
      // }

      //return idx == 1 ? 1 : Math.pow(Math.pow(2,(1.0/this.eqt)),idx-1);
      //return 1+((idx-1)/this.eqt);
      //return ratiosArr[idx-1] || 0;

      //var v = Math.pow(1.618033,idx-1);
      // var v = Math.pow(5,idx-1);
      // while(v > 2){
      //   v = v/2;
      // }
      // return v;

      //return idx+1;

      // var s = this.text(idx).split('/');
      // var a = parseFloat(s[0]) || 1;
      // var b = parseFloat(s[1]) || 1;
      // return a/b;
      //this.ratiosArr = [1, 11/10, 10/9, 9/8, 8/7, 7/6, 6/5, 11/9, 5/4, 9/7, 4/3, 11/8, 7/5, 10/7, 3/2, 11/7, 8/5, 5/3, 7/4, 9/5, 11/6, 2];
      //return this.ratiosArr[idx-1] || 0;
    },

    normalizeValue(v) {
      if (this.equivalence == 1) {
        return v;
      }

      var equivalence = this.equivalence || 2;
      if (v >= equivalence) {
        while (v >= equivalence) {
          v = v / equivalence;
        }
      } else if (v > 0 && v < 1) {
        while (v < 1) {
          v = v * equivalence;
        }
      }
      return v;
    },
    text(idx) {
      // var arr = ['1','9/8','8/7','7/6','6/5','5/4','9/7','4/3','7/5','3/2','8/5','5/3','7/4','2'];
      //var arr = ['1','11','10','9','8','7','6','11','5-10','9','4-8','11','7','10','3-6-9','11','8','5-10','7','9','11','2-4-6-8-10',' '];
      //return arr[Math.min(idx-1,arr.length-1)];
      return "";
    },
    color(idx) {
      //var arr = ['','#80bbaa','#80aaff','#aa80aa','#80ffaa','#ff8080','#80bbaa','#8080ff','#aa80aa','#80ff80','#80aaff','#ff8080','#aa80aa',' '];
      //return arr[Math.min(idx-1,arr.length-1)];
      //var arr = ["#ff8080",'#8080ff'];
      //return arr[ (idx-1) % arr.length];

      if (this.equivalence == 1) {
        return "";
      }

      var normRatio = this.normalizeValue(this.freqBased ?  this.freq(idx) : this.ratio(idx));

      // if([1, 1.25, 4/3, 1.5,5/3].indexOf( normRatio) != -1){
      //   return "#ff8080";
      // }
      // else
      // {
      //   return '#8080ff';
      // }

      if (normRatio) {
        var v = (normRatio - 1) / (this.equivalence - 1 || 1);
        var c = this.HSVtoRGB(v, 0.77, 1);
        return "rgb(" + c.r + "," + c.g + "," + c.b + ")";
      }

      //return '';
    },
    HSVtoRGB(h, s, v) {
      var r, g, b, i, f, p, q, t;
      if (arguments.length === 1) {
        (s = h.s), (v = h.v), (h = h.h);
      }
      i = Math.floor(h * 6);
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0:
          (r = v), (g = t), (b = p);
          break;
        case 1:
          (r = q), (g = v), (b = p);
          break;
        case 2:
          (r = p), (g = v), (b = t);
          break;
        case 3:
          (r = p), (g = q), (b = v);
          break;
        case 4:
          (r = t), (g = p), (b = v);
          break;
        case 5:
          (r = v), (g = p), (b = q);
          break;
      }
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    },
    smooth(array) {
      var arrResult = [];
      for (let index = 0; index < array.length; index++) {
        const element = array[index];

        var v = element;
        if (index > 0 && index < array.length - 1) {
          var prev = array[index - 1];
          var next = array[index + 1];
          v = (element + prev + next) / 3;
        } else if (index == 0) {
          //var prev = array[array.length-1];
          //var next = array[index+1];
          //v = (element + prev + next)/3;
        } else if (index == array.length - 1) {
          //var prev = array[index-1];
          //var next = array[0];
          //v = (element + prev + next)/3;
        }
        arrResult.push(v);
      }
      return arrResult;
    },
    averageItemsByValue(array, value) {
      var arrResult = [];
      for (let index = 0; index < array.length; index++) {
        const element = array[index];

        var v = (element + value) / 2;
        arrResult.push(v);
      }
      return arrResult;
    },
    onChangeActive(args) {
      //console.log("onChangeActive",args);
      var freq = args.freq;

      this.scaleRefIdx = args.idx;

      var idx = this.activeKeys.indexOf(freq);
      if (idx != -1) {
        this.activeKeys.splice(idx, 1);
      } else {
        this.activeKeys.push(freq);
      }

      if (this.activeKeys.length >= 2) {
        var v1 = this.activeKeys[0];
        var v2 = this.activeKeys[1];
        if (v1 > 0 && v2 > 0) {
          this.activeRatio = v1 > v2 ? v1 / v2 : v2 / v1;
        } else {
          this.activeRatio = "";
        }
      } else {
        this.activeRatio = "";
      }
    },
    ajustedRatio(idx) {
      return 1;
      // var normIdx = (idx-1) % this.scaleCount;
      // var targetIdx = (normIdx+1) - (this.scaleRefIdx-1);

      var targetIdx = idx - this.scaleRefIdx + 1;

      var div2 = false;
      if (targetIdx <= 0) {
        targetIdx += this.scaleCount;
        div2 = true;
      }

      var refRatio = this.ratio(this.scaleRefIdx);
      var targetRatio = this.ratio(targetIdx);

      var r = refRatio * targetRatio;
      if (div2) {
        r = r / 2;
      }
      return r;
    },
    formantPartials(v) {
      var n = 2 / (v - 1);
      return [(n + 1) / n, (n + 2) / (n + 1)];
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
