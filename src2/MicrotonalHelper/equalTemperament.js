export function getEqualTemperamentNote(index, numberOfDivisions, period = 2) {
  if (numberOfDivisions <= 1) {
    throw Error("The numberOfDivisions must be positive and greater than 1");
  }
  if (period <= 1) {
    throw Error("The period must be positive and greater than 1");
  }
  return Math.pow(period, index / numberOfDivisions);
}

export function getEqualTemperamentScale(numberOfDivisions, period = 2) {
  const result = [];
  for (let index = 1; index <= numberOfDivisions; index++) {
    const note = getEqualTemperamentNote(index, numberOfDivisions, period);
    result.push(note);
  }
  return result;
}

export function getEqualTemperamentSubsets(
  numberOfNotes,
  numberOfDivisions,
  period = 2
) {
  if (numberOfNotes > numberOfDivisions) {
    throw Error(
      "The number of notes must be less than the number of divisions"
    );
  }

  if (numberOfNotes === numberOfDivisions) {
    //For this scenario, the full scale is the only result
    return getEqualTemperamentScale(numberOfDivisions, period);
  }

  //N0 -> 0 to (numberOfDivisions - 1 - (numberOfNotes - 1))
  //N1 -> N0 + 1 to (numberOfDivisions - 1 - (numberOfNotes - 2))
  //N2 -> N1 + 1 to (numberOfDivisions - 1 - (numberOfNotes - 3))
  //NX -> N(X-1) to (numberOfDivisions - 1 - (numberOfNotes - (X+1)))
  // const result = [1]
  // let lastNoteIndex = 0;
  // for (let index = 1; index < numberOfNotes; index++) {

  //     const rangeMin = lastNoteIndex + 1
  //     const rangeMax =  (numberOfDivisions - 1 - (numberOfNotes - (index+1)))
  //     const randomNoteIndex = rangeMin + Math.floor(Math.random() * (rangeMax - rangeMin));
  //     const noteValue = getEqualTemperamentNote(randomNoteIndex, numberOfDivisions, period);
  //     result.push(noteValue);
  //     lastNoteIndex = randomNoteIndex;
  // }
  const result = [];
  recursive(0, 1, [0], numberOfNotes, numberOfDivisions, period, result);

  return result;
}

function recursive(
  lastNoteIndex,
  level,
  previousResult,
  numberOfNotes,
  numberOfDivisions,
  period,
  outputArray
) {
  const rangeMin = lastNoteIndex + 1;
  const rangeMax = numberOfDivisions - 1 - (numberOfNotes - (level + 1));
  for (let index = rangeMin; index <= rangeMax; index++) {
    //const noteValue = getEqualTemperamentNote(index, numberOfDivisions, period);
    //previousResult.push(noteValue);
    const tmpResult = [...previousResult, index];

    const nextLevel = level + 1;
    if (nextLevel < numberOfNotes) {
      recursive(
        index,
        nextLevel,
        tmpResult,
        numberOfNotes,
        numberOfDivisions,
        period,
        outputArray
      );
    } else {
      outputArray.push(tmpResult);
    }
  }

  return previousResult;
}

export function recursive2(
  lastNoteIndex,
  level,
  numberOfNotes,
  numberOfDivisions
) {
  const outputObj = {};
  let size = 0;
  const rangeMin = lastNoteIndex + 1;
  const rangeMax = numberOfDivisions - 1 - (numberOfNotes - (level + 1));
  for (let index = rangeMin; index <= rangeMax; index++) {
    //const noteValue = getEqualTemperamentNote(index, numberOfDivisions, period);
    //previousResult.push(noteValue);
    //const tmpResult = [...previousResult, index];

    const nextLevel = level + 1;
    if (nextLevel < numberOfNotes) {
      const tmpResult = recursive2(
        index,
        nextLevel,
        numberOfNotes,
        numberOfDivisions
      );
      outputObj[index] = tmpResult[0];
      size += tmpResult[1];
    } else {
      outputObj[index] = true;
      size++;
    }
  }

  return [outputObj, size];
}

export function recursive3(
  lastNoteIndex,
  level,
  numberOfNotes,
  numberOfDivisions
) {
  //[item, children?]
  const result = [];
  let size = 0;
  const rangeMin = lastNoteIndex + 1;
  const rangeMax = numberOfDivisions - 1 - (numberOfNotes - (level + 1));
  for (let index = rangeMin; index <= rangeMax; index++) {
    const nextLevel = level + 1;
    const isLeaf = nextLevel === numberOfNotes;
    if (isLeaf) {
      result.push([index]);
      size++;
    } else {
      const tmpResult = recursive3(
        index,
        nextLevel,
        numberOfNotes,
        numberOfDivisions
      );
      result.push([index, tmpResult[0]]);
      size += tmpResult[1];
    }
  }

  return [result, size];
}

export function recursive4(
    lastNoteIndex,
    level,
    numberOfNotes,
    numberOfDivisions,
    refArray,
    outputArray
  ) {
    //let size = 0;
    const rangeMin = lastNoteIndex + 1;
    const rangeMax = numberOfDivisions - 1 - (numberOfNotes - (level + 1));
    for (let index = rangeMin; index <= rangeMax; index++) {
      const nextLevel = level + 1;
      const isLeaf = nextLevel === numberOfNotes;
      if (isLeaf) {
        outputArray.push(...refArray)
        outputArray.push(index)
        //size++;
      } else {
        refArray.push(index);
        const tmpSize = recursive4(
          index,
          nextLevel,
          numberOfNotes,
          numberOfDivisions,
          refArray,
          outputArray
        );
        refArray.pop();
        //size += tmpSize;
      }
    }
  
    //return size;
  }


  export function recursive5(
    lastNoteIndex,
    level,
    numberOfNotes,
    numberOfDivisions,
    refArray,
    outputArray,
    outputIndex
  ) {
    //let size = 0;
    const rangeMin = lastNoteIndex + 1;
    const rangeMax = numberOfDivisions - 1 - (numberOfNotes - (level + 1));
    for (let index = rangeMin; index <= rangeMax; index++) {
      const nextLevel = level + 1;
      const isLeaf = nextLevel === numberOfNotes;
      if (isLeaf) {
        for (let refIndex = 0; refIndex < refArray.length; refIndex++) {
            outputArray[outputIndex] = refArray[refIndex];
            outputIndex++;            
        }
        outputArray[outputIndex] = index;
        outputIndex++;
        //size++;
      } else {
        refArray.push(index);
        const tmpOutputIndex = recursive5(
          index,
          nextLevel,
          numberOfNotes,
          numberOfDivisions,
          refArray,
          outputArray,
          outputIndex
        );
        refArray.pop();
        outputIndex = tmpOutputIndex;
      }
    }
  
    return outputIndex;
  }

/**
 * Generate all combinations of an array.
 * @param {Array} sourceArray - Array of input elements.
 * @param {number} comboLength - Desired length of combinations.
 * @return {Array} Array of combination arrays.
 */
export function generateCombinations(
  sourceArray,
  comboLength,
  initialValue = []
) {
  const sourceLength = sourceArray.length;
  if (comboLength > sourceLength) return [];

  const combos = []; // Stores valid combinations as they are generated.

  // Accepts a partial combination, an index into sourceArray,
  // and the number of elements required to be added to create a full-length combination.
  // Called recursively to build combinations, adding subsequent elements at each call depth.

  makeNextCombos(
    initialValue,
    0,
    comboLength,
    sourceLength,
    sourceArray,
    combos
  );
  return combos;
}

function makeNextCombos(
  workingCombo,
  currentIndex,
  remainingCount,
  sourceLength,
  sourceArray,
  combos
) {
  const oneAwayFromComboLength = remainingCount == 1;

  // For each element that remains to be added to the working combination.
  for (
    let sourceIndex = currentIndex;
    sourceIndex < sourceLength;
    sourceIndex++
  ) {
    // Get next (possibly partial) combination.
    const next = [...workingCombo, sourceArray[sourceIndex]];

    if (oneAwayFromComboLength) {
      // Combo of right length found, save it.
      combos.push(next);
    } else {
      // Otherwise go deeper to add more elements to the current partial combination.
      makeNextCombos(
        next,
        sourceIndex + 1,
        remainingCount - 1,
        sourceLength,
        sourceArray,
        combos
      );
    }
  }
}
