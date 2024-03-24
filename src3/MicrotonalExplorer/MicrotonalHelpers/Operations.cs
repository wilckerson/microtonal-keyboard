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
