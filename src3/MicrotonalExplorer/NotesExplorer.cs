using System.Diagnostics;
using System.Text;
using MicrotonalExplorer;

namespace MicrotonalExplorer;
public class NotesExplorer
{
    public static void MainComputation()
    {
        //Parameters:
        var numberOfNotes = 7;
        var numberOfDivisions = 12;
        var period = 2;
        float maxToleranceInCents = 16;
        var noteDistance = 1; //numberOfDivisions > 43 ? 2 : 1;
        var initialTargetRatios = Diamond.Diamond5Limit;

        //Remove period from target ratios
        var targetRatios = initialTargetRatios.Where(item => period != item).ToArray();

        var watch = Stopwatch.StartNew();
        var subsetResult = EqualTemperament.GetEqualTemperamentSubsets(numberOfNotes, numberOfDivisions, noteDistance);
        watch.Stop();
        Console.WriteLine($"CalculateSubsets {watch.ElapsedMilliseconds}ms");
        Console.WriteLine($"numberOfCombinations {subsetResult.NumberOfCombinations}");
        //Console.WriteLine(string.Join(',', subsetResult.Result));

        var result = new List<ScaleRankInfoResult>();
        watch = Stopwatch.StartNew();
        for (var index = 0; index < subsetResult.NumberOfCombinations; index++)
        {
            var start = index * numberOfNotes;
            var end = start + numberOfNotes;
            var subset = subsetResult.Result.Skip(start).Take(numberOfNotes);
            var scale = ConvertSubsetToScale(subset, numberOfDivisions, period);

            //compute the rank relative to the target rations an its modes rotation
            var rankInfo = GetScaleRankInfo(
              scale,
              targetRatios,
              maxToleranceInCents
            );
            result.Add(rankInfo);
        }
        Console.WriteLine($"GetScaleRankInfo {watch.ElapsedMilliseconds}ms");

        var orderedResult = result
            .OrderByDescending(item => item.Rank)
            .Take(16);

        SaveOutputFile(orderedResult);
    }


    public static ScaleRankInfoResult GetScaleRankInfo(float[] scale, float[] targetScale, float toleranceInCents)
    {
        var minInterval = Operations.GetMinInterval(scale);
        var rotations = Operations.ComputeRotations(scale);

        float rank = 0;
        var closestData = new List<ClosestRationFromScaleResult>();
        for (var rotation = 0; rotation < rotations.Length; rotation++)
        {
            var rotationScale = rotations[rotation];
            float closestDiffInCents = 0;
            int closestCount = 0;
            for (int targetIndex = 0; targetIndex < targetScale.Length; targetIndex++)
            {
                var targetScaleRatio = targetScale[targetIndex];
                var targetResult = Operations.GetClosestRatioFromScale(
                   targetScaleRatio,
                   rotationScale
                 );
                if (targetResult.DiffInCents <= toleranceInCents)
                {
                    closestDiffInCents += targetResult.DiffInCents;
                    closestCount++;
                    closestData.Add(targetResult);
                }
            }

            var rotationRank = closestCount - closestDiffInCents / 1200;
            rank += rotationRank;
        }

        float[] joinedRotations = rotations.SelectMany(item => item).Distinct().Order().ToArray();

        return new ScaleRankInfoResult(
          rank,
          closestData,
          joinedRotations,
          minInterval,
          scale
        );
    }

    static float[] ConvertSubsetToScale(IEnumerable<int> subset, int numberOfDivisions, float period)
    {
        var subsetSize = subset.Count();
        var scale = new float[subsetSize];
        for (var index = 0; index < subsetSize - 1; index++)
        {
            var noteIndex = subset.ElementAt(index + 1);
            scale[index] = EqualTemperament.GetEqualTemperamentNote(
              noteIndex,
              numberOfDivisions,
              period
            );
        }
        scale[subsetSize - 1] = period;
        return scale;
    }

    static void SaveOutputFile(IEnumerable<ScaleRankInfoResult> result)
    {
        // Write the string array to a new file named "WriteLines.txt".
        using (StreamWriter outputFile = new StreamWriter(Path.Combine("./", "output.txt")))
        {
            foreach (var item in result)
            {
                outputFile.WriteLine("=============");
                //outputFile.WriteLine($"Index: ${item.index}");
                outputFile.WriteLine($"Rank: {item.Rank:0.0000}");
                outputFile.WriteLine($"MinInterval: {item.MinInterval:0.0000}");
                outputFile.WriteLine($"Scale: {item.Scale.Length}");
                foreach (var scaleNote in item.Scale)
                {
                    if (scaleNote == 1)
                    {
                        continue;
                    }
                    var cents = Operations.RatioToCents(scaleNote);
                    outputFile.WriteLine(cents.ToString("0.00"));
                }
            }
        }

    }
}

public record ScaleRankInfoResult(float Rank, IEnumerable<ClosestRationFromScaleResult> ClosestData, float[] JoinedRotations, float MinInterval, float[] Scale);

