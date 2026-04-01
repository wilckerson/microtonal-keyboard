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
        var accumulatedIdx = 0;
        var len = TunningInfo.SkipFreting.Length;
        var sign = Math.Sign(Position.x);
        var absX = Math.Abs(Position.x);

        for (int i = 0; i < absX; i++)
        {
            var idx = sign < 0 ? (len - 1 + i) % len : i % len;
            accumulatedIdx += sign * TunningInfo.SkipFreting[idx];
        }
        
        var noteRatio = EqualTemperament.GetEqualTemperamentNote(accumulatedIdx, TunningInfo.Edo, TunningInfo.Period);
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
