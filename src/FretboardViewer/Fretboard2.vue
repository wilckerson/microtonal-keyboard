<template>
  <div class="fretboard-wraper">
    <div class="fretboard">
      <div class="string-row">
        <audio-key
          keyName="A"
          idx="a"
          :freq="320"
          text="some text"
          hideFreq
          style="width: 30%"
        />
        <audio-key
          keyName="S"
          idx="s"
          :freq="330"
          text="some text"
          :markers="['red', '#bb8845']"
          style="width: 50%"
          hideFreq
        />
        <audio-key
          keyName="D"
          idx="d"
          :freq="340"
          text="some text"
          :markers="['blue']"
          style="width: 20%"
          hideFreq
        />
      </div>
      <div class="string-row">
        <audio-key
          keyName="Z"
          idx="z"
          :freq="220"
          text="some text"
          hideFreq
          style="width: 50%"
          
        />
        <audio-key
          keyName="X"
          idx="x"
          :freq="230"
          text="some text"
          :markers="['red', '#bb8845']"
          style="width: 25%"
          hideFreq
        />
        <audio-key
          keyName="C"
          idx="c"
          :freq="240"
          text="some text"
          :markers="['blue']"
          style="width: 25%"
          hideFreq
        />
      </div>
    </div>
  </div>
</template>

<script>
import AudioKey from "../AudioKey.vue";
export default {
  components: { AudioKey },
  data() {
    return {};
  }
};
</script>

<style>
.fretboard-wraper {
  overflow-x: auto;
}
.fretboard {
  border: 1px solid darkgray;
  width: 900px;
}

.key-marker-container{
    top: auto;
    bottom: 0;
    right: 0;
}

.key {
  padding-right: 8px;
  text-align: right;
  vertical-align: top;
  display: inline-block;
  border: 0;
  border-right: 4px solid gray;
  box-sizing: border-box;
}
</style>
