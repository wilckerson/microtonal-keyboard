using System.Diagnostics;
using System.Text;
using MicrotonalExplorer;

namespace MicrotonalExplorer;
public class NotesExplorer
{
    public static void MainComputation()
    {
        //Parameters:
        var numberOfNotes = 9;
        var numberOfDivisions = 31;
        var period = 2 / 1;
        float maxToleranceInCents = 12;
        var noteDistance = 2; //numberOfDivisions > 43 ? 2 : 1;
        var topResults = 34;

        //Remove period from target ratios
        var targetRatiosSource =
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
        ;
        var targetRatiosName = GetTargetRatiosName(targetRatiosSource);
        var targetRatios = targetRatiosSource.Where(item => period != item).ToArray();

        var targetChords = new List<TargetChord>{
            // new(nameof(Chord.Overtone5Limit_Inversion0), Chord.Overtone5Limit_Inversion0),
            // new(nameof(Chord.Overtone5Limit_Inversion1), Chord.Overtone5Limit_Inversion1),
            // new(nameof(Chord.Overtone5Limit_Inversion2), Chord.Overtone5Limit_Inversion2),
            // new(nameof(Chord.Undertone5Limit_Inversion0), Chord.Undertone5Limit_Inversion0),
            // new(nameof(Chord.Undertone5Limit_Inversion1), Chord.Undertone5Limit_Inversion1),
            // new(nameof(Chord.Undertone5Limit_Inversion2), Chord.Undertone5Limit_Inversion2),

            // new(nameof(Chord.Overtone7Limit_Inversion0), Chord.Overtone7Limit_Inversion0),
            // new(nameof(Chord.Overtone7Limit_Inversion1), Chord.Overtone7Limit_Inversion1),
            // new(nameof(Chord.Overtone7Limit_Inversion2), Chord.Overtone7Limit_Inversion2),
            // new(nameof(Chord.Overtone7Limit_Inversion3), Chord.Overtone7Limit_Inversion3),
            // new(nameof(Chord.Undertone7Limit_Inversion0), Chord.Undertone7Limit_Inversion0),
            // new(nameof(Chord.Undertone7Limit_Inversion1), Chord.Undertone7Limit_Inversion1),
            // new(nameof(Chord.Undertone7Limit_Inversion2), Chord.Undertone7Limit_Inversion2),
            // new(nameof(Chord.Undertone7Limit_Inversion3), Chord.Undertone7Limit_Inversion3),

            new(nameof(Chord.Overtone9Limit_Inversion0), Chord.Overtone9Limit_Inversion0),
            new(nameof(Chord.Overtone9Limit_Inversion1), Chord.Overtone9Limit_Inversion1),
            new(nameof(Chord.Overtone9Limit_Inversion2), Chord.Overtone9Limit_Inversion2),
            new(nameof(Chord.Overtone9Limit_Inversion3), Chord.Overtone9Limit_Inversion3),
            new(nameof(Chord.Overtone9Limit_Inversion4), Chord.Overtone9Limit_Inversion4),
            new(nameof(Chord.Undertone9Limit_Inversion0), Chord.Undertone9Limit_Inversion0),
            new(nameof(Chord.Undertone9Limit_Inversion1), Chord.Undertone9Limit_Inversion1),
            new(nameof(Chord.Undertone9Limit_Inversion2), Chord.Undertone9Limit_Inversion2),
            new(nameof(Chord.Undertone9Limit_Inversion3), Chord.Undertone9Limit_Inversion3),
            new(nameof(Chord.Undertone9Limit_Inversion4), Chord.Undertone9Limit_Inversion4),
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
            .ThenByDescending(item => item.Symmetry.SymmetryPercentage)
            .ThenByDescending(item => item.Symmetry.PositionalSymmetryPercentage)
            .Take(topResults);

        var parameters = new ComputationParameters(
            numberOfNotes,
            numberOfDivisions,
            period,
            maxToleranceInCents,
            noteDistance,
            topResults,
            subsetResult.NumberOfCombinations,
            targetRatiosName,
            targetRatios,
            targetChords
        );

        SaveOutputFile(orderedResult, parameters);
    }


    public static ScaleRankInfoResult GetScaleRankInfo(float[] scale, float[] targetScale, float toleranceInCents, List<TargetChord> targetChords)
    {
        //Compute the rank relative to the target rations an its modes rotation
        //Considering also a rank addition when some target chords is fully present
        //----------------------------------------------------------------------------

        var minInterval = Operations.GetMinInterval(scale);
        var symmetry = Operations.GetScaleSymmetry(scale);
        var rotations = Operations.ComputeRotations(scale);

        float rank = 0;
        var closestData = new List<ClosestRationFromScaleResult>();
        var matchedNotes = new List<MatchedTargetNote>();
        var matchedChords = new List<MatchedTargetChord>();
        for (var rotation = 0; rotation < rotations.Length; rotation++)
        {
            var rotationScale = rotations[rotation];
            var rotationRootCents = rotation == 0 ? 0f : Operations.RatioToCents(scale[rotation - 1]);
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
                    matchedNotes.Add(new MatchedTargetNote(rotation, rotationRootCents, targetResult));
                }
            }

            var rotationRank = closestCount - closestDiffInCents / 1200;
            rank += rotationRank;

            //Full Chord verification
            foreach (var chord in targetChords)
            {
                var chordVerificationResult = Operations.FullMatchTargetRatiosToScale(chord.Ratios, rotationScale, toleranceInCents);
                if (chordVerificationResult.Any())
                {
                    rank += 7;
                    matchedChords.Add(new MatchedTargetChord(rotation, rotationRootCents, chord, chordVerificationResult));
                }
            }
        }

        float[] joinedRotations = rotations.SelectMany(item => item).Distinct().Order().ToArray();

        return new ScaleRankInfoResult(
          rank,
          closestData,
          joinedRotations,
          minInterval,
          scale,
          matchedNotes,
          matchedChords,
          symmetry
        );
    }





    static void SaveOutputFile(IEnumerable<ScaleRankInfoResult> result, ComputationParameters parameters)
    {
        var totalTargetNotes = parameters.TargetRatios.Length;
        var targetChords = parameters.TargetChords;
        var toleranceInCents = parameters.MaxToleranceInCents;

        using (StreamWriter outputFile = new StreamWriter(Path.Combine("./", "output.txt")))
        {
            outputFile.WriteLine("=== Parameters ===");
            outputFile.WriteLine($"NumberOfNotes: {parameters.NumberOfNotes}");
            outputFile.WriteLine($"NumberOfDivisions: {parameters.NumberOfDivisions}");
            outputFile.WriteLine($"Period: {FormatRatio(parameters.Period)} ({Operations.RatioToCents(parameters.Period):0.00}¢)");
            outputFile.WriteLine($"MaxToleranceInCents: {parameters.MaxToleranceInCents:0.00}¢");
            outputFile.WriteLine($"NoteDistance: {parameters.NoteDistance}");
            outputFile.WriteLine($"TopResults: {parameters.TopResults}");
            outputFile.WriteLine($"TotalCombinations: {parameters.TotalCombinations:N0}");
            outputFile.WriteLine($"TargetRatios ({parameters.TargetRatiosName}, {parameters.TargetRatios.Length}): {string.Join(", ", parameters.TargetRatios.Select(FormatRatio))}");
            outputFile.WriteLine($"TargetChords ({parameters.TargetChords.Count}): {(parameters.TargetChords.Count > 0 ? string.Join(", ", parameters.TargetChords.Select(c => c.Name)) : "(none)")}");
            outputFile.WriteLine("==================");

            foreach (var item in result)
            {
                outputFile.WriteLine("=============");
                //outputFile.WriteLine($"Index: ${item.index}");
                outputFile.WriteLine($"Rank: {item.Rank:0.0000}");
                outputFile.WriteLine($"MinInterval: {item.MinInterval:0.0000}");
                outputFile.WriteLine($"Symmetry: {FormatSymmetry(item.Symmetry)}");
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

                var groupedNotes = item.MatchedNotes
                    .GroupBy(m => m.Match.TargetScaleRatio)
                    .OrderBy(g => g.Key)
                    .ToList();

                outputFile.WriteLine($"Matched Target Notes ({groupedNotes.Count}/{totalTargetNotes} unique, {item.MatchedNotes.Count} total):");
                foreach (var group in groupedNotes)
                {
                    var targetRatio = group.Key;
                    var targetCents = Operations.RatioToCents(targetRatio);
                    var bestMatch = group.OrderBy(m => m.Match.DiffInCents).First().Match;
                    var rotationsText = string.Join(", ", group.Select(m => $"rot {m.Rotation} ({m.RotationRootCents:0.00}¢)"));
                    outputFile.WriteLine($"  {FormatRatio(targetRatio),-5} ({targetCents,6:0.00}¢) -> {Operations.RatioToCents(bestMatch.ClosestScaleRatio),6:0.00}¢ (diff {bestMatch.DiffInCents:0.00}¢) [{rotationsText}]");
                }

                var fullyMatchedChordNames = item.MatchedChords
                    .Select(c => c.Chord.Name)
                    .ToHashSet();

                outputFile.WriteLine($"Matched Target Chords ({fullyMatchedChordNames.Count}/{targetChords.Count} unique, {item.MatchedChords.Count} total):");
                if (item.MatchedChords.Count == 0)
                {
                    outputFile.WriteLine("  (none)");
                }
                else
                {
                    foreach (var matchedChord in item.MatchedChords)
                    {
                        var chordRatios = string.Join(", ", matchedChord.Chord.Ratios.Select(FormatRatio));
                        var avgDiff = matchedChord.Matches.Average(m => m.DiffInCents);
                        var maxDiff = matchedChord.Matches.Max(m => m.DiffInCents);
                        outputFile.WriteLine($"  {matchedChord.Chord.Name} [{chordRatios}] @ rot {matchedChord.Rotation} ({matchedChord.RotationRootCents:0.00}¢) (avg diff {avgDiff:0.00}¢, max {maxDiff:0.00}¢)");
                    }
                }

                var unsatisfiedChords = targetChords
                    .Where(c => !fullyMatchedChordNames.Contains(c.Name))
                    .ToList();

                if (unsatisfiedChords.Count > 0)
                {
                    var rotations = Operations.ComputeRotations(item.Scale);
                    var partialMatches = unsatisfiedChords
                        .Select(chord => GetBestPartialChordMatch(chord, item.Scale, rotations, toleranceInCents))
                        .OrderByDescending(p => p.MatchedRatios.Count)
                        .ThenBy(p => p.TotalDiffInCents)
                        .ToList();

                    outputFile.WriteLine($"Partial / Unmatched Target Chords ({unsatisfiedChords.Count}/{targetChords.Count}):");
                    foreach (var partial in partialMatches)
                    {
                        var matchedText = partial.MatchedRatios.Count > 0
                            ? string.Join(", ", partial.MatchedRatios.Select(FormatRatio))
                            : "none";
                        var missingText = string.Join(", ", partial.MissingRatios.Select(FormatRatio));
                        outputFile.WriteLine($"  [{partial.MatchedRatios.Count}/{partial.Chord.Ratios.Length}] {partial.Chord.Name} @ rot {partial.Rotation} ({partial.RotationRootCents:0.00}¢) | matched: [{matchedText}] | missing: [{missingText}]");
                    }
                }
            }
        }
    }

    static PartialChordMatch GetBestPartialChordMatch(TargetChord chord, float[] scale, float[][] rotations, float toleranceInCents)
    {
        PartialChordMatch? best = null;
        for (int rotation = 0; rotation < rotations.Length; rotation++)
        {
            var rotationScale = rotations[rotation];
            var rotationRootCents = rotation == 0 ? 0f : Operations.RatioToCents(scale[rotation - 1]);
            var matched = new List<float>();
            var missing = new List<float>();
            float totalDiff = 0;

            foreach (var ratio in chord.Ratios)
            {
                var closest = Operations.GetClosestRatioFromScale(ratio, rotationScale);
                totalDiff += closest.DiffInCents;
                if (closest.DiffInCents <= toleranceInCents)
                {
                    matched.Add(ratio);
                }
                else
                {
                    missing.Add(ratio);
                }
            }

            if (best is null
                || matched.Count > best.MatchedRatios.Count
                || (matched.Count == best.MatchedRatios.Count && totalDiff < best.TotalDiffInCents))
            {
                best = new PartialChordMatch(rotation, rotationRootCents, chord, matched, missing, totalDiff);
            }
        }

        return best!;
    }

    static string GetTargetRatiosName(float[] source)
    {
        if (ReferenceEquals(source, Diamond.Diamond5Limit)) return nameof(Diamond.Diamond5Limit);
        if (ReferenceEquals(source, Diamond.Diamond7Limit)) return nameof(Diamond.Diamond7Limit);
        if (ReferenceEquals(source, Diamond.Diamond7LimitNo5)) return nameof(Diamond.Diamond7LimitNo5);
        if (ReferenceEquals(source, Diamond.Diamond9Limit)) return nameof(Diamond.Diamond9Limit);
        if (ReferenceEquals(source, Diamond.Diamond9LimitNo7)) return nameof(Diamond.Diamond9LimitNo7);
        return "Custom";
    }

    static string FormatRatio(float ratio)
    {
        const int maxDenominator = 32;
        const float epsilon = 1e-4f;
        for (int den = 1; den <= maxDenominator; den++)
        {
            int num = (int)MathF.Round(ratio * den);
            if (num > 0 && MathF.Abs(ratio - (float)num / den) < epsilon)
            {
                return $"{num}/{den}";
            }
        }
        return ratio.ToString("0.0000");
    }

    static string FormatSymmetry(ScaleSymmetryResult sym)
    {
        if (sym.ConsecutiveMatches == 0 && sym.PositionalMatches == 0)
        {
            return $"0.00% (0/{sym.TotalIntervals})";
        }

        if (sym.ConsecutiveMatches == sym.PositionalMatches)
        {
            return $"{sym.SymmetryPercentage:0.00}% ({sym.ConsecutiveMatches}/{sym.TotalIntervals} consecutive @ rot {sym.BestConsecutiveRotation} ({sym.BestConsecutiveRootCents:0.00}¢))";
        }

        if (sym.ConsecutiveMatches == 0)
        {
            return $"{sym.SymmetryPercentage:0.00}% (0/{sym.TotalIntervals} consecutive; {sym.PositionalSymmetryPercentage:0.00}% [{sym.PositionalMatches}/{sym.TotalIntervals}] positional @ rot {sym.BestPositionalRotation} ({sym.BestPositionalRootCents:0.00}¢))";
        }

        if (sym.BestConsecutiveRotation == sym.BestPositionalRotation)
        {
            return $"{sym.SymmetryPercentage:0.00}% ({sym.ConsecutiveMatches}/{sym.TotalIntervals} consecutive, {sym.PositionalSymmetryPercentage:0.00}% [{sym.PositionalMatches}/{sym.TotalIntervals}] positional @ rot {sym.BestConsecutiveRotation} ({sym.BestConsecutiveRootCents:0.00}¢))";
        }

        return $"{sym.SymmetryPercentage:0.00}% ({sym.ConsecutiveMatches}/{sym.TotalIntervals} consecutive @ rot {sym.BestConsecutiveRotation} ({sym.BestConsecutiveRootCents:0.00}¢); {sym.PositionalSymmetryPercentage:0.00}% [{sym.PositionalMatches}/{sym.TotalIntervals}] positional @ rot {sym.BestPositionalRotation} ({sym.BestPositionalRootCents:0.00}¢))";
    }
}

public record ComputationParameters(
    int NumberOfNotes,
    int NumberOfDivisions,
    float Period,
    float MaxToleranceInCents,
    int NoteDistance,
    int TopResults,
    long TotalCombinations,
    string TargetRatiosName,
    float[] TargetRatios,
    List<TargetChord> TargetChords
);
public record TargetChord(string Name, float[] Ratios);
public record MatchedTargetNote(int Rotation, float RotationRootCents, ClosestRationFromScaleResult Match);
public record MatchedTargetChord(int Rotation, float RotationRootCents, TargetChord Chord, List<ClosestRationFromScaleResult> Matches);
public record PartialChordMatch(int Rotation, float RotationRootCents, TargetChord Chord, List<float> MatchedRatios, List<float> MissingRatios, float TotalDiffInCents);
public record ScaleRankInfoResult(
    float Rank,
    IEnumerable<ClosestRationFromScaleResult> ClosestData,
    float[] JoinedRotations,
    float MinInterval,
    float[] Scale,
    List<MatchedTargetNote> MatchedNotes,
    List<MatchedTargetChord> MatchedChords,
    ScaleSymmetryResult Symmetry
);

