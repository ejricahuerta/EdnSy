using System;
using System.Text.Json.Serialization;

namespace account.API.Models
{
    public class OAuthCallbackRequest
    {
        public string Code { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string? Error { get; set; }
    }

    public class OAuthTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; }

        [JsonPropertyName("scope")]
        public string Scope { get; set; }

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; }

        // Not from Google, set manually
        public DateTime? ExpiresAt { get; set; }
    }

    public class OAuthUrlRequest
    {
        public string Provider { get; set; } = string.Empty;
        public string RedirectUri { get; set; } = string.Empty;
    }

    public class GoogleUserInfo
    {
        [JsonPropertyName("sub")]
        public string Sub { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("picture")]
        public string Picture { get; set; }
    }
} 