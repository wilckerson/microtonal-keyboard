using MicrotonalExplorer;

public static class NoteColor
{
    /// <summary>
    /// Writes a ratio value to the console with color based on the ratio value
    /// </summary>
    /// <param name="ratio">The ratio value to write with color</param>
    public static void WriteRatioWithColor(float ratio, bool inBrackets = false)
    {
        Console.Write(inBrackets ? " [" : "  ");
        SetConsoleColorByRatio(ratio);
        Console.Write($"{ratio,6:F4}");
        Console.ResetColor();
        Console.Write(inBrackets ? "]" : " ");
    }

    public static void WriteCentsWithColor(float cents)
    {
        // Convert cents to ratio
        float ratio = Operations.CentsToRatio(cents);
        SetConsoleColorByRatio(ratio);
        Console.Write($"{cents,7:F1}c ");
        Console.ResetColor();
    }    /// <summary>
         /// Sets the console foreground color based on the ratio value using HSV color space
         /// </summary>
         /// <param name="ratio">The ratio value to determine color</param>
    private static void SetConsoleColorByRatio(float ratio)
    {
        // Assuming equivalence is 2 (octave) like the TunningInfo.Period default
        float equivalence = 2.0f;

        // Calculate v using the same formula as the JS code
        float v = (ratio - 1) / (equivalence - 1);

        // Convert HSV to RGB (hue=v, saturation=0.77, value=1)
        var rgb = HSVtoRGB(v, 0.77f, 1.0f);

        // Use ANSI escape codes for 24-bit color support
        Console.Write($"\x1b[38;2;{rgb.r};{rgb.g};{rgb.b}m");
    }

    /// <summary>
    /// Converts HSV color values to RGB
    /// </summary>
    /// <param name="h">Hue (0-1)</param>
    /// <param name="s">Saturation (0-1)</param>
    /// <param name="v">Value/Brightness (0-1)</param>
    /// <returns>RGB values as integers (0-255)</returns>
    private static (int r, int g, int b) HSVtoRGB(float h, float s, float v)
    {
        float c = v * s;
        float x = c * (1 - Math.Abs((h * 6) % 2 - 1));
        float m = v - c;

        float r1, g1, b1;

        if (h < 1.0f / 6.0f)
        {
            r1 = c; g1 = x; b1 = 0;
        }
        else if (h < 2.0f / 6.0f)
        {
            r1 = x; g1 = c; b1 = 0;
        }
        else if (h < 3.0f / 6.0f)
        {
            r1 = 0; g1 = c; b1 = x;
        }
        else if (h < 4.0f / 6.0f)
        {
            r1 = 0; g1 = x; b1 = c;
        }
        else if (h < 5.0f / 6.0f)
        {
            r1 = x; g1 = 0; b1 = c;
        }
        else
        {
            r1 = c; g1 = 0; b1 = x;
        }

        int r = (int)Math.Round((r1 + m) * 255);
        int g = (int)Math.Round((g1 + m) * 255);
        int b = (int)Math.Round((b1 + m) * 255);

        // Clamp values to 0-255 range
        r = Math.Max(0, Math.Min(255, r));
        g = Math.Max(0, Math.Min(255, g));
        b = Math.Max(0, Math.Min(255, b));

        return (r, g, b);
    }
}