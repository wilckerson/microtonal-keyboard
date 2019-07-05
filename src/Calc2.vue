<template>
  <div>
    <h2>Equal Temperament Calc</h2>

    <label>Base:</label>

    <input type="number" step="0.0001" v-model="base" />
    <button v-on:click="setBasePhi">φ</button>
    <button v-on:click="setBasePi">π</button>

    <label>Divisão máxima:</label>
    <input type="number" step="1" v-model="maxDiv" />

    <label>Valores procurados:</label>
    <textarea
      rows="10"
      cols="30"
      v-model="textData"
      placeholder="Um valor por linha em formato decimal (Ex: 1.333) ou fracionário(Ex: 4/3) "
    ></textarea>

<div>
    <input type="checkbox" v-model="priorityOrder"/> Ordem de prioridade
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,idx) in sortedResult" v-bind:key="idx">
            <td>{{idx+1}}</td>
            <td>{{item.value}}</td>
            <td>{{item.diff}}</td>
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
      maxDiv: 53,
      base: 2,
      textData: "",
      sortedResult: [],
      priorityOrder: false,
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
      var currentMinDiff = 1;
      for (let i = 1; i <= this.maxDiv; i++) {
        var interval = Math.pow(this.base, 1 / i);
        var ratios = this.generateArrRatios(interval, this.maxDiv);

        var totalDiff = 0;
        for (let j = 0; j < ratioData.length; j++) {
          const ratio = ratioData[j];

          var diffResult = this.diffFromRatio(ratios, ratio);
          if(this.priorityOrder){
             
              totalDiff += (diffResult.diff  * (ratioData.length-j));
          }
          else
          {
              totalDiff += diffResult.diff;
          }
         
        }

        //Only best results
        // if (totalDiff < currentMinDiff) {
        //   currentMinDiff = totalDiff;
        //   results.push({ value: i, diff: totalDiff });
        // }
        results.push({ value: i, diff: totalDiff });
      }

      var sortedResult = results.sort(function compare(a, b) {
        if (a.diff < b.diff) return -1;
        if (a.diff > b.diff) return 1;
        return 0;
      });
      //console.log("sorted");
      //console.log(sortedResult);

      this.sortedResult = sortedResult;
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
        var diff = arrRatio > ratio ? arrRatio/ratio : ratio/arrRatio;
        //var diff = Math.abs(arrRatio - ratio);
        if (diff < currentDiff) {
          currentDiff = diff;
          currentIdx = i;
        }
      }

      return { idx: currentIdx, diff: currentDiff, ratio: ratio };
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

