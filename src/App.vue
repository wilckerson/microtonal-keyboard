<template>
  <div id="app">
    
    <h3>🙌🎵 Microtonal Keyboard</h3>

<!-- <Calc/> -->
<keyboard/>
<!-- <lambdoma-keyboard/> -->

    <!-- <audio-key keyName="W" freq="220"/>
    <audio-key keyName="E" freq="440"/> -->

  </div>
</template>

<script>
import Calc from './Calc.vue';
import Keyboard from './Keyboard.vue';
import LambdomaKeyboard from './LambdomaKeyboard.vue';
import AudioKey from './AudioKey.vue';



export default {
  name: 'app',
  components: {
    LambdomaKeyboard,Keyboard,AudioKey,Calc
  },
  data() {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods:{
    
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
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
