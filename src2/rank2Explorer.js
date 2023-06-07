import { getClosestRatioFromScale } from "./MicrotonalHelper/operations.js";
import * as rank2 from "./MicrotonalHelper/rank2.js";
import * as fs from "fs";
//const CALCULATION_MODES = { bestApproximation: 0, includeMostElements: 1 };

//Rank-2 Explorer
//===========================
//Define a period, number of notes, and search for the best generators that satisfy the target ratios
//---------------------------
//Parameters:
const period = 2;
const numberOfNotes = 12;
const targetRatios = [
  //6 / 5, 5 / 4, 4 / 3, 3 / 2, 8 / 5, 5 / 3 //diamond 5-limit
    8/7,7/6,6/5,5/4,4/3,7/5,10/7,3/2,8/5,5/3,12/7,7/4 //diamond 7-limit
];
//const calculationMode = CALCULATION_MODES.includeMostElements;
const generatorMin = 1;//1;
const generatorMax = 2//2;
const generatorIncrement = 1 / 1000;
const maxToleranceInCents = 7;//16;
const minMatchCount = Math.ceil(numberOfNotes * 0.5);
mainComputation();

//--------------------------
//Computation code
function mainComputation() {
  if (generatorMin >= generatorMax) {
    return console.error(
      "The generator max must be greather than the generator min"
    );
  }
  const interationsCount = Math.floor(
    (generatorMax - generatorMin) / generatorIncrement
  );
  console.log("interationsCount", interationsCount);

  var result = [];
  for (let interation = 0; interation < interationsCount; interation++) {
    const currentGenerator = generatorMin + generatorIncrement * interation;
    if (currentGenerator === 1) {
      continue;
    }
    const scale = rank2.generateRank2UpAndDown(
      period,
      currentGenerator,
      numberOfNotes
    );
    // const scale = rank2.generateRank2(
    //   period,
    //   currentGenerator,
    //   5,
    //   1
    // );

    const rankInfo = getScaleRankInfo(scale, targetRatios, maxToleranceInCents);
    const data = { currentGenerator, scale, rankInfo };
    result.push(data);
  }

  result = result.sort((a, b) => b.rankInfo.rank - a.rankInfo.rank);

  //console.log(JSON.stringify(result));
  const output = result
    .filter(item => item.rankInfo.closestData.length >= minMatchCount)
    .map((item, resultIndex) => ({
      //index: resultIndex,
      rank: item.rankInfo.rank,
      generator: item.currentGenerator,
      // matchDiffInCents: item.rankInfo.closestDiffInCents,
      // matchCount: item.rankInfo.closestData.length,
      // scale: item.scale.map((scaleRatio, index) =>
      //   scaleRatioOutput(scaleRatio, index, item)
      // )
    }));
  //console.log(output);

  fs.writeFile("output.json", JSON.stringify(output, undefined, 2), err => {
    if (err) {
      throw err;
    }
    console.log("JSON output is saved.");
  });
}

function scaleRatioOutput(scaleRatio, index, item) {
  const closestItem = item.rankInfo.closestData.find(
    closestDataItem => closestDataItem.scaleIndex === index
  );
  const info =
    closestItem === undefined || scaleRatio === 1
      ? ""
      : ` (${closestItem.diffInCents.toFixed(2)})`;
  return `${scaleRatio}${info}`;
}

function getScaleRankInfo(scale, targetScale, toleranceInCents) {
  const closestRatios = targetScale.map(targetScaleRatio => {
    const closestRatioInfo = getClosestRatioFromScale(targetScaleRatio, scale);
    return {
      ...closestRatioInfo,
      targetScaleRatio,
      closestScaleRatio: scale[closestRatioInfo.scaleIndex]
    };
  });
  const closestRatiosInfoByTolerance = closestRatios.filter(
    item => item.diffInCents <= toleranceInCents
  );
  let closestDiffInCents = closestRatiosInfoByTolerance.reduce(
    (sum, item) => sum + item.diffInCents,
    0
  );
  const rank = closestRatiosInfoByTolerance.length - closestDiffInCents / 1200;
  return {
    rank,
    closestData: closestRatiosInfoByTolerance,
    closestDiffInCents
  };
}
