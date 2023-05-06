import * as operations from "./operations.js";
import { isRequired } from "./argumentCheck.js";

export function generateRank2UpAndDown(period, generator, count) {
  isRequired(count, "count");
  const upCount = Math.ceil((count - 1) / 2);
  const downCount = Math.floor((count - 1) / 2);
  return generateRank2(period, generator, upCount, downCount);
}

export function generateRank2(period, generator, upCount = 1, downCount = 0) {
  isRequired(generator, "generator");
  isRequired(period, "period");

  var result = [];

  for (let index = 1; index <= downCount; index++) {
    const ratio = 1 / Math.pow(generator, index);
    const reducedRatio = operations.reduce(ratio, period);
    result.push(reducedRatio);
  }

  result.push(1);

  for (let index = 1; index <= upCount; index++) {
    const ratio = Math.pow(generator, index);
    const reducedRatio = operations.reduce(ratio, period);
    result.push(reducedRatio);
  }

  return result.sort();
}
