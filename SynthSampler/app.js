var DOMReady = function(a,b,c){b=document,c='addEventListener';b[c]?b[c]('DOMContentLoaded',a):window.attachEvent('onload',a)}
    
    DOMReady(function () {

var iOS = /iPad|iPhone|iPod/.test(navigator.platform);
var startBtn = document.querySelector('.start'),
    stopBtn = document.querySelector('.stop'),
    carrierFInput = document.querySelector('.carrier-f'),
    modulatorFInput = document.querySelector('.modulator-f'),
    modulatorGInput = document.querySelector('.modulator-g'),
    masterGInput = document.querySelector('.master-g'),
    carrierType = document.querySelector('.cw'),
    modulatorType = document.querySelector('.mw'),
    carrierTracking = document.querySelector('.carrier-tracking'),
    modulatorTracking = document.querySelector('.modulator-tracking'),
    CMTracking = document.querySelector('.cm-tracking')
    presetBtn = document.querySelectorAll('.preset'),
    allKeys = document.querySelectorAll('#kboard > g > path');

var presets = {
    a: {
        cf: 218,
        mf: 478,
        cw: 'sine',
        mw: 'sine',
        modg: 1,
        mg: 0.5
    },
    b: {
        cf: 505,
        mf: 7,
        cw: 'sine',
        mw: 'sawtooth',
        modg: 1.95,
        mg: 0.3
    },
    c: {
        cf: 79,
        mf: 41,
        cw: 'sine',
        mw: 'sawtooth',
        modg: 1.75,
        mg: 0.5
    },
    d: {
        cf: 218,
        mf: 2,
        cw: 'triangle',
        mw: 'square',
        modg: 1.5,
        mg: 0.8
    },
    e: {
        cf: 163,
        mf: 41,
        cw: 'sawtooth',
        mw: 'sawtooth',
        modg: 1.175,
        mg: 0.5
    },
    f: {
        cf: 83,
        mf: 41,
        cw: 'sawtooth',
        mw: 'square',
        modg: 1,
        mg: 0.75
    },
    g: {
        cf: 98,
        mf: 393,
        cw: 'square',
        mw: 'sawtooth',
        modg: 1,
        mg: 0.5
    },
    h: {
        cf: 100,
        mf: 151,
        cw: 'square',
        mw: 'square',
        modg: 0.85,
        mg: 0.75
    },
    i: {
        cf: 747,
        mf: 172,
        cw: 'sine',
        mw: 'square',
        modg: 0.925,
        mg: 0.5
    },
    j: {
        cf: 79,
        mf: 87,
        cw: 'square',
        mw: 'square',
        modg: 1.75,
        mg: 0.275
    },
    k: {
        cf: 71,
        mf: 214,
        cw: 'triangle',
        mw: 'sine',
        modg: 1,
        mg: 0.5
    },
    l: {
        cf: 1223,
        mf: 1257,
        cw: 'sawtooth',
        mw: 'sawtooth',
        modg: 1,
        mg: 0.5
    },
    m: {
        cf: 198,
        mf: 100,
        cw: 'sine',
        mw: 'triangle',
        modg: 1,
        mg: 0.5
    }
};

// setup audioNodes
var audioContext = new(window.AudioContext || window.webkitAudioContext)(),
    carrier = audioContext.createOscillator(),
    modulator = audioContext.createOscillator(),
    carrierGain = audioContext.createGain(),
    modulatorGain = audioContext.createGain(),
    master = audioContext.createGain(),
    currTime = audioContext.currentTime;

// keep track of active keys
var activeKeys = {};

// create our oscilloscope
var contentWidth = document.body.offsetWidth;
var analyser = audioContext.createAnalyser();
var oscilloscope = new Oscilloscope(audioContext, analyser, contentWidth, 150);

// connections
carrier.connect(carrierGain);
modulator.connect(modulatorGain);
modulatorGain.connect(carrierGain.gain);
carrierGain.connect(master);

// start oscillators
carrier.start(0);
modulator.start(0);

// init
presetter('a');

// buttons
startBtn.onclick = playSound;
stopBtn.onclick = stopSound;

// choose preset on button click
addEventListenerBySelector('.preset', 'click', function (e) {
    var t = e.target,
        p = t.dataset.preset;
    presetter(p);
    CMTracking.checked = true;
    deactivateKeys(allKeys);
});
// set carrier frequency
carrierFInput.oninput = function () {
    carrier.frequency.value = this.value;
    carrier.frequency.cancelScheduledValues(0);
    carrier.frequency.setValueAtTime(this.value, audioContext.currentTime);
}
// set modulator frequency
modulatorFInput.oninput = function () {
    modulator.frequency.value = this.value;
    modulator.frequency.cancelScheduledValues(0);
    modulator.frequency.setValueAtTime(this.value, audioContext.currentTime);
}
// set modulator gain
modulatorGInput.oninput = function () {
    modulatorGain.gain.value = this.value;
    modulatorGain.gain.cancelScheduledValues(0);
    modulatorGain.gain.setValueAtTime(this.value, audioContext.currentTime);
}
// set master gain
masterGInput.oninput = function () {
    changeMaster(this.value);
}
// set carrier type
carrierType.onchange = function () {
    changeCarrierType(this.value);
}
// set modulator type
modulatorType.onchange = function () {
    changeModulatorType(this.value);
}

function changeMaster(vol) {
    master.gain.value = vol;
    masterGInput.value = vol;
    master.gain.cancelScheduledValues(0);
    master.gain.setValueAtTime(vol, audioContext.currentTime);
}

function playSound() {
    // start with preset 'a' values
    presetter('a');
    master.connect(audioContext.destination);
    master.connect(oscilloscope.analyser);
    stopBtn.disabled = false;
    startBtn.disabled = true;
    audioContext.resume();
}

function stopSound() {
    master.gain.value = 0;
    master.disconnect(audioContext.destination);
    master.disconnect(oscilloscope.analyser);
    stopBtn.disabled = true;
    startBtn.disabled = false;
    audioContext.suspend();
    deactivateKeys(allKeys);
}

function changeCarrierType(type) {
    carrier.type = type;
}

function changeModulatorType(type) {
    modulator.type = type;
}

// EG functions
function envGenOn(audioParam) {
    var now = audioContext.currentTime,
        masterG = masterGInput.value;

    audioParam.cancelScheduledValues(0);
    audioParam.setValueAtTime(0, now);
    audioParam.linearRampToValueAtTime(masterG, now + 0.005);
}

function envGenOff(audioParam) {
    var now = audioContext.currentTime;
    audioParam.cancelScheduledValues(0);
    audioParam.setValueAtTime(audioParam.value, now);
    audioParam.linearRampToValueAtTime(0, now + 0.005);
}

// presets
function presetter(preset) {
    var p;

    if (typeof preset === 'object') {
        p = preset;
    } else if (preset === 'random') {
        p = randomPreset();
    } else {
        p = presets[preset];
    }

    master.gain.cancelScheduledValues(0);
    master.gain.setValueAtTime(p.mg, audioContext.currentTime);
    // change values
    carrier.type = p.cw;
    modulator.type = p.mw;

    carrier.frequency.value = p.cf;
    carrier.frequency.cancelScheduledValues(0);
    carrier.frequency.setValueAtTime(p.cf, audioContext.currentTime);

    modulator.frequency.value = p.mf;
    modulator.frequency.cancelScheduledValues(0);
    modulator.frequency.setValueAtTime(p.mf, audioContext.currentTime);

    modulatorGain.gain.value = p.modg;
    modulatorGain.gain.cancelScheduledValues(0);
    modulatorGain.gain.setValueAtTime(p.modg, audioContext.currentTime);

    master.gain.value = p.mg;
    master.gain.cancelScheduledValues(0);
    master.gain.setValueAtTime(p.mg, audioContext.currentTime);
    // display values
    carrierType.value = p.cw;
    modulatorType.value = p.mw;

    carrierFInput.value = p.cf;
    modulatorFInput.value = p.mf;
    modulatorGInput.value = p.modg;

    masterGInput.value = p.mg;

    // global reference
    window.currentPreset = p;
}

function randomPreset() {
    var type = ['sine', 'square', 'sawtooth', 'triangle'],
        typeIndex1 = Math.floor(Math.random() * 4),
        typeIndex2 = Math.floor(Math.random() * 4),
        car = Math.random() * 1500,
        mod = Math.random() * 1500;

    return {
        cf: car,
        mf: mod,
        cw: type[typeIndex1],
        mw: type[typeIndex2],
        modg: 1,
        mg: 0.5
    };
}

// set preset again on tracking change
addEventListenerBySelector('.tc', 'click', function (e) {
    presetter(window.currentPreset);
    deactivateKeys(allKeys);
});

// Everything below here is related to setting up Web MIDI

// MIDI
var midi, data, cmd, channel, type, note, velocity;
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
        sysex: false
    }).then(MIDISuccess, MIDIFailure);
}

function MIDISuccess(midi) {
    var inputs = midi.inputs,
        device = {};
    inputs.forEach(function (port) {
        port.onmidimessage = onMIDIMessage;
    });
}

function MIDIFailure() {
    console.log('Your browser does not support Web MIDI');
}

function onMIDIMessage(message) {
    console.log('MIDI Message', message.data);
    data = message.data,
    cmd = data[0] >> 4,
    channel = data[0] & 0xf,
    type = data[0] & 0xf0,
    note = data[1],
    velocity = data[2];

    if (velocity == 0) {
        noteOff();
    } else {
        switch (type) {
            case 144:
                noteOn(note, velocity);
                break;
            case 128:
                noteOff();
                break;
            case 176:
                pressure(note, velocity);
                break;
            case 224:
                bend(note, velocity);
                break;
        }
    }
}

function noteOn(note, velocity) {
    svgnote(note, velocity);
    activeKeys[note] = true;
    tracking(note);
    envGenOn(master.gain);
}

function noteOff() {
    svgnote(note, velocity);
    delete activeKeys[note];
    tracking(note);
    if (isEmptyObj(activeKeys)) {
        envGenOff(master.gain);
    }
}

function bend(note, velocity) {
    console.log('bend', note, velocity);
}

function pressure(note, velocity) {
    console.log('pressure', note, velocity);
}

// qwerty keyboard functions
var keyboard = document.getElementById('controller');
var k = document.getElementsByClassName('key');
if (!iOS){
	keyboard.addEventListener('mousedown', keynote);
	keyboard.addEventListener('mouseup', keynote);
} else {
    keyboard.addEventListener('touchstart', keynote);
}

function keynote(e) {
    if (e.target.classList[0] != 'key') return;

    var keyClasses = e.target.classList,
        midiNote = keyClasses[searchIndex(keyClasses, "key[0-9]+")].replace('key', '');

    if (!iOS){
    	switch (e.type) {
        	case 'mousedown':
            tracking(midiNote);
            envGenOn(master.gain);
            keyClasses.add('active');
                
            break;

        	case 'mouseup':
            tracking(midiNote);
            envGenOff(master.gain);
            keyClasses.remove('active');
                
            break;
    	}
    } else {
       	switch (e.type) {
        	case 'touchstart':
            tracking(midiNote);
            envGenOn(master.gain);
            deactivateKeys(allKeys);
            keyClasses.add('active');

            break;

    	}
    }
}

// utilities
function frequencyFromNote(note) {
    return 440 * Math.pow(2, (+note - 69) / 12);
}

function modValue(preset, note) {
		var note = +note;
    /*
		ratio = carfreq/modfreq
		scaling = 1/ratio
		modfreq = carfreq*scaling
	*/
    var ratio = preset.cf / preset.mf, scaling = 1 / ratio;
    return (frequencyFromNote(note) * scaling < 0) ? preset.mf : frequencyFromNote(note) * scaling;
}

function tracking(note) {
    var now = audioContext.currentTime,
        modVal, note = +note;

    if (carrierTracking.checked) {
        carrier.frequency.cancelScheduledValues(0);
        carrier.frequency.setValueAtTime(frequencyFromNote(note), now);
        carrierFInput.value = frequencyFromNote(note);

    } else if (modulatorTracking.checked) {
        modulator.frequency.cancelScheduledValues(0);
        modulator.frequency.setValueAtTime(frequencyFromNote(note), now);
        modulatorFInput.value = frequencyFromNote(note);

    } else if (CMTracking.checked) {
        modVal = modValue(window.currentPreset, note);

        carrier.frequency.cancelScheduledValues(0);
        carrier.frequency.setValueAtTime(frequencyFromNote(note), now);
        carrierFInput.value = frequencyFromNote(note);

        modulator.frequency.cancelScheduledValues(0);
        modulator.frequency.setValueAtTime(modVal, now);
        modulatorFInput.value = modVal;
    }
}

function addEventListenerBySelector(selector, event, fn) {
    var list = document.querySelectorAll(selector);
    for (var i = 0, len = list.length; i < len; i++) {
        list[i].addEventListener(event, fn, false);
    }
}

function isEmptyObj(obj) {
    return Object.keys(obj).length === 0;
}

// ios enable sound output
window.addEventListener('touchstart', function () {
    //create empty buffer
    var buffer = audioContext.createBuffer(1, 1, 22050);
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
}, false);
// svg
function svgnote(midiNote, velocity) {
    // ignore notes outside of our svg keyboard range
    if (midiNote >= 48 && midiNote <= 72) {
        var keyClass = "key" + midiNote,
            key = document.querySelector('.' + keyClass),
            keyClassList = key.classList;
        (velocity) ? keyClassList.add('active') : keyClassList.remove('active');
    }
}
// find items in list
function searchIndex(list, value) {
    value = new RegExp(value);
    for (var i in list) {
        if (list[i].match(value)) {
            return i;
        }
    }
    return 0;
}
// deactivateKeys
function deactivateKeys(elems){
    [].forEach.call(elems, function(el) {
        el.classList.remove("active");
    });
}

    });