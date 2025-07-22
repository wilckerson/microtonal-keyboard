using System;

public class FretsSectionExplorer{
    public static void MainComputation()
    {
        //Objective: Test the CreateRelativeMatrix method
        
        // Example: Create a 3x5 matrix with center at (0,0)
        // 1 row above, 1 row below, 2 columns left, 2 columns right
        var matrix = CreateRelativeMatrix(upperBoundCount: 1, downBoundCount: 1, leftBoundCount: 2, rightBoundCount: 2);
        
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
    /// <returns>A 2D array of tuples representing (x, y) coordinates</returns>
    public static (int x, int y)[,] CreateRelativeMatrix(int upperBoundCount, int downBoundCount, int leftBoundCount, int rightBoundCount)
    {
        // Calculate total dimensions
        int totalRows = upperBoundCount + 1 + downBoundCount; // +1 for center row
        int totalCols = leftBoundCount + 1 + rightBoundCount; // +1 for center column
        
        // Create the matrix
        (int x, int y)[,] matrix = new (int x, int y)[totalRows, totalCols];
        
        // Fill the matrix with relative coordinates
        for (int row = 0; row < totalRows; row++)
        {
            for (int col = 0; col < totalCols; col++)
            {
                // Calculate relative X coordinate (0 at center column)
                int relativeX = col - leftBoundCount;
                
                // Calculate relative Y coordinate (0 at center row, positive upward)
                int relativeY = upperBoundCount - row;
                
                matrix[row, col] = (relativeX, relativeY);
            }
        }
        
        return matrix;
    }

    /// <summary>
    /// Helper method to display the matrix in a readable format
    /// </summary>
    /// <param name="matrix">The matrix to display</param>
    public static void DisplayMatrix((int x, int y)[,] matrix)
    {
        int rows = matrix.GetLength(0);
        int cols = matrix.GetLength(1);
        
        for (int row = 0; row < rows; row++)
        {
            for (int col = 0; col < cols; col++)
            {
                var (x, y) = matrix[row, col];
                Console.Write($"({x,2},{y,2}) ");
            }
            Console.WriteLine();
        }
    }
}