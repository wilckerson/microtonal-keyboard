using MicrotonalExplorer;

public class FretsSectionExplorer
{
    public static void MainComputation()
    {
        Console.WriteLine("Testing different StrEdoJump values from 1 to 31...\n");

        float[] targets = { 9/8f, 5/4f, 4/3f, 3/2f, 5/3f, 15/8f, 2f }; 
        var results = new List<(int strEdoJump, float totalMinDistance, List<ClosestMatchResult> matches, RelativeNote[,] matrix)>();
        
        // Test each StrEdoJump value from 1 to 31
        for (int strEdoJump = 1; strEdoJump <= 31; strEdoJump++)
        {
            var matrix = CreateRelativeMatrix(
                tunningInfo: new TunningInfo { Edo = 31, Period = 2, StrEdoJump = strEdoJump, SkipFreting = 2 },
                upperBoundCount: 5,
                downBoundCount: 0,
                leftBoundCount: 3,
                rightBoundCount: 3);

            var matches = FindClosestMatches(matrix, targets, 16f);
            float totalMinDistance = CalculateTotalMinimumDistance(matches);
            
            results.Add((strEdoJump, totalMinDistance, matches, matrix));
            
            //Console.Write($"StrEdoJump {strEdoJump,2}: {totalMinDistance:F2}  ");
            //if (strEdoJump % 5 == 0) Console.WriteLine(); // New line every 5 results
        }
        
        Console.WriteLine("\n");
        
        // Sort results by number of matches (descending), then by total minimum distance (ascending)
        var sortedResults = results
            .OrderByDescending(r => r.matches.Count)
            .ThenBy(r => r.totalMinDistance)
            .ToList();

        Console.WriteLine("=== TOP 3 BEST CONFIGURATIONS (Most Matches, Then Lowest Total Distance) ===\n");

        for (int i = 0; i < Math.Min(3, sortedResults.Count); i++)
        {
            var (strEdoJump, totalMinDistance, matches, matrix) = sortedResults[i];

            Console.WriteLine($"#{i + 1} - StrEdoJump: {strEdoJump}, Matches: {matches.Count}, Total Distance: {totalMinDistance:F3}");
            Console.WriteLine("Target approximations:");

            foreach (var match in matches)
            {
                var bestNote = match.ClosestNotes.OrderBy(n => n.Position.GetDistanceFromOrigin()).First();
                Console.WriteLine($"  {match.TargetRatio:F3} → Position {bestNote.Position} " +
                                $"(±{match.DiffInCents:F1}¢, dist: {bestNote.Position.GetDistanceFromOrigin():F2})");
            }

            Console.WriteLine($"\nMatrix for StrEdoJump {strEdoJump}:");
            DisplayMatrix(matrix, matches);
            Console.WriteLine();
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
                // Calculate relative Y coordinate (0 at center row, positive upward)
                int relativeY = col - leftBoundCount;

                // Calculate relative X coordinate (0 at center column)
                int relativeX = upperBoundCount - row;

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
    /// Helper method to display the matrix in a readable format with color gradients.
    /// If a list of ClosestMatchResult is provided, notes that match are rendered with square brackets.
    /// </summary>
    /// <param name="matrix">The matrix to display</param>
    /// <param name="matches">Optional: list of ClosestMatchResult to highlight selected notes</param>
    public static void DisplayMatrix(RelativeNote[,] matrix, List<ClosestMatchResult>? matches = null)
    {
        int rows = matrix.GetLength(0);
        int cols = matrix.GetLength(1);

        // Build a set of matched positions for quick lookup if matches are provided
        HashSet<string>? matchedPositions = null;
        if (matches != null)
        {
            matchedPositions = new HashSet<string>(
                matches.SelectMany(m => m.ClosestNotes)
                       .Select(n => n.Position.ToString())
            );
        }

        for (int row = 0; row < rows; row++)
        {
            for (int col = 0; col < cols; col++)
            {
                var note = matrix[row, col];
                var ratio = note.GetNormalizedRatio();
                var posStr = note.Position.ToString();

                if ((matchedPositions != null && matchedPositions.Contains(posStr)) || ratio == 1.0f)
                {
                    // Highlight matched notes with square brackets
                    Console.Write("[");
                    NoteColor.WriteRatioWithColor(ratio);
                    Console.Write("]");
                }
                else if (ratio < 1.0f)
                {
                    Console.Write("[");
                    NoteColor.WriteRatioWithColor(ratio);
                    Console.Write("]");
                }
                else
                {
                    Console.Write(" ");
                    NoteColor.WriteRatioWithColor(ratio);
                    Console.Write(" ");
                }

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
      public static List<ClosestMatchResult> FindClosestMatches(RelativeNote[,] matrix, float[] targetRatios, float maxCentsDiff = 30.0f)
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
                        minDiffInCents = diffInCents;
                        closestNotes.Clear();
                        closestNotes.Add(note);
                    }
                    else if (Math.Abs(diffInCents - minDiffInCents) < 0.001f)
                    {
                        closestNotes.Add(note);
                    }
                }
            }

            // Only add if the best match is below the maxCents threshold
            if (closestNotes.Count > 0 && minDiffInCents <= maxCentsDiff)
            {
                results.Add(new ClosestMatchResult(targetRatio, closestNotes, minDiffInCents));
            }
        }

        return results;
    }

    /// <summary>
    /// Calculates the sum of minimum distances for all closest notes in the match results
    /// For each match result, finds the closest note to origin and adds its distance to the sum
    /// </summary>
    /// <param name="matchResults">List of ClosestMatchResult objects</param>
    /// <returns>Sum of all minimum distances</returns>
    public static float CalculateTotalMinimumDistance(List<ClosestMatchResult> matchResults)
    {
        return matchResults.Sum(matchResult =>
            matchResult.ClosestNotes.Min(note => note.Position.GetDistanceFromOrigin()));
    }
}