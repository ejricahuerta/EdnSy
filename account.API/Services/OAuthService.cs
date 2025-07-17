using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using account.API.Models;
using System.Threading.Tasks;
using System;
using System.Collections.Generic; // Added for Dictionary
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace account.API.Services
{
    public class OAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private const string GoogleRedirectUri = "http://localhost:5173/oauth-callback";

        public OAuthService(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        public string GenerateGoogleOAuthUrl(string userId)
        {
            var clientId = _configuration["OAuth:Google:ClientId"];
            var scope = "openid email profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/gmail.readonly";
            return $"https://accounts.google.com/o/oauth2/v2/auth?client_id={clientId}&redirect_uri={Uri.EscapeDataString(GoogleRedirectUri)}&scope={Uri.EscapeDataString(scope)}&response_type=code&state={userId}&access_type=offline&prompt=consent";
        }

        public string GenerateSlackOAuthUrl(string userId, string redirectUri)
        {
            var clientId = _configuration["OAuth:Slack:ClientId"];
            var scope = "chat:write,channels:read,groups:read,im:read,mpim:read";
            return $"https://slack.com/oauth/v2/authorize?client_id={clientId}&redirect_uri={Uri.EscapeDataString(redirectUri)}&scope={Uri.EscapeDataString(scope)}&state={userId}";
        }

        public async Task<OAuthTokenResponse?> ExchangeGoogleCodeForTokens(string code)
        {
            var clientId = _configuration["OAuth:Google:ClientId"];
            var clientSecret = _configuration["OAuth:Google:ClientSecret"];
            Console.WriteLine($"[OAuthService] Exchanging code for tokens. clientId: {clientId}, redirectUri: {GoogleRedirectUri}");

            var values = new Dictionary<string, string>
            {
                { "client_id", clientId },
                { "client_secret", clientSecret },
                { "code", code },
                { "grant_type", "authorization_code" },
                { "redirect_uri", GoogleRedirectUri }
            };

            try
            {
                var content = new FormUrlEncodedContent(values);
                var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", content);
                var responseJson = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"[OAuthService] Google token exchange response: {responseJson}");

                if (!response.IsSuccessStatusCode)
                {
                    // Log the error and return null
                    Console.WriteLine($"[OAuthService] Google token exchange failed: {response.StatusCode}");
                    return null;
                }

                var tokenResponse = JsonSerializer.Deserialize<OAuthTokenResponse>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (tokenResponse != null && !string.IsNullOrEmpty(tokenResponse.AccessToken))
                {
                    tokenResponse.ExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn);
                    return tokenResponse;
                }
                else
                {
                    Console.WriteLine("[OAuthService] Token response is null or missing access token.");
                    return null;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OAuthService] Exception during token exchange: {ex.Message}");
                return null;
            }
        }

        public async Task<OAuthTokenResponse> ExchangeSlackCodeForTokens(string code, string redirectUri)
        {
            var clientId = _configuration["OAuth:Slack:ClientId"];
            var clientSecret = _configuration["OAuth:Slack:ClientSecret"];
            var tokenRequest = new
            {
                client_id = clientId,
                client_secret = clientSecret,
                code = code,
                redirect_uri = redirectUri
            };
            var json = JsonSerializer.Serialize(tokenRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("https://slack.com/api/oauth.v2.access", content);
            response.EnsureSuccessStatusCode();
            var responseJson = await response.Content.ReadAsStringAsync();
            var slackResponse = JsonSerializer.Deserialize<SlackOAuthResponse>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return new OAuthTokenResponse
            {
                AccessToken = slackResponse?.AccessToken ?? "",
                RefreshToken = "", // Slack doesn't provide refresh tokens
                ExpiresIn = 0,
                TokenType = "Bearer",
                ExpiresAt = null
            };
        }

        public async Task<GoogleUserInfo?> GetGoogleUserInfoAsync(string accessToken)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v3/userinfo");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            try
            {
                var response = await _httpClient.SendAsync(request);
                var responseJson = await response.Content.ReadAsStringAsync();
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[OAuthService] Failed to fetch Google user info: {response.StatusCode} {responseJson}");
                    return null;
                }
                var userInfo = JsonSerializer.Deserialize<GoogleUserInfo>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                return userInfo;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OAuthService] Exception fetching Google user info: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Refreshes the Google access token using the refresh token.
        /// </summary>
        public async Task<OAuthTokenResponse?> RefreshGoogleAccessTokenAsync(string refreshToken)
        {
            var clientId = _configuration["OAuth:Google:ClientId"];
            var clientSecret = _configuration["OAuth:Google:ClientSecret"];
            var values = new Dictionary<string, string>
            {
                { "client_id", clientId },
                { "client_secret", clientSecret },
                { "refresh_token", refreshToken },
                { "grant_type", "refresh_token" }
            };
            try
            {
                var content = new FormUrlEncodedContent(values);
                var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", content);
                var responseJson = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[OAuthService] Google token refresh response: {responseJson}");
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[OAuthService] Google token refresh failed: {response.StatusCode}");
                    return null;
                }
                var tokenResponse = JsonSerializer.Deserialize<OAuthTokenResponse>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (tokenResponse != null)
                {
                    tokenResponse.RefreshToken = refreshToken; // Google may not return refresh_token on refresh
                    tokenResponse.ExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn);
                }
                return tokenResponse;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OAuthService] Exception refreshing Google token: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Gets a valid Google access token, refreshing if expired or near expiry.
        /// </summary>
        public async Task<OAuthTokenResponse?> GetOrRefreshGoogleAccessTokenAsync(string accessToken, string refreshToken, DateTime? expiresAt)
        {
            // If token expires within 5 minutes, refresh
            if (!expiresAt.HasValue || expiresAt.Value <= DateTime.UtcNow.AddMinutes(5))
            {
                Console.WriteLine("[OAuthService] Access token expired or near expiry, refreshing...");
                return await RefreshGoogleAccessTokenAsync(refreshToken);
            }
            // Otherwise, return current token info
            return new OAuthTokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt
            };
        }

        public string GenerateJwtToken(Guid userId, string email, string name)
        {
            var key = Convert.FromBase64String(_configuration["Supabase:JwtSecret"]);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email ?? ""),
                new Claim("name", name ?? "")
            };

            var token = new JwtSecurityToken(
                issuer: "ednsy.com",
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class SlackOAuthResponse
    {
        public bool Ok { get; set; }
        public string AccessToken { get; set; } = string.Empty;
        public string TokenType { get; set; } = string.Empty;
        public string Scope { get; set; } = string.Empty;
        public string BotUserId { get; set; } = string.Empty;
        public string TeamId { get; set; } = string.Empty;
        public string TeamName { get; set; } = string.Empty;
    }
} 