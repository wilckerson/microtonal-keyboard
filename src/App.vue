<template>
  <div id="app">
    <h1>🙌🎵</h1>
    <h1>Microtonal Keyboard</h1>

<keyboard/>
    <!-- <audio-key keyName="W" freq="220"/>
    <audio-key keyName="E" freq="440"/> -->
  </div>
</template>

<script>
import Keyboard from './Keyboard.vue';
import AudioKey from './AudioKey.vue';

export default {
  name: 'app',
  components: {
    Keyboard,AudioKey
  },
  data() {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
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
  margin-top: 20px;
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
