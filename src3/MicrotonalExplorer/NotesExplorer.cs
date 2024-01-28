using System.Diagnostics;

namespace MicrotonalExplorer;
public class NotesExplorer
{
    public static void MainComputation()
    {
        //Parameters:
        var numberOfNotes = 7;
        var numberOfDivisions = 31;
        var period = 2;
        float maxToleranceInCents = 16;
        var noteDistance = 1; //numberOfDivisions > 43 ? 2 : 1;
        var targetRatios = Diamond.Diamond5Limit.AsEnumerable();

        //Remove period from target ratios
        targetRatios = targetRatios.Where(item => period == item);

        var watch = Stopwatch.StartNew();
        var subsetResult = EqualTemperament.GetEqualTemperamentSubsets(numberOfNotes, numberOfDivisions, noteDistance);
        watch.Stop();
        Console.WriteLine($"CalculateSubsets {watch.ElapsedMilliseconds}ms");
        Console.WriteLine($"numberOfCombinations {subsetResult.NumberOfCombinations}");

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
              targetRatios.ToArray(),
              maxToleranceInCents
            );
            result.Add(rankInfo);
        }
        Console.WriteLine($"GetScaleRankInfo {watch.ElapsedMilliseconds}ms");
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
                 if(targetResult.DiffInCents <= toleranceInCents){
                    closestDiffInCents +=targetResult.DiffInCents;
                    closestCount++;
                    closestData.Add(targetResult);
                 }
            }
            // var closestRatios = targetScale.Select(targetScaleRatio =>
            // {
            //     return Operations.GetClosestRatioFromScale(
            //        targetScaleRatio,
            //        rotationScale
            //      );
            // });
            // var closestRatiosInfoByTolerance = closestRatios.Where(
            //   item => item.DiffInCents <= toleranceInCents
            // );
            // var closestDiffInCents = closestRatiosInfoByTolerance.Sum(item => item.DiffInCents);

            // //TODO: deduzir numero de dissonancias por rotaçao 16/15 7/5
            // var rotationRank =
            //   closestRatiosInfoByTolerance.Count() - closestDiffInCents / 1200;

            var rotationRank = closestCount - closestDiffInCents / 1200;
            rank += rotationRank;
            //closestData.AddRange(closestRatiosInfoByTolerance);
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
        scale[subsetSize-1] = period;
        return scale;
    }
}

public record ScaleRankInfoResult(float Rank, IEnumerable<ClosestRationFromScaleResult> ClosestData, float[] JoinedRotations, float MinInterval, float[] Scale);

