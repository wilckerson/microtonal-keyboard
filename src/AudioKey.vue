<template>
  <div
    class="key"
    :class="{ 'active' : active}"
    @mousedown="mouseDown"
    @mouseup="mouseUp"
    @touchstart="mouseDown"
    @touchend="mouseUp"
    :style="{'background-color':color}"
  >
    <div class="key-label">{{keyName}}</div>
    <div class="key-tone">{{ text || parseFloat(freq).toFixed(2) + 'Hz'}}</div>
  </div>
</template>

<script>
import Vue from "vue";

import Pizzicato from "pizzicato";

export default {
  props: ["keyName", "freq", "text", "color", "idx"],
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
      },
      sound: undefined,
      soundFreq: 1,
      pressed: false,
      clickTimer: 0
    };
  },
  mounted: function() {
    //if ((!this.freq && this.freq != 0) || !this.keyName) {
    if (!this.freq && this.freq != 0) {
      return;
    }

    this.soundFreq = 130.81; //C3
    //this.soundFreq = 196;
    //this.soundFreq = 220;
    //this.soundFreq = 174.61;
    //this.soundFreq = 622.25;

///Howler
    this.sound = new Howl({
      //src: ["./audio-samples/Alesis-Fusion-Clean-Guitar-C3.wav"]
      //src: ['./audio-samples/guitar-note_G.wav']
      //src: ['./audio-samples/piano-a_A_major.wav']
      //src: ['./audio-samples/clarinete_F.mp3']
      //src: ['./audio-samples/HangDrum_C03.wav'] ///Hang!!!
      //src: ['./audio-samples/163[kb]shamisen-pluck.wav.mp3'] //Muito bom
      //src: ['./audio-samples/869[kb]tinshaw.aif.mp3'] // Legal
      
    });

///Pizzicato
    //From wave
    // var sound = new Pizzicato.Sound({
    //         source: 'wave',
    //         options: {
    //           type: 'triangle', //sine, square, triangle or sawtooth
    //           frequency: this.freq }
    // });
    // sound.volume=1/6;
    //  sound.atack = 0.1;
    // sound.release=0.3;

    // var reverb = new Pizzicato.Effects.Reverb({
    //     time: 0.5,
    //     decay: 0.01,
    //     reverse: false,
    //     mix: 0.5
    // });
    // sound.addEffect(reverb);
    //  this.sound = sound;

    //From File
    //     var sound = new Pizzicato.Sound({
    //         source: 'file',
    //         options: {
    //           //path: './audio-samples/Alesis-Fusion-Clean-Guitar-C3.wav'
    //           path: './audio-samples/HangDrum_C03.wav'
    //         }
    //       } , () => {
    //         console.log('sound file loaded!');

    //         sound.atack = 0.07;

    //         sound.release=2; //HangDrum
    //         //sound.release=0.5;

    //         //sound.volume = 0.9;

    // //       var quadrafuzz = new Pizzicato.Effects.Quadrafuzz({
    // //     lowGain: 0.6,
    // //     midLowGain: 0.8,
    // //     midHighGain: 0.5,
    // //     highGain: 0.5,
    // //     mix: 1.0
    // // });
    // // sound.addEffect(quadrafuzz);

    // // var flanger = new Pizzicato.Effects.Flanger({
    // //     time: 0.45,
    // //     speed: 0.2,
    // //     depth: 0.1,
    // //     feedback: 0.1,
    // //     mix: 0.5
    // // });
    // // sound.addEffect(flanger);

    // // var reverb = new Pizzicato.Effects.Reverb({
    // //     time: 0.5,
    // //     decay: 0.01,
    // //     reverse: false,
    // //     mix: 0.5
    // // });
    // // sound.addEffect(reverb);

    //         this.sound = sound;
    //       });

    //window.addEventListener("click", this.playSoundNote);
    // window.addEventListener("click", this.start);

    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
  },
  beforeDestroy: function() {
    window.removeEventListener("keydown", this.keyDown);

    window.removeEventListener("keyup", this.keyUp);
  },
  methods: {
    stopSoundNote() {
      if (!this.sound) {
        return;
      }

      //Howler
      this.sound.fade(1, 0, 500);

      //Pizzicato
      // this.sound.stop();
    },
    playSoundNote() {
      if (!this.sound) {
        return;
      }
      var rate = parseFloat(this.freq) / this.soundFreq;

      //Howler
      this.sound.volume(1);
      this.sound.rate(rate);
      this.sound.play();

      //Pizzicato
      // if(!this.sound.sourceNode.playbackRate){
      //   this.sound.frequency = this.freq;
      // }
      // this.sound.play();

      // if(this.sound.sourceNode.playbackRate){
      //   this.sound.sourceNode.playbackRate.value = rate;
      // }
    },
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
        this.stopSoundNote();
      }
    },
    keyDown: function(e) {
      //console.log(e.keyCode);
      var keyName = String.fromCharCode(e.keyCode);
      if (
        !this.active &&
        (keyName == this.keyName || this.keyMap[this.keyName] == e.keyCode)
      ) {
        this.active = true;

        this.playSoundNote();
      }
    },
    mouseDown: function() {
      this.active = true;

      clearTimeout(this.clickTimer);
      this.clickTimer = setTimeout(() => {
        this.playSoundNote();
      }, 50);
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
      this.$emit("onChangeActive", {freq: this.freq, keyName: this.keyName, idx : this.idx } );

      // var m = 0.05;

      // //Obter um oscillator disponivel
      // var gVco = this.getAvailableOscillator();

      // if (val != oldVal && gVco) {
      //   console.log("currentTime", window.audioCtx.currentTime)
      //   gVco.vco.frequency.setValueAtTime(
      //     this.freq,
      //     0,//window.audioCtx.currentTime
      //   );
      //   if (val) {
      //     this.gVco.vca.gain.setValueAtTime(0.25, 0);// window.audioCtx.currentTime);
      //     //gVco.vca.gain.linearRampToValueAtTime(0.25, window.audioCtx.currentTime + m);
      //     gVco.busy = true;
      //     this.gVco = gVco;
      //   } else if(this.gVco) {
      //     this.gVco.vca.gain.setValueAtTime(0,0);// window.audioCtx.currentTime);
      //     //this.gVco.vca.gain.linearRampToValueAtTime(0, window.audioCtx.currentTime + m );
      //     this.gVco.busy = false;
      //   }
      // }
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
  -webkit-user-select: none; /* Chrome/Safari/Opera */
  -khtml-user-select: none; /* Konqueror */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
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
  -webkit-user-select: none; /* Chrome/Safari/Opera */
  -khtml-user-select: none; /* Konqueror */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none;
}

.key-tone {
  /* padding: 25px; */
  /* padding:15px;
  font-size: 14px; */
  /* padding: 10px 0px; */
  font-size: 12px;

  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Chrome/Safari/Opera */
  -khtml-user-select: none; /* Konqueror */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none;
}
</style>
