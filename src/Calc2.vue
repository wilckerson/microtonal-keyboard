<template>
  <div>
    <h2>Microtonal Calc</h2>

    <select v-model="calcType">
      <option value="eqt">Equal Temperament</option>
      <option value="gen">Generator</option>
    </select>

    <div v-if="calcType == 'eqt'">
      <label>Base:</label>

      <input type="number" step="0.0001" v-model="base" />
      <button v-on:click="setBasePhi">φ</button>
      <button v-on:click="setBasePi">π</button>

      <label>Divisão máxima:</label>
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

    <label>Valores procurados:</label>
    <textarea
      rows="10"
      cols="30"
      v-model="textData"
      placeholder="Um valor por linha em formato decimal (Ex: 1.333) ou fracionário(Ex: 4/3) "
    ></textarea>

    <div>
      <input type="checkbox" v-model="priorityOrder" /> Ordem de prioridade
    </div>
    <br />
    <button v-on:click="calc">Calcular</button>

    <div v-if="sortedResult.length > 0">
      <h3>Result</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Idx</th>
            <th>Value</th>
            <th>TotalDiff</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,idx) in sortedResult" v-bind:key="idx">
            <td>{{idx+1}}</td>
            <td>{{item.value}}</td>
            <td>{{item.diff}}</td>
            <td>
              <span
                v-for="(ratio,idx) in item.ratios"
                :key="idx"
                style="padding-right: 10px;"
              >{{ratio}}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
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
      priorityOrder: false
    };
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
      }
      else  if (this.calcType == "gen") {
        results = this.calcGen(ratioData);
      }

      var sortedResult = results        
        .sort(function compare(a, b) {
        if (a.diff < b.diff) return -1;
        if (a.diff > b.diff) return 1;
        return 0;
      })
      .slice(0,100);
      //console.log("sorted");
      //console.log(sortedResult);

      this.sortedResult = sortedResult;
    },
    calcGen(ratioData){

var maxRatioData = Math.max(...ratioData);

      var gMin = parseFloat(this.genMin);
      var gMax = parseFloat(this.genMax);
      var gStep = parseFloat(this.genStep);

var results = [];
      //var currentMinDiff = 1;
      for (let i = gMin; i <= gMax; i+=gStep) {
        var interval = i;
        var qtd = Math.ceil(Math.log(maxRatioData) / Math.log(interval)) + 1;
        var ratios = this.generateArrRatios(interval, qtd);
        
        var totalDiff = 0;
        var resultRatios = [];
        for (let j = 0; j < ratioData.length; j++) {
          const ratio = ratioData[j];

          var diffResult = this.diffFromRatio(ratios, ratio);
          resultRatios.push(diffResult.ratio);
          if (this.priorityOrder) {
            totalDiff += diffResult.diff * (ratioData.length - j);
          } else {
            totalDiff += diffResult.diff;
          }
        }

        //Only best results
        // if (totalDiff < currentMinDiff) {
        //   currentMinDiff = totalDiff;
        //   results.push({ value: i, diff: totalDiff });
        // }
        results.push({ value: i, diff: totalDiff, ratios: resultRatios });
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
        for (let j = 0; j < ratioData.length; j++) {
          const ratio = ratioData[j];

          var diffResult = this.diffFromRatio(ratios, ratio);
          resultRatios.push(diffResult.ratio);
          if (this.priorityOrder) {
            totalDiff += diffResult.diff * (ratioData.length - j);
          } else {
            totalDiff += diffResult.diff;
          }
        }

        //Only best results
        // if (totalDiff < currentMinDiff) {
        //   currentMinDiff = totalDiff;
        //   results.push({ value: i, diff: totalDiff });
        // }
        results.push({ value: i, diff: totalDiff, ratios: resultRatios });
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
          var v = parseFloat(line);
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
    diffFromRatio(arr, ratio) {
      var currentDiff = ratio;
      var currentIdx = 0;
      for (var i = 0; i < arr.length; i++) {
        var arrRatio = arr[i];
        var diff = arrRatio > ratio ? arrRatio / ratio : ratio / arrRatio;
        //var diff = Math.abs(arrRatio - ratio);
        if (diff < currentDiff) {
          currentDiff = diff;
          currentIdx = i;
        }
      }

      var resultRatio = arr[currentIdx];
      return { idx: currentIdx, diff: currentDiff, ratio: resultRatio };
    }
  }
};
</script>

<style>
label {
  font-weight: bold;
  display: block;
  margin-top: 12px;
}
</style>

