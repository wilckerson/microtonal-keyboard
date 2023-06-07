<template>
  <div id="app">
    <h3>🙌🎵 Microtonal Keyboard</h3>

    <!-- <Calc v-if="route == '#calc'"/> -->
    <Guitar v-if="route == '#guitar'" />
    <Phi v-else-if="route == '#phi'" />
    <Calc3 v-else-if="route == '#calc3'" />
    <Calc2 v-else-if="route == '#calc2'" />
    <!-- <KeyGrid v-if="route == '#grid'"/> -->
    <lambdoma-keyboard v-else-if="route == '#lambdoma'" />
    <keyboard2 v-else-if="route == '#keyboard2'" />
    <keyboardMos v-else-if="route == '#keyboardmos'" />
    <Mos v-else-if="route == '#mos'" />
    <TouchBoard v-else-if="route == '#touchboard'" />
    <keyboard v-else />

    <!-- <audio-key keyName="W" freq="220"/>
    <audio-key keyName="E" freq="440"/>  -->
  </div>
</template>

<script>
import Guitar from "./Guitar.vue";
import Phi from "./Phi.vue";
import Calc2 from "./Calc2.vue";
import Calc3 from "./Calc3.vue";
import Keyboard from "./Keyboard.vue";
import Keyboard2 from "./Keyboard2.vue";
import KeyboardMos from "./KeyboardMos.vue";
import LambdomaKeyboard from "./LambdomaKeyboard.vue";
import TouchBoard from "./TouchBoard.vue";
import Mos from "./Mos.vue";

export default {
  name: "app",
  components: {
    LambdomaKeyboard,
    Keyboard,
    Keyboard2,
    Calc2,
    Calc3,
    Phi,
    Guitar,
    KeyboardMos,
    TouchBoard,
    Mos,
  },
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      route: "",
    };
  },
  mounted() {
    this.route = window.location.hash.toLowerCase();
  },
  methods: {},
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 20px; */
}

h1,
h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
