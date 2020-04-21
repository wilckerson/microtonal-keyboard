<template>
  <div>Touch Guitar</div>
</template>

<script>
export default {
  data() {
    return {};
  },
  created() {
    var context = new AudioContext(),
  oscillator = null;

document.body.addEventListener('mousedown', function () {
  oscillator = context.createOscillator();
  oscillator.connect(context.destination);
  oscillator.start(context.currentTime);
});

document.body.addEventListener('mouseup', function () {
  if (oscillator) {
      oscillator.stop(context.currentTime);
      oscillator.disconnect();
  }
});
  }
};
</script>

<style>
html,
body {
  background: #eee;
  height: 100%;
  user-select: none;
}
</style>