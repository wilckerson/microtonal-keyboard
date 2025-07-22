using MicrotonalExplorer;

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
        var noteRatio = EqualTemperament.GetEqualTemperamentNote(Position.x * TunningInfo.SkipFreting, TunningInfo.Edo, TunningInfo.Period);
        var stringRatio = EqualTemperament.GetEqualTemperamentNote(Position.y * TunningInfo.StrEdoJump, TunningInfo.Edo, TunningInfo.Period);
        return stringRatio * noteRatio;
    }

    public float GetNormalizedRatio()
    {
        var ratio = GetRatio();
        return Operations.Reduce(ratio, TunningInfo.Period);
    }

    public float GetNormalizedCents()
    {
        var ratio = GetNormalizedRatio();
        return Operations.RatioToCents(ratio);
    }
}
