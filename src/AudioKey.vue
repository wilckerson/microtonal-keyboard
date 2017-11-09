<template>
    <div class="key" :class="{ 'active' : active}" @mousedown="mouseDown" @mouseup="mouseUp">
        <div class="key-label">{{keyName}}</div>
        <div class="key-tone">{{freq.toFixed(2)}}Hz</div>
    </div>
</template>

<script>
export default {
    props: ['keyName', 'freq'],
    data() {
        return {
            active: false,
            vca: undefined,
            vco: undefined,
        }
    },
    mounted: function() {

        if (!this.freq || !this.keyName) {
            return;
        }

        if (!window.audioCtx) {
            window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        var audioCtx = window.audioCtx;

        /* VCO */
        var vco = audioCtx.createOscillator();
        //vco.type = vco.SINE;
        vco.frequency.value = this.freq;
        vco.start(0);
        this.vco = vco;

        /* VCA */
        var vca = audioCtx.createGain();
        vca.gain.value = 0;

        /* Connections */
        vco.connect(vca);
        vca.connect(audioCtx.destination);
        this.vca = vca;


        window.addEventListener('keydown', (e) => {
            var keyName = String.fromCharCode(e.keyCode);
            if (keyName == this.keyName) {
                this.active = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            var keyName = String.fromCharCode(e.keyCode);
            if (keyName == this.keyName) {
                this.active = false;
            }
        });

    },
    methods: {
        mouseDown: function() {
            this.active = true;
        },
        mouseUp: function() {
            this.active = false;
        }
    },
    watch: {
        active: function(val, oldVal) {
            if (val != oldVal && this.vca) {
                if (val) {

                    this.vca.gain.value = 1;
                }
                else {
                    this.vca.gain.value = 0;
                }
            }
        },
        freq: function(val) {
            console.log('freq',val);
            if (this.vco) {
                this.vco.frequency.value = val;
            }
        }
    }
}
</script>

<style>
.key {
    width: 100px;
    border: 2px solid #ccc;
    min-height: 50px;
    text-align: center;
    user-select: none;
}

.key.active {
    background: #ddd;
}

.key-label {
    position: absolute;
    margin: 3px;
    font-size: 12px;
    text-transform: uppercase;
}

.key-tone {
    padding: 25px;
    font-size: 14px;
}
</style>
