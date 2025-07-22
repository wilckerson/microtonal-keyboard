using System.Collections.Immutable;
using System.Linq;

namespace MicrotonalExplorer;

public static class Operations
{

    public static float GetMinInterval(float[] scale)
    {
        var minInterval = scale[scale.Length - 1];
        for (var index = 1; index < scale.Length; index++)
        {
            var interval = scale[index] / scale[index - 1];
            if (interval < minInterval)
            {
                minInterval = interval;
            }
        }
        return minInterval;
    }

    public static float[][] ComputeRotations(float[] scaleArray)
    {
        // if (scaleArray[0] != 1)
        // {
        //     scaleArray = [1, .. scaleArray];
        // }
        var result = new float[scaleArray.Length][];
        var scaleLength = scaleArray.Length;
        var period = scaleArray[scaleArray.Length - 1];
        float tmpRoot = 1;
        for (var i = 0; i < scaleLength; i++)
        {
            var rotationArray = new float[scaleArray.Length];
            for (var j = 0; j < scaleLength; j++)
            {
                int idx = i + j;
                var modIdx = idx % scaleLength;
                var idxPow = (int)Math.Floor((float)idx / scaleLength);
                var item = scaleArray[modIdx];
                var fixedItem = (float)Math.Pow(period, idxPow) * item;
                rotationArray[j] = fixedItem / tmpRoot;
            }
            result[i] = rotationArray;            
            tmpRoot = scaleArray[i];
        }
        return result;
    }


    public static float RatioToCents(float ratio)
    {
        return (float)Math.Log2(ratio) * 1200;
    }

    public static float CentsToRatio(float cents)
    {
        var ratio = (float)Math.Pow(2, cents / 1200);
        return ratio;
    }

    public static float RatiosDiffInCents(float ratio1, float ratio2)
    {
        return Math.Abs(RatioToCents(ratio1) - RatioToCents(ratio2));
    }

    /// <summary>
    /// Reduces a value to be within the range [1, period) by dividing or multiplying by the period.
    /// If period is 1, returns the value unchanged.
    /// If value >= period, divides by period until value < period.
    /// If 0 < value < 1, multiplies by period until value >= 1.
    /// </summary>
    /// <param name="value">The value to reduce</param>
    /// <param name="period">The period to use for reduction</param>
    /// <returns>The reduced value within [1, period)</returns>
    public static float Reduce(float value, float period)
    {
        if (period == 1)
        {
            return value;
        }

        if (value >= period)
        {
            while (value >= period)
            {
                value = value / period;
            }
        }
        else if (value > 0 && value < 1)
        {
            while (value < 1)
            {
                value = value * period;
            }
        }
        
        return value;
    }

    public static ClosestRationFromScaleResult GetClosestRatioFromScale(float targetRatio, float[] scale)
    {
        float minDiff = 1200;
        var scaleIndex = 0;
        for (int i = 0; i < scale.Length; i++)
        {
            var scaleRatio = scale[i];
            var diff = RatiosDiffInCents(scaleRatio, targetRatio);
            if(diff < minDiff){
                minDiff = diff;
                scaleIndex = i;
            }
        }

        return new ClosestRationFromScaleResult
        (
            scaleIndex,
            minDiff,
            targetRatio,
            scale[scaleIndex]
        );
    }

/// <summary>
/// Verify if all target ratios are present inside the scale considering the tolerance. It returns an empty list if at least one target is not matched.
/// </summary>
/// <param name="targetRatios"></param>
/// <param name="scale"></param>
/// <param name="toleranceInCents"></param>
/// <returns></returns>
    public static List<ClosestRationFromScaleResult> FullMatchTargetRatiosToScale(float[] targetRatios, float[] scale, float toleranceInCents)
    {
        var closestData = new List<ClosestRationFromScaleResult>();
        int closestCount = 0;
        for (int targetIndex = 0; targetIndex < targetRatios.Length; targetIndex++)
        {
            var targetRatio = targetRatios[targetIndex];
            var targetResult = GetClosestRatioFromScale(
               targetRatio,
               scale
             );
            if (targetResult.DiffInCents <= toleranceInCents)
            {
                closestCount++;
                closestData.Add(targetResult);
            }
            else{
                return new List<ClosestRationFromScaleResult>();
            }
        }

        return closestData;
    }
}

public record ClosestRationFromScaleResult(int ScaleIndex, float DiffInCents, float TargetScaleRatio, float ClosestScaleRatio);
