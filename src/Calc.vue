<template>
  <div>
    <div>Msg: {{msg}}</div>
    <div>Interval:
      <input v-model="interval">
    </div>
    <div>Total Diff: {{(data.totalDiff || 0).toFixed(12)}}</div>
    <div>12ET: {{calcValues( Math.pow(2, (1/12))).data.totalDiff}}</div>
    <table border="1'">
      <thead>
        <tr>
          <th>Idx</th>
          <th>Ratio</th>
          <th>Diff</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ratio,idx) in arrRatios" v-bind:key="ratio">
          <td>{{idx}}</td>
          <td>{{ratio}}</td>
          <td>
            <!-- <div v-if="idx == data.diffFrom2.idx">{{data.diffFrom2.diff.toFixed(8)}} (2)</div>
            <div v-if="idx == data.diffFrom1_875.idx">{{data.diffFrom1_875.diff.toFixed(8)}} (1.875)</div>
            <div v-if="idx == data.diffFrom1_666.idx">{{data.diffFrom1_666.diff.toFixed(8)}} (1.666)</div>
            <div v-if="idx == data.diffFrom1_5.idx">{{data.diffFrom1_5.diff.toFixed(8)}} (1.5)</div>
            <div v-if="idx == data.diffFrom1_333.idx">{{data.diffFrom1_333.diff.toFixed(8)}} (1.333)</div>
            <div v-if="idx == data.diffFrom1_25.idx">{{data.diffFrom1_25.diff.toFixed(8)}} (1.25)</div>
            <div v-if="idx == data.diffFrom1_2.idx">{{data.diffFrom1_2.diff.toFixed(8)}} (1.2)</div>
            <div v-if="idx == data.diffFrom1_125.idx">{{data.diffFrom1_125.diff.toFixed(8)}} (1.125)</div> -->
            
            <!-- <div v-if="idx == data.diff_8_4.idx">{{data.diff_8_4.diff.toFixed(8)}} ({{(8/4).toFixed(3)}})</div> -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: {},
      arrRatios: [],
      interval: Math.pow(2, 1 / 19), //1.0375399999986081 Quase 18TET
      msg: ""
    };
  },
  mounted() {
    this.updateValues();

    var currentMinDiff = 1;
    var currentInterval = 0;
    var increment = 1;
    var interval = 1.022;//1 + increment;

    var bestResults = [];
    //for (var i = 1.25; i > 1+increment; i -= increment) {
    for (var i = 1; i <= 1000; i+= increment) {
    //for (var i = 1; i <= 100000; i++) {


      //var result = this.calcValues(i);
      var result = this.calcValues( Math.pow(2, (1/i)) );

      if (result.data.totalDiff < currentMinDiff) {
        currentMinDiff = result.data.totalDiff;
        currentInterval = i;

        //if(i > 1.022){
          bestResults.push({ratio: i, totalDiff :result.data.totalDiff});
        //}
      }
    }

    var sorted = bestResults.sort(function compare(a,b) {
        if (a.totalDiff < b.totalDiff)
          return -1;
        if (a.totalDiff > b.totalDiff)
          return 1;
        return 0;
    });
    console.log("sorted");
    console.log(sorted);

  this.interval = Math.pow(2, 1/currentInterval);
    this.msg = currentInterval;
  },
  watch: {
    interval: function(val, oldVal) {
      this.updateValues();
    }
  },
  methods: {
    calcValues(interval) {
      var ratios = this.generateArrRatios(interval,80);

      // var diffFrom2 = this.diffFromRatio(ratios, 2);
      // var diffFrom1_875 = this.diffFromRatio(ratios, 15/8);
      // var diffFrom1_666 = this.diffFromRatio(ratios, 5 / 3);
      // var diffFrom1_5 = this.diffFromRatio(ratios, 1.5);
      // var diffFrom1_333 = this.diffFromRatio(ratios, 4 / 3);
      // var diffFrom1_25 = this.diffFromRatio(ratios, 1.25);
      // var diffFrom1_2 = this.diffFromRatio(ratios, 1.2);
      // var diffFrom1_2 = this.diffFromRatio(ratios, 1.2);
      // var diffFrom1_125 = this.diffFromRatio(ratios, 9/8);
    
      // var data = {
      //   diffFrom2,
      //   diffFrom1_875,
      //   diffFrom1_666,
      //   diffFrom1_5,
      //   diffFrom1_333,
      //   diffFrom1_25,
      //   diffFrom1_2,
      //   diffFrom1_125,
      //   totalDiff:
      //     diffFrom2.diff
      //     //+ diffFrom1_875.diff
      //     //+ diffFrom1_666.diff
      //     + diffFrom1_5.diff 
      //     + diffFrom1_333.diff
      //     + diffFrom1_25.diff 
      //     + diffFrom1_2.diff
      //     //+ diffFrom1_125.diff
      // };

      var diff_8_4 = this.diffFromRatio(ratios, 8/4);
      var diff_8_5 = this.diffFromRatio(ratios, 8/5);
      var diff_8_6 = this.diffFromRatio(ratios, 8/6);
      var diff_8_7 = this.diffFromRatio(ratios, 8/7);
    
      var data = {
        diff_8_4,
        diff_8_5,
        diff_8_6,
        diff_8_7,
        totalDiff:
          diff_8_4.diff +
          diff_8_5.diff +
          diff_8_6.diff +
          diff_8_7.diff
      };
      return { data, ratios };
    },
    updateValues() {
      var result = this.calcValues(this.interval);
      this.arrRatios = result.ratios;
      this.data = result.data;
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
        var diff = Math.abs(arrRatio - ratio);
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