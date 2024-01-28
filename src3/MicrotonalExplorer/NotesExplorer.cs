using System.Diagnostics;

namespace MicrotonalExplorer;
public class NotesExplorer
{
    public static void MainComputation()
    {
        //Parameters:
        var numberOfNotes = 7;
        var numberOfDivisions = 22;
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
            var scale = subset.Select(noteIndex =>
                EqualTemperament.GetEqualTemperamentNote(noteIndex, numberOfDivisions, period)
            ).ToArray();

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
            var closestRatios = targetScale.Select(targetScaleRatio =>
            {
                return Operations.GetClosestRatioFromScale(
                   targetScaleRatio,
                   rotationScale
                 );
            });
            var closestRatiosInfoByTolerance = closestRatios.Where(
              item => item.DiffInCents <= toleranceInCents
            );
            var closestDiffInCents = closestRatiosInfoByTolerance.Sum(item => item.DiffInCents);

            //TODO: deduzir numero de dissonancias por rotaçao 16/15 7/5
            var rotationRank =
              closestRatiosInfoByTolerance.Count() - closestDiffInCents / 1200;
            rank += rotationRank;
            closestData.AddRange(closestRatiosInfoByTolerance);
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
}

public record ScaleRankInfoResult(float Rank, IEnumerable<ClosestRationFromScaleResult> ClosestData, float[] JoinedRotations, float MinInterval, float[] Scale);

