using System.Security.Cryptography;
using System.Text;

namespace the_enigma_casino_server.Utilities;

public class HashHelper
{
    public static string Hash(string value)
    {
        byte[] inputBytes = Encoding.UTF8.GetBytes(value);
        byte[] inputHash = SHA256.HashData(inputBytes);
        return Encoding.UTF8.GetString(inputHash);
    }

    public static bool Verify(string plainText, string hashed)
    {
        return Hash(plainText) == hashed;
    }
}
