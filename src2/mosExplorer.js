import { getClosestRatioFromScale, computeRotations, unique } from "./MicrotonalHelper/operations.js";
import * as mos from "./MicrotonalHelper/mos.js";
import * as fs from "fs";

//MOS Explorer
//===========================
//This searches for the best MOS step ratio that satisfy the target ratios for teh given mode
//---------------------------
//Parameters:
const period = 1.5;
const mosMode = 'sLsLs';
const searchMin = 1
const searchMax = 10
const searchIncrement = 1 / 100;
const targetRatios = [
    //diamond 5-limit
    //6 / 5, 5 / 4, 4 / 3, 3 / 2, 8 / 5, 5 / 3
    //, 10 / 5, 10 / 4, 8 / 3 //tritave expansion

    //diamond 7-limit
    8 / 7, 7 / 6, 6 / 5, 5 / 4, 4 / 3, 7 / 5, 10 / 7//, 3 / 2, 8 / 5, 5 / 3, 12 / 7, 7 / 4

    //diamond 9-limit
    //10 / 9, 9 / 8, 8 / 7, 7 / 6, 6 / 5, 5 / 4, 9 / 7, 4 / 3, 7 / 5, 10 / 7, 3 / 2, 14 / 9, 8 / 5, 5 / 3, 12 / 7, 7 / 4, 16 / 9, 9 / 5, 2 / 1
];

const maxToleranceInCents = 12;
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


function interator(min, max, increment, callback) {
    if (min >= max) {
        throw Error(
            "The max value must be greather than the min value"
        );
    }
    const interationsCount = Math.floor((max - min) / increment);
    console.log(`Number of interations: ${interationsCount}`);

    var result = [];
    for (let interation = 0; interation <= interationsCount; interation++) {
        const currentValue = min + increment * interation;
        const data = callback(currentValue)
        if (data !== undefined)
            result.push(data);
    }
    return result;
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