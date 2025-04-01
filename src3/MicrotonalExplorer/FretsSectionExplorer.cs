using Microsoft.VisualBasic;
using MicrotonalExplorer;
using System.Linq;
using System.Net.NetworkInformation;
using System.Numerics;

public class FretsSectionExplorer
{
    public static void MainComputation()
    {
        //TODO:
        //[] Consider non-isomorphic string steps
        //[] More points when notes from chord don't overlap at the same string

        //Objective: Given a EDO subset, find good combinations of notes for the strings,
        //isomorphic or not, considering the distance of target notes on the surrounding frets
        float baseRefValue = 2;
        float baseValue = 8;
        float eqt = 31;
        float stringStep = 1 / (float)(Math.Log(baseValue) / Math.Log(baseRefValue));
        int fretSpan = 5;

        int stringsNumber = 6;
        float toleranceInCents = 30;
        //float[] targetNotes = [1.2f, 8 / 7f];
        var targetNotesList = new List<float[]>
        {
          Chord.Overtone7Limit_Inversion0,
          Chord.Overtone7Limit_Inversion1,
          Chord.Overtone7Limit_Inversion2,
          Chord.Overtone7Limit_Inversion3
        };
        //float[] targetNotes = targetNotesList.ToArray();


        var iterationsResult = new List<IterationResult>();
        var numberOfIterations = stringStep * eqt;
        for (int i = 0; i < numberOfIterations; i++)
        {
            var stepsByString = stringStep * (i + 1);
            var avgIterations = new List<IterationResult>();
            foreach (var targetNotes in targetNotesList)
            {
                var iteration = GetIteration(
                    stringsNumber,
                    fretSpan,
                    stepsByString,
                    baseRefValue,
                    toleranceInCents,
                    targetNotes,
                    baseValue,
                    eqt,
                    false);
                avgIterations.Add(iteration);
            }
            var iterationAvg = new IterationResult(
                avgIterations.Average(s => s.Points),
                stepsByString,
                avgIterations.SelectMany(s => s.ClosestNotes)
            );
            iterationsResult.Add(iterationAvg);
        }
        var sortedResult = iterationsResult.OrderBy(o => o.Points).Take(3);
        //Console.WriteLine($"Best result points: {sortedResult.Points}");
        Console.WriteLine("Best result points:");
        Console.WriteLine(string.Join(Environment.NewLine, sortedResult));
    }

    private static IterationResult GetIteration(int stringsNumber, int fretSpan, float stringStep, float baseRefValue, float toleranceInCents, float[] targetNotes, float baseValue, float eqt, bool displayOutput)
    {
        float[,] notes = GetFretSectionNotes(stringsNumber, fretSpan, stringStep, baseValue, eqt);
        if (displayOutput) DisplayArray2D(notes, baseRefValue);

        //For each string, find the closest notes to the target notes
        var closestNotes = new List<StringResult>();
        for (int i = 0; i < stringsNumber; i++)
        {
            var stringScale = Enumerable.Range(0, notes.GetLength(1))
                .Select(x => Operations.Reduce(notes[i, x], baseRefValue))
                .ToArray();
            var result = Operations.MatchTargetRatiosToScale(targetNotes, stringScale, toleranceInCents);
            closestNotes.AddRange(result.Select((s) => new StringResult(i, s.ScaleIndex - fretSpan + 1, s.ClosestScaleRatio, s.TargetScaleRatio)));
        }
        closestNotes = closestNotes.OrderBy(o => o.StringIndex).ToList();
        var uniqueNotesCount = closestNotes.GroupBy(x => x.TargetRatio).Count();
        //var filteredResult = closestNotes.GroupBy(x => x.TargetRatio).Select(g => g.OrderBy(o => o.Distance).First());
        var pointsByUniqueTargetCounts = 100 - (100 * ((float)uniqueNotesCount / targetNotes.Length));
        var pointsByDistance = closestNotes.GroupBy(x => x.TargetRatio).Sum(g => g.Sum(s => Math.Abs(s.Distance)) / g.Count());
        var pointsByRepetition = closestNotes.GroupBy(x => x.StringIndex).Where(x => x.Count() >= 2).Count() * 10;
        var points = pointsByUniqueTargetCounts + pointsByDistance + pointsByRepetition;
        var iterationResult = new IterationResult(points, stringStep, closestNotes);

        if (displayOutput) Console.WriteLine(iterationResult);

        return iterationResult;
    }

    private static float[,] GetFretSectionNotes(int stringsNumber, int fretSpan, float stepsByString, float baseValue, float eqt)
    {
        int totalFretSpan = (fretSpan * 2) - 1;
        float[,] notes = new float[stringsNumber, totalFretSpan];
        for (int i = 0; i < stringsNumber; i++)
        {
            float stringRatioIdx = stepsByString * i;
            float stringRatio = EqualTemperament.GetEqualTemperamentNote(stringRatioIdx, eqt, baseValue);
            for (int j = 0; j < totalFretSpan; j++)
            {
                int fretIdx = j - fretSpan + 1;
                float ratio = EqualTemperament.GetEqualTemperamentNote(fretIdx, eqt, baseValue);
                notes[i, j] = ratio * stringRatio;
            }
        }
        return notes;
    }

    private static void DisplayArray2D(float[,] array2D, float? reducePeriod = null)
    {
        for (int i = array2D.GetLength(0) - 1; i >= 0; i--)
        {
            for (int j = 0; j < array2D.GetLength(1); j++)
            {
                var value = array2D[i, j];
                if (reducePeriod.HasValue)
                {
                    value = Operations.Reduce(value, reducePeriod.Value);
                }
                var fretIdx = j - array2D.GetLength(1) / 2;
                Console.Write("({0},{1}) {2:0.00000}, ", i, fretIdx, value);
            }
            Console.WriteLine();
        }
    }

    public record IterationResult(float Points, float StepsByString, IEnumerable<StringResult> ClosestNotes)
    {
        public override string ToString()
        {
            var notes = string.Join(Environment.NewLine, ClosestNotes.Select(s => s.ToString()));
            return $"Points: {Points}, StepsByString: {StepsByString}, ClosestNotes: {Environment.NewLine}{notes}{Environment.NewLine}=======";
        }
    }
    public record StringResult(int StringIndex, int FretIndex, float ClosestScaleRatio, float TargetRatio)
    {
        public float Distance
        {
            get
            {
                return Vector2.Distance(Vector2.Zero, new Vector2(StringIndex, FretIndex));
            }
        }
    }

}