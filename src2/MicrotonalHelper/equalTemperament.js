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
  minDistanceBetweenNotes = 1,
  period = 2
) {
  if (numberOfNotes > numberOfDivisions) {
    throw Error(
      "The number of notes must be less than the number of divisions"
    );
  }

  if (minDistanceBetweenNotes < 1) {
    throw Error("The minDistanceBetweenNotes must be greater than 1");
  }

  if (numberOfNotes === numberOfDivisions) {
    //For this scenario, the full scale is the only result
    return {
      initialNumberOfCombinations: numberOfDivisions,
      numberOfCombinations: numberOfDivisions,
      result: [...new Array(numberOfDivisions).keys()]
    };
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
  const bytesPerElement = Uint8Array.BYTES_PER_ELEMENT;
  const MAX_VALUE = Math.pow(2, bytesPerElement * 8) - 1;
  if (numberOfDivisions >= MAX_VALUE) {
    throw Error(`The number of divisions must be less than ${MAX_VALUE}`);
  }
  const initialNumberOfCombinations = getNumberOfCombinations(
    numberOfDivisions - 1,
    numberOfNotes - 1
  );
  const arrayLength = initialNumberOfCombinations * numberOfNotes;
  const MAX_ARRAY_LENGTH = Math.pow(2, 32) - 1;
  if (arrayLength > MAX_ARRAY_LENGTH) {
    throw Error(
      `Too much combinations to calculate: ${initialNumberOfCombinations.toLocaleString()}`
    );
  }
  const result = new Uint8Array(arrayLength);
  //const result = [];
  const data = recursive(
    0,
    1,
    numberOfNotes,
    numberOfDivisions,
    [0],
    result,
    0,
    minDistanceBetweenNotes
  );

  return {
    initialNumberOfCombinations,
    numberOfCombinations: data[1],
    result
  };
}

export function recursive(
  lastNoteIndex,
  level,
  numberOfNotes,
  numberOfDivisions,
  refArray,
  outputArray,
  outputIndex,
  minDistanceBetweenNotes
) {
  let size = 0;
  const rangeMin = lastNoteIndex + 1;
  const rangeMax = numberOfDivisions - 1 - (numberOfNotes - (level + 1));
  for (let index = rangeMin; index <= rangeMax; index++) {
    const lastRefIndex = refArray[refArray.length - 1];
    const indexDistance = index - lastRefIndex;
    if (indexDistance < minDistanceBetweenNotes) continue;

    const nextLevel = level + 1;
    const isLeaf = nextLevel === numberOfNotes;
    if (isLeaf) {
      for (let refIndex = 0; refIndex < refArray.length; refIndex++) {
        outputArray[outputIndex] = refArray[refIndex];
        outputIndex++;
      }
      outputArray[outputIndex] = index;
      outputIndex++;
      size++;
    } else {
      refArray.push(index);
      const tmpResult = recursive(
        index,
        nextLevel,
        numberOfNotes,
        numberOfDivisions,
        refArray,
        outputArray,
        outputIndex,
        minDistanceBetweenNotes
      );
      refArray.pop();
      outputIndex = tmpResult[0];
      size += tmpResult[1];
    }
  }

  return [outputIndex, size];
}

function factorial(num) {
  if (num < 0) return "Undefined";
  var fact = BigInt(1);
  for (var i = num; i > 1; i--) fact *= BigInt(i);
  return fact;
}
function getNumberOfCombinations(numberOfElements, groupSize) {
  return parseInt(
    factorial(numberOfElements) /
      (factorial(groupSize) * factorial(numberOfElements - groupSize))
  );
}
