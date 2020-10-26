<template>
  <div>
    <p>
      MOS:
      <select v-model="selectedMos" @change="onChangeMos">
        <option
          v-for="item in getMosOptions()"
          :key="item.value"
          :value="item.value"
          >{{ item.text }}</option
        >
      </select>
    </p>
    <p>
      Generator:
      <select v-model="selectedMosGenerator" @change="onChangeMosGenerator">
        <option value="custom">Custom</option>
        <option
          v-for="(item, index) in getMosGeneratorOptions()"
          :key="'gen' + index"
          :value="item"
          >{{ item }}</option
        >
      </select>
      <input        
        type="number"
        step="0.0001"
        v-model="generator"
      />
      <small>Min: {{ this.getMosMin() }} Max: {{ this.getMosMax() }}</small>
    </p>
    <p>
      Period:
      <input type="number" step="0.0001" v-model="period" @change="onChangeMosGenerator" />
      Scale Size:
      <input type="number" step="1" v-model="scaleSize" />
    </p>
    <p>
      <span>
        MainFreq:
        <input type="text" v-model="mainFreq" />
      </span>
      <span>
        Normalize:
        <input type="checkbox" v-model="normalize" />
        <input type="number" v-model="equivalence" step="0.0001" />
      </span>
      <span>
        Repeat
        <input type="checkbox" v-model="repeatScale" />
        <input type="number" v-model="repeatScaleValue" step="0.0001" />
      </span>
      <span>
        Chart:
        <input type="checkbox" v-model="showChart" />
      </span>
      <span>
        guitarStringLength:
        <input type="number" v-model="guitarStringLength" step="1" />
      </span>
    </p>

    <table class="keyboard">
      <tr v-for="(krow, ridx) in keys" v-bind:key="ridx + base">
        <td v-for="(key, kidx) in krow" v-bind:key="(ridx+''+kidx)">
          <template v-if="!freqBased">
            <small
              >{{ key.idx }} :
              {{ parseFloat(ratio(key.idx)).toFixed(4) }}</small
            >

            <!-- Distancia do fret em relação ao inicio do braço -->
            <small
              >({{
                (
                  guitarStringLength -
                  guitarStringLength / ratio(key.idx)
                ).toFixed(3)
              }}cm)</small
            >
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
            <small
              >{{ key.idx }} : {{ parseFloat(freq(key.idx)).toFixed(3) }}</small
            >
            <audio-key
              :keyName="key.k"
              :freq="freq(key.idx)"
              :color="color(key.idx)"
              @onChangeActive="onChangeActive"
            />
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
        style="display: inline-block;"
      ></chartjs-line>
      <chartjs-line
        :width="500"
        :height="150"
        :labels="chartLabels()"
        :data="ratioDiff"
        :bind="true"
        style="display: inline-block;"
      ></chartjs-line>
    </div>
    <div>ActiveRatio: {{ activeRatio }}</div>
    <div>Avg ratio: {{ ratioAvg }}</div>
    <div>Ratios diff: {{ ratioDiff }}</div>
    <div style="text-align: left;" v-if="!freqBased">
      <h4 style="display: inline-block;">Ratio List:</h4>
      <span> <input type="checkbox" v-model="ratioListIdx" />Idx </span>
      <span style="margin-left: 20px;">
        <input type="checkbox" v-model="inCents" />In cents
      </span>
      <!-- <div v-for="ii in (this.ratiosArr.length)" v-bind:key="ii">{{ratio(ii)}}</div> -->
      <div v-for="ii in Math.max(73, nEqt)" v-bind:key="ii">
        <span v-if="ratioListIdx">{{ ii }}:</span>
        <span>{{ inCents ? ratioToCents(ratio(ii)) : ratio(ii) }}</span>
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
    AudioKey,
  },
  data() {
    return {
      eqt: 12,
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
      testValueInt: 1,
      wtg: false,
      keys: [],

      generator: 3,
      period: 2,
      scaleSize: 5,
      selectedMos: undefined,
      selectedMosGenerator: "custom",
      mosData: {
        "1L1s": { s: 2, p: 2, min: 1/2, max: 1,   g: ["2/3", "3/4", "4/5"] },
        "1L2s": { s: 3, p: 2, min: 2/3, max: 1,   g: ["3/4", "4/5", "5/6"] },
        "2L1s": { s: 3, p: 2, min: 1/3, max: 1/2, g: ["2/5", "3/7", "4/9"] },
        "1L3s": { s: 4, p: 2, min: 3/4, max: 1,   g: ["4/5", "5/6", "6/7"] },
        "2L2s": { s: 4, p: 2, min: 1/4, max: 1/2, g: ["2/6", "3/8", "4/10"] },
        "3L1s": { s: 4, p: 2, min: 1/4, max: 1/3, g: ["2/7", "3/10", "4/13"] },
        "1L4s": { s: 5, p: 2, min: 4/5, max: 1,   g: ["5/6", "6/7", "7/8"] },
        "2L3s": { s: 5, p: 2, min: 2/5, max: 1/2, g: ["3/7", "4/9", "5/11", "5/12", "13/31"], name:"Pentatonic" },
        "3L2s": { s: 5, p: 2, min: 3/5, max: 2/3, g: ["5/8", "7/11", "9/14"], name: "Anti-pentatonic" },
        "4L1s": { s: 5, p: 2, min: 1/5, max: 1/4, g: ["2/9", "3/13", "4/17"] },
        "1L5s": { s: 6, p: 2, min: 5/6, max: 1,   g: ["6/7", "7/8", "8/9"] },
        "2L4s": { s: 6, p: 2, min: 2/6, max: 1/2, g: ["3/8", "4/10", "5/12"] },
        "3L3s": { s: 6, p: 2, min: 1/6, max: 1/3, g: ["2/9", "3/12", "4/15"] },
        "4L2s": { s: 6, p: 2, min: 1/6, max: 1/4, g: ["2/10", "3/14", "4/18"] },
        "5L1s": { s: 6, p: 2, min: 1/6, max: 1/5, g: ["2/11", "3/16", "4/21"] },
        "1L6s": { s: 7, p: 2, min: 6/7, max: 1,   g: ["7/8", "8/9", "9/10"] },
        "2L5s": { s: 7, p: 2, min: 3/7, max: 1/2, g: ["4/9", "5/11", "6/13"], name: "Anti-diatonic" },
        "3L4s": { s: 7, p: 2, min: 2/4, max: 1/3, g: ["3/10", "4/13", "5/16"] },
        "4L3s": { s: 7, p: 2, min: 5/7, max: 3/4, g: ["8/11", "11/15", "14/19"] },
        "5L2s": { s: 7, p: 2, min: 4/7, max: 3/5, g: ["7/12", "10/17", "13/22"], name: "Diatonic" },
        "6L1s": { s: 7, p: 2, min: 1/7, max: 1/6, g: ["2/13", "3/19", "4/25"] },        
        "1L7s": { s: 8, p: 2, min: 7/8, max:1 ,   g: ["8/9", "9/10", "10/11"] },        
        "2L6s": { s: 8, p: 2, min: 3/8, max: 1/2, g: ["4/10", "5/12","6/14"] },        
        "3L5s": { s: 8, p: 2, min: 5/8, max: 2/3, g: ["7/11", "9/14", "11/17"] },        
        "4L4s": { s: 8, p: 2, min: 1/8, max: 1/4, g: ["2/12", "3/16", "4/20"] },        
        "5L3s": { s: 8, p: 2, min: 3/8, max: 2/5, g: ["5/13", "7/18", "9/23"] },        
        "6L2s": { s: 8, p: 2, min: 1/8, max: 1/6, g: ["2/14", "3/20", "4/26"] },        
        "7L1s": { s: 8, p: 2, min: 1/8, max: 1/7, g: ["2/15", "3/22", "4/29"] },        
        "1L8s": { s: 9, p: 2, min:8/9 , max: 1,   g: ["9/10","10/11","11/12"] },        
        "2L7s": { s: 9, p: 2, min: 4/9, max: 1/2, g: ["5/11", "6/13", "7/15"] },        
        "3L6s": { s: 9, p: 2, min: 2/9, max: 1/3, g: ["3/12", "4/15", "5/18"] },        
        "4L5s": { s: 9, p: 2, min:2/9 , max: 1/4, g: ["3/13", "4/17", "5/21"] },        
        "5L4s": { s: 9, p: 2, min: 7/9, max:4/5 , g: ["11/14", "15/19", "18/23"] },        
        "6L3s": { s: 9, p: 2, min: 1/9, max: 1/6, g: ["2/15", "3/21", "4/27"] },        
        "7L2s": { s: 9, p: 2, min: 5/9, max: 4/7, g: ["9/16", "10/23", "17/30"] },        
        "8L1s": { s: 9, p: 2, min: 1/9, max: 1/8, g: ["2/17", "3/25", "4/33"] },       
      },
    };
  },
  mounted: function () {
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
 var vDiff = v /vAnterior;
 if (vDiff > 0) {
   arrDiff.push(vDiff);
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
      var max = Math.max(73, this.eqt); //this.eqt;
      //var max = Math.max(this.ratiosArr.length,this.eqt);
      for (var i = 1; i <= max; i++) {
        var v = i.toString();
        data.push(v);
      }
      data.push("O");
      return data;
    },

    ratio(idx) {
      var PHI = (1 + Math.sqrt(5)) / 2; //1.618033988749895

      var ratiosArr = [];

      ratiosArr = this.rank2Temperament(
        this.generator,
        this.period,
        this.scaleSize
      );

      //Gerar repetição da escala (oitava)
      if (this.repeatScale) {
        ratiosArr = this.repeatTheScale(ratiosArr, this.repeatScaleValue, 9);
      }

      return ratiosArr[idx - 1] || 0;
    },

    rank2Temperament(generator, period, size) {
      var ratiosArr = [1];

      //Alternated (Horagrams)
      var vUp = 1;
      var vDown = 1;
      for (let index = 1; index < size; index++) {
        if ((index - 1) % 2 == 0) {
          vUp = vUp * generator;
          var normalizedUp = this.normalizeValue(vUp, this.period);
          ratiosArr.push(normalizedUp);
        } else {
          vDown = vDown / generator;
          var normalizedDown = this.normalizeValue(vDown, this.period);
          ratiosArr.push(normalizedDown);
        }
      }

      ratiosArr = this.sortValues(ratiosArr, true);
      return ratiosArr;
    },

    onChangeMos() {
      var data = this.mosData[this.selectedMos];
      if (!data) {
        return;
      }

      this.period = data.p;
      this.selectedMosGenerator = data.g[0];
      this.generator = this.eqtExpToRatio(this.period, eval(data.g[0]));
      this.scaleSize = data.s;
    },

    onChangeMosGenerator() {
      if (this.selectedMosGenerator == "custom") {
        return;
      }
      
      this.generator = this.eqtExpToRatio(this.period, eval(this.selectedMosGenerator));
    },

    getMosMin() {
      var data = this.mosData[this.selectedMos];
      if (!data) {
        return;
      }

      var value = this.eqtExpToRatio(this.period, data.min);
      return value.toFixed(5);
    },

    getMosMax() {
      var data = this.mosData[this.selectedMos];
      if (!data) {
        return;
      }

      var value = this.eqtExpToRatio(this.period, data.max);
      return value.toFixed(5);
    },

    getMosOptions() {
      var options = [];

      for (var dataKey in this.mosData) {
        var dataValue = this.mosData[dataKey];
        var name = "";
        if(dataValue.name){
          name = ` (${dataValue.name})`;
        }
        options.push({
          value: dataKey,
          text: `${dataValue.s} notes - ${dataKey}`+name,
        });
      }

      return options;
    },

    getMosGeneratorOptions() {
      var data = this.mosData[this.selectedMos];
      if (!data) {
        return [];
      }

      var options = data.g;
      return options;
    },

    eqtExpToRatio(base, exp) {
      return Math.pow(base, exp);
    },

    sortValues(ratiosArr, unique) {
      if (unique) {
        Array.prototype.unique = function () {
          return this.filter(function (value, index, self) {
            return self.indexOf(value) === index;
          });
        };
        ratiosArr = ratiosArr.unique();
      }
      ratiosArr = ratiosArr.sort((a, b) => a - b);
      return ratiosArr;
    },

    repeatTheScale(ratiosArr, rapetitionBase, numOfRepetitions) {
      var base = rapetitionBase;
      var resultArr = [];
      for (var t = 0; t < numOfRepetitions; t++) {
        for (let i = 0; i < ratiosArr.length; i++) {
          const element = ratiosArr[i];
          resultArr.push(element * Math.pow(base, t + 1));
        }
      }
      resultArr = ratiosArr.concat(resultArr);
      return resultArr;
    },

    normalizeValue(v, equivalence) {
      if (equivalence == 1) {
        return v;
      }

      var equivalence = equivalence || 2;
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

      var normRatio = this.normalizeValue(
        this.freqBased ? this.freq(idx) : this.ratio(idx)
      );

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
    },
  },
  watch: {
    eqt: function (val) {
      if (val == 0) {
        this.eqt = 1;
      }
    },
  },
};
</script>

<style scoped>
.keyboard {
  width: 100%;
}
</style>
