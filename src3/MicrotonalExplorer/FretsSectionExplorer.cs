using MicrotonalExplorer;
using System.Linq;
using System.Net.NetworkInformation;

public class FretsSectionExplorer
{
    public static void MainComputation()
    {
        //Objective: Given a EDO subset, find good combinations of notes for the strings,
        //isomorphic or not, considering the distance of target notes on the surrounding frets
        float baseRefValue = 2;
        float baseValue = 4;
        float eqt = 22;
        float stringStep = 1 / (baseValue / baseRefValue);
        int fretSpan = 5;

        int stringsNumber = 6;
        float[] targetNotes = [1.25f, 1.5f];

        float[,] notes = GetFretSectionNotes(stringsNumber, fretSpan, stringStep, baseValue, eqt);
        DisplayArray2D(notes);
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

    private static void DisplayArray2D(float[,] array2D)
    {
        for (int i = array2D.GetLength(0) - 1; i >= 0; i--)
        {
            for (int j = 0; j < array2D.GetLength(1); j++)
            {
                Console.Write("{0:0.00000}, ", array2D[i, j]);
            }
            Console.WriteLine();
        }
    }
}