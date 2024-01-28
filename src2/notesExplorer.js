import {
  getClosestRatioFromScale,
  computeRotations,
  unique,
  ratioToCents,
  getMinInterval
} from "./MicrotonalHelper/operations.js";
import * as mos from "./MicrotonalHelper/mos.js";
import * as fs from "fs";
import {
  getEqualTemperamentNote,
  getEqualTemperamentSubsets
} from "./MicrotonalHelper/equalTemperament.js";
import {
  diamond5Limit,
  diamond7Limit,
  diamond9Limit,
  diamond9LimitNo7
} from "./MicrotonalHelper/diamond.js";

//Notes Explorer
//===========================
//This searches for scales of N notes that satisfy the target ratios considering all related modes (rotations)
//---------------------------
//Parameters:
const numberOfNotes = 6;
const numberOfDivisions = 22;
const period = 2;
const maxToleranceInCents = 16;
const noteDistance = 1; //numberOfDivisions > 43 ? 2 : 1;
const targetRatios = [
  //, 10 / 5, 10 / 4, 8 / 3 //tritave expansion
  //...diamond5Limit,
  //...diamond7Limit
  ...diamond9Limit,
  //...diamond9LimitNo7,
];

//Remove period from target ratios
const periodIndex = targetRatios.findIndex(item => period - item <= 0.000001);
targetRatios.splice(periodIndex, 1);

mainComputation();

//--------------------------
//Computation code
function mainComputation() {
  //get all subset of N notes, with a minimum cents distance
  console.time("calculateSubsets");
  const subsetResult = getEqualTemperamentSubsets(
    numberOfNotes,
    numberOfDivisions,
    noteDistance
  );
  console.timeEnd("calculateSubsets");
  //   console.log(
  //     "initialNumberOfCombinations",
  //     result.initialNumberOfCombinations.toLocaleString()
  //   );
  console.log(
    "numberOfCombinations",
    subsetResult.numberOfCombinations.toLocaleString()
  );

  //Round target ratios to closest equal temperament index
  console.time("getScaleRankInfo");
  let result = [];
  //iterate on each one
  subsetIterator(
    subsetResult.result,
    numberOfNotes,
    subsetResult.numberOfCombinations,
    subset => {
      const scale = subsetToScale(subset, numberOfDivisions, period);

      //compute the rank relative to the target rations an its modes rotation
      const rankInfo = getScaleRankInfo(
        scale,
        targetRatios,
        maxToleranceInCents
      );
      const data = { scale, rankInfo };
      result.push(data);
    }
  );
  console.timeEnd("getScaleRankInfo");

  //Sort by rank
  result = result.sort((a, b) => b.rankInfo.rank - a.rankInfo.rank);

  //Output mapping
  const output = result
    .slice(0, 16)
    //.filter(item => item.rankInfo.closestData.length >= minMatchCount)
    .map((item, resultIndex) => ({
      index: resultIndex,
      rank: item.rankInfo.rank,
      minInterval: item.rankInfo.minInterval,
      scale: item.scale
      //closestData: item.rankInfo.closestData,
      //joinedRotations: item.rankInfo.joinedRotations
    }));
  //console.log(output);
  //const jsonOutput = JSON.stringify(output, undefined, 2)
  const lines = [];
  output.forEach(item => {
    lines.push(`=============`);
    lines.push(`Index: ${item.index}`);
    lines.push(`Rank: ${item.rank}`);
    lines.push(`MinInterval: ${item.minInterval.toFixed(3)}`);
    lines.push(`Scale: ${item.scale.length - 1}`);
    item.scale.forEach(scaleNote => {
      if (scaleNote === 1) {
        return;
      }
      const cents = ratioToCents(scaleNote);
      lines.push(cents.toFixed(3));
    });
  });
  const scaleWorkshopOutput = lines.join("\n");

  fs.writeFile("mos_output.json", scaleWorkshopOutput, err => {
    if (err) {
      throw err;
    }
    console.log("JSON output is saved.");
  });
}

function subsetToScale(subset, numberOfDivisions, period) {
  const scale = [];
  for (let index = 0; index < subset.length; index++) {
    const noteIndex = subset[index];
    scale[index] = getEqualTemperamentNote(
      noteIndex,
      numberOfDivisions,
      period
    );
  }
  scale.push(period);
  return scale;
}

function subsetIterator(
  dataArray,
  numberOfNotes,
  numberOfCombinations,
  callback
) {
  for (let index = 0; index < numberOfCombinations; index++) {
    const start = index * numberOfNotes;
    const end = start + numberOfNotes;
    const subset = dataArray.slice(start, end);
    if (callback !== undefined) {
      callback(subset);
    }
  }
}

function getScaleRankInfo(scale, targetScale, toleranceInCents) {
  const minInterval = getMinInterval(scale);
  const rotations = computeRotations(scale);

  let rank = 0;
  const closestData = [];
  for (let rotation = 0; rotation < rotations.length; rotation++) {
    const rotationScale = rotations[rotation];
    const closestRatios = targetScale.map(targetScaleRatio => {
      const closestRatioInfo = getClosestRatioFromScale(
        targetScaleRatio,
        rotationScale
      );
      return {
        ...closestRatioInfo,
        targetScaleRatio,
        closestScaleRatio: rotationScale[closestRatioInfo.scaleIndex]
      };
    });
    const closestRatiosInfoByTolerance = closestRatios.filter(
      item => item.diffInCents <= toleranceInCents
    );
    let closestDiffInCents = closestRatiosInfoByTolerance.reduce(
      (sum, item) => sum + item.diffInCents,
      0
    );

    //TODO: deduzir numero de dissonancias por rotaçao 16/15 7/5
    const rotationRank =
      closestRatiosInfoByTolerance.length - closestDiffInCents / 1200;
    rank += rotationRank;
    closestData.push(closestRatiosInfoByTolerance);
  }

  let joinedRotations = [].concat.apply([], rotations);
  joinedRotations.sort();
  //joinedRotations.push(period);
  joinedRotations = unique(joinedRotations);

  return {
    rank,
    closestData,
    joinedRotations,
    minInterval
  };
}
