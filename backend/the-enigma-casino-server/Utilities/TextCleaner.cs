using System.Globalization;
using System.Text;

namespace the_enigma_casino_server.Utilities;

public class TextCleaner
{
    public static string Clear(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        return RemoveDiacritics(text.ToLower());
    }

    private static string RemoveDiacritics(string text)
    {
        string normalizedString = text.Normalize(NormalizationForm.FormD);
        StringBuilder stringBuilder = new StringBuilder(normalizedString.Length);

        foreach (char c in normalizedString)
        {
            UnicodeCategory unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
    }
}
