<template>
  <div>
    <p>
      Mode:
      <select v-model="mode">
        <option value="eqt">Equal temperament</option>
        <option value="harm">Harmonics</option>
        <option value="wtg">Regular temperament</option>
        <option value="gtr">Guitar strings</option>
        <option value="code">Custom notes (code edit only)</option>
        <option value="custom">Custom notes</option>
      </select>


      <span>
        MainFreq:
        <input type="text" v-model="mainFreq" style="width: 70px;" />
      </span>
      <span>
        Guitar string length (cm):
        <input type="number" v-model="guitarStringLength" step="1" style="width: 70px;" />
      </span>

    </p>
    <div>
      <div v-if="mode == 'eqt' || mode == 'gtr' || mode == 'code'">
        <button v-on:click="setPhi">φ</button>
        <button v-on:click="setPi">π</button>
        <span>Base:</span>
        <input type="number" step="0.0001" v-model="base" />
        <span>Eqt:</span>
        <input type="number" step="1" v-model="eqt" />
        <span>Custom notes:</span>
        <input type="checkbox" v-model="enableCustomNotes" />
      </div>

      <div v-if="mode == 'wtg'">
        <button v-on:click="setPhi">φ</button>
        <button v-on:click="setPi">π</button>
        <span>Generator:</span>
        <input type="number" step="0.0001" v-model="base" />

        <span>
          <input type="checkbox" v-model="normalize" />
          <span>Period:</span>
          <input type="number" v-model="equivalence" step="0.0001" />
        </span>
      </div>
      <div v-if="mode == 'wtg'" style="display: inline-block; margin: 8px 0;">
        <span>Quantity:</span>
        <input type="number" step="1" v-model="eqt" style="width: 70px;" />

        <span>Direction:</span>
        <select v-model="wtgMode">
          <option value="up">Up</option>
          <option value="alternated">Up/Down</option>
          <option value="down">Down</option>
        </select>
      </div>

      <span v-if="mode == 'wtg' || mode == 'code'">
        <input type="checkbox" v-model="repeatScale" />
        Repeat
        <input type="number" v-model="repeatScaleValue" step="0.0001" />

        <input type="checkbox" v-model="repeatScaleHarm" />
        HarmRepeat
        <span v-if="repeatScaleHarm">Harm</span>
        <input v-if="repeatScaleHarm" type="number" v-model="repeatScaleHarmValue" step="1" />
        <span v-if="repeatScaleHarm">Count</span>
        <input v-if="repeatScaleHarm" type="number" v-model="repeatScaleHarmCount" step="1" />
      </span>
      <span v-if="mode == 'wtg' || mode == 'code'">
        <input type="checkbox" v-model="applySort" />
        Sort
      </span>

      <div v-if="mode == 'harm'">
        Harmonic number:
        <input type="number" step="1" v-model="eqt" />
        Type:
        <select v-model="harmMode">
          <option value="over">Overtone</option>
          <option value="under">Undertone</option>
        </select>
        Qtd:
        <input type="number" step="1" v-model="harmQtd" />
        Prime filter:
        <input type="checkbox" v-model="usePrimeFilter" />
        <input type="text" v-model="primeFilter" />
      </div>

      <span v-if="mode == 'custom'">
        Repetition count:
        <input type="number" step="1" min="1" v-model="repetitionCount" />
      </span>

      <p v-if="mode != 'wtg'">
        <input type="checkbox" v-model="normalize" />
        <span>Equivalence Period:</span>
        <input type="number" v-model="equivalence" step="0.0001" />

      <div v-if="mode == 'gtr'">
        Shift by:
        <input type="number" v-model="shiftCount" :step="1" style="width: 70px" />
        Single steps:
        <input type="checkbox" v-model="gtrSingleStep" />
        <span v-if="gtrSingleStep">
          Steps by string:
          <input type="number" v-model="testValueInt" :step="1 / stepDivision" style="width: 70px" />

        </span>
        <span v-if="!gtrSingleStep">
          <input type="number" v-model="gtrStep1" :step="1 / stepDivision" />
          <input type="number" v-model="gtrStep2" :step="1 / stepDivision" />
          <input type="number" v-model="gtrStep3" :step="1 / stepDivision" />
          <input type="number" v-model="gtrStep4" :step="1 / stepDivision" />
        </span>
        Steps division:
        <input type="number" v-model="stepDivision" :step="1" style="width: 70px" />
        Fixed step:
        <input type="number" v-model="fixedStepValue" step="0.0001" />
      </div>
      </p>
      <span v-if="mode == 'code' || mode == 'harm'">
        Test:
        <input type="number" :value="testValue" @input="testValue = parseFloat($event.target.value)" :step="1 / 10000"
          style="width: 70px" />
      </span>
      <span v-if="mode == 'code'">
        Test2:
        <input type="number" :value="testValue2" @input="testValue2 = parseFloat($event.target.value)" step="1"
          style="width: 70px" />
      </span>
      <span v-if="mode == 'code'">
        Test3:
        <input type="number" :value="testValue3" @input="testValue3 = parseFloat($event.target.value)" step="0.1"
          style="width: 70px" />
      </span>


    </div>
    <p v-if="sDisplay && lDisplay">s: {{ sDisplay }} L: {{ lDisplay }}</p>

    <table class="keyboard">
      <tr v-for="(krow, ridx) in keys" v-bind:key="ridx + base">
        <td v-for="(key, kidx) in krow" v-bind:key="ridx + '' + kidx">
          <template v-if="!freqBased">
            <small>{{ key.idx }} :
              {{ parseFloat(ratio(key.idx)).toFixed(4) }}</small>

            <!-- Distancia do fret em relação ao inicio do braço -->
            <small>({{
              (
                guitarStringLength - (guitarStringLength / (ratio(key.idx) || 1))
              ).toFixed(3)
            }}cm)</small>
            <!-- <small >({{(65-(65/ratio(key.idx))).toFixed(2)}}cm)</small> -->

            <!-- Distancia entre frets em relação ao inicio do braço -->
            <!-- <small v-if="key.idx > 1">({{(   (65-(65/ratio(key.idx)))  -  (65-(65/ratio(key.idx-1)))  ).toFixed(2)}}cm)</small>
            <small v-else>({{(65-(65/ratio(key.idx))).toFixed(2)}}cm)</small>-->

            <!-- <div>{{getFreq(key.idx)}}</div> -->
            <audio-key :keyName="key.k" :idx="key.idx" :freq="mainFreq * factor * ratio(key.idx)"
              :text="parseFloat(ratioToCents(ratio(key.idx) || 1)).toFixed(0) + '¢'" :color="color(key.idx)"
              @onChangeActive="onChangeActive" />
          </template>
          <template v-if="freqBased">
            <small>{{ key.idx }} : {{ parseFloat(freq(key.idx)).toFixed(3) }}</small>
            <audio-key :keyName="key.k" :freq="freq(key.idx)" :color="color(key.idx)" @onChangeActive="onChangeActive" />
          </template>
        </td>
      </tr>
    </table>
    <p>Active interval ratio:
      <br />
      {{ activeRatio ? (parseFloat(activeRatio).toFixed(12) + " (" + parseFloat(ratioToCents(activeRatio)).toFixed(0) +
        "c)") :
        "None" }}
    </p>
    <div v-if="enableCustomNotes || mode === 'custom'" style="text-align: left">
      <label>Custom Notes:</label>
      <textarea v-model="customNotesInput" rows="5" />
      <!-- <pre>{{customNotes}}</pre> -->
    </div>
    <div>
      <input type="checkbox" v-model="showChart" />
      Display chart and infos
    </div>
    <div v-if="showChart">
      <input type="checkbox" v-model="inCents" />In cents
    </div>

    <table v-if="showChart" width="100%">
      <tr style="vertical-align: top;">
        <td style="width: 45%;">
          <chartjs-line :width="500" :height="150" :labels="chartLabels()" :data="chartData" :bind="true"
            datalabel="Chart of notes"></chartjs-line>

          <div style="text-align: left" v-if="!freqBased">
            <b>Notes list: </b>
            <input type="checkbox" v-model="ratioListIdx" />
            Index
            <br />
            <br />
            <!-- <div v-for="ii in (this.ratiosArr.length)" v-bind:key="ii">{{ratio(ii)}}</div> -->
            <div v-for="ii in Math.max(73, nEqt)" v-bind:key="ii">
              <span v-if="ratioListIdx">{{ ii }}:</span>
              <span>{{ inCents ? parseFloat(ratioToCents(ratio(ii, true))).toFixed(3) :
                parseFloat(ratio(ii, true)).toFixed(12) }}</span>
            </div>
          </div>

        </td>
        <td style="width: 45%;">
          <chartjs-line :width="500" :height="150" :labels="chartLabels()" :data="ratioDiff" :bind="true"
            datalabel="Chart of intervals"></chartjs-line>

          <p><b>Average ratio:</b> {{ ratioAvg }}</p>
          <div><b>Ratios difference:</b> {{ ratioDiff }}</div>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
//TODO: fix lint problems
/* eslint-disable */
import AudioKey from "./AudioKey.vue";
import Vue from "vue";
import ratiosData from "./ratiosData";

require("chart.js");
require("hchs-vue-charts");

Vue.use(window.VueCharts);

Array.prototype.unique = function () {
  // return this.filter(function (value, index, self) {
  //   return self.indexOf(value) === index;
  // });
  var array = this;
  var minValue = 0.00000001//0.01;
  var resultArray = [];
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    var contains = false;

    if (resultArray.length > 0) {
      for (let j = 0; j < resultArray.length; j++) {
        const element2 = resultArray[j];
        if (Math.abs(element2 - element) < minValue) {
          contains = true;
          break;
        }
      }
    }

    if (!contains) {
      resultArray.push(element);
    }
  }
  return resultArray;
};

export default {
  components: {
    AudioKey,
  },
  data() {
    return {
      mode: "eqt",
      eqt: 12, //12,
      base: 2, //1.4950347693089112,//Math.pow(5,1/4),
      ratioDiff: [],
      //ratiosArr:[],
      ratioAvg: 0,
      mainFreq: 110, //440
      factor: 1,
      freqBased: false,
      diffRoot: false,
      equivalence: 2, //2.0125,
      normalize: false,
      repeatScale: false,
      repeatScaleValue: 2,
      repetitionCount: 10,
      applySort: false,
      repeatScaleHarm: false,
      repeatScaleHarmValue: 1,
      repeatScaleHarmCount: 1,
      activeKeys: [],
      activeRatio: "",
      scaleRefIdx: 1,
      scaleCount: 12,
      showChart: false,
      ratioListIdx: true,
      inCents: false,
      guitarStringLength: 65, //65
      testValue: Math.pow(2, (8 - (Math.sqrt(5) + 1) / 2) / 11), //Golden meantone
      testValue2: 1,
      testValue3: 4 / 3,
      testValueInt: 1,
      stepDivision: 2,
      wtg: false,
      wtgMode: "alternated",
      harmMode: "over",
      harmQtd: -1,
      shiftCount: 3,
      sDisplay: undefined,
      lDisplay: undefined,
      gtrSingleStep: true,
      gtrStep1: 0,
      gtrStep2: 0,
      gtrStep3: 0,
      gtrStep4: 0,
      enableCustomNotes: false,
      customNotesInput: "",
      fixedStepValue: 0,
      usePrimeFilter: false,
      primeFilter: "",
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
      ],
    };
  },
  mounted: function () {
    //var _this = this;
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
            if (this.inCents) {
              arrDiff.push(
                parseFloat(parseFloat(this.ratioToCents(vDiff)).toFixed(6))
              );
            } else {
              arrDiff.push(parseFloat(vDiff.toFixed(12)));
            }
          }
        }
      }
      data.push(2);

      this.ratioDiff = arrDiff;

      if (this.ratioDiff.length) {
        var sum = this.ratioDiff.reduce(function (a, b) {
          return a + b;
        });
        var avg = sum / this.ratioDiff.length;
        this.ratioAvg = avg;
      }

      return data;
    },

    nEqt: function () {
      return parseInt(this.eqt);
    },

    customNotes: function () {
      var result = [];
      var lines = this.customNotesInput.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        var v = undefined;
        if (line.indexOf("/") !== -1) {
          //Fração
          var parts = line.split("/");
          v = parseFloat(parts[0]) / parseFloat(parts[1]);
        }
        else if (line.indexOf("\\") !== -1) {
          //Index of edo
          var parts = line.split("\\");
          v = Math.pow(2, (parseFloat(parts[0]) / parseFloat(parts[1])));
        }
        else if (line.indexOf("c") !== -1) {
          //Cents
          var parts = line.split("c");
          var cent = parseFloat(parts[0]);
          v = Math.pow(2, (cent / 1200));
        }
        else {
          v = parseFloat(line);
        }

        if (v !== undefined && !isNaN(v)) {
          result.push(v);
        }
      }

      return result;
    }
  },
  methods: {
    mountKeyboardKeys() {
      var keyboardKeys = [
        ["Z", "X", "C", "V", "B", "N", "M", "<", ">"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O"],
        ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
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
      var chartCount = 73;
      var max = Math.max(chartCount, this.eqt); //this.eqt;
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
        100 + this.base * 1,
        100 + this.base * 2,
        100 + this.base * 3,
        100 + this.base * 4,
        100 + this.base * 5,
        100 + this.base * 6,
        100 + this.base * 7,
        100 + this.base * 8,
        100 + this.base * 9,
        100 + this.base * 10,
        100 + this.base * 11,
        100 + this.base * 12,
        100 + this.base * 13,
        100 + this.base * 14,
        100 + this.base * 15,
        100 + this.base * 16,
        100 + this.base * 17,
        100 + this.base * 18,
        100 + this.base * 19,
        100 + this.base * 20,
        100 + this.base * 21,
        100 + this.base * 22,
        100 + this.base * 23,
        100 + this.base * 24,
      ];
      //freqArr = freqArr.sort();
      return freqArr[idx - 1] || 0;
    },
    ratio(idx, useMaxCount) {
      //Aqui
      var PHI = (1 + Math.sqrt(5)) / 2; //1.618033988749895
      //CPS factors
      var a = 1, b = 3, c = 5, d = 7, e = 9;
      //#region
      var ratiosArr = ratiosData;

      //Steps from edo
      // if(true){
      //   var stepSize = Math.pow(2, 1/31);
      //   var stepsDef = "3 1 1 1 3 1 1 1 3 1 1 1 3 1 1 1 3 1 1 1 1";
      //   var stepsNum = stepsDef.split(' ').map(item => parseInt(item));

      //   ratiosArr = [1];
      //   var totalSteps = 0;
      //   for (let index = 0; index < stepsNum.length-1; index++) {
      //     const stepNum = stepsNum[index];
      //     totalSteps += stepNum;

      //     ratiosArr.push(Math.pow(stepSize,totalSteps))
      //   }
      // }

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

      //Generator1
      if (false) {
        var init = 1;
        var cc = init;
        ratiosArr = [];
        ratiosArr.push(cc);
        var start = 0;
        var r = this.eqt + 1; //53 + start ;

        //Formula: s = 1200 / (Xs + (YL)*phi) e L = PHI*s
        // var nRatio = this.repeatScaleValue;;
        // var sCents = 1200 / (2 + 5*nRatio);
        // var Lcents = nRatio * sCents;
        // var s = this.centsToRatio(sCents);
        // var L = this.centsToRatio(Lcents);
        // console.log("s:"+s);
        // console.log("L:"+L);

        //var s = this.centsToRatio(192.4290089296681593);
        //var s = this.centsToRatio(175.0777162687612);
        //var L = this.centsToRatio(311.356486605497760);
        //var L = this.centsToRatio(283.2815224874925);

        //var arrIntervals = [ s,L,s,L,s ] //Pentatônica (2L 3s)
        //var arrIntervals = [ L,L,s,L,L,L,s ] //Diatônica (5L 2s)
        //var arrIntervals = [ L,s,L,s,L ] //Anti-Pentatônica (3L 2s)
        //var arrIntervals = [ s,s,L,s,s,s,L ] //Anti-Diatônica (2L 5s)

        //var arrIntervals = [ s, L, s, s, L, s, L, s, s, L, s ]

        //var arrIntervals = [ 1.0606601717798212, 1.0606601717798214, 1.0540925533894598, 1.0540925533894598, 1.06666664, 1.0606601982963262, 1.0606601717798212, 1.0666666666666667, 1.0540925533894596, 1.054092553384848, 1.0606601717844617, 1.0606601717798212, 1.0606601717798212, 1.0606601717798214, 1.0540925533894598, 1.0540925533894598, 1.06666664, 1.0606601982963262, 1.0606601717798212, 1.0666666666666667, 1.0540925533894596, 1.054092553384848, 1.0606601717844617, 1.0606601717798212, 1.0606601717798212, 1.0606601717798214, 1.0540925533894598 ]
        //var arrIntervals = [1.041665, 1.066668373336064, 1.0546875, 1.0666666666666667, 1.0666666666666667, 1.0416666, 1.0800000691200045, 1.0416666666666667, 1.0666666666666667, 1.0666666666666667, 1.0546875, 1.0666666666666667, 1.041665, 1.066668373336064, 1.0546875, 1.0666666666666667, 1.0666666666666667, 1.0416666, 1.0800000691200045, 1.0416666666666667, 1.0666666666666667, 1.0666666666666667, 1.0546875, 1.0666666666666667, 1.041665, 1.066668373336064, 1.0546875 ];
        //arrIntervals = this.smooth(arrIntervals);
        //arrIntervals = this.averageItemsByValue(arrIntervals, Math.pow(2,1/12));
        //arrIntervals = this.averageItemsByValue(arrIntervals, Math.pow(2,1/12));
        //arrIntervals = this.averageItemsByValue(arrIntervals, Math.pow(2,1/12));

        var interval1 = 1.375;
        // var arrIntervals = [1.125, 1.1851851851851851,1.125, 1.1851851851851851, 1.125]; //Pentatônica ChingLing
        //var arrIntervals = [ 10/9, 9/8, 16/15, 9/8 ];
        var arrIntervals = [interval1, 1.4953 / interval1];
        //var arrIntervals = [ 1.25, 1.2 ];  //Geradora Wilckerson's Scale (Na verdade é só uma escala pitagórica com mais itens entre as quintas =/)
        //var arrIntervals = [ 1.25, 1.4997884186649116546043685512303/1.25 ];  //Geradora Wilckerson's Scale (Na verdade é só uma escala pitagórica com mais itens entre as quintas =/)
        //var arrIntervals = [ 1.2467583092848906, 1.2080894444044472 ];
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
        //var arrIntervals = [9/8, 10/9, 6/5, 10/9, 9/8];

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
          var interval = arrIntervals[i % arrIntervals.length];
          cc *= interval; //(i % 2 == 0 ? (1.25) :(1.2))
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
          var v = 1 / ((parseFloat(this.eqt) + i) / parseFloat(this.eqt));
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
      if (this.mode == "gtr") {
        ratiosArr = [];
        var start = 1;
        var value = start;

        var shift = this.shiftCount;
        var qtd = useMaxCount ? 73 : 9;
        //var lineRatios = [1, Math.pow(1.5, 14/20), Math.pow(1.5, 28/20), Math.pow(1.5, 42/20)]; //Gamma 1ed1.0627073611568032
        //var lineRatios = [1, Math.pow(2, 14/34), Math.pow(2, 28/34), Math.pow(2, 42/34)]; //34ed8
        //var lineRatios = [1,Math.pow(2, 9/22), Math.pow(2, 18/22), Math.pow(2, 27/22), Math.pow(2, 36/22)]; //11ed2
        //var lineRatios = [1, Math.pow(2, 13/31), Math.pow(2, 23/31), Math.pow(2, 38/31)]; //31ed4
        //var lineRatios = [1, Math.pow(2, 13/31), Math.pow(2, 26/31), Math.pow(2, 39/31)]; //31ed4
        //var lineRatios = [1, Math.pow(2, 10/31), Math.pow(2, 18/31), Math.pow(2, 25/31)]; //31ed4
        //var lineRatios = [1, Math.pow(2, 7/31), Math.pow(2, 14/31), Math.pow(2, 21/31)]; //31ed4
        //var lineRatios = [1, Math.pow(2, 8/31), Math.pow(2, 21/31), Math.pow(2, 31/31)]; //31ed4
        //var lineRatios = [1, Math.pow(2, 13/41), Math.pow(2, 26/41), Math.pow(2, 39/41)]; //41ed4 KiteTunning v3
        //var lineRatios = [1, Math.pow(2, 13/41), Math.pow(2, 24/41), Math.pow(2, 37/41)]; //41ed4 KiteTunning alternate v3 vm3
        //var lineRatios = [1, Math.pow(2, 17/53), Math.pow(2, 31/53), Math.pow(2, 48/53), Math.pow(2, 62/53)]; //53ed8 Top!
        //var lineRatios = [1, Math.pow(2, 22/53), Math.pow(2, 39/53), Math.pow(2, 53/53)]; //53ed8 Top!
        //var lineRatios = [ 1,Math.pow(2, 11/34), Math.pow(2, 20/34), Math.pow(2, 31/34), Math.pow(2, 40/34)]; //34ed4
        //var lineRatios = [ 1,Math.pow(2,14/34), Math.pow(2, 25/34), Math.pow(2, 34/34)]; //34ed4
        //var lineRatios = [ 1,Math.pow(2,9/34), Math.pow(2, 23/34), Math.pow(2, 34/34)]; //34ed4
        //var lineRatios = [ Math.pow(2, 6/19), Math.pow(2, 11/19), Math.pow(2, 17/19), Math.pow(2, 22/19)]; //19edo
        //var lineRatios = [1, Math.pow(3, 13/28), Math.pow(3, 26/28), Math.pow(3, 39/28)]; //28ed3 ou 53ed8
        //var lineRatios = [Math.pow(1.154775,1), Math.pow(1.154775,2), Math.pow(1.154775,3), Math.pow(1.154775,4)]; //28ed3 ou 53ed8
        // var lineRatios = [1,/* Math.pow(3, 13/30),*/ Math.pow(3, 27/30), Math.pow(3, 42/30), Math.pow(3, 56/30)]; //30ed3
        //var lineRatios = [1, Math.pow(PHI, 11/18), Math.pow(PHI, 22/18), Math.pow(PHI, 33/18)]; //9edPHI (apox 26ed4)
        //var lineRatios = [1, Math.pow(2, 11/27), Math.pow(2, 22/27), Math.pow(2,33/27)]; // 27ed4
        //var lineRatios = [1, Math.pow(2, 9/27), Math.pow(2, 18/27), Math.pow(2,27/27)]; // 27ed4
        // var lineRatios = [
        //   1,
        //   Math.pow(2, 13 / 31),
        //   Math.pow(2, 23 / 31),
        //   Math.pow(2, 36 / 31),
        //   Math.pow(2, 46 / 31),
        // ]; //31ed4
        // var lineRatios = [
        //   1,
        //   Math.pow(2, 8 / 31),
        //   Math.pow(2, 13 / 31),
        //   Math.pow(2, 21 / 31),
        //   Math.pow(2, 26 / 31),
        // ]; //31ed4
        // var lineRatios = [
        //   1,
        //   Math.pow(2, 7 / 34),
        //   Math.pow(2, 14 / 34),
        //   Math.pow(2, 21 / 34),
        //   Math.pow(2, 40 / 34),
        // ]; //34ed4

        //var lineRatios = [1, 9/8, 4/3, 3/2, 2];
        //var lineRatios = [1, 1.125, 3/2, 2];
        // var lineRatios = [1, 4/3, 8/5, 2];
        //var lineRatios = [1, 1.19161105815061963775, 1.19161105815061963775*1.19161105815061963775, 2];
        //var lineRatios = [1, 1.2, 1.5, 2];
        //var lineRatios = [1 , 1.25, 1.5, 1.875, 2.25];
        //var lineRatios = [1 , 1.25, 1.5, 1.875, 2.25]; //17edo
        //var lineRatios = [1, 1.25, 1.4953487812212205, 1.4953487812212205*1.25, 2.25];
        //var lineRatios = [1, 1.2505655196145777, 1.4955178823482058,1.4955178823482058*1.19587327404414  ];
        //var lineRatios = [1, 1.2467583092848906, 1.5061955531706115,  1.877861821323412];
        //var lineRatios = [1, 4/3, 5/3, 7/3];
        //var lineRatios = [1, 4/3, 5/3, 20/9];
        //var lineRatios = [1, 1.4, 7/4, 7/4 * 1.4];
        //var lineRatios = [1, Math.pow(3, 1/6), Math.pow(9, 1/6), Math.pow(27, 1/6)];

        //var lineRatios = [1, 1.25, 1.5, 1.75];
        //var lineRatios = [1, 4/3, 5/3, 2];
        //var lineRatios = [1, 1.2, 5/3, 2];
        //var lineRatios = [1, 1.2, 1.4, 1.6];
        //var lineRatios = [1, 4/3, 16/9, (16*4)/(9*3)];
        //var lineRatios = [1, Math.sqrt(1.8068056703447524), 1.8068056703447524, 1.8068056703447524*Math.sqrt(1.8068056703447524)];
        //var lineRatios = [1, 1.5, 2.25, 2.25*1.5];
        //var lineRatios = [1, 1.4950347393840864, 1.4950347393840864*1.4950347393840864, 1.4950347393840864*1.4950347393840864*1.4950347393840864];

        //var lineRatios = [1, Math.pow(1.4948492486349365,1), Math.pow(1.4948492486349365,2), Math.pow(1.4948492486349365,3)]
        //var lineRatios = [1, Math.pow(1.337927554786111,1), Math.pow(1.337927554786111,2), Math.pow(1.337927554786111,3)]

        //var lineRatios = [1, Math.pow(1.7411011265922487,1), Math.pow(1.7411011265922487,2), Math.pow(1.7411011265922487,3)]
        //var lineRatios = [1, Math.pow(2,1/2), Math.pow(2,1), Math.pow(2,3/2)]

        //var lineRatios = [1, Math.pow(2/1.4950347393840864,1), Math.pow(2/1.4950347393840864,2), Math.pow(2/1.4950347393840864,3)]
        //var lineRatios = [1, Math.sqrt(1.5), 1.5, Math.sqrt(1.5)*1.5];
        //var lineRatios = [1, Math.pow(1.4972850337321,1), Math.pow(1.4972850337321,2), Math.pow(1.4972850337321,3)];
        //var lineRatios = [1, Math.pow(1.4950347393840864,1), Math.pow(1.4950347393840864,2), Math.pow(1.4950347393840864,3)]; //1.1175644359826216
        //var lineRatios = [1, Math.pow(5/3,2)/2, Math.pow(5/3,1), Math.pow(5/3,3)/2, Math.pow(5/3,3)]; //1.1175644359826216
        //var lineRatios = [1, Math.pow(1.5,1), Math.pow(1.5,2), Math.pow(1.5,3)];
        //var lineRatios = [1, Math.pow(1.748579888531560928425454494,1), Math.pow(1.748579888531560928425454494,2), Math.pow(1.748579888531560928425454494,3)]; //1.4963512473325191858246684714214
        //var lineRatios = [1, Math.pow(1.49767258499040130252,1), Math.pow(1.49767258499040130252,2), Math.pow(1.49767258499040130252,3)]; //1.4963512473325191858246684714214

        //var lineRatios = [1, 1.49534812, 1.49534812*1.49534812, 1.49534812*1.49534812*1.49534812];
        //var lineRatios = [1, 5/4, 1.49534812, 1.49534812*1.25, 1.49534812*1.49534812];
        //var lineRatios = [1, 5/4, 1.5, 1.5*1.25, 1.5*1.5];
        //var lineRatios = [1, Math.0(2,10/17), Math.pow(2,20/17), Math.pow(2,30/17)];
        //var lineRatios = [1, 1.2, 1.4, 1.6, 1.8];
        //var lineRatios = [1, 4/3, 5/3, 2];
        //var lineRatios = [1, 7/6, 4/3];
        //var lineRatios = [ 1,Math.pow(2, 25/31), Math.pow(2, 50/31)/2, Math.pow(2, 75/31)/2, Math.pow(2, 30/31)]; //31ed4
        //var lineRatios = [ 1,Math.pow(2, 10/31), Math.pow(2, 18/31), Math.pow(2, 28/31), Math.pow(2, 30/31)]; //31ed4
        // var lineRatios = [
        //   1,
        //   Math.pow(2, 18 / 31),
        //   Math.pow(2, 5 / 31),
        //   Math.pow(2, 23 / 31),
        //   Math.pow(2, 30 / 31),
        // ]; //31ed4
        // var lineRatios = [
        //   1,
        //   Math.pow(2, 8 / 31),
        //   Math.pow(2, 15 / 31),
        //   Math.pow(2, 21 / 31)
        // ]; //31ed4

        //Golden Diatonic
        //         var lineRatios = [
        // 1
        // //,1.117564002635853
        // ,1.248949299987469
        // //,1.337761815878635
        // ,1.4950344495267345
        // //,1.6707966834915866
        // //,1.337761815878635*1.337761815878635
        // ,1.867222229193566
        // ,2]

        //Especify value
        //var lineRatios = [1, Math.pow(this.repeatScaleValue,1), Math.pow(this.repeatScaleValue,2), Math.pow(this.repeatScaleValue,3)];

        //Afinações legais
        //45Ed(PI^2) ou 19Ed(PHI^2) (string step 4.5)
        //31EdPI (string step 6)

        //N from Scale
        // var lineRatios = []
        // if(this.gtrSingleStep){
        //   var n = this.testValueInt;
        //   lineRatios = [
        //     1,
        //     Math.pow(this.base, n / this.eqt),
        //     Math.pow(this.base, (n * 2) / this.eqt),
        //     Math.pow(this.base, (n * 3) / this.eqt),
        //     Math.pow(this.base, (n * 4) / this.eqt),
        //   ];
        // }else{
        //   lineRatios = [
        //     1,
        //     Math.pow(this.base, this.gtrStep1 / this.eqt),
        //     Math.pow(this.base, this.gtrStep2 / this.eqt),
        //     Math.pow(this.base, this.gtrStep3 / this.eqt),
        //     Math.pow(this.base, this.gtrStep4 / this.eqt),
        //   ];
        // }
        //var lineRatios = [1,Math.pow(this.base, (n*2)/this.eqt)/2,Math.pow(this.base, n/this.eqt),  Math.pow(this.base, (n*4)/this.eqt)/4, Math.pow(this.base, (n*3)/this.eqt)];

        //var lineRatios = [1, Math.pow(n, 1), Math.pow(n, 2), Math.pow(n, 3)];
        //var lineRatios = [1, Math.pow(2, n/41), Math.pow(2, (n*2)/41), Math.pow(2, (n*3)/41)];
        //var lineRatios = [1, Math.pow(2, n/19), Math.pow(2, (n*2)/19), Math.pow(2, (n*3)/19)];
        //var lineRatios = [1, Math.pow(2, 6/19), Math.pow(2, 12/19), Math.pow(2, 18/19)];
        //var lineRatios = [1, Math.pow(2, 7/22), Math.pow(2, 13/22), Math.pow(2, 20/22)];
        //var lineRatios = [1, Math.pow(PHI*PHI, 6/21), Math.pow(PHI*PHI, 12/21), Math.pow(PHI*PHI, 18/21)];

        //var lineRatios = [1, 1.25, 1.5, 1.75];
        if (this.enableCustomNotes && this.customNotes.length == 0) { return [1] }
        var parsedFixedStepValue = parseFloat(this.fixedStepValue);

        for (let l = 0; l < 4; l++) {
          //for (let l = 0; l < lineRatios.length; l++) {
          //const vLine = lineRatios[l];

          for (let i = 0; i < qtd; i++) {

            if (this.enableCustomNotes && this.customNotes.length > 0) {

              function getCalculatedCustomNote(idx, customNotesData, shiftValue) {
                var shiftedIdx = idx - parseFloat(shiftValue) - 1;
                var modIdx = shiftedIdx % customNotesData.length;
                if (modIdx < 0) {
                  modIdx += customNotesData.length;
                }
                var nPeriod = Math.floor(shiftedIdx / customNotesData.length)
                var r = customNotesData[modIdx] || 0;
                var equivalenceValue = customNotesData[customNotesData.length - 1];
                var v = r * Math.pow(equivalenceValue, nPeriod);
                return v;
              }
              var v = getCalculatedCustomNote(i, this.customNotes, shift);

              if (parsedFixedStepValue === 0) {
                var vLineIdx = (l * Math.floor(this.testValueInt));
                var vLine = getCalculatedCustomNote(vLineIdx, this.customNotes, 0);
                ratiosArr.push(v * vLine);
              } else {
                var vLine = Math.pow(parsedFixedStepValue, l);
                ratiosArr.push(v * vLine);
              }
            } else {
              var vLine = 1;

              //Equal temperament
              var v = Math.pow(this.base, (i - shift) / this.eqt);

              if (parsedFixedStepValue === 0) {
                var vLineIdx = (l * this.testValueInt);
                if (!this.gtrSingleStep && l == 0) {
                  vLineIdx = this.gtrStep1;
                } else if (!this.gtrSingleStep && l == 1) {
                  vLineIdx = this.gtrStep2;
                } else if (!this.gtrSingleStep && l == 2) {
                  vLineIdx = this.gtrStep3;
                } else if (!this.gtrSingleStep && l == 3) {
                  vLineIdx = this.gtrStep4;
                }
                vLine = Math.pow(this.base, (vLineIdx / this.eqt));
              } else {
                vLine = Math.pow(parsedFixedStepValue, l);
              }


              //Overtones
              //var v = (parseFloat(this.eqt)+i)/parseFloat(this.eqt);
              //var vLine = (parseFloat(this.eqt)+(l*this.testValueInt))/parseFloat(this.eqt);
              //Undertones
              //var v = (parseFloat(this.eqt))/Math.max(1,(parseFloat(this.eqt)-i));

              ratiosArr.push(v * vLine);
            }
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
        //var lineRatios = [1, 1.2, 1.4, 1.6, 1.8];
        //Golden Pentatonic
        // var lineRatios = [
        //   1,
        //   1.117564002635853,
        //   1.337761815878635,
        //   1.4950344495267345,
        //   1.7896066760229032,
        //   2,
        // ];
        //var lineRatios = [1, 4/3, 1.5, 2];
        //var lineRatios = [1, 1.324717957244746, 1.4950347693089112,2]
        //var lineRatios = [1, 4/3, 5/3, 7/3];
        //var lineRatios = [1, Math.pow(1.3077590684505787,1), Math.pow(1.3077590684505787,2), Math.pow(1.3077590684505787,3)];
        //var lineRatios = [1, Math.pow(1.3373293784088067,1), Math.pow(1.3373293784088067,2), Math.pow(1.3373293784088067,3)];
        //var lineRatios = [1, Math.pow(1.2505655196145855,1), Math.pow(1.2505655196145855,2), Math.pow(1.2505655196145855,3)];
        //var lineRatios = [1, Math.pow(2,5/31), 1.4955142597767768, Math.pow(2,23/31)]; //Possibilidade de afinação para 31ed4
        var lineRatios = [1, Math.pow(2, 14 / 55), Math.pow(2, 32 / 55), Math.pow(2, 46 / 55)];
        //var lineRatios = [1, Math.pow(2,18/55), Math.pow(2,32/55), Math.pow(2,50/55)];
        //var lineRatios = [1, Math.pow(2,23/31), Math.pow(2,46/31), Math.pow(2,23*3/31)];
        //var lineRatios = [1, 1.4955142597767768, 1.4955142597767768*1.4955142597767768, 1.4955142597767768*1.4955142597767768*1.4955142597767768];
        //var lineRatios = [1, 1.2505678497940804, 1.4955142597767768, 1.7489046221194926];
        //var lineRatios = [1, 1.3373293784088152, 1.3373293784088152*1.3373293784088152, 1.3373293784088152* 1.3373293784088152* 1.3373293784088152];
        //var lineRatios = [1, 1.2505655196145855, 1.2505655196145855*1.2505655196145855, 1.2505655196145855*1.2505655196145855*1.2505655196145855];
        //var lineRatios = [1, Math.pow(1.2080894444044472,1), Math.pow(1.2080894444044472,2), Math.pow(1.2080894444044472,3)]
        //var lineRatios = [1, Math.pow(1.337762182113573606,1), Math.pow(1.337762182113573606,2), Math.pow(1.337762182113573606,3)]
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
          1.000000000000
          , 1.038531844737
          , 1.078548392533
          , 1.120106851735
          , 1.163266635035
          , 1.208089444404
          , 1.254639359305
          , 1.302982928298
          , 1.353189264187
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

        //var lineRatios = [1,colRatios[this.testValueInt], Math.pow(colRatios[this.testValueInt],2), Math.pow(colRatios[this.testValueInt],3),Math.pow(colRatios[this.testValueInt],4)];

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

      //Generator6 (Golden)
      if (false) {
        ratiosArr = [1];
        //var qtd = this.eqt;
        var s = 0;
        var L = 1;

        //var mode = [s,s,s,s,L];

        //var mode = [L,L,L,s,s,s,s,s];
        //var mode = [L,L,L,L,L,L,L,s]; //Porcupine[8]
        //var mode = [L, L, L, s, L, L, L, L, s,  L ,L, L];
        //var mode = [L, L, L, L, s, L, s, s, L, s, L];
        //var mode = [L,s, s, s, s, s, L, L, L];

        //MOS tree (s => L, L => s, L)
        //var mode = [s,L, s, L, s]; //5
        //var mode = [L,s,L, L, s,L, L]; //7
        //var mode = [s,L,L,s,L, s,L, L,s,L, s,L]; //12
        //var mode = [L,s,L,s,L,L,s,L, L,s,L, s,L,L,s,L, L,s,L]; //19
        //var mode = [s,L,L,s,L,L,s,L,s,L,L,s,L, s,L,L,s,L, L,s,L,s,L,L,s,L, s,L,L,s,L]; //31

        //var mode = [s, L, s, L, s]; //Pentatonica
        //var mode = [L, s, L, s, L]; //Anti-Pentatonica
        //var mode = [L, L, s, L, L, L, s]; //Diatonica (Jônio)
        //var mode = [L, s, L, L, L, s, L]; //Diatonica (Dórico)
        //var mode = [s, L, L, L, s, L, L]; //Diatonica (Frígio)
        //var mode = [L, L, L, s, L, L, s]; //Diatonica (Lídio)
        //var mode = [L, L, s, L, L, s, L]; //Diatonica (Mixolídio)
        //var mode = [L, s, L, L, s, L, L]; //Diatonica (Eólio)
        //var mode = [s, L, L, s, L, L, L]; //Diatonica (Lócrio)

        //var mode = [s, s, L, s, s, s, L]; //Anti-Diatonica
        //var mode = [L, L, s, L, s, s, s];
        //var mode = [L, s, s, L, s, s, L, s, s] // Magic[10]
        var mode = [s, s, s, L, s, s, s, s, s, L, s, s, s] // BP[13]

        var baseC = this.ratioToCents(this.repeatScaleValue);

        var ns = mode.filter((item) => item == s).length;
        var nL = mode.filter((item) => item == L).length;

        //var ratioBase = PHI;
        var ratioBase = this.testValue;

        var sCents = baseC / (ns + nL * ratioBase);
        var LCents = sCents * ratioBase;

        this.sDisplay = this.inCents ? sCents : this.centsToRatio(sCents);
        this.lDisplay = this.inCents ? LCents : this.centsToRatio(LCents);
        //console.log(`s: ${s} L:${L}`)

        var currentValue = 0;
        var modeLength = mode.length;
        if (this.repeatScale) {
          modeLength -= 1;
        }
        for (let i = 0; i < modeLength; i++) {
          var v = mode[i] == s ? sCents : LCents;
          currentValue = currentValue + v;
          //console.log(currentValue);
          var vRatio = this.centsToRatio(currentValue);
          ratiosArr.push(vRatio);
        }
      }

      //Generator7
      if (false) {
        ratiosArr = [1];

        var n = this.testValueInt;
        var r = Math.pow(this.base, n / this.eqt);

        for (let index = 1; index < 39; index++) {
          var v = Math.pow(r, index);
          ratiosArr.push(v);
        }
      }

      //Generator8 Harmonic with prime limit
      if (false) {
        ratiosArr = [1];

        var n = this.testValue2;
        var limits = [2, 3, 5, 7];

        for (let index = 1; index < n; index++) {
          //Undertone
          var den = (n - index);
          if (limits.some(l => den % l === 0)) {
            var v = n / den;
            if (v < 2) {
              ratiosArr.push(v);
            }
          }
        }
      }

      //Generator9 cummulative overtones/undertones with prime limit
      if (false) {
        ratiosArr = [];

        var n = this.testValue2;
        var primeLimits = [2, 3, 5, 7];

        var index = n;
        //for (let index = 2; index <= n; index++) {
        //Family prime limit
        if (isPrimeLimit(index, primeLimits)) {
          // //Undertone family
          // ratiosArr.push(1);
          // for(var u = 1; u < index; u++){

          //   var den = (index - u);
          //   if(!isPrimeLimit(den,primeLimits)){ continue}

          //   var v = index / den;
          //   if(v >= 2){ continue }

          //   ratiosArr.push(v);
          // }

          //Overtone family
          ratiosArr.push(1);
          for (var o = 1; o < index; o++) {

            var num = (index + o);
            if (!isPrimeLimit(num, primeLimits)) { continue }

            var v = num / index;
            if (v >= 2) { continue }

            ratiosArr.push(v);
          }
        }
        //}
      }

      //Generator10 EDL
      if (false)
        for (let d = 1; d <= n; d++) {
          for (let index = 0; index < d; index++) {
            ratiosArr.push(d / (d - index));
          }
        }

      //Well Tempered Generator - WTG
      //base: PHI edt: 4 norm: 1.5 repeat sort
      //base: 5 eqt: 13 norm: 3 repeat 3 sort
      //base: 1.2013911007785754  eqt: 6 norm 2 sort, //Escala de 11 tons
      //WTG 1.143572939715946 (base9)
      //WTG 1.2458005985895744 (base9)gg
      //1.4950347693089112
      if (this.wtg || this.mode == "wtg") {
        //this.wtg = true;
        ratiosArr = [1];

        //ratiosArr.push(2/this.base);

        //Alternated (Horagrams)
        if (this.wtgMode == "alternated") {
          var vUp = 1;
          var vDown = 1;
          for (let index = 1; index < this.eqt; index++) {
            if ((index - 1) % 2 == 0) {
              vUp = vUp * this.base;
              ratiosArr.push(vUp);
            } else {
              vDown = vDown / this.base;
              ratiosArr.unshift(vDown);
            }
          }
        }

        //Over
        if (this.wtgMode == "up") {
          for (let index = 1; index < this.eqt; index++) {
            ratiosArr.push(Math.pow(this.base, index));
            //ratiosArr.push(Math.pow(this.base, index + 1) / 1.2);
            //ratiosArr.push(Math.pow(this.base, index + 1));
          }
        }

        //Under
        if (this.wtgMode == "down") {
          for (let index = 1; index < this.eqt; index++) {
            ratiosArr.unshift(Math.pow(this.base, -index));

            //ratiosArr.push(Math.pow(this.base, -(index + 1)) * 1.2);
            //ratiosArr.push(Math.pow(this.base, -(index + 1)));
          }
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

      //WTG 3
      if (false) {
        this.wtg = true;
        ratiosArr = [1];

        var arrIntervals = [1.25, 1.2, 7 / 6];

        //Over
        var lastOver = 1;
        for (let index = 0; index < this.eqt; index++) {
          var interval = arrIntervals[index % arrIntervals.length];

          lastOver *= interval;
          ratiosArr.push(lastOver);
          //ratiosArr.push(Math.pow(this.base, index + 1) / 1.2);
          //ratiosArr.push(Math.pow(this.base, index + 1));
        }

        //Under
        var lastUnder = 1;
        for (let index = 0; index < this.eqt; index++) {
          //ratiosArr.unshift(Math.pow(this.base,-index))

          var interval = arrIntervals[index % arrIntervals.length];
          lastUnder /= interval || 1;
          //ratiosArr.push(lastUnder);

          //ratiosArr.push(Math.pow(this.base, -(index + 1)) * 1.2);
          //ratiosArr.push(Math.pow(this.base, -(index + 1)));
        }

        // if(this.repeatScale){
        //   ratiosArr.push(Math.sqrt(this.repeatScaleValue));
        // }
      }
      // if (this.normalize) {
      //   for (var i = 0; i < ratiosArr.length; i++) {
      //     var v = ratiosArr[i] || 1;
      //     ratiosArr[i] = this.normalizeValue(v);
      //   }
      // }



      if (this.repeatScaleHarm) {
        var harmArr = []
        const harm = parseFloat(this.repeatScaleHarmValue);
        for (let harmIndex = harm + 1; harmIndex < (harm + parseInt(this.repeatScaleHarmCount)); harmIndex++) {
          const harmValue = harmIndex / harm;
          for (let i = 0; i < ratiosArr.length; i++) {
            const element = ratiosArr[i];
            harmArr.push(element * harmValue);
          }
        }
        ratiosArr = ratiosArr.concat(harmArr);
      }

      if (this.normalize) {
        for (var i = 0; i < ratiosArr.length; i++) {
          var v = ratiosArr[i] || 1;
          ratiosArr[i] = this.normalizeValue(v);
        }
      }

      if (this.applySort) {

        ratiosArr = ratiosArr.unique();
        ratiosArr = ratiosArr.sort((a, b) => a - b);
      }

      //Gerar repetição da escala (oitava)
      if (this.repeatScale) {
        var base = this.repeatScaleValue;
        var numOct = 12;
        var octArr = [];
        for (var t = 0; t < numOct; t++) {
          for (let i = 0; i < ratiosArr.length; i++) {
            const element = ratiosArr[i];
            octArr.push(element * Math.pow(base, t + 1));
          }
        }
        ratiosArr = ratiosArr.concat(octArr);
      }

      //Normal
      if (!(this.wtg || this.mode == "wtg") && !this.repeatScaleHarm && this.normalize) {
        for (var i = 0; i < ratiosArr.length; i++) {
          var v = ratiosArr[i] || 1;
          ratiosArr[i] = this.normalizeValue(v);
        }
      }

      // if (!this.wtg && this.applySort) {
      //   Array.prototype.unique = function() {
      //     return this.filter(function(value, index, self) {
      //       return self.indexOf(value) === index;
      //     });
      //   };
      //   ratiosArr = ratiosArr.unique();
      //   ratiosArr = ratiosArr.sort((a, b) => a - b);
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

      //Ls Mapped Steps
      if (false && idx > 1) {
        //var mode = "2 2 1 2 2 2 1"; //Diatônica 12ed2
        //var mode = "3 3 3 3 3 3 3 1"; //Porcupine[8] 22edo
        //var mode = "3 3 3 3 3 3 4"; //Porcupine[7] 22edo
        //var mode = "3 4 2 4 3 3 3"; //Porcupine[7] 22edo MODMOS
        //var mode = "4 2 3 4 3 3 3"; //Porcupine[7] 22edo MODMOS
        //var mode = "3 2 2 2 2 3 2 2 2 2"; //Pajara[10] 22edo MOS (Symmetric)
        //var mode = "3 2 2 2 2 2 3 2 2 2"; //Pajara[10] 22edo MODMOS (Pentacordal)
        //var mode = "1 2 1 2 1 2 1 2 1 2 1 2 1 2 1"; //Porcupine[15] 22edo
        //var mode = "3 1 3 1 3 1 1 3 1 3 1 1"; //Superpyth[12] 22edo
        //var mode = "1 1 3 1 3 1 4 1 3 1 3"; //Anti-Superpyth[12] 22edo
        //var mode = "1 3 1 1 3 1 3 1 1 3 1"; //kleismic[11] 19edo
        //var mode = "4 1 1 4 1 1 4 1 1 1"; //magic[10] 19edo
        //var mode = "1 1 6 1 1 1 6 1 1";  //liese[9]  19edo
        //var mode = "5 1 1 5 1 1 5 1 1 1"; //Magic[10] 22edo
        //var mode = "5 1 1"; //Magic[10]
        //var mode = "1 2 1 2";  //Legal: posui acorde 1 1.2 1.6 e 1 1.3333 1.6
        //var mode = "1 2 1 1";  //Legal: posui acorde 1 1.2 1.6 e 1 1.3333 1.6
        //var mode = "1 2"; //Porcupine[10] 15edo
        //var mode = "6 2";
        //var mode = "5 2 2 5 2 5 2 5 2";
        //var mode = "2 1 1 2 1 2 1 2 1"; //BP Lambda
        //var mode = "1 2 1 2 1 2 1 2 1"; //BP
        //var mode = "2 2 2 2 3 2 2 2 2"; //Negri[9] 19edo
        //var mode = "3 10 2 10"; //28EDT (Interessante)
        //var mode = "5 2 5 2 2";//Mavila[5]
        //var mode = "3 2 2 3 2 2 2"; //Mavila[7]
        //var mode = "1 2 2 2 1 2 2 2 2";//Mavila[9]
        //var mode = "3 1 3 2 2 2"; //22edo bom

        var mode = "3 3 4 3 5 3 4 3 3";

        //var mapArr = mode.split(" ");
        var mapArr = mode.replace(/\D/g, "");
        var cIdx = idx - 1;
        var mapSum = 0;
        for (let mapIdx = 0; mapIdx < cIdx; mapIdx++) {
          const mapValue = mapArr[mapIdx % mapArr.length];
          mapSum += parseInt(mapValue);
        }
        idx = mapSum + 1;
      }

      //AQUI!
      if (this.mode == "wtg" || this.mode == "code" || this.mode == "gtr") {
        return ratiosArr[idx - 1] || 0;
      }

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

      //Equal temperament
      if (this.mode == "eqt") {
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
      if (this.mode == "harm") {
        var numHarmQtd = parseInt(this.harmQtd)
        if (numHarmQtd > 0) {

          var arrHarm = []
          var primeList = this.primeFilter?.split(' ').map(v => parseFloat(v));
          var hBase = 1;
          for (let index = 0; index < numHarmQtd; index++) {
            var v = 1;
            var harmIdx = parseFloat(this.eqt) + index;

            if (index > 0 && index != parseFloat(this.eqt) && this.usePrimeFilter && primeList.includes(getMaxPrimeFactor(harmIdx)) == false) {
              continue;
            }

            if (this.harmMode == 'over') {
              //Overtones
              v = (harmIdx) / parseFloat(this.eqt);
              hBase = (parseFloat(this.eqt) + numHarmQtd) / parseFloat(this.eqt);
            } else {
              //Undertones
              v = parseFloat(this.eqt) / (harmIdx);
              hBase = parseFloat(this.eqt) / (parseFloat(this.eqt) + numHarmQtd);
            }

            arrHarm.push(v);
          }


          var numOct = 12;
          var octArr = [];
          for (var t = 0; t < numOct; t++) {
            for (let i = 0; i < arrHarm.length; i++) {
              const element = arrHarm[i];
              octArr.push(element * Math.pow(hBase, t + 1));
            }
          }
          arrHarm = arrHarm.concat(octArr);
          var harmV = arrHarm[idx - 1];
          if (this.normalize) {
            harmV = this.normalizeValue(harmV);
          }
          return harmV;

        } else {
          var v = 1;
          if (this.harmMode == 'over') {
            //Overtones
            v = (this.eqt - 1 + (idx)) / this.eqt;
            //v = (this.eqt - 1 + Math.pow(this.testValue,)) / this.eqt;

          } else {
            //Undertones
            v = this.eqt / (this.eqt - 1 + (idx % harmMod));
          }
          if (this.normalize) {
            v = this.normalizeValue(v);
          }
          return v;
        }
      }

      if (this.mode == "custom" && this.customNotes.length > 0) {

        const periodRatio = this.customNotes[this.customNotes.length - 1];
        const resultNotes = [1];
        for (var r = 1; r <= this.repetitionCount; r++) {
          for (let i = 0; i < this.customNotes.length; i++) {
            const element = this.customNotes[i];
            resultNotes.push(element * Math.pow(periodRatio, r - 1));
          }
        }
        const v = resultNotes[idx - 1];
        if (this.normalize) {
          return this.normalizeValue(v)
        } else {
          return v;
        }
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
      //var arr = ['white','red','blue','yellow','green','blue','yellow','red','green','yellow','blue','red','green',''];
      //return arr[Math.min(idx-1,arr.length-1)];
      //var arr = ["#ff8080",'#8080ff'];
      //return arr[ (idx-1) % arr.length];

      if (this.equivalence == 1) {
        return "";
      }

      var normRatio = this.normalizeValue(
        this.freqBased ? this.freq(idx) : this.ratio(idx)
      );

      var freq = this.ratio(idx) * this.mainFreq;
      var range = Math.min(Math.log2(freq / 20) / 10, 1);

      //TODO: Finalizar
      // var vRange = 1;
      // var sRange = 1;
      // if(range < 0.5){
      //   vRange = range * 2;
      // }
      // else{
      //   sRange =
      // }

      // if([1, 1.25, 4/3, 1.5,5/3].indexOf( normRatio) != -1){
      //   return "#ff8080";
      // }
      // else
      // {
      //   return '#8080ff';
      // }

      if (normRatio) {
        var h = (normRatio - 1) / (this.equivalence - 1 || 1); //Matriz
        var s = 0.77; //Saturaçao
        var v = 1; //range //Brilho
        var c = this.HSVtoRGB(h, s, v);
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
        b: Math.round(b * 255),
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
    eqt: function (val) {
      if (val == 0) {
        this.eqt = 1;
      }
    },
  },
};

function isPrimeLimit(value, primesArray) {
  if (value === 1) { return true; }

  var currentValue = value;
  var isPrimeLimit = false;
  do {
    var isMultiple = false;
    for (let index = 0; index < primesArray.length; index++) {
      const primeLimit = primesArray[index];
      if (currentValue % primeLimit === 0) {
        currentValue = currentValue / primeLimit;
        isMultiple = true;
        break;
      }
    }
    if (isMultiple === false) {
      isPrimeLimit = false;
      break;
    }
    if (currentValue === 1) {
      isPrimeLimit = true;
      break;
    }
  } while (isMultiple);

  return isPrimeLimit;
}

// function normalizeValueIsolated(v, equivalence = 2) {
//       if (equivalence == 1) {
//         return v;
//       }

//       equivalence = equivalence || 2;
//       if (v >= equivalence) {
//         while (v >= equivalence) {
//           v = v / equivalence;
//         }
//       } else if (v > 0 && v < 1) {
//         while (v < 1) {
//           v = v * equivalence;
//         }
//       }
//       return v;
//     }

// function harmonicSerieWithPrimes(harm, primes){
// const result = [1];

// for (let index = 1; index < harm; index++) {
//   const num = harm + index;

//   let multiple = false;
//   for (let p = 0; p < primes.length; p++) {
//     const prime = primes[p];
//     if (num % prime === 0) {
//       multiple = true;
//       break;
//     }
//   }

//   if (multiple) {
//     const v = num / harm;
//     result.push(v);
//   }
// }
// return result;
// }

// function harmonicPermutation(harmSerie){
//   var permutations = [];

// for (let permIdx = 0; permIdx < harmSerie.length; permIdx++) {
//   for (let index = 0; index < harmSerie.length; index++) {
//     const modIdx = (index + permIdx) % harmSerie.length;
//     const element = harmSerie[modIdx];
//     const value = element/harmSerie[permIdx];
//     const normValue = normalizeValueIsolated(value);
//     //permutations.push({element, v: (index + permIdx)});
//     permutations.push(normValue);

//   }

// }

// return permutations;
// }

// var harmSerie = harmonicSerieWithPrimes(6, [2,3,5,7,11]);
//  console.log(harmSerie);

//  var permutations = harmonicPermutation(harmSerie);
//  console.log(permutations);

//  var sorted = permutations.unique().sort((a, b) => a - b);
//  console.log(sorted);

const arr = [6 / 5, 7 / 6, 8 / 7, 9 / 8, 10 / 9];
const findPermutations = (arr = []) => {
  let res = []
  const helper = (arr2) => {
    if (arr2.length == arr.length)
      return res.push(arr2)
    for (let e of arr)
      if (!arr2.includes(e))
        helper([...arr2, e])
  };
  helper([])
  return res;
};


var permutations = findPermutations(arr);

const result = [];
for (let p = 0; p < permutations.length; p++) {

  const permutation = permutations[p];
  result.push(1);
  permutation.reduce((previousValue, currentValue) => {
    const v = previousValue * currentValue;
    result.push(v);
    return v;
  }, 1);
  result.pop();
}
console.log(result.toString());
// console.log();

function isPrime(num) {
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return num > 1;
}

function getFactors(number) {
  return Array
    .from(Array(number + 1), (_, i) => i)
    .filter(i => number % i === 0)
}

function getMaxPrimeFactor(num) {
  const primeFactors = getFactors(num).filter(n => isPrime(n));
  const maxPrime = Math.max(...primeFactors);
  return maxPrime;
}

</script>

<style scoped>
.keyboard {
  width: 100%;
}
</style>
