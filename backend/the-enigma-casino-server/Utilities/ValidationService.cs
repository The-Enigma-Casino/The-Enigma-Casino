using System.Text.RegularExpressions;

namespace the_enigma_casino_server.Utilities;

public class ValidationService
{
    private readonly HashSet<string> _bannedWords = new();

    public ValidationService()
    {
        LoadBannedWords();
    }

    private void LoadBannedWords()
    {
        try
        {
            // Ruta base ajustada a wwwroot/filters
            string basePath = Path.Combine(AppContext.BaseDirectory, "wwwroot", "filters");

            string enWordsPath = Path.Combine(basePath, "en_words.txt");
            string esWordsPath = Path.Combine(basePath, "es_words.txt");

            if (File.Exists(enWordsPath))
            {
                var words = File.ReadAllLines(enWordsPath)
                    .Select(w => w.Trim().ToLower())
                    .Where(w => !string.IsNullOrWhiteSpace(w));

                _bannedWords.UnionWith(words);
            }

            if (File.Exists(esWordsPath))
            {
                var words = File.ReadAllLines(esWordsPath)
                    .Select(w => w.Trim().ToLower())
                    .Where(w => !string.IsNullOrWhiteSpace(w));

                _bannedWords.UnionWith(words);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error loading banned words: {ex.Message}");
        }
    }

    public bool IsValidEmail(string email)
    {
        string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        return Regex.IsMatch(email, pattern);
    }

    public bool IsValidName(string name)
    {
        name = name.ToLower().Trim();

        foreach (string word in _bannedWords)
        {
            string pattern = Regex.Escape(word);
            if (Regex.IsMatch(name, pattern, RegexOptions.IgnoreCase))
                return false;
        }

        return true;
    }

    public bool IsAdult(DateTime birthDate)
    {
        var today = DateTime.Today;
        int age = today.Year - birthDate.Year;

        if (birthDate.Date > today.AddYears(-age)) age--;

        return age >= 18;
    }

    public string CensorWords(string text)
    {
        string result = text;

        foreach (string word in _bannedWords)
        {
            string pattern = $@"\b{Regex.Escape(word)}\b";
            result = Regex.Replace(result, pattern, new string('*', word.Length), RegexOptions.IgnoreCase);
        }

        return result;
    }
}
