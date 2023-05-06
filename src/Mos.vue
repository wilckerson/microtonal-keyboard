<template>
  <div>
    <h1>MOS Explorer</h1>
    <div>{{msg}}</div>
  </div>
</template>

<script>
import * as mosLib from 'moment-of-symmetry';
export default {
  data(){
    return {
      msg: "msg"
    }
  },
  mounted(){
    mosLib.mos(2,3);
    this.msg = "mounted";
  }
}
</script>

<style>

</style>
