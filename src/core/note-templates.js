const notes12edo = [
  '1\\12 "A#"',
  '2\\12 "B"',
  '3\\12 "C"',
  '4\\12 "C#"',
  '5\\12 "D"',
  '6\\12 "D#"',
  '7\\12 "E"',
  '8\\12 "F"',
  '9\\12 "F#"',
  '10\\12 "G"',
  '11\\12 "G#"',
  '12\\12 "A"'
];

const notes31edo = [
  '1\\31 "A‡"',
  '2\\31 "A#"',
  '3\\31 "Bb"',
  '4\\31 "Bd"',
  '5\\31 "B"',
  '6\\31 "B‡"',
  '7\\31 "Cd"',
  '8\\31 "C"',
  '9\\31 "C‡"',
  '10\\31 "C#"',
  '11\\31 "Db"',
  '12\\31 "Dd"',
  '13\\31 "D"',
  '14\\31 "D‡"',
  '15\\31 "D#"',
  '16\\31 "Eb"',
  '17\\31 "Ed"',
  '18\\31 "E"',
  '19\\31 "E‡"',
  '20\\31 "Fd"',
  '21\\31 "F"',
  '22\\31 "F‡"',
  '23\\31 "F#"',
  '24\\31 "Gb"',
  '25\\31 "Gd"',
  '26\\31 "G"',
  '27\\31 "G‡"',
  '28\\31 "G#"',
  '29\\31 "Ab"',
  '30\\31 "Ad"',
  '31\\31 "A"'
];

export default {
  "12edo - Guitar - Standard Tuning": {
    notes: notes12edo,
    baseFreq: 110,
    stringsTuningIdx: [19, 14, 10, 5, 0, -5]
  },
  "12edo - Guitar - DADGAD": {
    notes: notes12edo,
    baseFreq: 110,
    stringsTuningIdx: [17, 12, 10, 5, 0, -7]
  },
  "12edo - Bass - Standard Tuning": {
    notes: notes12edo,
    baseFreq: 55,
    stringsTuningIdx: [10, 5, 0, -5]
  },
  "12edo - Ukelele - Standard Tuning": {
    notes: notes12edo,
    baseFreq: 110,
    stringsTuningIdx: [12, 7, 3 , 10]
  },
  "31edo - Guitar - Standard Tuning": {
    notes: notes31edo,
    baseFreq: 110,
    stringsTuningIdx: [49, 36, 26, 13, 0, -13]
  },
  "31edo - Bass - Standard Tuning": {
    notes: notes31edo,
    baseFreq: 55,
    stringsTuningIdx: [26, 13, 0, -13]
  },
};
