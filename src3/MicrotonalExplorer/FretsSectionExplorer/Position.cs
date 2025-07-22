using System;

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

    /// <summary>
    /// Calculates the Euclidean distance from this position to the origin (0, 0)
    /// </summary>
    /// <returns>The distance as a float</returns>
    public float GetDistanceFromOrigin()
    {
        return (float)Math.Sqrt(x * x + y * y);
    }
}
