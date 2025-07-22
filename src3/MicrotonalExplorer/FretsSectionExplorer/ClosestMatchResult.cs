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
            Console.WriteLine($"  - Position {note.Position}, Ratio: {note.GetNormalizedRatio():F4}, Distance: {note.Position.GetDistanceFromOrigin():F4}");
        }
        Console.WriteLine();
    }
}
