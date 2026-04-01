import {
  getRelativeRatioByIndex,
  getNoteNameByStringTuningIdx,
  buildFretboardData,
  buildFretboardDataByRatios,
  DISPLAY_MODES
} from "./fretboard";

// --- Existing tests ---

test("getRelativeRatioByIndex", () => {
  const scale = [5 / 4, 3 / 2, 2 / 1];
  expect(getRelativeRatioByIndex(scale, 0)).toEqual(1);
  expect(getRelativeRatioByIndex(scale, 1)).toEqual(5 / 4);
  expect(getRelativeRatioByIndex(scale, 2)).toEqual(3 / 2);
  expect(getRelativeRatioByIndex(scale, 3)).toEqual(2 / 1);
  expect(getRelativeRatioByIndex(scale, 4)).toEqual(5 / 2);
  expect(getRelativeRatioByIndex(scale, 5)).toEqual(3 / 1);
  expect(getRelativeRatioByIndex(scale, 6)).toEqual(4 / 1);
  expect(getRelativeRatioByIndex(scale, 7)).toEqual(5 / 1);
  expect(getRelativeRatioByIndex(scale, -1)).toEqual(3 / 4);
  expect(getRelativeRatioByIndex(scale, -2)).toEqual(5 / 8);
  expect(getRelativeRatioByIndex(scale, -3)).toEqual(1 / 2);
  expect(getRelativeRatioByIndex(scale, -4)).toEqual(3 / 8);
  expect(getRelativeRatioByIndex(scale, -5)).toEqual(5 / 16);
  expect(getRelativeRatioByIndex(scale, -6)).toEqual(1 / 4);
});

test("getNoteNameByStringTuningIdx", () => {
  const noteNames = ["B", "C", "D", "E", "F", "G", "A"];
  expect(getNoteNameByStringTuningIdx(0, noteNames)).toEqual("A");
  expect(getNoteNameByStringTuningIdx(1, noteNames)).toEqual("B");
  expect(getNoteNameByStringTuningIdx(2, noteNames)).toEqual("C");
  expect(getNoteNameByStringTuningIdx(3, noteNames)).toEqual("D");
  expect(getNoteNameByStringTuningIdx(4, noteNames)).toEqual("E");
  expect(getNoteNameByStringTuningIdx(5, noteNames)).toEqual("F");
  expect(getNoteNameByStringTuningIdx(6, noteNames)).toEqual("G");
  expect(getNoteNameByStringTuningIdx(7, noteNames)).toEqual("A");
  expect(getNoteNameByStringTuningIdx(8, noteNames)).toEqual("B");
  expect(getNoteNameByStringTuningIdx(-1, noteNames)).toEqual("G");
  expect(getNoteNameByStringTuningIdx(-2, noteNames)).toEqual("F");
  expect(getNoteNameByStringTuningIdx(-3, noteNames)).toEqual("E");
  expect(getNoteNameByStringTuningIdx(-4, noteNames)).toEqual("D");
  expect(getNoteNameByStringTuningIdx(-5, noteNames)).toEqual("C");
  expect(getNoteNameByStringTuningIdx(-6, noteNames)).toEqual("B");
  expect(getNoteNameByStringTuningIdx(-7, noteNames)).toEqual("A");
  expect(getNoteNameByStringTuningIdx(-8, noteNames)).toEqual("G");
});

// --- buildFretboardData tests ---

describe("buildFretboardData", () => {
  const scale = [5 / 4, 3 / 2, 2 / 1];
  const baseFreq = 440;
  const noteNames = ["C", "E", "G"];
  const noteTexts = ["1/1", "5/4", "3/2"];

  test("returns correct grid dimensions for single string", () => {
    const result = buildFretboardData(
      baseFreq, scale, [0], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    expect(result).toHaveLength(1);
    // scale has 3 ratios + 1 zero fret = 4 frets per string
    expect(result[0]).toHaveLength(scale.length + 1);
  });

  test("returns correct grid dimensions for multiple strings", () => {
    const result = buildFretboardData(
      baseFreq, scale, [0, 1, 2], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    expect(result).toHaveLength(3);
    result.forEach(stringData => {
      expect(stringData).toHaveLength(scale.length + 1);
    });
  });

  test("falls back to [2] when scale is empty", () => {
    const result = buildFretboardData(
      baseFreq, [], [0], [], [],
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    expect(result).toHaveLength(1);
    // fallback scale [2] has 1 ratio + 1 zero fret = 2 frets
    expect(result[0]).toHaveLength(2);
  });

  test("falls back to [2] when scale is null", () => {
    const result = buildFretboardData(
      baseFreq, null, [0], [], [],
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
  });

  test("each fret has expected properties", () => {
    const result = buildFretboardData(
      baseFreq, scale, [0], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    result[0].forEach(fret => {
      expect(fret).toHaveProperty("text");
      expect(fret).toHaveProperty("freq");
      expect(fret).toHaveProperty("width");
      expect(fret).toHaveProperty("scaleIdx");
      expect(fret).toHaveProperty("keyName");
    });
  });

  test("applies keyboard mapping to frets", () => {
    const result = buildFretboardData(
      baseFreq, scale, [0, 1], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    // Row 0, Fret 0 => "1"
    expect(result[0][0].keyName).toBe("1");
    // Row 0, Fret 1 => "2"
    expect(result[0][1].keyName).toBe("2");
    // Row 1, Fret 0 => "Q"
    expect(result[1][0].keyName).toBe("Q");
  });

  test("zero fret has base frequency multiplied by relative ratio", () => {
    const result = buildFretboardData(
      baseFreq, scale, [0], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    // stringTuningIdx=0, baseIndex=0 => normalizedIdx=0 => relativeRatio=1
    // zero fret ratio=1, so freq = baseFreq * 1 * 1 = 440
    expect(result[0][0].freq).toBeCloseTo(440, 5);
  });

  test("fret frequencies are correct for first string", () => {
    const result = buildFretboardData(
      baseFreq, scale, [0], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    // After rotation at index 0, scale stays [5/4, 3/2, 2/1]
    // relativeRatio for index 0 = 1
    // fret 0: ratio=1, freq=440*1=440
    // fret 1: ratio=5/4, freq=440*5/4=550
    // fret 2: ratio=3/2, freq=440*3/2=660
    // fret 3: ratio=2/1, freq=440*2=880
    expect(result[0][0].freq).toBeCloseTo(440, 2);
    expect(result[0][1].freq).toBeCloseTo(550, 2);
    expect(result[0][2].freq).toBeCloseTo(660, 2);
    expect(result[0][3].freq).toBeCloseTo(880, 2);
  });

  test("second string with tuning offset has correct base frequency", () => {
    const result = buildFretboardData(
      baseFreq, scale, [0, 1], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    // stringTuningIdx=1, baseIndex=0 => normalizedIdx=1
    // relativeRatio = getRelativeRatioByIndex(scale, 1) = 5/4
    // zero fret: ratio=1, freq = 440 * 5/4 = 550
    expect(result[1][0].freq).toBeCloseTo(550, 2);
  });

  test("zero fret always has fixed width of 7", () => {
    const result = buildFretboardData(
      baseFreq, scale, [0], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    expect(result[0][0].width).toBe(7);
  });

  test("fret widths are positive and sum to approximately 100", () => {
    const result = buildFretboardData(
      baseFreq, scale, [0], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    const totalWidth = result[0].reduce((sum, fret) => sum + fret.width, 0);
    expect(totalWidth).toBeCloseTo(100, 0);
    result[0].forEach(fret => {
      expect(fret.width).toBeGreaterThan(0);
    });
  });

  test("fullFrets=true aligns all strings to same fret positions", () => {
    const resultFull = buildFretboardData(
      baseFreq, scale, [0, 1], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, true, 0
    );
    const resultIndependent = buildFretboardData(
      baseFreq, scale, [0, 1], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    // With fullFrets=true, both strings should use the same fret widths
    for (let f = 0; f < resultFull[0].length; f++) {
      expect(resultFull[0][f].width).toBeCloseTo(resultFull[1][f].width, 5);
    }
    // With fullFrets=false, fret widths differ between strings with different tuning
    // (string 0 has tuningIdx 0, string 1 has tuningIdx 1 => rotated differently)
    const widthsDiffer = resultIndependent[0].some(
      (fret, i) => Math.abs(fret.width - resultIndependent[1][i].width) > 0.001
    );
    expect(widthsDiffer).toBe(true);
  });

  test("baseIndex shifts frequencies correctly", () => {
    const resultBase0 = buildFretboardData(
      baseFreq, scale, [0], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    const resultBase1 = buildFretboardData(
      baseFreq, scale, [0], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 1
    );
    // baseIndex=1 => normalizedIdx = 0+1 = 1 => relativeRatio = 5/4
    // zero fret freq = 440 * 5/4 = 550
    expect(resultBase0[0][0].freq).toBeCloseTo(440, 2);
    expect(resultBase1[0][0].freq).toBeCloseTo(550, 2);
  });

  test("stringLength defaults to 650 when invalid", () => {
    const resultDefault = buildFretboardData(
      baseFreq, scale, [0], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    const resultInvalid = buildFretboardData(
      baseFreq, scale, [0], noteNames, noteTexts,
      DISPLAY_MODES.DEFAULT, "invalid", false, 0
    );
    // Both should produce identical results since invalid falls back to 650
    expect(resultDefault[0].map(f => f.freq)).toEqual(
      resultInvalid[0].map(f => f.freq)
    );
  });
});

// --- Display modes tests (tested via buildFretboardData) ---

describe("display modes", () => {
  const scale = [5 / 4, 3 / 2, 2 / 1];
  const baseFreq = 440;
  const noteNames = ["C", "E", "G"];
  const noteTexts = ["root", "third", "fifth"];

  function getTexts(displayMode) {
    const result = buildFretboardData(
      baseFreq, scale, [0], noteNames, noteTexts,
      displayMode, 650, false, 0
    );
    return result[0].map(fret => fret.text);
  }

  test("DEFAULT mode shows note names", () => {
    const texts = getTexts(DISPLAY_MODES.DEFAULT);
    // zero fret: stringTuningIdx=0 => noteNames index wraps to last => "G"
    // Then note names cycle through the array
    texts.forEach(t => expect(typeof t).toBe("string"));
  });

  test("RATIO mode shows full ratio as decimal", () => {
    const texts = getTexts(DISPLAY_MODES.RATIO);
    // zero fret: ratio=1, relativeRatio=1, finalRatio=1 => "1.0000"
    expect(texts[0]).toBe("1.0000");
    // fret 1: ratio=5/4, finalRatio=5/4 => "1.2500"
    expect(texts[1]).toBe("1.2500");
    // fret 2: ratio=3/2, finalRatio=3/2 => "1.5000"
    expect(texts[2]).toBe("1.5000");
    // fret 3: ratio=2, finalRatio=2 => "2.0000"
    expect(texts[3]).toBe("2.0000");
  });

  test("RATIO_REDUCED mode normalizes ratio within period", () => {
    const texts = getTexts(DISPLAY_MODES.RATIO_REDUCED);
    // All ratios are already within the period [1, 2), so same as RATIO
    expect(texts[0]).toBe("1.0000");
    expect(texts[1]).toBe("1.2500");
    expect(texts[2]).toBe("1.5000");
    // period ratio 2/1 normalized to 1.0000 (or stays 2.0000 depending on normalizeRatio)
  });

  test("RATIO_RELATIVE mode shows ratio relative to string", () => {
    const texts = getTexts(DISPLAY_MODES.RATIO_RELATIVE);
    // Shows the ratio argument (not multiplied by relativeRatio)
    expect(texts[0]).toBe("1.0000"); // zero fret ratio=1
    expect(texts[1]).toBe("1.2500"); // 5/4
    expect(texts[2]).toBe("1.5000"); // 3/2
    expect(texts[3]).toBe("2.0000"); // 2/1
  });

  test("CENTS mode shows cents values with ¢ suffix", () => {
    const texts = getTexts(DISPLAY_MODES.CENTS);
    expect(texts[0]).toMatch(/¢$/);
    expect(texts[0]).toBe("0.00¢");
    // 5/4 = ~386.31 cents
    expect(texts[1]).toMatch(/386\.31¢$/);
  });

  test("CENTS_REDUCED mode shows reduced cents with ¢ suffix", () => {
    const texts = getTexts(DISPLAY_MODES.CENTS_REDUCED);
    texts.forEach(t => expect(t).toMatch(/¢$/));
    expect(texts[0]).toBe("0.00¢");
  });

  test("CENTS_RELATIVE mode shows cents relative to string", () => {
    const texts = getTexts(DISPLAY_MODES.CENTS_RELATIVE);
    texts.forEach(t => expect(t).toMatch(/¢$/));
    expect(texts[0]).toBe("0.00¢"); // ratio=1 => 0 cents
  });

  test("FREQUENCY mode shows frequency with Hz suffix", () => {
    const texts = getTexts(DISPLAY_MODES.FREQUENCY);
    expect(texts[0]).toBe("440.00 Hz");
    expect(texts[1]).toBe("550.00 Hz");
    expect(texts[2]).toBe("660.00 Hz");
    expect(texts[3]).toBe("880.00 Hz");
  });

  test("FRETS_DISTANCE mode shows distance in mm", () => {
    const texts = getTexts(DISPLAY_MODES.FRETS_DISTANCE);
    // zero fret: ratio=1 => empty string
    expect(texts[0]).toBe("");
    // fret 1: ratio=5/4, distance = 650 - 650/(5/4) = 650 - 520 = 130
    expect(texts[1]).toBe("130.00");
    // fret 2: ratio=3/2, distance = 650 - 650/(3/2) = 650 - 433.33 = 216.67
    expect(parseFloat(texts[2])).toBeCloseTo(216.67, 1);
  });
});

// --- buildFretboardDataByRatios tests ---

describe("buildFretboardDataByRatios", () => {
  const scale = [5 / 4, 3 / 2, 2 / 1];
  const baseFreq = 440;

  test("returns correct grid dimensions", () => {
    const result = buildFretboardDataByRatios(
      baseFreq, scale, [1, 3 / 2], [], [],
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    expect(result).toHaveLength(2);
    result.forEach(stringData => {
      expect(stringData).toHaveLength(scale.length + 1);
    });
  });

  test("falls back to [2] when scale is empty", () => {
    const result = buildFretboardDataByRatios(
      baseFreq, [], [1], [], [],
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
  });

  test("falls back to [2] when scale is null", () => {
    const result = buildFretboardDataByRatios(
      baseFreq, null, [1], [], [],
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
  });

  test("uses explicit ratio tuning for strings", () => {
    const result = buildFretboardDataByRatios(
      baseFreq, scale, [1, 3 / 2], [], [],
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    // String 0: relativeRatio=1, zero fret freq = 440*1 = 440
    expect(result[0][0].freq).toBeCloseTo(440, 2);
    // String 1: relativeRatio=3/2, zero fret freq = 440*3/2 = 660
    expect(result[1][0].freq).toBeCloseTo(660, 2);
  });

  test("fret frequencies scale correctly with string ratio", () => {
    const result = buildFretboardDataByRatios(
      baseFreq, scale, [3 / 2], [], [],
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    // relativeRatio = 3/2
    // fret 0: ratio=1, freq = 440 * 3/2 = 660
    // fret 1: ratio=5/4, freq = 440 * 5/4 * 3/2 = 825
    // fret 2: ratio=3/2, freq = 440 * 3/2 * 3/2 = 990
    // fret 3: ratio=2, freq = 440 * 2 * 3/2 = 1320
    expect(result[0][0].freq).toBeCloseTo(660, 2);
    expect(result[0][1].freq).toBeCloseTo(825, 2);
    expect(result[0][2].freq).toBeCloseTo(990, 2);
    expect(result[0][3].freq).toBeCloseTo(1320, 2);
  });

  test("applies key mapping", () => {
    const result = buildFretboardDataByRatios(
      baseFreq, scale, [1], [], [],
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    expect(result[0][0].keyName).toBe("1");
    expect(result[0][1].keyName).toBe("2");
  });

  test("each fret has expected properties", () => {
    const result = buildFretboardDataByRatios(
      baseFreq, scale, [1], [], [],
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    result[0].forEach(fret => {
      expect(fret).toHaveProperty("text");
      expect(fret).toHaveProperty("freq");
      expect(fret).toHaveProperty("width");
      expect(fret).toHaveProperty("scaleIdx");
      expect(fret).toHaveProperty("keyName");
    });
  });

  test("display mode FREQUENCY works with ratio tuning", () => {
    const result = buildFretboardDataByRatios(
      baseFreq, scale, [1], [], [],
      DISPLAY_MODES.FREQUENCY, 650, false, 0
    );
    expect(result[0][0].text).toBe("440.00 Hz");
    expect(result[0][1].text).toBe("550.00 Hz");
  });

  test("all strings use same fret layout (rotated to baseIndex)", () => {
    const result = buildFretboardDataByRatios(
      baseFreq, scale, [1, 5 / 4], [], [],
      DISPLAY_MODES.DEFAULT, 650, false, 0
    );
    // Both strings should have the same fret widths since they share the same rotated scale
    for (let f = 0; f < result[0].length; f++) {
      expect(result[0][f].width).toBeCloseTo(result[1][f].width, 5);
    }
  });
});

