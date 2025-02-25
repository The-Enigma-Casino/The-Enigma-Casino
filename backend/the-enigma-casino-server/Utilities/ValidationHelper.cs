using System.Text.RegularExpressions;
using the_enigma_casino_server.Models.Dtos.Request;

namespace the_enigma_casino_server.Utilities;

public static class ValidationHelper
{
    private static HashSet<string> _palabrasProhibidas = new HashSet<string>();

    static ValidationHelper()
    {
        LoadRestrictedWords();
    }

    private static void LoadRestrictedWords()
    {
        try
        {
            string rutaProyecto = Directory.GetParent(AppDomain.CurrentDomain.BaseDirectory)?.Parent?.Parent?.Parent?.FullName;
            string rutaArchivo1 = Path.Combine(rutaProyecto, "Utilities", "en_words.txt");
            string rutaArchivo2 = Path.Combine(rutaProyecto, "Utilities", "es_words.txt");

            if (File.Exists(rutaArchivo1))
            {
                var palabras = File.ReadAllLines(rutaArchivo1)
                                   .Select(p => p.Trim().ToLower())
                                   .Where(p => !string.IsNullOrWhiteSpace(p))
                                   .ToList();
                _palabrasProhibidas.UnionWith(palabras);
            }
            else
            {
                Console.WriteLine($"Archivo no encontrado: {rutaArchivo1}");
            }

            if (File.Exists(rutaArchivo2))
            {
                var palabras = File.ReadAllLines(rutaArchivo2)
                                   .Select(p => p.Trim().ToLower())
                                   .Where(p => !string.IsNullOrWhiteSpace(p))
                                   .ToList();
                _palabrasProhibidas.UnionWith(palabras);
            }
            else
            {
                Console.WriteLine($"Archivo no encontrado: {rutaArchivo2}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al cargar palabras ofensivas: {ex.Message}");
        }
    }

    public static bool IsValidEmail(string email)
    {
        string patronEmail = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        return Regex.IsMatch(email, patronEmail);
    }

    public static bool IsValidDNI(string dni)
    {
        return Regex.IsMatch(dni, @"^\d{8}[A-Za-z]$");
    }


    public static bool IsValidName(string nombre)
    {
        nombre = nombre.ToLower().Trim();

        foreach (var palabra in _palabrasProhibidas)
        {
            string patron = Regex.Escape(palabra);
            if (Regex.IsMatch(nombre, patron, RegexOptions.IgnoreCase))
            {
                return false;
            }
        }

        return true;
    }
}