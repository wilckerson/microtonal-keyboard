import { parseNoteToken, extractCustomNotes } from "./custom-notes-extractor";

describe("parseNoteToken", () => {
  test("parses fraction token", () => {
    const result = parseNoteToken("3/2");
    expect(result.isValid).toBe(true);
    expect(result.value).toBeCloseTo(1.5, 10);
  });

  test("parses cents token with c and cent symbol", () => {
    const resultC = parseNoteToken("700c");
    const resultCentSymbol = parseNoteToken("700¢");

    expect(resultC.isValid).toBe(true);
    expect(resultCentSymbol.isValid).toBe(true);
    expect(resultC.value).toBeCloseTo(resultCentSymbol.value, 12);
  });

  test("parses edo token", () => {
    const result = parseNoteToken("7\\12");
    expect(result.isValid).toBe(true);
    expect(result.value).toBeCloseTo(Math.pow(2, 7 / 12), 12);
  });

  test("parses decimal ratio token", () => {
    const result = parseNoteToken("1.25");
    expect(result.isValid).toBe(true);
    expect(result.value).toBeCloseTo(1.25, 12);
  });

  test("marks invalid token as invalid", () => {
    const result = parseNoteToken("abc");
    expect(result.isValid).toBe(false);
    expect(result.value).toBeNaN();
  });
});

describe("extractCustomNotes", () => {
  test("uses token parser and keeps note metadata", () => {
    const input = '3/2 "P5"\n700c "c700"\nabc "ignored"';
    const result = extractCustomNotes(input);

    expect(result.values).toHaveLength(2);
    expect(result.names).toContain("P5");
    expect(result.names).toContain("c700");
    expect(result.texts).toContain("3/2");
    expect(result.texts).toContain("700c");
  });
});
