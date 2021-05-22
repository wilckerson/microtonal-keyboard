<template>
  <div
    class="key"
    :class="{ active: active }"
    @mousedown="mouseDown"
    @mouseup="mouseUp"
    @touchstart="mouseDown"
    @touchend="mouseUp"
    :style="{ 'background-color': color }"
  >
    <div class="key-label">{{ keyName }}</div>
    <div class="key-tone">
      <div v-if="text">{{text}}</div>
      <small>{{parseFloat(freq).toFixed(2) + "Hz" }}</small>
      </div>
  </div>
</template>

<script>
import Vue from "vue";

import Pizzicato from "pizzicato";
const AUDIO_CACHE_SIZE = 6;

export default {
  props: ["keyName", "freq", "text", "color", "idx"],
  data() {
    return {
      wave: false,
      active: false,
      vca: undefined,
      vco: undefined,
      keyMap: {
        "<": 188,
        ">": 190,
        ";": 191,
        "\\": 226,
      },
      sound: undefined,
      soundFreq: 1,
      pressed: false,
      clickTimer: 0,
      audioFile: undefined,
      audioCacheIdx: -1,
    };
  },
  mounted: function () {
    //return;
    //if ((!this.freq && this.freq != 0) || !this.keyName) {
    if (!this.freq && this.freq != 0) {
      return;
    }

    this.soundFreq = 130.81; //C3
    //this.soundFreq = 196;
    //this.soundFreq = 220;
    //this.soundFreq = 174.61;
    //this.soundFreq = 622.25;

    // if (!window["audioCache"]) {
      //   window["audioCache"] = {};
    // }

    // if (!window.audioCache[this.freq]) {
      //   if (!this.wave) {
        this.audioFile = "./audio-samples/guitar-note_G.wav";
        //this.audioFile = './audio-samples/sine.wav';
        //this.audioFile = './audio-samples/Alesis-Fusion-Clean-Guitar-C3.wav';
        //this.audioFile = './audio-samples/violaoMicrotonal2.wav';
        //this.audioFile = './audio-samples/tampaPanela2.wav'; //132hz
        //this.audioFile = './audio-samples/piano-a_A_major.wav';
        //this.audioFile = './audio-samples/clarinete_F.mp3';
        //this.audioFile = './audio-samples/HangDrum_C03.wav'; ///Hang!!!
        //this.audioFile = './audio-samples/163[kb]shamisen-pluck.wav.mp3'; //Muito bom
        //this.audioFile = './audio-samples/869[kb]tinshaw.aif.mp3'; // Legal
        //this.audioFile = './audio-samples/Alesis-S4-Plus-SterMarimb-C4.wav'; //Marimba1
        //this.audioFile = './audio-samples/Ensoniq-ESQ-1-Marimba-C3.wav'; //Marimba1
        //this.audioFile = './audio-samples/F2_MelloKalimbaTape_SP_01_376.mp3'; //Kalimba


    //     ///Howler
    //     window.audioCache[this.freq] = new Howl({
    //       src: [this.audioFile]
    //     });
    //   } else {
    //     ///Pizzicato
    //     //From wave
    //     var sound = new Pizzicato.Sound({
    //       source: "wave",
    //       options: {
    //         type: "sine", //sine, square, triangle or sawtooth
    //         frequency: this.freq
    //       }
    //     });
    //     sound.volume = 1 / 6;
    //     sound.atack = 0.1;
    //     sound.release = 0.3;

    //     // var reverb = new Pizzicato.Effects.Reverb({
    //     //     time: 0.5,
    //     //     decay: 0.01,
    //     //     reverse: false,
    //     //     mix: 0.5
    //     // });
    //     // sound.addEffect(reverb);
    //     window.audioCache[this.freq] = sound;
    //   }
    // }

    // this.sound = window.audioCache[this.freq];

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

this.initAudioCache();

    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
  },
  beforeDestroy: function () {
    window.removeEventListener("keydown", this.keyDown);

    window.removeEventListener("keyup", this.keyUp);
  },
  methods: {
    // stopSoundNote() {
    //   if (!this.sound) {
    //     return;
    //   }

    //   if (!this.wave) {
    //     //Howler
    //     this.sound.fade(1, 0, 500);
    //   } else {
    //     //Pizzicato
    //     this.sound.stop();
    //   }
    // },
    initAudioCache(){
       //Get sound from cache
      if (!window["audioCache"]) {
        window["audioCache"] = [];
        for (let index = 0; index < AUDIO_CACHE_SIZE; index++) {
          var audioCacheItem = {
            inUse: false,
            sound: new Howl({ src: [this.audioFile] }),
          };
          window["audioCache"].push(audioCacheItem);
        }
      }
    },
    stopSoundNote() {
      if (this.audioCacheIdx != -1) {
        var sound = window["audioCache"][this.audioCacheIdx].sound;
        sound.fade(1, 0, 500);

        window["audioCache"][this.audioCacheIdx].inUse = false;
      }
    },
    playSoundNote() {
      var rate = parseFloat(this.freq) / this.soundFreq;



      //Busca um cache disponivel
      this.audioCacheIdx = window["audioCache"].findIndex(
        (i) => i.inUse == false
      );

      if (this.audioCacheIdx != -1) {
        window["audioCache"][this.audioCacheIdx].inUse = true;

        var sound = window["audioCache"][this.audioCacheIdx].sound;
        //Howler
        sound.volume(1);
        sound.rate(rate);
        sound.play();
      }

      // if (!this.wave) {
      //   //Howler
      //   this.sound.volume(1);
      //   this.sound.rate(rate);
      //   this.sound.play();
      // } else {
      //   //Pizzicato
      //   if (!this.sound.sourceNode.playbackRate) {
      //     this.sound.frequency = this.freq;
      //   }
      //   this.sound.play();
      // }

      // if(this.sound.sourceNode.playbackRate){
      //   this.sound.sourceNode.playbackRate.value = rate;
      // }
    },
    // playSoundNote() {
    //   if (!this.sound) {
    //     return;
    //   }
    //   var rate = parseFloat(this.freq) / this.soundFreq;

    //   if (!this.wave) {
    //     //Howler
    //     this.sound.volume(1);
    //     this.sound.rate(rate);
    //     this.sound.play();
    //   } else {
    //     //Pizzicato
    //     if (!this.sound.sourceNode.playbackRate) {
    //       this.sound.frequency = this.freq;
    //     }
    //     this.sound.play();
    //   }

    //   // if(this.sound.sourceNode.playbackRate){
    //   //   this.sound.sourceNode.playbackRate.value = rate;
    //   // }
    // },
    start() {
      return;

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
    keyUp: function (e) {
      if (this.isIgnoredKey(e.key)) {
        return;
      }

      //console.log("keyUp",e)
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
    keyDown: function (e) {
      if (this.isIgnoredKey(e.key)) {
        return;
      }

      //console.log("keyDown",e)
      var keyName = String.fromCharCode(e.keyCode);
      if (
        !this.active &&
        (keyName == this.keyName || this.keyMap[this.keyName] == e.keyCode)
      ) {
        this.active = true;

        this.playSoundNote();
      }
    },
    isIgnoredKey(key) {
      var ignoreList = ["Control", "Alt", "AltGraph", "Shift", "Tab", " "];
      var ignore = ignoreList.indexOf(key) != -1;
      return ignore;
    },
    mouseDown: function () {
      clearTimeout(this.clickTimer);
      this.clickTimer = setTimeout(() => {
        this.active = true;
        this.playSoundNote();
      }, 50);
    },
    mouseUp: function () {
      this.active = false;
      this.stopSoundNote();
    },
    onTap() {
      //this.mouseDown();
      //setTimeout(this.mouseUp,400);
    },
    onTouchStart() {
      //console.log("onTouchStart");
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
    },
  },
  watch: {
    active: function (val, oldVal) {
      this.$emit("onChangeActive", {
        freq: this.freq,
        keyName: this.keyName,
        idx: this.idx,
      });

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
    freq: function (val) {
      //console.log("freq", val);
      if (this.vco) {
        this.vco.frequency.value = val;
      }
    },
  },
};
</script>

<style>
.key {
  /* width: 40px;
  height: 40px; */

  /* text-shadow: 1px 1px 1px #777;
    color: white; */

  /* text-shadow: 1px 1px 1px white; */
  color: black;

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
