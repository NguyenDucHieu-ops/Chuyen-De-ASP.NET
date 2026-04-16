using System.Net;
using System.Security.Cryptography;
using System.Text;

public class VnPayLibrary
{
    private readonly SortedList<string, string> _requestData = new SortedList<string, string>();
    private readonly SortedList<string, string> _responseData = new SortedList<string, string>();

    public void AddRequestData(string key, string value) => _requestData.Add(key, value);
    public void AddResponseData(string key, string value) => _responseData.Add(key, value);
    public string GetResponseData(string key) => _responseData.TryGetValue(key, out var val) ? val : string.Empty;

    public string CreateRequestUrl(string baseUrl, string vnp_HashSecret)
    {
        StringBuilder data = new StringBuilder();
        foreach (var kv in _requestData)
        {
            if (!string.IsNullOrEmpty(kv.Value))
            {
                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }
        }
        string queryString = data.ToString();
        baseUrl += "?" + queryString;
        string signData = queryString.Remove(queryString.Length - 1);
        string vnp_SecureHash = HmacSHA512(vnp_HashSecret, signData);
        baseUrl += "vnp_SecureHash=" + vnp_SecureHash;
        return baseUrl;
    }

    public bool ValidateSignature(string inputHash, string secretKey)
    {
        StringBuilder data = new StringBuilder();
        foreach (var kv in _responseData)
        {
            if (!string.IsNullOrEmpty(kv.Value) && kv.Key != "vnp_SecureHash")
            {
                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }
        }
        string signData = data.ToString().Remove(data.ToString().Length - 1);
        string checkSum = HmacSHA512(secretKey, signData);
        return checkSum.Equals(inputHash, StringComparison.InvariantCultureIgnoreCase);
    }

    private string HmacSHA512(string key, string inputData)
    {
        var hash = new StringBuilder();
        byte[] keyBytes = Encoding.UTF8.GetBytes(key);
        byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
        using (var hmac = new HMACSHA512(keyBytes))
        {
            byte[] hashValue = hmac.ComputeHash(inputBytes);
            foreach (var theByte in hashValue) hash.Append(theByte.ToString("x2"));
        }
        return hash.ToString();
    }
}