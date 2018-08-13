<template>
    <div class="key" :class="{ 'active' : active}" @mousedown="mouseDown" @mouseup="mouseUp">
        <div class="key-label">{{keyName}}</div>
        <div class="key-tone">{{freq.toFixed(2)}}Hz</div>
    </div>
</template>

<script>
export default {
  props: ["keyName", "freq"],
  data() {
    return {
      active: false,
      vca: undefined,
      vco: undefined,
      keyMap:{
        "<":188,
        ">":190,
        ";":191,
        "\\":226,
      }
    };
  },
  mounted: function() {
    if ((!this.freq && this.freq != 0) || !this.keyName) {
      return;
    }

    if (!window.audioCtx) {
      window.audioCtx = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    var audioCtx = window.audioCtx;

    /* VCO */
    var vco = audioCtx.createOscillator();
    vco.type = "sine";
    //vco.type = "sawtooth";
    //vco.frequency.value = this.freq;
    vco.frequency.setValueAtTime(this.freq, audioCtx.currentTime);
    vco.start(0);
    this.vco = vco;

    /* VCA */
    var vca = audioCtx.createGain();
    vca.gain.setValueAtTime(0, audioCtx.currentTime);

var distortion = audioCtx.createWaveShaper();
function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};
distortion.curve = makeDistortionCurve(2);

    /* Connections */
    //vco.connect(vca);
     vco.connect(distortion);
    distortion.connect(vca)
    vca.connect(audioCtx.destination);

   

    this.vca = vca;

    window.addEventListener("keydown", this.keyDown);

    window.addEventListener("keyup", this.keyUp);
  },
  beforeDestroy: function() {
    window.removeEventListener("keydown", this.keyDown);

    window.removeEventListener("keyup", this.keyUp);
  },
  methods: {
    keyUp: function(e) {
      var keyName = String.fromCharCode(e.keyCode);
      if (keyName == this.keyName || this.keyMap[this.keyName] == e.keyCode) {
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
    }
  },
  watch: {
    active: function(val, oldVal) {
      var m = 0.05;
      if (val != oldVal && this.vca) {
        if (val) {
          //this.vca.gain.setValueAtTime(1, audioCtx.currentTime);
          this.vca.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime+m);
        } else {
          //this.vca.gain.setValueAtTime(0, audioCtx.currentTime+0.2);
          this.vca.gain.linearRampToValueAtTime(0, audioCtx.currentTime+m);
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
  width: 100px;
  border: 2px solid #ccc;
  min-height: 50px;
  text-align: center;
  user-select: none;
}

.key.active {
  background: #ddd;
}

.key-label {
  position: absolute;
  margin: 3px;
  font-size: 12px;
  text-transform: uppercase;
}

.key-tone {
  padding: 25px;
  font-size: 14px;
}
</style>
