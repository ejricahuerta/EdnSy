using System;
using System.Text.Json.Serialization;

namespace account.API.Models
{
    public class UserExternalAccount
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("user_id")]
        public Guid UserId { get; set; }

        [JsonPropertyName("provider")]
        public string Provider { get; set; } = string.Empty;

        [JsonPropertyName("provider_user_id")]
        public string ProviderUserId { get; set; } = string.Empty;

        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; } = string.Empty;

        [JsonPropertyName("expires_at")]
        public DateTime? ExpiresAt { get; set; }

        [JsonPropertyName("linked_at")]
        public DateTime LinkedAt { get; set; }
    }
} 