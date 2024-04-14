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
        var numberOfDivisions = 31;
        var period = 2 / 1;
        float maxToleranceInCents = 9;
        var noteDistance = 1; //numberOfDivisions > 43 ? 2 : 1;

        //Remove period from target ratios
        var targetRatios = (
            //Diamond.Diamond5Limit
            //Diamond.Diamond7LimitNo5
            //Diamond.Diamond7Limit
            Diamond.Diamond9Limit
        // new float[]{
        //     16/15f,
        //     10/9f,
        //     8/7f,
        //     7/6f,
        //     6/5f, 
        //     5/4f,
        //     4/3f,
        //     7/5f,
        //     10/7f
        // }
        ).Where(item => period != item).ToArray();

        var targetChords = new List<float[]>{
            // Chord.Overtone5Limit_Inversion0,
            // Chord.Overtone5Limit_Inversion1,
            // Chord.Overtone5Limit_Inversion2,
            // Chord.Undertone5Limit_Inversion0,
            // Chord.Undertone5Limit_Inversion1,
            // Chord.Undertone5Limit_Inversion2,

            Chord.Overtone7Limit_Inversion0,
            Chord.Overtone7Limit_Inversion1,
            Chord.Overtone7Limit_Inversion2,
            Chord.Overtone7Limit_Inversion3,
            Chord.Undertone7Limit_Inversion0,
            Chord.Undertone7Limit_Inversion1,
            Chord.Undertone7Limit_Inversion2,
            Chord.Undertone7Limit_Inversion3,
        };

        var watch = Stopwatch.StartNew();
        var subsetResult = EqualTemperament.GetEqualTemperamentSubsets(numberOfNotes, numberOfDivisions, noteDistance);
        watch.Stop();
        Console.WriteLine($"CalculateSubsets {watch.ElapsedMilliseconds}ms");
        Console.WriteLine($"numberOfCombinations {subsetResult.NumberOfCombinations:N0}");
        //Console.WriteLine(string.Join(',', subsetResult.Result));

        var result = new List<ScaleRankInfoResult>();
        watch = Stopwatch.StartNew();
        //Parallel.For(0, (int)subsetResult.NumberOfCombinations, (index) =>
        for (int index = 0; index < (int)subsetResult.NumberOfCombinations; index++)
        {
            var start = index * numberOfNotes;
            var end = start + numberOfNotes;
            var subset = subsetResult.Result.Skip(start).Take(numberOfNotes);
            var scale = EqualTemperament.ConvertSubsetToScale(subset, numberOfDivisions, period);

            var rankInfo = GetScaleRankInfo(
              scale,
              targetRatios,
              maxToleranceInCents,
              targetChords
            );
            result.Add(rankInfo);
        }
        //});
        Console.WriteLine($"GetScaleRankInfo {watch.ElapsedMilliseconds}ms");

        var orderedResult = result
            .OrderByDescending(item => item.Rank)
            .Take(34);

        SaveOutputFile(orderedResult);
    }


    public static ScaleRankInfoResult GetScaleRankInfo(float[] scale, float[] targetScale, float toleranceInCents, List<float[]> targetChords)
    {
        //Compute the rank relative to the target rations an its modes rotation
        //Considering also a rank addition when some target chords is fully present
        //----------------------------------------------------------------------------

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

            //Full Chord verification
            foreach (var chord in targetChords)
            {
                var chordVerificationResult = Operations.FullMatchTargetRatiosToScale(chord, rotationScale, toleranceInCents);
                if (chordVerificationResult.Any())
                {
                    rank += 7;
                }
            }
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

