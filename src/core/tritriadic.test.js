import {
  gcd,
  simplifyFraction,
  reduceToOctaveFraction,
  getTritriadicChords,
  generateTritriadicScale,
  computeTritriadicModes
} from "./tritriadic.js";

describe("Tritriadic scale core functions", () => {
  test("gcd and simplifyFraction reduce fractions correctly", () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(7, 6)).toBe(1);
    expect(simplifyFraction(63, 36)).toEqual({ n: 7, d: 4 });
    expect(simplifyFraction(81, 36)).toEqual({ n: 9, d: 4 });
  });

  test("reduceToOctaveFraction normalizes ratios into [1, 2)", () => {
    // 9/4 (2.25) -> 9/8 (1.125)
    expect(reduceToOctaveFraction(9, 4)).toEqual({ n: 9, d: 8 });
    // 2/3 (0.6667) -> 4/3 (1.3333)
    expect(reduceToOctaveFraction(2, 3)).toEqual({ n: 4, d: 3 });
    // 7/9 (0.7778) -> 14/9 (1.5556)
    expect(reduceToOctaveFraction(7, 9)).toEqual({ n: 14, d: 9 });
    // 1/1 -> 1/1
    expect(reduceToOctaveFraction(1, 1)).toEqual({ n: 1, d: 1 });
  });

  test("6:7:9 Chalmers example generates the Tritriad69 scale {9/8, 7/6, 4/3, 3/2, 14/9, 7/4, 2/1}", () => {
    const scale = generateTritriadicScale(6, 7, 9, { includeOctave: true, baseFreq: 261.63 });

    const fractions = scale.map((s) => `${s.fraction.n}/${s.fraction.d}`);
    expect(fractions).toEqual([
      "1/1",
      "9/8",
      "7/6",
      "4/3",
      "3/2",
      "14/9",
      "7/4",
      "2/1"
    ]);

    // Check chord assignments:
    // 1/1 is in Tonic and Subdominant
    const tonicNode = scale.find((s) => s.fraction.n === 1 && s.fraction.d === 1);
    expect(tonicNode.roles).toContain("Tonic");
    expect(tonicNode.roles).toContain("Subdominant");

    // 3/2 is in Tonic and Dominant
    const dominantNode = scale.find((s) => s.fraction.n === 3 && s.fraction.d === 2);
    expect(dominantNode.roles).toContain("Tonic");
    expect(dominantNode.roles).toContain("Dominant");

    // 9/8 is in Dominant
    const d98 = scale.find((s) => s.fraction.n === 9 && s.fraction.d === 8);
    expect(d98.roles).toEqual(["Dominant"]);

    // 7/6 is in Tonic
    const t76 = scale.find((s) => s.fraction.n === 7 && s.fraction.d === 6);
    expect(t76.roles).toEqual(["Tonic"]);

    // 4/3 is in Subdominant
    const s43 = scale.find((s) => s.fraction.n === 4 && s.fraction.d === 3);
    expect(s43.roles).toEqual(["Subdominant"]);
  });

  test("4:5:6 generates the classic Just Major scale", () => {
    const scale = generateTritriadicScale(4, 5, 6, { includeOctave: true });
    const fractions = scale.map((s) => `${s.fraction.n}/${s.fraction.d}`);
    expect(fractions).toEqual([
      "1/1",
      "9/8",
      "5/4",
      "4/3",
      "3/2",
      "5/3",
      "15/8",
      "2/1"
    ]);
  });

  test("10:12:15 generates the classic Just Natural Minor scale", () => {
    const scale = generateTritriadicScale(10, 12, 15, { includeOctave: true });
    const fractions = scale.map((s) => `${s.fraction.n}/${s.fraction.d}`);
    expect(fractions).toEqual([
      "1/1",
      "9/8",
      "6/5",
      "4/3",
      "3/2",
      "8/5",
      "9/5",
      "2/1"
    ]);
  });

  test("computeTritriadicModes generates 7 rotated modes for 6:7:9 scale", () => {
    const scale = generateTritriadicScale(6, 7, 9, { includeOctave: true });
    const modes = computeTritriadicModes(scale);
    expect(modes.length).toBe(7);

    // Mode 1 (rooted on 1/1) matches original scale
    const m1Fractions = modes[0].notes.map((n) => `${n.fraction.n}/${n.fraction.d}`);
    expect(m1Fractions).toEqual([
      "1/1",
      "9/8",
      "7/6",
      "4/3",
      "3/2",
      "14/9",
      "7/4",
      "2/1"
    ]);

    // Mode 2 (rooted on 9/8)
    const m2Fractions = modes[1].notes.map((n) => `${n.fraction.n}/${n.fraction.d}`);
    expect(m2Fractions).toEqual([
      "1/1",
      "28/27",
      "32/27",
      "4/3",
      "112/81",
      "14/9",
      "16/9",
      "2/1"
    ]);
  });
});
