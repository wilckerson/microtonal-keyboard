<template>
  <div
    class="key"
    :class="{ 'active' : active}"
    @mousedown="mouseDown"
    @mouseup="mouseUp"
    @touchstart="mouseDown"
    @touchend="mouseUp"
  >
    <div class="key-label">{{keyName}}</div>
    <div class="key-tone">{{ text || freq.toFixed(2) + 'Hz'}}</div>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  props: ["keyName", "freq", "text"],
  data() {
    return {
      active: false,
      vca: undefined,
      vco: undefined,
      keyMap: {
        "<": 188,
        ">": 190,
        ";": 191,
        "\\": 226
      }
    };
  },
  mounted: function() {
    //if ((!this.freq && this.freq != 0) || !this.keyName) {
    if (!this.freq && this.freq != 0) {
      return;
    }

    window.addEventListener("click", this.start);

    window.addEventListener("keydown", this.keyDown);

    window.addEventListener("keyup", this.keyUp);
  },
  beforeDestroy: function() {
    window.removeEventListener("keydown", this.keyDown);

    window.removeEventListener("keyup", this.keyUp);
  },
  methods: {
    start() {
      //Global audio context
      if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      var audioCtx = window.audioCtx;

      //Global Oscillator cache
      if (!window.gVcoSetup) {
        window.gVcoCount = 5;
        window.gVcoArr = [];
        for (var c = 0; c < window.gVcoCount; c++) {
          var vco = window.audioCtx.createOscillator();
          vco.type = "sine";
          vco.start(0);

          var vca = audioCtx.createGain();
          vca.gain.setValueAtTime(0, window.audioCtx.currentTime);

          var distortion = window.audioCtx.createWaveShaper();
          function makeDistortionCurve(amount) {
            var k = typeof amount === "number" ? amount : 50,
              n_samples = 44100,
              curve = new Float32Array(n_samples),
              deg = Math.PI / 180,
              i = 0,
              x;
            for (; i < n_samples; ++i) {
              x = (i * 2) / n_samples - 1;
              curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
            }
            return curve;
          }
          distortion.curve = makeDistortionCurve(0.7);

          vco.connect(distortion);
          distortion.connect(vca);
          vca.connect(audioCtx.destination);

          window.gVcoArr[c] = { vco: vco, vca: vca, busy: false };
        }
        window.gVcoSetup = true;
      }

      //Gloval VCO
      // if(!window["gVco"]){
      //   window["gVco"] = audioCtx.createOscillator();
      //   window["gVco"].start(0);
      // }
      /* VCO */
      //var vco = window["gVco"];//audioCtx.createOscillator();
      //vco.type = "sine";
      //vco.type = "sawtooth";
      //vco.frequency.value = this.freq;
      //vco.frequency.setValueAtTime(this.freq, audioCtx.currentTime);

      //this.vco = vco;

      /* VCA */
      // var vca = audioCtx.createGain();
      // vca.gain.setValueAtTime(0, audioCtx.currentTime);

      // var distortion = audioCtx.createWaveShaper();
      // function makeDistortionCurve(amount) {
      //   var k = typeof amount === 'number' ? amount : 50,
      //     n_samples = 44100,
      //     curve = new Float32Array(n_samples),
      //     deg = Math.PI / 180,
      //     i = 0,
      //     x;
      //   for ( ; i < n_samples; ++i ) {
      //     x = i * 2 / n_samples - 1;
      //     curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
      //   }
      //   return curve;
      // };
      // distortion.curve = makeDistortionCurve(0.7);

      /* Connections */
      //vco.connect(vca);
      // vco.connect(distortion);
      // distortion.connect(vca)
      // vca.connect(audioCtx.destination);
      //this.vca = vca;
    },
    keyUp: function(e) {
      var keyName = String.fromCharCode(e.keyCode);
      var stopArrowUpOrDown = e.keyCode == 38 || e.keyCode == 40;
      if (
        keyName == this.keyName ||
        this.keyMap[this.keyName] == e.keyCode ||
        stopArrowUpOrDown
      ) {
        this.active = false;
      }
    },
    keyDown: function(e) {
      //console.log(e.keyCode);
      var keyName = String.fromCharCode(e.keyCode);
      if (keyName == this.keyName || this.keyMap[this.keyName] == e.keyCode) {
        this.active = true;
      }
    },
    mouseDown: function() {
      this.active = true;
    },
    mouseUp: function() {
      this.active = false;
    },
    onTap() {
      //this.mouseDown();
      //setTimeout(this.mouseUp,400);
    },
    onTouchStart() {
      console.log("onTouchStart");
    },
    getAvailableOscillator() {
      var gVco = undefined;
      for (var c = 0; c < window.gVcoCount; c++) {
        gVco = window.gVcoArr[c];
        if (!gVco.busy) {
          break;
        }
      }
      return gVco;
    }
  },
  watch: {
    active: function(val, oldVal) {
      var m = 0.05;

      //Obter um oscillator disponivel
      var gVco = this.getAvailableOscillator();

      if (val != oldVal && gVco) {
        gVco.vco.frequency.setValueAtTime(
          this.freq,
          window.audioCtx.currentTime
        );
        if (val) {
          //this.vca.gain.setValueAtTime(0.25, audioCtx.currentTime);
          gVco.vca.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + m);
          gVco.busy = true;
          this.gVco = gVco;
        } else {
          //this.vca.gain.setValueAtTime(0, audioCtx.currentTime);
          this.gVco.vca.gain.linearRampToValueAtTime(
            0,
            audioCtx.currentTime + m
          );
          this.gVco.busy = false;
        }
      }
    },
    freq: function(val) {
      console.log("freq", val);
      if (this.vco) {
        this.vco.frequency.value = val;
      }
    }
  }
};
</script>

<style>
.key {
  /* width: 100px; */
  border: 2px solid #ccc;
  min-height: 57px;
  text-align: center;
  
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none;   /* Chrome/Safari/Opera */
    -khtml-user-select: none;    /* Konqueror */
    -moz-user-select: none;      /* Firefox */
    -ms-user-select: none;       /* Internet Explorer/Edge */
    user-select: none;  
}

.key.active {
  opacity: 0.8;
  background: #ccc;
}

.key-label {
  
  /* position: absolute; */
  margin: 3px;
  font-size: 10px;
  /* font-weight: bold; */
  text-transform: uppercase;

  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none;   /* Chrome/Safari/Opera */
    -khtml-user-select: none;    /* Konqueror */
    -moz-user-select: none;      /* Firefox */
    -ms-user-select: none;       /* Internet Explorer/Edge */
    user-select: none;  
}

.key-tone {
  /* padding: 25px; */
  /* padding:15px;
  font-size: 14px; */
      /* padding: 10px 0px; */
    font-size: 12px;

    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none;   /* Chrome/Safari/Opera */
    -khtml-user-select: none;    /* Konqueror */
    -moz-user-select: none;      /* Firefox */
    -ms-user-select: none;       /* Internet Explorer/Edge */
    user-select: none;  
}
</style>
