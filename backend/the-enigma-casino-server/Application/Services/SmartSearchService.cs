using F23.StringSimilarity.Interfaces;
using F23.StringSimilarity;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Application.Services;

public class SmartSearchService
{
    private readonly INormalizedStringSimilarity _stringSimilarityComparer;

    private const double THRESHOLD = 0.75;

    public SmartSearchService()
    {
        _stringSimilarityComparer = new JaroWinkler();
    }

    public IEnumerable<string> Search(string query, List<string> data)
    {
        IEnumerable<string> result;

        if (string.IsNullOrWhiteSpace(query))
        {
            result = null;
        }
        else
        {
            string[] queryKeys = GetKeys(TextCleaner.Clear(query));
            List<string> matches = new List<string>();

            foreach (string item in data)
            {
                string[] itemKeys = GetKeys(TextCleaner.Clear(item));

                if (IsMatch(queryKeys, itemKeys))
                {
                    matches.Add(item);
                }
            }

            result = matches;
        }

        return result;
    }

    private bool IsMatch(string[] queryKeys, string[] itemKeys)
    {
        bool isMatch = false;

        for (int i = 0; !isMatch && i < itemKeys.Length; i++)
        {
            string itemKey = itemKeys[i];

            for (int j = 0; !isMatch && j < queryKeys.Length; j++)
            {
                string queryKey = queryKeys[j];

                isMatch = IsMatch(itemKey, queryKey);
            }
        }

        return isMatch;
    }

    private bool IsMatch(string itemKey, string queryKey)
    {
        return itemKey == queryKey
            || itemKey.Contains(queryKey)
            || _stringSimilarityComparer.Similarity(itemKey, queryKey) >= THRESHOLD;
    }

    private string[] GetKeys(string query)
    {
        return query.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }
}
