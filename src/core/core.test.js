import { rotateScale, ratioToCents, centsToRatio } from "./core";

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

test("ratio and cents conversions should be inverse within tolerance", () => {
  const ratios = [1, 16 / 15, 5 / 4, 3 / 2, 2, 5 / 2, 1 / 2];

  ratios.forEach(ratio => {
    const cents = ratioToCents(ratio);
    const recovered = centsToRatio(cents);
    expect(recovered).toBeCloseTo(ratio, 3);
  });
});

test("centsToRatio should support negative and larger-than-period cents", () => {
  expect(centsToRatio(0)).toBeCloseTo(1, 12);
  expect(centsToRatio(1200)).toBeCloseTo(2, 4);
  expect(centsToRatio(-1200)).toBeCloseTo(0.5, 4);
  expect(centsToRatio(2400)).toBeCloseTo(4, 4);
});

test("centsToRatio should round up to 4 decimal places", () => {
  const cents = ratioToCents(16 / 15);
  const recovered = centsToRatio(cents);

  expect(recovered).toBe(1.0667);
});
