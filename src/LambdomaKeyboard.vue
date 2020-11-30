<template>
  <div class="full">
    <!-- <h5>Lambdoma Keyboard</h5> -->
    Limit:
    <!-- <input type="number" v-model.number="limit" step="1" :max="maxLimit" /> -->
    <input id="inputLimit" type="number" :value="limit" @input="limit = Math.min(parseInt($event.target.value),maxLimit)"  step="1" />
    
    <!-- Z:
    <input id="inputLimit" type="number" :value="z" @input="z = Math.min(parseInt($event.target.value),maxLimit)"  step="1" /> -->

    MinRatio:
    <input id="inputLimit" type="number" v-model="minRatio" step="0.00025" min="1" />

    <span
      >Normalize: <input type="checkbox" v-model="normalize" />
      <input type="number" v-model="equivalence" min="0.1" step="0.01" />
    </span>
    <span>
      Chart:
      <input type="checkbox" v-model="showChart" />
    </span>

    <div>
      Lattice X:
      <input type="number" v-model="latticeX" min="1" step="0.0001" /> Lattice
      Y: <input type="number" v-model="latticeY" min="1" step="0.0001" />
      <!-- step="0.0001" -->
    </div>
    <div>
      Skip X: <input type="number" v-model="skipX" /> Skip Y:
      <input type="number" v-model="skipY" />
    </div>

    <table border="0">
      <tr>
        <td></td>
        <!-- <td v-for="j in limit"><small>{{j+skipX}}</small> </td> -->

        <!-- <td v-for="j in limit" v-bind:key="j"><small>{{j}}</small> </td> -->
      </tr>
      <tr v-for="i in limit" v-bind:key="'r' + i">
        <!-- <td v-if="i-1 >= currentRow && i-1 <= currentRow+2" style="background-color:#ff8080;"><small>{{i+skipY}}</small></td>
        <td v-else><small>{{i+skipY}}</small></td> -->

        <td v-for="j in limit" v-bind:key="i + '-' + j">
          <audio-key
            :keyName="getKeyName(i, j)"
            :text="getRatioText(i, j)"
            :freq="mainFreq * ratio(i, j)"
            :style="color(i, j)"
          />
          <!-- <div class="square" :style="color(i,j)">&nbsp;</div> -->
          <!-- <div :style="color(i,j)">{{ratio(i,j)}}</div> -->
          <!-- <div :style="color(i,j)">{{i}} - {{j}}</div> -->
        </td>
      </tr>
    </table>

    <p>Notes per octave: {{ resultList.length }}</p>
    <p>
      {{ resultList }}
    </p>
    <div v-if="showChart">
      <chartjs-line
        :width="500"
        :height="150"
        :labels="chartLabels()"
        :data="chartData"
        :bind="true"
        style="display: inline-block"
      ></chartjs-line>
      <chartjs-line
        :width="500"
        :height="150"
        :labels="chartLabels()"
        :data="ratioDiff"
        :bind="true"
        style="display: inline-block"
      ></chartjs-line>
    </div>
  </div>
</template>

<script>
import AudioKey from "./AudioKey.vue";
//import Vue from 'vue';

Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
};

export default {
  components: {
    AudioKey,
  },
  data() {
    return {
      model: 1,
      limit: 8, //(N*2)-1
      maxLimit: 300,
      skipX: 1,
      skipY: 1,
      mainFreq: 110*2,
      currentRow: 0,
      //resultList: [],
      normalize: false,
      equivalence: 2,
      latticeX: 3,
      latticeY: 5,
      shiftX: 0,
      shiftY: 0,
      ratioDiff: [],
      showChart: false,
      z:1,
      minRatio: 1.0125
    };
  },
  mounted: function () {
    var _this = this;
    window.addEventListener("keyup", this.onKeyUp);
  },
  beforeDestroy: function () {
    window.removeEventListener("keyup", this.onKeyUp);
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
        var sum = this.ratioDiff.reduce(function (a, b) {
          return a + b;
        });
        var avg = sum / this.ratioDiff.length;
        this.ratioAvg = avg;
      }

      return data;
    },

    resultList() {
      var limit = this.limit;
      var list = [];
      for (let i = 1; i <= limit; i++) {
        for (let j = 1; j <= limit; j++) {
          var r = this.ratio(i, j);
          var normR = this.normalizeValue(r);
          list.push(normR);
        }
      }
      list.push(2);
      list = list.sort((a, b) => a - b);
      var unique = [ list[0] ];
      for (let i = 1; i < list.length; i++) {
        const element = list[i];
        const ultimoLista = unique[unique.length-1];

        if((element / ultimoLista) >= this.minRatio){
          unique.push(element);
        }  
      }
      return unique;

      //var rList = list.unique().sort((a, b) => a - b);
      //return rList;
    },
  },
  methods: {
    onKeyUp(e) {
      e.preventDefault();
      //console.log(this,e);

      var keyName = String.fromCharCode(e.keyCode);
      //console.log(e.keyCode);
      //Arrows keyCode: left = 37; up = 38; right = 39; down = 40
      var r = this.currentRow;
      if (e.keyCode == 37) {
        r--;
      } else if (e.keyCode == 39) {
        r++;
      }

      if (r < 0 || this.limit - 4 <= 0) {
        r = 0;
      } else if (r > this.limit - 4) {
        r = this.limit - 4;
      }
      this.currentRow = r;
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
    color(i, j) {
      var ratio = this.ratio(i, j);

      if (ratio == 0) {
        return "background: white";
      }
      var normRatio = this.normalizeValue(ratio);
      // var r = normRatio * 255 / 2;
      // var g = normRatio * (255/3) / 2;
      // var b = normRatio * (255/2) / 2;
      // return "background:rgb("+r+","+g+","+b+");";

      // var c = this.perc2color((normRatio-1)*100);
      // return "background:" + c + ";";
      // var c = this.HSVtoRGB(normRatio-1,0.77,1);
      // return "background:rgb("+c.r+","+c.g+","+c.b+");";

      // if (normRatio) {
      var v = (normRatio - 1) / (this.equivalence - 1 || 1);
      var c = this.HSVtoRGB(v, 0.77, 1);
      return "background:rgb(" + c.r + "," + c.g + "," + c.b + ")";
      //}
    },
    perc2color(perc) {
      var r,
        g,
        b = 0;
      if (perc < 50) {
        r = 255;
        g = Math.round(5.1 * perc);
      } else {
        g = 255;
        r = Math.round(510 - 5.1 * perc);
      }
      b = 64;
      var h = r * 0x10000 + g * 0x100 + b * 0x1;
      return "#" + ("000000" + h.toString(16)).slice(-6);
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

    ratio(row, col) {
      //console.log(row, col);

      //Scale
      //var scale = [1,1.125,4/3,1.5,16/9];
      //var s = scale[(row-1) % scale.length];

      //Based on limit 
      //OxO (circular) OxU (linear) UxU (circular invertido)
      //OxOxO (circular) OxOxU (circular invertido) OxUxU (linear) UxUxU (circular)
      
      //var l = (this.limit - 1 + col) / this.limit; //O
      //var l = this.limit/ (this.limit - 1 + col); //U

      //var c = (this.limit - 1 + row) / this.limit; //O
      //var c = this.limit/ (this.limit - 1 + row); //U

      //var vz = (this.limit - 1 + this.z) / this.limit; //O
      //var divZ = this.limit - 1 + this.z;
      //var vz = this.limit/ (divZ == 0 ? 1 : divZ); //U

      //var r = l * c// * vz;
      //var r = s * l// * vz;


      //Scale vs Overtone
      // var scale = [1,1.125,1.25,4/3,1.5,5/3,15/8,2];
      // var idx = (j-1) % scale.length;
      // return (1/(i+this.skipY)) * scale[idx];

      //Scale vs Scale
      // var scale = [
      //     Math.pow(Math.pow(2,1/12),1),
      //     Math.pow(Math.pow(2,1/12),2),
      //     Math.pow(Math.pow(2,1/12),3),
      //     Math.pow(Math.pow(2,1/12),4),
      //     Math.pow(Math.pow(2,1/12),5),
      //     Math.pow(Math.pow(2,1/12),6),
      //     Math.pow(Math.pow(2,1/12),7),
      //     Math.pow(Math.pow(2,1/12),8),
      //     Math.pow(Math.pow(2,1/12),9),
      //     Math.pow(Math.pow(2,1/12),10),
      //     Math.pow(Math.pow(2,1/12),11),
      //     Math.pow(Math.pow(2,1/12),12),
      // ];
      //var scale = [1,1.25,1.5,1.875];
      //var scale = [1,1.125,1.25,4/3,1.5,5/3,15/8];
      //var scale = [1,1.125,1.25,4/3,16/9]
      //var idx = (j-1) % scale.length;
      //var oct = Math.pow(2, Math.ceil((j) / scale.length)-1);
      //var idx2 = (i-1) % scale.length;
      //var oct2 = Math.pow(2, Math.ceil((i) / scale.length)-1);

      //Default Lambdoma (UxO)
      //var r = (col+(this.skipX-1))/(row+(this.skipY-1));
      //return r;

      //Default Lambdoma (OxU)
      //var r = (row+this.skipY)/(col+this.skipX);

      //Default Lambdoma (UxU)
      //var r = 1/(row+this.skipY)/(col+this.skipX);

      //Default Lambdoma (OxO)
      //var r = (row+this.skipY)*(col+this.skipX);

      //Full Lambdoma (Quatro quadrantes)
      // var size = (this.limit+1)/2;
      // var rr = (row-size-1) < 0 ? 1/Math.abs(row-size-1) :  row-size+1
      // var cc = (col-size-1) < 0 ? 1/Math.abs(col-size-1) : col-size+1
      // var r = rr * cc;

      //Scale
      //var scale = [8/8,9/8,10/8,11/8,12/8,13/8,14/8,15/8,16/8];
      //var scale = [ 1, 128/125, 5/4, 32/25, 25/16, 8/5, 125/64];
      //var scale = [1,9,5,11,3,7];
      //var scale = [1, 1.2, 1.25, 1.3333333333333333, 1.5, 1.6, 1.6666666666666667];
      //var scale = [9/9, 10/9, 11/9, 12/9, 13/9, 14/9, 15/9, 16/9, 17/9 , 18/9];
      //var scale = [1, 1.25, 4/3, 5/3]
      //var scale = [1,3,5,7,11,13,17]; //64/45
      //var scale = [1, 9, 5, 3, 7];
      //17EDO
      //var scale = [ 1 ,1.0416160106505838 ,1.084963913643637 ,1.1301157834293298 ,1.177146693908918 ,1.2261348432599308 ,1.2771616839560882 ,1.3303120581981223 ,1.3856743389806956 ,1.4433405770299568 ,1.5034066538560553 ,1.5659724411750875 ,1.631141966965551 ,1.6990235884354035 ,1.7697301721873244 ,1.8433792818817316 ,1.9200933737095873]
      //Carlos Gamma
      //var scale = [1,1.0413797439924106,1.0844717711976988,1.1293469354568555,1.1760790225246738,1.2247448713915892,1.2754245006257912,1.3282012399433345,1.383161867222592,1.4403967511883276,1.5000000000000004,1.5620696159886165,1.6267076567965486,1.694020403185284,1.7641185337870113,1.8371173070873845,1.9131367509386874,1.9923018599150024];

      //var scale = [1,16/15,9/8,6/5,5/4,4/3,45/32,3/2,8/5,5/3,7/4,15/8,2]; //64/45
      //var scale = [1, 1.044985, 1.118055, 1.168305, 1.25, 1.337468, 1.39757, 1.49537, 1.56250, 1.67191, 1.78882, 1.86929,2];
      //var scale = [1, 1.041665, 10/9, 5/4, 4/3, 1.3888888, 3/2, 1.5625, 5/3, 15/8,2];
      //var scale = [2,3,5,8,13,21,34]; //Fibonacci
      //var scale = [1,17,9,5,11,3,13,7,15];
      //var scale = [1,17,9,19,5,11,3,13,7,15];
      //var scale = [1, 16/15, 9/8, 6/5, 5/4, 4/3, 1.41424142, 3/2, 8/5, 5/3, 16/9, 15/8, 2]
      //var scale = [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2]
      var scale = [1, 3/2, 4/3, 5/3, 5/4, 6/5, 7/6, 7/5, 7/4, 8/7, 8/5, 9/8, 9/7, 9/5] //Partials
      //var scale = [1, 7/6, 6/5, 5/4, 4/3, 7/5, 3/2, 5/3, 7/4, 2]
      //var scale = [1,17,9,19,5,21,11,23,3,25,13,27,7,29,15,31,2]//
      //var scale = [1, 1.0666666, 1.125, 1.171875, 1.25, 4/3, 1.40625, 1.5, 1.5625, 5/3, 1.757813, 15/8]
      //var scale = [12/12, 13/12, 14/12, 15/12, 16/12, 17/12, 18/12, 19/12, 20/12, 21/12, 22/12, 23/12, 24/12]
      //var scale = [1, 1.2, 1.25, 1.5, 1.6]
      //var scale = [1, 1.25, 1.5, 1.777777]
      //var scale = [1, 1.25, 1.5, 1.875, 2.25]
      //var scale = [ 1, 1.1428571428571428, 1.25, 1.3333333333333333, 1.5, 1.6, 1.75]
      //var scale = [ 1, 1.1428571428571428, 1.1666666666666667, 1.2, 1.25, 1.3333333333333333, 1.4, 1.4285714285714286, 1.5, 1.6, 1.6666666666666667, 1.7142857142857142, 1.75]
      //var scale = [1/12, 1/11, 1/10, 1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6, 7,8,9,10,11,12];
      //var scale = [1/12, 1/11, 1/10, 1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6, 7,8,9,10,11,12];
      //var scale = [1, 1.041666666666666667, 1.090909, 8/7, 1.2, 1.25, 1.3, 1.333333333];
      //              var scale = [1
      // ,1.0339462756035176
      // ,1.0690449008343852
      // ,1.1053349936706443
      // ,1.1428570000000005
      // ,1.1816527386974096
      // ,1.2217654482328832
      // ,1.263239834861452
      // ,1.306122122449001
      // ,1.350460103989506]
      // var scale = [
      //     1
      // ,1.0324810319760918
      // ,1.0660170813904155
      // ,1.1006424162981174
      // ,1.1363924178161395
      // ,1.1733036162766137
      // ,1.2114137285545585
      // ,1.2507616966080157
      // ,1.2913877272700114
      // ,1.3333333333330013
      // ]
      //20EDO
      //var scale=[
      //     1
      // ,1.0350983390164887
      // ,1.0714285714346938
      // ,1.109033934666861
      // ,1.1479591836865888
      // ,1.1882506442927123
      // ,1.2299562682426592
      // ,1.2731256903208954
      // ,1.3178102874103794
      // ,1.3640632396373253
      //31edo4
      //]
      //Harmonics 12-24
      //  var scale = [
      //      1
      //     ,1.0833333333333333
      //     ,1.1666666666666667
      //     ,1.25
      //     ,1.3333333333333333
      //     ,1.4166666666666667
      //     ,1.5
      //     ,1.5833333333333333
      //     ,1.6666666666666667
      //     ,1.75
      //     ,1.8333333333333333
      //     ,1.9166666666666667
      //  ]
      //  var scale = [1, Math.pow(1.0416666,1), Math.pow(1.0416666,2), Math.pow(1.0416666,3),Math.pow(1.0416666,4), Math.pow(1.0416666,5), Math.pow(1.0416666,6), Math.pow(1.0416666,7)]
      var s = scale[(col - 1) % scale.length];
      //var s = scale[Math.min(col-1,scale.length-1)];
      //var r = s * (j+this.skipX)/8;

      //Scale 2
      //var scale2 = [1, 1.2513882056240933, 1.5034066538560558, 1.7697301721873249, 2];
      //  var scale2 = [1, 1.118033, 1.49551788234820, 1.672425, 2];
      //var scale2 = [1, 1.25, 1.5, 1.75, 2];

      //var scale2 = [1/12, 1/11, 1/10, 1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6, 7,8,9,10,11,12];
      //var scale2 = [1, 3, 5, 7];
      //var scale2 = [1, 9, 5, 3, 25, 15];
      //var scale2 = [1, 10, 4, 5, 2, 7, 8]; //Normalize 3
      //var scale2 = [4, 5, 6, 7];
      // var scale2 = [
      //   8 / 8,
      //   9 / 8,
      //   10 / 8,
      //   11 / 8,
      //   12 / 8,
      //   13 / 8,
      //   14 / 8,
      //   15 / 8,
      //   16 / 8,
      // ];
      //var scale2 = [ 1, 5/4, 32/25, 25/16, 8/5];
      //var scale2 = [1,16/15,9/8,6/5,5/4,4/3,45/32,3/2,8/5,5/3,16/9,15/8,2];
      //var scale2 = [1,1/3,1/5,1/7,1/11,1/13,1/17];
      //var scale2 = [1,9/8,8/7,7/6,6/5,5/4,9/7,4/3,7/5,3/2,8/5,5/3,7/4,9/5];
      // var scale2 = [1,16/15,8/7,6/5,5/4,4/3,Math.sqrt(2),3/2,8/5,5/3,7/4,15/8,2]
      //var scale2 = [1,1/17,1/9,1/19,1/5,1/11,1/3,1/13,1/7,1/15];
      //var scale2 = [1, 1/7,1/3,1/11,1/5, 1/9];
      //var scale2 = [1,17,9,5,11,3,13,7,15];
      //var scale2 = [2,3,5,8,13,21,34]; //Fibonacci
      //var scale2 = [1, 1.25, 1.3333333333333333, 1.6666666666666667];
      //var scale2 = [1,  1.5];
      //var scale2 = [1, 16/15, 9/8, 6/5, 5/4, 4/3, 1.41424142, 3/2, 8/5, 5/3, 16/9, 15/8, 2]
      //var scale2 = [1, 7/6, 6/5, 5/4, 4/3, 7/5, 3/2, 5/3, 7/4, 2]
      //var scale2 = [1, 1.6, 4/3, 5/3, 2]
      //var scale2 = [1, 1.2, 1.25, 1.5, 1.875, 9/4, 2.8125]
      //var scale2 = [1, 4/3, 1.5]
      //var scale2 = [12/12, 13/12, 14/12, 15/12, 16/12, 17/12, 18/12, 19/12, 20/12, 21/12, 22/12, 23/12, 24/12]
      //var scale2 = [1,1.2513882056240933,1.3303120581981225, 1.664736819428643,2, 2*1.2513882056240933];
      //var scale2 = [1,1.249827834539069,1.3282012399433354, 1.6600228795504854, 1.9923018599150024, 1.9923018599150024*1.249827834539069]; //Carlos Gamma
      //var scale2 = [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2]
      //var scale2 = [1, 1.25, 1.5, 1.875, 2.25]
      //var scale2 = [1, 1.25, 1.5, 1.75, 2.25, 15/4]
      //var scale2 = [ 1, 1.1428571428571428, 1.25, 1.3333333333333333, 1.5, 1.6, 1.75]
      //var scale2 = [1, 3/2, 4/3, 5/3, 5/4, 6/5, 7/4, 7/5, 7/6, 8/5, 8/7, 9/5, 9/7, 9/8] //Partials
      //var scale2 = [1, 1.1428571428571428, 1.1666666666666667, 1.2, 1.25, 1.3333333333333333, 1.4, 1.4285714285714286, 1.5, 1.6, 1.6666666666666667, 1.7142857142857142, 1.75];
      var scale2 = [1, 3/2, 4/3, 5/3, 5/4, 6/5, 7/6, 7/5, 7/4, 8/7, 8/5, 9/8, 9/7, 9/5] //Partials

      var s2 = scale2[(row - 1) % scale2.length];
      //s = scale2[(col - 1) % scale2.length];
      //Aqui

      //Multiply
      var r = s * s2;

      //Tonality Diamond
      //var r = s / s2;

      //Lattice
      //var r = Math.pow(this.latticeX, col-1-this.shiftX) * Math.pow(this.latticeY, row-1-this.shiftY);
      //var r = Math.pow(3, col-1) * Math.pow(5, row-1);
      //var r = Math.pow(1.5, col-1) * Math.pow(1.25, row-1);
      //var r = Math.pow(4/3, col-1) * Math.pow(7/6, row-1); //JI
      //var r = Math.pow(1.33483985417, col-1) * Math.pow(1.18920711500272106, row-1); //12EDO
      //var r = Math.pow(1.32784882798910, col-1) * Math.pow(1.17061991471191, row-1); //22EDO

      //var r = Math.pow(1.5,i-1) * (j+this.skipX)/4;
      if (this.normalize) {
        r = this.normalizeValue(r);
      }

      //Result List
      //   var elmContains = false; // this.resultList.indexOf(r) != -1;
      //   for (let index = 0; index < this.resultList.length; index++) {
      //     const element = this.resultList[index];

      //     if (Math.abs(r - element) < 0.001) {
      //       elmContains = true;
      //       break;
      //     }
      //   }
      //   if (elmContains == false && r >= 1 && r < this.equivalence) {
      //     //  && r < 2){

      //     this.resultList.push(r);
      //     this.resultList.sort(function (a, b) {
      //       return a - b;
      //     });
      //   }

      return r;
      //return r;
    },
    // lambdoma(i,j,limit){
    //     return 1/(i+1+this.skipY)*(j+1+this.skipX);
    // },

    getKeyName(i, j) {
      var keys = [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["Z", "X", "C", "V", "B", "N", "M", "¼", "¾"],
      ];

      i -= this.currentRow;
      if (i > 0 && i <= 4 && j <= 9) {
        return keys[i - 1][j - 1];
      } else {
        return "";
      }
    },
    normalizeValue(v) {
      var equivalence = this.equivalence || 1; //3

      if (equivalence == 1) {
        return v;
      }
      if (v >= equivalence) {
        while (v > equivalence) {
          v = v / equivalence;
        }
      } else if (v > 0 && v < 1) {
        while (v < 1) {
          v = v * equivalence;
        }
      }
      return v;
    },
    getRatioText(i, j) {
      var ratio = this.ratio(i, j).toFixed(5);
      var normalized = this.normalizeValue(ratio);
      var fraction = ""; // (j+this.skipX) + "/" + (i+this.skipY);

      return fraction + " " + normalized;
    },
  },
};
</script>

<style>
.full table {
  width: 100%;
  max-width: 1200px;
}

table,
tr,
td {
  margin: 0;
  padding: 0;
}

.full table td {
  width: 130px;
}

.square{
  width:24px;
  height:24px;
}
</style>
