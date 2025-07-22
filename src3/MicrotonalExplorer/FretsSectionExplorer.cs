using System;
using MicrotonalExplorer;

public class Position
{
    public int x { get; set; }
    public int y { get; set; }

    public Position(int x, int y)
    {
        this.x = x;
        this.y = y;
    }

    public override string ToString()
    {
        return $"({x,2},{y,2})";
    }
}

public class RelativeNote
{
    public Position Position { get; set; }
    public TunningInfo TunningInfo { get; set; }

    public RelativeNote(Position position, TunningInfo tunningInfo)
    {
        Position = position;
        TunningInfo = tunningInfo;
    }

    public float GetRatio()
    {
        var noteRatio = EqualTemperament.GetEqualTemperamentNote(Position.x, TunningInfo.Edo, TunningInfo.Period);
        var stringRatio = EqualTemperament.GetEqualTemperamentNote(Position.y * TunningInfo.StrEdoJump, TunningInfo.Edo, TunningInfo.Period);
        return stringRatio * noteRatio;
    }

    public float GetNormalizedRatio()
    {
        var ratio = GetRatio();
        return Operations.Reduce(ratio, TunningInfo.Period);
    }
}

public class TunningInfo
{
    public int Edo { get; set; }
    /// <summary>
    /// Default period is 2 (octave)
    /// </summary>
    public float Period { get; set; } = 2;
    public float StrEdoJump { get; set; } = 1;

}

public class FretsSectionExplorer
{
    public static void MainComputation()
    {
        var matrix = CreateRelativeMatrix(
            tunningInfo: new TunningInfo { Edo = 31, Period = 2, StrEdoJump = 9 },
            upperBoundCount: 5,
            downBoundCount: 0,
            leftBoundCount: 3,
            rightBoundCount: 3);

        // Display the matrix
        Console.WriteLine("Relative Position Matrix:");
        DisplayMatrix(matrix);
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
    /// Helper method to display the matrix in a readable format
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
                //Console.Write($"{matrix[row, col].Position} ");
                var note = matrix[row, col];
                var ratio = note.GetNormalizedRatio();
                Console.Write($"{ratio:N5} ");
            }
            Console.WriteLine();
        }
    }
}