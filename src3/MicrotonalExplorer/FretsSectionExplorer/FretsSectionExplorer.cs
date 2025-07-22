using System;
using System.Collections.Generic;
using MicrotonalExplorer;

public class ClosestMatchResult
{
    public float TargetRatio { get; set; }
    public List<RelativeNote> ClosestNotes { get; set; }
    public float DiffInCents { get; set; }

    public ClosestMatchResult(float targetRatio, List<RelativeNote> closestNotes, float diffInCents)
    {
        TargetRatio = targetRatio;
        ClosestNotes = closestNotes;
        DiffInCents = diffInCents;
    }

    /// <summary>
    /// Displays the match result to the console with formatted output
    /// </summary>
    public void Display()
    {
        Console.WriteLine($"Target {TargetRatio:F3} ({DiffInCents:F1} cents difference):");
        foreach (var note in ClosestNotes)
        {
            Console.WriteLine($"  - Position {note.Position}, Ratio: {note.GetNormalizedRatio():F4}");
        }
        Console.WriteLine();
    }
}

public class FretsSectionExplorer
{
    public static void MainComputation()
    {
        var matrix = CreateRelativeMatrix(
            tunningInfo: new TunningInfo { Edo = 31, Period = 2, StrEdoJump = 9, SkipFreting = 2 },
            upperBoundCount: 5,
            downBoundCount: 0,
            leftBoundCount: 3,
            rightBoundCount: 3);

        // Display the matrix
        Console.WriteLine("Relative Position Matrix:");
        DisplayMatrix(matrix);

        float[] targets = { 1.125f, 1.25f, 1.5f }; // 9/8, 5/4, 3/2
        var matches = FindClosestMatches(matrix, targets);

        foreach (var match in matches)
        {
            match.Display();
        }
    }

    /// <summary>
    /// Creates a relative matrix of position coordinates where (0,0) is the center.
    /// x increases to the right, decreases to the left.
    /// y increases upward, decreases downward.
    /// </summary>
    /// <param name="upperBoundCount">Number of rows above the center</param>
    /// <param name="downBoundCount">Number of rows below the center</param>
    /// <param name="leftBoundCount">Number of columns to the left of center</param>
    /// <param name="rightBoundCount">Number of columns to the right of center</param>
    /// <returns>A 2D array of Position objects representing (x, y) coordinates</returns>
    public static RelativeNote[,] CreateRelativeMatrix(TunningInfo tunningInfo, int upperBoundCount, int downBoundCount, int leftBoundCount, int rightBoundCount)
    {
        // Calculate total dimensions
        int totalRows = upperBoundCount + 1 + downBoundCount; // +1 for center row
        int totalCols = leftBoundCount + 1 + rightBoundCount; // +1 for center column

        // Create the matrix
        RelativeNote[,] matrix = new RelativeNote[totalRows, totalCols];

        // Fill the matrix with relative coordinates
        for (int row = 0; row < totalRows; row++)
        {
            for (int col = 0; col < totalCols; col++)
            {
                // Calculate relative X coordinate (0 at center column)
                int relativeX = col - leftBoundCount;

                // Calculate relative Y coordinate (0 at center row, positive upward)
                int relativeY = upperBoundCount - row;

                var relativeNote = new RelativeNote(
                    new Position(relativeX, relativeY),
                    tunningInfo
                );
                matrix[row, col] = relativeNote;
            }
        }

        return matrix;
    }

    /// <summary>
    /// Helper method to display the matrix in a readable format with color gradients
    /// </summary>
    /// <param name="matrix">The matrix to display</param>
    public static void DisplayMatrix(RelativeNote[,] matrix)
    {
        int rows = matrix.GetLength(0);
        int cols = matrix.GetLength(1);

        for (int row = 0; row < rows; row++)
        {
            for (int col = 0; col < cols; col++)
            {
                var note = matrix[row, col];
                var ratio = note.GetNormalizedRatio();
                NoteColor.WriteRatioWithColor(ratio);

                //var cents = note.GetNormalizedCents();
                //NoteColor.WriteCentsWithColor(cents);
            }
            Console.WriteLine();
        }
    }

    /// <summary>
    /// Finds the closest RelativeNote matches for a list of target ratios within the matrix
    /// Includes all positions that have the same closest ratio for each target
    /// </summary>
    /// <param name="matrix">The matrix to search through</param>
    /// <param name="targetRatios">Array of target ratios to find</param>
    /// <returns>List of ClosestMatchResult objects containing target ratio, list of closest RelativeNotes, and difference in cents</returns>
    public static List<ClosestMatchResult> FindClosestMatches(RelativeNote[,] matrix, float[] targetRatios)
    {
        var results = new List<ClosestMatchResult>();

        foreach (var targetRatio in targetRatios)
        {
            var closestNotes = new List<RelativeNote>();
            float minDiffInCents = float.MaxValue;

            // Search through the entire matrix
            int rows = matrix.GetLength(0);
            int cols = matrix.GetLength(1);

            for (int row = 0; row < rows; row++)
            {
                for (int col = 0; col < cols; col++)
                {
                    var note = matrix[row, col];
                    var noteRatio = note.GetNormalizedRatio();

                    // Calculate difference in cents
                    float diffInCents = Operations.RatiosDiffInCents(targetRatio, noteRatio);

                    if (diffInCents < minDiffInCents)
                    {
                        // Found a better match, clear previous matches and start new list
                        minDiffInCents = diffInCents;
                        closestNotes.Clear();
                        closestNotes.Add(note);
                    }
                    else if (Math.Abs(diffInCents - minDiffInCents) < 0.001f) // Same difference (within tolerance)
                    {
                        // Same quality match, add to the list
                        closestNotes.Add(note);
                    }
                }
            }

            // Add results if we found any matches
            if (closestNotes.Count > 0)
            {
                results.Add(new ClosestMatchResult(targetRatio, closestNotes, minDiffInCents));
            }
        }

        return results;
    }
}