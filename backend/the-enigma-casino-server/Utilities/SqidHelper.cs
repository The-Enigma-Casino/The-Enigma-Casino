using Sqids;

namespace the_enigma_casino_server.Utilities
{
    public static class SqidHelper
    {
        private static readonly SqidsEncoder<int> _encoder = new SqidsEncoder<int>(new SqidsOptions
        {
            MinLength = 6
        });

        public static string Encode(int id)
        {
            return _encoder.Encode(id);
        }

        public static int Decode(string encodedId)
        {
            var decoded = _encoder.Decode(encodedId);
            if (decoded.Count == 0)
                throw new ArgumentException("El ID codificado es inválido.");
            return decoded[0];
        }
    }
}
