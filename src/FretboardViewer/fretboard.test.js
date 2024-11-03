import {
  getRelativeRatioByIndex,
  getNoteNameByStringTuningIdx
} from "./fretboard";

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
