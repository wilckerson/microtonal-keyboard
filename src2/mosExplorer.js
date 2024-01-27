import { getClosestRatioFromScale, computeRotations, unique, interator } from "./MicrotonalHelper/operations.js";
import * as mos from "./MicrotonalHelper/mos.js";
import * as fs from "fs";

//MOS Explorer
//===========================
//This searches for the best MOS step ratio that satisfy the target ratios for the given mode
//---------------------------
//Parameters:
const period = 2;
const mosMode = 'LssLssL';
const searchMin = 1
const searchMax = 2
const searchIncrement = 1 / 1000;
const maxToleranceInCents = 7;
const targetRatios = [
    //diamond 5-limit
    //6 / 5, 5 / 4, 4 / 3, 3 / 2, 8 / 5, 5 / 3
    //, 10 / 5, 10 / 4, 8 / 3 //tritave expansion

    //diamond 7-limit
    8 / 7, 7 / 6, 6 / 5, 5 / 4, 4 / 3, 7 / 5, 10 / 7//, 3 / 2, 8 / 5, 5 / 3, 12 / 7, 7 / 4

    //diamond 9-limit
    //10 / 9, 9 / 8, 8 / 7, 7 / 6, 6 / 5, 5 / 4, 9 / 7, 4 / 3, 7 / 5, 10 / 7, 3 / 2, 14 / 9, 8 / 5, 5 / 3, 12 / 7, 7 / 4, 16 / 9, 9 / 5, 2 / 1
];
mainComputation();

//--------------------------
//Computation code
function mainComputation() {

    let result = interator(searchMin, searchMax, searchIncrement, (stepRatio) => {
        const scale = mos.generateMos(mosMode, period, stepRatio);
        const rankInfo = getScaleRankInfo(scale, targetRatios, maxToleranceInCents);
        const data = { stepRatio, scale, rankInfo };
        return data;
    });

    //Sort by rank
    result = result.sort((a, b) => b.rankInfo.rank - a.rankInfo.rank);

    //Output mapping
    const output = result
        .slice(0, 10)
        //.filter(item => item.rankInfo.closestData.length >= minMatchCount)
        .map((item, resultIndex) => ({
            //index: resultIndex,
            rank: item.rankInfo.rank,
            stepRatio: item.stepRatio,
            scale: item.scale
            // matchDiffInCents: item.rankInfo.closestDiffInCents,
            // matchCount: item.rankInfo.closestData.length,
            // scale: item.scale.map((scaleRatio, index) =>
            //   scaleRatioOutput(scaleRatio, index, item)
            // )
        }));
    //console.log(output);

    fs.writeFile("mos_output.json", JSON.stringify(output, undefined, 2), err => {
        if (err) {
            throw err;
        }
        console.log("JSON output is saved.");
    });
}

function getScaleRankInfo(scale, targetScale, toleranceInCents) {

    const rotations = computeRotations(scale);
    const joinedRotations = [].concat.apply([], rotations);
    joinedRotations.sort();
    joinedRotations.push(period)

    const resultScale = unique(joinedRotations);

    const closestRatios = targetScale.map(targetScaleRatio => {
        const closestRatioInfo = getClosestRatioFromScale(targetScaleRatio, resultScale);
        return {
            ...closestRatioInfo,
            targetScaleRatio,
            closestScaleRatio: resultScale[closestRatioInfo.scaleIndex]
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