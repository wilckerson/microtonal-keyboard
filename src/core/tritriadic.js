import { ratioToCents, unique } from "./core.js";

export function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function simplifyFraction(n, d) {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: Math.round(n / g), d: Math.round(d / g) };
}

export function reduceToOctaveFraction(n, d) {
  let { n: num, d: den } = simplifyFraction(n, d);
  if (num <= 0 || den <= 0) return { n: 1, d: 1 };
  while (num < den) {
    num *= 2;
  }
  while (num >= 2 * den) {
    den *= 2;
  }
  return simplifyFraction(num, den);
}

export function getTritriadicChords(tVal, mVal, dVal) {
  const T = Math.max(1, Math.round(tVal || 1));
  const M = Math.max(1, Math.round(mVal || 1));
  const D = Math.max(1, Math.round(dVal || 1));

  // 1. Tonic Triad: { 1/1, M/T, D/T }
  const tonicRaw = [
    { n: 1, d: 1, role: "Tonic" },
    { n: M, d: T, role: "Tonic" },
    { n: D, d: T, role: "Tonic" }
  ];

  // 2. Dominant Triad (Root * D/T): { D/T, (M*D)/(T*T), (D*D)/(T*T) }
  const dominantRaw = [
    { n: D, d: T, role: "Dominant" },
    { n: M * D, d: T * T, role: "Dominant" },
    { n: D * D, d: T * T, role: "Dominant" }
  ];

  // 3. Subdominant Triad (Root * T/D): { T/D, (M*T)/(T*D) = M/D, (D*T)/(T*D) = 1/1 }
  const subdominantRaw = [
    { n: T, d: D, role: "Subdominant" },
    { n: M, d: D, role: "Subdominant" },
    { n: 1, d: 1, role: "Subdominant" }
  ];

  const processNotes = (rawList) => {
    return rawList.map((item) => {
      const reduced = reduceToOctaveFraction(item.n, item.d);
      const decimal = reduced.n / reduced.d;
      const cents = ratioToCents(decimal);
      return {
        fraction: reduced,
        decimal,
        cents,
        role: item.role
      };
    });
  };

  return {
    subdominant: processNotes(subdominantRaw),
    tonic: processNotes(tonicRaw),
    dominant: processNotes(dominantRaw)
  };
}

export function generateTritriadicScale(
  tVal,
  mVal,
  dVal,
  options = { includeOctave: true, baseFreq: 261.63 }
) {
  const chords = getTritriadicChords(tVal, mVal, dVal);
  const allNotes = [...chords.tonic, ...chords.subdominant, ...chords.dominant];

  // Deduplicate notes by ratio within tolerance
  const map = new Map();
  allNotes.forEach((n) => {
    const key = n.decimal.toFixed(8);
    if (!map.has(key)) {
      map.set(key, {
        fraction: n.fraction,
        decimal: n.decimal,
        cents: n.cents,
        roles: [n.role]
      });
    } else {
      const existing = map.get(key);
      if (!existing.roles.includes(n.role)) {
        existing.roles.push(n.role);
      }
    }
  });

  let sorted = Array.from(map.values()).sort((a, b) => a.decimal - b.decimal);

  const uniqueDecimals = unique(sorted.map((s) => s.decimal));
  sorted = sorted.filter((s) =>
    uniqueDecimals.some((u) => Math.abs(u - s.decimal) < 1e-6)
  );

  const baseFreq = options.baseFreq || 261.63;

  if (options.includeOctave) {
    const octavePresent = sorted.some((s) => Math.abs(s.decimal - 2.0) < 1e-6);
    if (!octavePresent) {
      const tonicNode = sorted.find((s) => Math.abs(s.decimal - 1.0) < 1e-6);
      const octaveRoles = tonicNode ? [...tonicNode.roles] : ["Tonic"];
      sorted.push({
        fraction: { n: 2, d: 1 },
        decimal: 2.0,
        cents: 1200.0,
        roles: octaveRoles
      });
    }
  }

  return sorted.map((note) => {
    const markers = [];
    if (note.roles.includes("Subdominant")) markers.push("#4caf50");
    if (note.roles.includes("Tonic")) markers.push("#2196f3");
    if (note.roles.includes("Dominant")) markers.push("#ff9800");

    return {
      ...note,
      frequency: baseFreq * note.decimal,
      markers
    };
  });
}

export function computeTritriadicModes(scaleDegrees, baseFreq = 261.63) {
  // Extract the unique scale degrees excluding the octave (2.0)
  const baseNotes = scaleDegrees.filter(
    (s) => Math.abs(s.decimal - 2.0) > 1e-6
  );
  const n = baseNotes.length;
  if (n === 0) return [];

  const modes = [];

  for (let i = 0; i < n; i++) {
    const rootNote = baseNotes[i];
    const modeNotes = [];

    for (let j = 0; j < n; j++) {
      const idx = (i + j) % n;
      const octaveShift = i + j >= n ? 1 : 0;
      const note = baseNotes[idx];

      // Rotated ratio = (note.fraction * 2^octaveShift) / rootNote.fraction
      const num =
        note.fraction.n * rootNote.fraction.d * Math.pow(2, octaveShift);
      const den = note.fraction.d * rootNote.fraction.n;
      const reduced = simplifyFraction(num, den);
      const decimal = reduced.n / reduced.d;
      const cents = ratioToCents(decimal);

      const markers = [];
      if (note.roles.includes("Subdominant")) markers.push("#4caf50");
      if (note.roles.includes("Tonic")) markers.push("#2196f3");
      if (note.roles.includes("Dominant")) markers.push("#ff9800");

      modeNotes.push({
        fraction: reduced,
        decimal,
        cents,
        frequency: baseFreq * decimal,
        originalDegreeIndex: idx,
        roles: [...note.roles],
        markers
      });
    }

    // Append 2/1 (octave)
    const octaveMarkers = [];
    if (rootNote.roles.includes("Subdominant")) octaveMarkers.push("#4caf50");
    if (rootNote.roles.includes("Tonic")) octaveMarkers.push("#2196f3");
    if (rootNote.roles.includes("Dominant")) octaveMarkers.push("#ff9800");

    modeNotes.push({
      fraction: { n: 2, d: 1 },
      decimal: 2.0,
      cents: 1200.0,
      frequency: baseFreq * 2.0,
      originalDegreeIndex: i,
      roles: [...rootNote.roles],
      markers: octaveMarkers
    });

    modes.push({
      modeIndex: i,
      name: `Mode ${i + 1}`,
      rootFraction: rootNote.fraction,
      notes: modeNotes
    });
  }

  return modes;
}
