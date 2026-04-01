import { rotateScale } from "./core";

test("rotateScale should rotate the scale", () => {
  const scale = [5 / 4, 3 / 2, 2 / 1];
  const scaleR1 = [6 / 5, 8 / 5, 2 / 1];
  const scaleR2 = [4 / 3, 5 / 3, 2 / 1];
  expect(rotateScale(scale, 0)).toEqual(scale);
  expect(rotateScale(scale, 1)).toEqual(scaleR1);
  expect(rotateScale(scale, 2)).toEqual(scaleR2);
  expect(rotateScale(scale, 3)).toEqual(scale);
  expect(rotateScale(scale, 4)).toEqual(scaleR1);
  expect(rotateScale(scale, 5)).toEqual(scaleR2);
  expect(rotateScale(scale, -1)).toEqual(scaleR2);
  expect(rotateScale(scale, -2)).toEqual(scaleR1);
  expect(rotateScale(scale, -3)).toEqual(scale);
  expect(rotateScale(scale, -4)).toEqual(scaleR2);
  expect(rotateScale(scale, -5)).toEqual(scaleR1);
});
