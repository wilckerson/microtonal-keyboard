<template>
  <div id="app">
    
    <h3>🙌🎵 Microtonal Keyboard</h3>

<!-- <Calc v-if="route == '#calc'"/> -->
<Calc2 v-if="route == '#calc2'"/>
<!-- <KeyGrid v-if="route == '#grid'"/> -->
<lambdoma-keyboard v-else-if="route == '#lambdoma'"/>
<keyboard2 v-else-if="route == '#keyboard2'"/>
  <keyboard v-else/>

    <!-- <audio-key keyName="W" freq="220"/> 
    <audio-key keyName="E" freq="440"/>  -->

  </div>
</template>

<script>
import KeyGrid from './KeyGrid.vue';
import Calc from './Calc.vue';
import Calc2 from './Calc2.vue';
import Keyboard from './Keyboard.vue';
import Keyboard2 from './Keyboard2.vue';
import LambdomaKeyboard from './LambdomaKeyboard.vue';
import AudioKey from './AudioKey.vue';

import {Howl, Howler} from 'howler';

export default {
  name: 'app',
  components: {
    LambdomaKeyboard,Keyboard,Keyboard2,AudioKey,Calc,Calc2,KeyGrid
  },
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
      route: ''
    }
  },
  mounted(){

     this.route = window.location.hash;
     
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
