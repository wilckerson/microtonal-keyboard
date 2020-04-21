<template>
  <div>
    <div>
      PHI |
      Size:
      <input type="number" v-model="size" min="1" @input="update" />
      Count:
      <input type="number" v-model="count" min="1" @input="update" />
      Distance:
      <input type="number" v-model="distance" min="0.1" @input="update" step="0.1" />
      Show Number:
      <input type="checkbox" v-model="showNumber" @change="update" />
      Normalize:
      <input type="checkbox" v-model="normalize" @change="update" />
      <input type="number" v-model="equivalence" step="0.0001" @input="update" />
    </div>
    <canvas id="canvas" width="800" height="600" @click="onClickCanvas"></canvas>
  </div>
</template>

<script>
var canvas = {};
var circles = [];
var soundBaseFreq = 440;

export default {
  data() {
    return {
      size: 16,
      count: 115,
      distance: 2.1,
      showNumber: true,
      equivalence: 2,
      normalize: true
    };
  },
  mounted() {
    this.draw();
    // window.addEventListener("resize",()=>{

    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;
    //     this.draw();
    // })

    ///Howler
    window.audioCache = {};
    window.audioCache["phi"] = new Howl({
      //src: ["./audio-samples/sine.wav"]
      //src: ["./audio-samples/Alesis-Fusion-Clean-Guitar-C3.wav"]
      //src: ['./audio-samples/guitar-note_G.wav']
      src: ["./audio-samples/violaoMicrotonal2.wav"] //132hz
      //src: ['./audio-samples/piano-a_A_major.wav']
      //src: ['./audio-samples/clarinete_F.mp3']
      //src: ["./audio-samples/HangDrum_C03.wav"] ///Hang!!!
      //src: ['./audio-samples/163[kb]shamisen-pluck.wav.mp3'] //Muito bom
      // src: ['./audio-samples/869[kb]tinshaw.aif.mp3'] // Legal
    });
    soundBaseFreq = 132;
  },
  methods: {
    update() {
      // console.log("update")
      this.draw();
    },
    draw() {
      canvas = document.getElementById("canvas");
      var context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.font = "16px Arial";
      context.textAlign = "center";

      var centerX = canvas.width / 2;
      var centerY = canvas.height / 2;
      var size = this.size;

      //Center
      //   context.beginPath();
      //   context.arc(centerX, centerY, size, 0, 2 * Math.PI, false);
      //   context.fillStyle = "red";
      //   context.fill();

      //Angle circles
      var radius = size * 2;
      var count = this.count;
      circles = [];

      for (let i = 0; i < count; i++) {
        var angle = (137.5 * i) % 360;
        var angleRad = angle * (Math.PI / 180);
        //var radius = (size*2) + ((i * 1.618033));
        radius += parseFloat(this.distance);
        var x = centerX + Math.cos(angleRad) * radius;
        var y = centerY - Math.sin(angleRad) * radius;

        var value = i + 1;

      if (value <= 0) {
        return;
      }

//Cents
// var cents = angle/360 * 1200;
// value = this.centsToRatio(cents);

//Linear ratio
value = angle/360


      //var freq = value * 132;

        var color = "#8edc9b";
        if (this.normalize) {
          value = this.normalizeValue(value);
        }

        if (value == 0) {
          color = "red";
        } else {
          color = this.color(this.normalizeValue(value));
        }

        //DrawCircle
        context.beginPath();
        context.arc(x, y, size, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = "#003300";
        context.stroke();

        if (this.showNumber) {
          context.fillStyle = "black";
          context.fillText(value.toFixed(2), x, y + 5);
        }

        circles.push({ x, y, size, value, angle });
      }
    },
    onClickCanvas(ev) {
      var canvasRect = canvas.getBoundingClientRect();

      var posX = ev.clientX - canvasRect.x;
      var posY = ev.clientY - canvasRect.y;

      for (let index = 0; index < circles.length; index++) {
        const circle = circles[index];

        if (
          Math.sqrt((posX - circle.x) ** 2 + (posY - circle.y) ** 2) <
          circle.size
        ) {
          this.onClickCircle(circle);

          break;
        }
      }
      //console.log(circles);
      //console.log(posX, posY);
    },
    onClickCircle(circle) {

      
      var value = circle.value;
      if (value <= 0) {
        return;
      }

      var freq = value * 132;

      //console.log(`click on circle: ${idx} => ${freq}Hz`);
      this.playSoundNote(freq);
    },
    playSoundNote(freq) {
      var sound = window.audioCache["phi"];

      var rate = parseFloat(freq) / soundBaseFreq;

      //Howler
      sound.volume(1);
      sound.rate(rate);
      sound.play();
    },
    normalizeValue(v) {
      if (v == 0) {
        return 0;
      }

      if (this.equivalence == 1) {
        return v;
      }

      var equivalence = this.equivalence || 2;
      if (v >= equivalence) {
        while (v >= equivalence) {
          v = v / equivalence;
        }
      } else if (v > 0 && v < 1) {
        while (v < 1) {
          v = v * equivalence;
        }
      }
      return v;
    },
    color(normRatio) {
      if (normRatio) {
        var v = (normRatio - 1) / (this.equivalence - 1 || 1);
        var c = this.HSVtoRGB(v, 0.77, 1);
        return "rgb(" + c.r + "," + c.g + "," + c.b + ")";
      }
    },
     centsToRatio(cents) {
      var ratio = Math.pow(2, cents / 1200);
      return ratio;
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