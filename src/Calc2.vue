<template>
  <div>
    <h2>Microtonal Calc</h2>

    <select v-model="calcType">
      <option value="eqt">Equal Temperament</option>
      <option value="lin">Linear (Overtones)</option>
      <option value="sub">Linear (Undertones)</option>
      <option value="gen">Generator</option>
    </select>

    <div v-if="calcType == 'eqt'">
      <label>Base:</label>

      <input type="number" step="0.0001" v-model="base" />
      <button v-on:click="setBasePhi">φ</button>
      <button v-on:click="setBasePi">π</button>

      <label>Max division to search:</label>
      <input type="number" step="1" v-model="maxDiv" />
    </div>

    <div v-if="calcType == 'gen'">
      <label>Min:</label>
      <input type="number" step="0.0001" v-model="genMin" />
      <label>Max:</label>
      <input type="number" step="0.0001" v-model="genMax" />
      <label>Step:</label>
      <input type="number" step="0.0001" v-model="genStep" />
    </div>

    <div v-if="calcType == 'lin' || calcType == 'sub'">
      <label>Max harmonic to search:</label>
      <input type="number" step="1" v-model="maxDiv" />
    </div>

    <label>Values to search:</label>
    <textarea
      rows="10"
      cols="30"
      v-model="textData"
      placeholder="One value per line in decimal format (Ex: 1.333) or fraction (Ex: 4/3) "
    ></textarea>

    <div>
      <input type="checkbox" v-model="priorityOrder" /> Search by priority (top lines have more priority)
    </div>
    <br />

    <button v-on:click="calc">Calculate</button>

    <div v-if="sortedResult.length > 0">
      <h3>Result</h3>
      <chartjs-line
            :width="500"
            :height="200"
            :labels="chartLabels"
            :data="chartData"
            :bind="true"
            datalabel="Chart"
          ></chartjs-line>
      <table border="1">
        <thead>
          <tr>
            <th>Idx</th>
            <th>Value</th>
            <th>TotalDiff (cents)</th>
            <th>AvgDiff (cents)</th>
            <th>MinDiff (cents)</th>
            <th>MaxDiff (cents)</th>
            <th>Result</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in sortedResult" v-bind:key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ item.value }}</td>
            <td>{{ item.diff.toFixed(5) }}</td>
            <td>{{ item.avgDiff.toFixed(5) }}</td>
            <td>{{ item.minDiff.toFixed(5) }}</td>
            <td>{{ item.maxDiff.toFixed(5) }}</td>
            <td>
              <span
                v-for="(ratio, idx) in item.ratios"
                :key="idx"
                style="padding-right: 10px"
                >
                {{ ratio.ratio }}
                <i>({{ ratio.diff.toFixed(2) }}¢) [{{ratio.eqtIndex}}]</i>
              </span>
              
            </td>
            <td>
              <div>{{ getIndexAnalysis(item.ratios, item.value)}}</div>
              {{ item.indexList === undefined ? "": [item.value].concat(item.indexList).join(':') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
require("chart.js");
require("hchs-vue-charts");

Vue.use(window.VueCharts);

export default {
  data() {
    return {
      calcType: "eqt",
      maxDiv: 53,
      base: 2,
      genMin: 1.05,
      genMax: 1.08,
      genStep: 0.0001,
      textData: "",
      sortedResult: [],
      priorityOrder: false,
    };
  },
  computed: {
    chartData() {
      return this.sortedResult.map(m=>m.value) || [];
    },
    chartLabels() {
      return this.sortedResult.map(m=>m.value) || []
    }
  },
  methods: {
    setBasePhi() {
      this.base = (Math.sqrt(5) + 1) / 2;
    },
    setBasePi() {
      this.base = Math.PI;
    },
    calc() {
      this.sortedResult = [];

      var ratioData = this.parseTextData();

      if (ratioData.length == 0) {
        return;
      }

      var results = [];
      if (this.calcType == "eqt") {
        results = this.calcEqt(ratioData);
      } else if (this.calcType == "gen") {
        results = this.calcGen(ratioData);
      } else if (this.calcType == "lin") {
        results = this.calcLin(ratioData);
      } else if (this.calcType == "sub") {
        results = this.calcSub(ratioData);
      }

      var sortedResult = results
        .sort((a, b) => {
          if (Math.abs(a.diff) < Math.abs(b.diff)) return -1;
          if (Math.abs(a.diff) > Math.abs(b.diff)) return 1;
          return 0;
        })
        //.reverse()
        .slice(0, 100);
      //console.log("sorted");
      //console.log(sortedResult);

      this.sortedResult = sortedResult;
    },
    calcGen(ratioData) {
      var maxRatioData = Math.max(...ratioData);

      var gMin = parseFloat(this.genMin);
      var gMax = parseFloat(this.genMax);
      var gStep = parseFloat(this.genStep);

      var results = [];
      //var currentMinDiff = 1;
      for (let i = gMin; i <= gMax; i += gStep) {
        var interval = i;
        var qtd = Math.ceil(Math.log(maxRatioData) / Math.log(interval)) + 1;
        var ratios = this.generateArrRatios(interval, qtd);

        var totalDiff = 0;
        var resultRatios = [];

        for (let j = 0; j < ratioData.length; j++) {
          const ratio = ratioData[j];

          var diffResult = this.diffFromRatio(ratios, ratio);

          resultRatios.push({ ratio: diffResult.ratio, diff: diffResult.diff });
          if (this.priorityOrder) {
            totalDiff += Math.abs(diffResult.diff) * (ratioData.length - j);
          } else {
            totalDiff += Math.abs(diffResult.diff);
          }
        }
        var avgDiff = totalDiff / ratioData.length;

        //Only best results
        // if (totalDiff < currentMinDiff) {
        //   currentMinDiff = totalDiff;
        //   results.push({ value: i, diff: totalDiff });
        // }
        results.push({
          value: i,
          diff: totalDiff,
          ratios: resultRatios,
          avgDiff,
          minDiff: 0,
          maxDiff: 0
        });
      }

      return results;
    },
    calcEqt(ratioData) {
      var maxRatioData = Math.max(...ratioData);
      var results = [];
      //var currentMinDiff = 1;
      for (let i = 2; i <= this.maxDiv; i++) {
        var interval = Math.pow(parseFloat(this.base), 1 / i);
        var qtd = Math.ceil(Math.log(maxRatioData) / Math.log(interval)) + 1;
        var ratios = this.generateArrRatios(interval, qtd);

        var totalDiff = 0;
        var resultRatios = [];
        var minDiff = 999;
        var maxDiff = -999;

        for (let j = 0; j < ratioData.length; j++) {
          const ratio = ratioData[j];

          var diffResult = this.diffFromRatio(ratios, ratio);
          minDiff = Math.min(minDiff, diffResult.diff);
          maxDiff = Math.max(maxDiff, diffResult.diff);

          resultRatios.push({ ratio: diffResult.ratio, diff: diffResult.diff, eqtIndex: diffResult.idx });
          if (this.priorityOrder) {
            totalDiff += Math.abs(diffResult.diff) * (ratioData.length - j);
          } else {
            totalDiff += Math.abs(diffResult.diff);
          }
        }
        var avgDiff = totalDiff / ratioData.length;

        //Only best results
        // if (totalDiff < currentMinDiff) {
        //   currentMinDiff = totalDiff;
        //   results.push({ value: i, diff: totalDiff });
        // }
        results.push({
          value: i,
          diff: totalDiff,
          ratios: resultRatios,
          avgDiff,
          minDiff,
          maxDiff
        });
      }

      return results;
    },
    calcLin(ratioData) {
      //var maxRatioData = Math.max(...ratioData);
      var results = [];
      //var currentMinDiff = 1;
      for (let i = 2; i <= this.maxDiv; i++) {
        var ratios = this.generateArrRatiosLinear(i);

        var minDiff = 999;
        var maxDiff = -999;
        var totalDiff = 0;
        var resultRatios = [];
        for (let j = 0; j < ratioData.length; j++) {
          const ratio = ratioData[j];

          var diffResult = this.diffFromRatio(ratios, ratio);
          minDiff = Math.min(minDiff, diffResult.diff);
          maxDiff = Math.max(maxDiff, diffResult.diff);

          resultRatios.push({ ratio: diffResult.ratio, diff: diffResult.diff, eqtIndex: i+diffResult.idx });
          if (this.priorityOrder) {
            totalDiff += Math.abs(diffResult.diff) * (ratioData.length - j);
          } else {
            totalDiff += Math.abs(diffResult.diff);
          }
        }
        var avgDiff = totalDiff / ratioData.length;

        //Only best results
        // if (totalDiff < currentMinDiff) {
        //   currentMinDiff = totalDiff;
        //   results.push({ value: i, diff: totalDiff });
        // }
        var indexList = resultRatios.map(rr => parseFloat(rr.eqtIndex)).sort((a, b) => (a < b ? -1 : 1));
        console.log("indexList",indexList)
        results.push({
          value: i,
          diff: totalDiff,
          ratios: resultRatios,
          avgDiff,
          minDiff,
          maxDiff,
          indexList
        });
      }

      return results;
    },
    calcSub(ratioData) {
      //var maxRatioData = Math.max(...ratioData);
      var results = [];
      //var currentMinDiff = 1;
      for (let i = 2; i <= this.maxDiv; i++) {
        var ratios = this.generateArrRatiosSubHarmonics(i);

        var minDiff = 999;
        var maxDiff = -999;
        var totalDiff = 0;
        var resultRatios = [];
        for (let j = 0; j < ratioData.length; j++) {
          const ratio = ratioData[j];

          var diffResult = this.diffFromRatio(ratios, ratio);
          minDiff = Math.min(minDiff, diffResult.diff);
          maxDiff = Math.max(maxDiff, diffResult.diff);

          resultRatios.push({ ratio: diffResult.ratio, diff: diffResult.diff, eqtIndex: i+diffResult.idx });
          if (this.priorityOrder) {
            totalDiff += Math.abs(diffResult.diff) * (ratioData.length - j);
          } else {
            totalDiff += Math.abs(diffResult.diff);
          }
        }
        var avgDiff = totalDiff / ratioData.length;

        //Only best results
        // if (totalDiff < currentMinDiff) {
        //   currentMinDiff = totalDiff;
        //   results.push({ value: i, diff: totalDiff });
        // }
        var indexList = resultRatios.map(rr => parseFloat(rr.eqtIndex)).sort((a, b) => (a < b ? -1 : 1));
        console.log("indexList",indexList)
        results.push({
          value: i,
          diff: totalDiff,
          ratios: resultRatios,
          avgDiff,
          minDiff,
          maxDiff,
          indexList
        });
      }

      return results;
    },
    parseTextData() {
      var result = [];
      var lines = this.textData.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        var v = undefined;
        if (line.indexOf("/") !== -1) {
          //Fração
          var parts = line.trim().split("/");
          v = parseFloat(parts[0]) / parseFloat(parts[1]);
        } else {
          v = parseFloat(line);
        }

        if (v !== undefined && !isNaN(v)) {
          result.push(v);
        }
      }

      return result;
    },
    generateArrRatios(interval, qtd) {
      var ratios = [];
      for (var i = 0; i < (qtd || 26); i++) {
        var r = Math.pow(interval, i);
        ratios.push(r);
      }
      return ratios;
    },
    generateArrRatiosLinear(num) {
      var ratios = [];
      for (var i = 0; i < num; i++) {
        var r = (num + i) / num;
        ratios.push(r);
      }
      return ratios;
    },
    generateArrRatiosSubHarmonics(num) {
      var ratios = [];
      for (var i = 0; i < num; i++) {
        var r = (num * 2) / ((num * 2) - i);
        ratios.push(r);
      }
      return ratios;
    },
    diffFromRatio(arr, ratio) {
      //var currentDiff = ratio;
      var currentDiff = 9999999999999;
      var currentIdx = 0;
      for (var i = 0; i < arr.length; i++) {
        var arrRatio = arr[i];
        //var diff = this.calcDiff(arrRatio, ratio);
        var diff = this.calcDiffCents(arrRatio, ratio);

        if (Math.abs(diff) < Math.abs(currentDiff)) {
          currentDiff = diff;
          currentIdx = i;
        }
      }

      var resultRatio = arr[currentIdx];
      return { idx: currentIdx, diff: currentDiff, ratio: resultRatio };
    },

    // calcDiff(ratioA, ratioB) {
    //   var diff = arrRatio > ratio ? arrRatio / ratio : ratio / arrRatio;
    //   return diff;
    // },

    calcDiffCents(ratioA, ratioB) {
      var centsA = this.ratioToCents(ratioA);
      var centsB = this.ratioToCents(ratioB);

      return centsA - centsB;
    },

    ratioToCents(ratio) {
      var cents = 1200 * Math.log2(parseFloat(ratio));
      return cents;
    },

    getIndexAnalysis(ratios, value){
      var indexes = ratios.map(r => r.eqtIndex);
      if(indexes.every(idx => idx % 2 == 0)){
        return `Even indexes (${(value/2).toFixed(2)})`
      }else if(indexes.every(idx => idx % 2 != 0)){
        return `Odd indexes (${(value/2).toFixed(2)})`
      }
      else if(indexes.every((idx, arrIndex) => arrIndex == 0 || idx - indexes[arrIndex-1] == 3)){
        return `Skip3 indexes (${(value/3).toFixed(2)})`
      }
    }
  },
};
</script>

<style>
label {
  font-weight: bold;
  display: block;
  margin-top: 12px;
}
</style>

