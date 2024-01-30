using System.Numerics;

namespace MicrotonalExplorer;

public record EqualTemperamentSubsetResult
(
    uint InitialNumberOfCombinations,
    uint NumberOfCombinations,
    int[] Result
);


public static class EqualTemperament
{
    public static EqualTemperamentSubsetResult GetEqualTemperamentSubsets(
      int numberOfNotes,
      int numberOfDivisions,
      int minDistanceBetweenNotes = 1
    )
    {
        if (numberOfNotes > numberOfDivisions)
        {
            throw new Exception(
              "The number of notes must be less than the number of divisions"
            );
        }

        if (minDistanceBetweenNotes < 1)
        {
            throw new Exception("The minDistanceBetweenNotes must be greater than 1");
        }

        if (numberOfNotes == numberOfDivisions)
        {
            //For this scenario, the full scale is the only result
            return new EqualTemperamentSubsetResult(
                (uint)numberOfDivisions,
                (uint)numberOfDivisions,
                Enumerable.Range(0, numberOfDivisions).ToArray()
            );
        }

        if (numberOfDivisions >= int.MaxValue)
        {
            throw new Exception($"The number of divisions must be less than ${int.MaxValue}");
        }
        var initialNumberOfCombinations = GetNumberOfCombinations(
          numberOfDivisions - 1,
          numberOfNotes - 1
        );
        var arrayLength = initialNumberOfCombinations * numberOfNotes;
        if (arrayLength >= uint.MaxValue)
        {
            throw new Exception($"Too much combinations to calculate: ${initialNumberOfCombinations.ToString("N")}");
        }
        var result = new int[arrayLength];
        var refArray = new int[numberOfNotes];
        var refArrayIndex = 0;
        refArray[refArrayIndex] = 0;

        var data = Recursive(
          0,
          1,
          numberOfNotes,
          numberOfDivisions,
          refArrayIndex,
          refArray,
          result,
          0,
          minDistanceBetweenNotes
        );

        return new EqualTemperamentSubsetResult(
            initialNumberOfCombinations,
            data.size,
            result
        );
    }

    static (int outputIndex, uint size) Recursive(
      int lastNoteIndex,
      int level,
      int numberOfNotes,
      int numberOfDivisions,
      int refArrayIndex,
      int[] refArray,
      int[] outputArray,
      int outputIndex,
      int minDistanceBetweenNotes
    )
    {
        uint size = 0;
        var rangeMin = lastNoteIndex + 1;
        var rangeMax = numberOfDivisions - 1 - (numberOfNotes - (level + 1));
        for (var index = rangeMin; index <= rangeMax; index++)
        {
            var lastRefIndex = refArray[refArrayIndex];
            var indexDistance = index - lastRefIndex;
            if (indexDistance < minDistanceBetweenNotes) continue;

            var nextLevel = level + 1;
            var isLeaf = nextLevel == numberOfNotes;
            if (isLeaf)
            {
                for (var refIndex = 0; refIndex <= refArrayIndex; refIndex++)
                {
                    outputArray[outputIndex] = refArray[refIndex];
                    outputIndex++;
                }
                outputArray[outputIndex] = index;
                outputIndex++;
                size++;
            }
            else
            {
                refArrayIndex++;
                refArray[refArrayIndex] = index;
                var tmpResult = Recursive(
                  index,
                  nextLevel,
                  numberOfNotes,
                  numberOfDivisions,
                  refArrayIndex,
                  refArray,
                  outputArray,
                  outputIndex,
                  minDistanceBetweenNotes
                );
                refArray[refArrayIndex] = 0;
                refArrayIndex--;
                outputIndex = tmpResult.outputIndex;
                size += tmpResult.size;
            }
        }

        return (outputIndex, size);
    }

    static BigInteger Factorial(int num)
    {
        if (num < 0) throw new Exception("Undefined");
        BigInteger fact = 1;
        for (var i = num; i > 1; i--){
            fact *= i;
        }
        return fact;
    }

    static uint GetNumberOfCombinations(int numberOfElements, int groupSize)
    {
        var result = Factorial(numberOfElements) /
            (Factorial(groupSize) * Factorial(numberOfElements - groupSize));
        return (uint)result;
    }

    public static float GetEqualTemperamentNote(int noteIndex, int numberOfDivisions, float period)
    {
        if (numberOfDivisions <= 1)
        {
            throw new Exception("The numberOfDivisions must be positive and greater than 1");
        }
        if (period <= 1)
        {
            throw new Exception("The period must be positive and greater than 1");
        }
        return (float)Math.Pow(period, (float)noteIndex / numberOfDivisions);
    }
}
