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
const scales12edo = [
  {
    name: "Major scale",
    degrees: [0, 2, 4, 5, 7, 9, 11]
  },
  {
    name: "Minor scale",
    degrees: [0, 2, 3, 5, 7, 8, 10]
  },
  {
    name: "Major chord",
    degrees: [0, 4, 7]
  },
  {
    name: "Major chord 7M",
    degrees: [0, 4, 7, 11]  
  },
  {
    name: "Minor chord",
    degrees: [0, 3, 7]
  },
  {
    name: "Minor chord 7m",
    degrees: [0, 3, 7, 10]
  }
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

const scales31edo = [
  {
    name: "Major scale",
    degrees: [0, 5, 10, 13, 18, 23, 28]
  },
  {
    name: "Minor scale",
    degrees: [0, 5, 8, 13, 18, 21, 26]
  },
  {
    name: "Major chord",
    degrees: [0, 10, 18]
  },
  {
    name: "Major chord 7M",
    degrees: [0, 10, 18, 28]
  },
  {
    name: "Major chord 7h",
    degrees: [0, 10, 18, 25]
  },
  {
    name: "Minor chord",
    degrees: [0, 8, 18]
  },
  {
    name: "Minor chord 7m",
    degrees: [0, 8, 18, 26]
  }
];

const notes41edo = [
  '1\\41 "^A"',
  '2\\41 "^^A"',
  '3\\41 "vA#"',
  '4\\41 "A#"',
  '5\\41 "^A#"',
  '6\\41 "vB"',
  '7\\41 "B"',
  '8\\41 "^B"',
  '9\\41 "vC"',
  '10\\41 "C"',
  '11\\41 "^C"',
  '12\\41 "^^C"',
  '13\\41 "vC#"',
  '14\\41 "C#"',
  '15\\41 "C#^"',
  '16\\41 "vD"',
  '17\\41 "D"',
  '18\\41 "^D"',
  '19\\41 "^^D"',
  '20\\41 "vD#"',
  '21\\41 "D#"',
  '22\\41 "^D#"',
  '23\\41 "vE"',
  '24\\41 "E"',
  '25\\41 "^E"',
  '26\\41 "vF"',
  '27\\41 "F"',
  '28\\41 "^F"',
  '29\\41 "^^F"',
  '30\\41 "vF#"',
  '31\\41 "F#"',
  '32\\41 "^F#"',
  '33\\41 "vG"',
  '34\\41 "G"',
  '35\\41 "^G"',
  '36\\41 "^^G"',
  '37\\41 "vG#"',
  '38\\41 "G#"',
  '39\\41 "vvA"',
  '40\\41 "vA"',
  '41\\41 "A"'
];

export default {
  "12edo - Guitar - Standard Tuning": {
    notes: notes12edo,
    baseFreq: 110,
    stringsTuningIdx: [19, 14, 10, 5, 0, -5],
    scales: scales12edo
  },
  "12edo - Guitar - DADGAD": {
    notes: notes12edo,
    baseFreq: 110,
    stringsTuningIdx: [17, 12, 10, 5, 0, -7],
    scales: scales12edo
  },
  "12edo - Bass - Standard Tuning": {
    notes: notes12edo,
    baseFreq: 55,
    stringsTuningIdx: [10, 5, 0, -5],
    scales: scales12edo
  },
  "12edo - Ukelele - Standard Tuning": {
    notes: notes12edo,
    baseFreq: 110,
    stringsTuningIdx: [12, 7, 3, 10],
    scales: scales12edo
  },
  "31edo - Guitar - Standard Tuning": {
    notes: notes31edo,
    baseFreq: 110,
    stringsTuningIdx: [49, 36, 26, 13, 0, -13],
    scales: scales31edo,
    isEdo: true,
    edoIdx_Fifth: 18,
    useCircleOfFifthViewer: true
  },
  "31edo - Bass - Standard Tuning": {
    notes: notes31edo,
    baseFreq: 55,
    stringsTuningIdx: [26, 13, 0, -13],
    scales: scales31edo,
    isEdo: true,
    edoIdx_Fifth: 18,
    useCircleOfFifthViewer: true
  },
  "41edo - Kite Guitar - Downmajor tuning": {
    notes: notes41edo,
    baseFreq: 110,
    stringsTuningIdx: [53, 40, 27, 14, 1, -12],
    scales: [],
    fullFrets: true,
    skipFretting: [2]
  },
};
