namespace the_enigma_casino_server.Utilities;

using System.Text.RegularExpressions;

public class ValidationService
{
    private readonly HashSet<string> _bannedWords = new();

    public ValidationService()
    {
        LoadRestrictedWords();
    }

    private void LoadRestrictedWords()
    {
        try
        {
            string baseDir = Directory.GetParent(AppDomain.CurrentDomain.BaseDirectory)?.Parent?.Parent?.Parent?.FullName;

            if (baseDir == null) return;

            string rutaArchivo1 = Path.Combine(baseDir, "Utilities", "en_words.txt");
            string rutaArchivo2 = Path.Combine(baseDir, "Utilities", "es_words.txt");

            if (File.Exists(rutaArchivo1))
            {
                var palabras = File.ReadAllLines(rutaArchivo1)
                    .Select(p => p.Trim().ToLower())
                    .Where(p => !string.IsNullOrWhiteSpace(p));

                _bannedWords.UnionWith(palabras);
            }

            if (File.Exists(rutaArchivo2))
            {
                var palabras = File.ReadAllLines(rutaArchivo2)
                    .Select(p => p.Trim().ToLower())
                    .Where(p => !string.IsNullOrWhiteSpace(p));

                _bannedWords.UnionWith(palabras);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al cargar palabras ofensivas: {ex.Message}");
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

        foreach (string palabra in _bannedWords)
        {
            string patron = Regex.Escape(palabra);
            if (Regex.IsMatch(name, patron, RegexOptions.IgnoreCase))
                return false;
        }

        return true;
    }

    public bool IsAdult(DateTime dateOfBirth)
    {
        var today = DateTime.Today;
        int age = today.Year - dateOfBirth.Year;

        if (dateOfBirth.Date > today.AddYears(-age)) age--;

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

