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

    public static string HashDNI(string dni) //No se usa, aplicar si da problemas al registrar con el DNI
    {
        byte[] inputBytes = Encoding.UTF8.GetBytes(dni); 
        byte[] inputHash = SHA256.HashData(inputBytes);  
        return BitConverter.ToString(inputHash).Replace("-", "").ToLower();
    }
}
