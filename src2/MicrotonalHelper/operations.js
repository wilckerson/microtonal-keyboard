import { isRequired, isArray } from "./argumentCheck.js";

export function reduce(
  value = isRequired("value"),
  period = isRequired("period")
) {
  if (period == 1) {
    return value;
  }

  if (value >= period) {
    while (value >= period) {
      value = value / period;
    }
  } else if (value > 0 && value < 1) {
    while (value < 1) {
      value = value * period;
    }
  }
  return value;
}

export function ratioToCents(ratio) {
  return Math.log2(ratio) * 1200;
}

export function ratiosDiffInCents(ratio1, ratio2) {
  return Math.abs(ratioToCents(ratio1) - ratioToCents(ratio2));
}

export function getClosestRatioFromScale(targetRatio, scale) {
  isRequired(targetRatio, "targetRatio");
  isRequired(scale, "scale");
  isArray(scale, "scale");

  const diffMap = scale.map((scaleRatio, scaleIndex) => ({
    scaleIndex,
    diffInCents: ratiosDiffInCents(scaleRatio, targetRatio)
  })).sort((a,b) => a.diffInCents - b.diffInCents);

  return diffMap[0];
}

function scaleFindIndexByReducedRatio(scale, ratio) {
  const period = getScalePeriod(scale);
  const reducedRatio = reduceRatio(ratio, period);
  return scale.findIndex(scaleRatio =>
    isEqualRatio(reducedRatio, reduceRatio(scaleRatio, period))
  );
}
