import {
  getClosestRatioFromScale,
  computeRotations,
  unique
} from "./MicrotonalHelper/operations.js";
import * as mos from "./MicrotonalHelper/mos.js";
import * as fs from "fs";
import {
  generateCombinations,
  getEqualTemperamentScale,
  getEqualTemperamentSubsets,
  recursive2,
  recursive3,
  recursive4,
  recursive5
} from "./MicrotonalHelper/equalTemperament.js";

//Notes Explorer
//===========================
//This searches for scales of N notes that satisfy the target ratios considering all related modes (rotations)
//---------------------------
//Parameters:
const numberOfNotes = 7;
const period = 2;
const numberOfDivisions = 72;
const maxToleranceInCents = 7;
const targetRatios = [
  //diamond 5-limit
  //6 / 5, 5 / 4, 4 / 3, 3 / 2, 8 / 5, 5 / 3
  //, 10 / 5, 10 / 4, 8 / 3 //tritave expansion

  //diamond 7-limit
  8 / 7,
  7 / 6,
  6 / 5,
  5 / 4,
  4 / 3,
  7 / 5,
  10 / 7 //, 3 / 2, 8 / 5, 5 / 3, 12 / 7, 7 / 4

  //diamond 9-limit
  //10 / 9, 9 / 8, 8 / 7, 7 / 6, 6 / 5, 5 / 4, 9 / 7, 4 / 3, 7 / 5, 10 / 7, 3 / 2, 14 / 9, 8 / 5, 5 / 3, 12 / 7, 7 / 4, 16 / 9, 9 / 5, 2 / 1
];
mainComputation();

//--------------------------
//Computation code
function mainComputation() {
  //get all subset of N notes, with a minimum cents distance
  //iterate on each one
  //compute the rank relative to the target rations an its modes rotation
  const data = [72, 12];
  //const data = [5, 3];
  const n = data[0];
  const g = data[1];


function fact(num)
{
    if(num<0)
     return "Undefined";
    var fact=1;
    for(var i=num;i>1;i--)
      fact*=i;
    return fact;
 }
 function getNumberOfCombinations(numberOfElements, groupSize){
    return parseInt(fact(numberOfElements) / ( fact(groupSize) * fact(numberOfElements - groupSize) ));
 }
 const numberOfCombinations = getNumberOfCombinations(n-1,g-1);
 console.log("Number of combinations ", numberOfCombinations.toLocaleString());

const MAX_LENGTH = Math.pow(2,32) - 1
if(numberOfCombinations > MAX_LENGTH){
    console.error('Too much combinations to calculate');
    return;
}

//   console.time("algorithm1");
//   const result = getEqualTemperamentSubsets(g, n);
//   console.timeEnd("algorithm1");
//   console.log(result.length);

//   const elements = [...Array(n).keys()];
//   elements.splice(0, 1);
//   console.time("algorithmEx");
//   //const result = getEqualTemperamentSubsets(g, n);
//   const resultEx = generateCombinations(elements, g - 1, [0]);
//   console.timeEnd("algorithmEx");
//   //console.log(result);
//   console.log(resultEx.length);

//     console.time("algorithm2");
//   const result2 = recursive2(0, 1, g, n);
//   console.timeEnd("algorithm2");
//   //console.log(JSON.stringify({ '0': result3[0]}));
//   console.log(result2[1]);

//   console.time("algorithm3");
//   const result3 = recursive3(0, 1, g, n);
//   console.timeEnd("algorithm3");
//   const finalArrayTree = [0, result3[0]]
//   //console.log(JSON.stringify(finalArrayTree));
//   console.log(result3[1]);

//   console.time("algorithm4");
//   const result4 = [];
//   recursive4(0, 1, g, n, [0],result4);
//   console.timeEnd("algorithm4"); 

  console.time("algorithm5");
  const result5 = new Uint8Array(numberOfCombinations);
  //const result5 = []
  recursive5(0, 1, g, n, [0], result5, 0);
  console.timeEnd("algorithm5");


  //Sort by rank
  //result = result.sort((a, b) => b.rankInfo.rank - a.rankInfo.rank);

  //Output mapping
  // const output = result
  //     .slice(0, 10)
  //     //.filter(item => item.rankInfo.closestData.length >= minMatchCount)
  //     .map((item, resultIndex) => ({
  //         //index: resultIndex,
  //         rank: item.rankInfo.rank,
  //         stepRatio: item.stepRatio,
  //         scale: item.scale
  //         // matchDiffInCents: item.rankInfo.closestDiffInCents,
  //         // matchCount: item.rankInfo.closestData.length,
  //         // scale: item.scale.map((scaleRatio, index) =>
  //         //   scaleRatioOutput(scaleRatio, index, item)
  //         // )
  //     }));
  //console.log(output);

  // fs.writeFile("mos_output.json", JSON.stringify(output, undefined, 2), err => {
  //     if (err) {
  //         throw err;
  //     }
  //     console.log("JSON output is saved.");
  // });
}
