<template>
  <div>
     Base: <input type="number" step="0.0001" v-model="base">
     
     <!-- <div v-for="(a,idx) in 10" :key="idx">
      <div>b: {{base}}</div>
     </div> -->

      <table>
          <tr>
              <td><audio-key keyName="1" :text="1" :freq="mainFreq * 1" :style="color(1)" /></td>
              <td><audio-key keyName="2" :text="1.2" :freq="mainFreq * 1.2" :style="color(1.2)" /></td>
              <td><audio-key keyName="3" :text="1.5" :freq="mainFreq * 1.5" :style="color(1.5)" /></td>
              <td><audio-key keyName="4" :text="1.8" :freq="mainFreq * 1.8" :style="color(1.8)" /></td>
              <td><audio-key keyName="5" :text="1.125" :freq="mainFreq * 1.125" :style="color(1.125)" /></td>
              <td><audio-key keyName="6" :text="1.35" :freq="mainFreq * 1.35" :style="color(1.35)" /></td>
              <td><audio-key keyName="7" :text="1.6875" :freq="mainFreq * 1.6875" :style="color(1.6875)" /></td>
              <td><audio-key keyName="8" :text="1.0125" :freq="mainFreq * 1.0125" :style="color(1.0125)" /></td>
          </tr>
          <tr>
              <td><audio-key keyName="Q" :text="1.666" :freq="mainFreq * 1.666" :style="color(1.666)" /></td>
              <td><audio-key keyName="W" :text="1" :freq="mainFreq * 1" :style="color(1)" /></td>
              <td><audio-key keyName="E" :text="1.25" :freq="mainFreq * 1.25" :style="color(1.25)" /></td>
              <td><audio-key keyName="R" :text="1.5" :freq="mainFreq * 1.5" :style="color(1.5)" /></td>
              <td><audio-key keyName="T" :text="1.875" :freq="mainFreq * 1.875" :style="color(1.875)" /></td>
              <td><audio-key keyName="Y" :text="1.125" :freq="mainFreq * 1.125" :style="color(1.125)" /></td>
              <td><audio-key keyName="U" :text="1.40625" :freq="mainFreq * 1.40625" :style="color(1.40625)" /></td>
              <td><audio-key keyName="I" :text="1.6875" :freq="mainFreq * 1.6875" :style="color(1.6875)" /></td>
          </tr>
          <tr>
              <td><audio-key keyName="A" :text="1.333" :freq="mainFreq * 1.333" :style="color(1.333)" /></td>
              <td><audio-key keyName="S" :text="1.6" :freq="mainFreq * 1.6" :style="color(1.6)" /></td>
              <td><audio-key keyName="D" :text="1" :freq="mainFreq * 1" :style="color(1)" /></td>
              <td><audio-key keyName="F" :text="1.2" :freq="mainFreq * 1.2" :style="color(1.2)" /></td>
              <td><audio-key keyName="G" :text="1.5" :freq="mainFreq * 1.5" :style="color(1.5)" /></td>
          </tr>
          <tr>
              <td><audio-key keyName="Z" :text="1.111" :freq="mainFreq * 1.111" :style="color(1.111)" /></td>
              <td><audio-key keyName="X" :text="1.333" :freq="mainFreq * 1.333" :style="color(1.333)" /></td>
              <td><audio-key keyName="C" :text="1.666" :freq="mainFreq * 1.666" :style="color(1.666)" /></td>
              <td><audio-key keyName="V" :text="1" :freq="mainFreq * 1" :style="color(1)" /></td>
              <td><audio-key keyName="B" :text="1.25" :freq="mainFreq * 1.25" :style="color(1.25)" /></td>
          </tr>
          <tr>
              <td><audio-key              :text="1.777" :freq="mainFreq * 1.777" :style="color(1.777)" /></td>
              <td><audio-key              :text="1.066" :freq="mainFreq * 1.066" :style="color(1.066)" /></td>
              <td><audio-key              :text="1.333" :freq="mainFreq * 1.333" :style="color(1.333)" /></td>
              <td><audio-key              :text="1.6" :freq="mainFreq * 1.6" :style="color(1.6)" /></td>
              <td><audio-key              :text="1" :freq="mainFreq * 1" :style="color(1)" /></td>
          </tr>
      </table>
    <div>
      
      
    </div>
  </div>
</template>

<script>
import AudioKey from "./AudioKey.vue";

export default {
  components: {
    AudioKey
  },
  data() {
    return {
      mainFreq: 132,
      base: 2
    };
  },
  methods: {
    normalize(v) {
      if (v >= 2) {
        while (v >= 2) {
          v = v / 2;
        }
      } else if (v < 1) {
        while (v < 1) {
          v = v * 2;
        }
      }
      return v;
    },
    color(ratio) {
      var normRatio = this.normalize(ratio);

      var c = this.HSVtoRGB(normRatio - 1, 0.77, 1);
      return "background:rgb("+c.r+","+c.g+","+c.b+");";
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
    }
  }
};
</script>

<style scoped>
table td{
    width:130px;
}
</style>