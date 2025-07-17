using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using account.API.Models;
using System;
using System.Linq;

namespace account.API
{
    public class SupabaseRestService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private readonly string _apiKey;

        public SupabaseRestService(IConfiguration configuration)
        {
            _baseUrl = configuration["Supabase:RestUrl"]?.TrimEnd('/') ?? "";
            _apiKey = configuration["Supabase:ApiKey"] ?? "";
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("apikey", _apiKey);
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }

        public async Task<List<UserExternalAccount>> GetUserExternalAccountsAsync()
        {
            var url = $"{_baseUrl}/user_external_accounts?select=*";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var accounts = JsonSerializer.Deserialize<List<UserExternalAccount>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return accounts ?? new List<UserExternalAccount>();
        }

        public async Task<List<UserExternalAccount>> InsertUserExternalAccountAsync(UserExternalAccount account)
        {
            var url = $"{_baseUrl}/user_external_accounts";
            var json = JsonSerializer.Serialize(account);
            Console.WriteLine($"[SupabaseRestService] Request body: {json}");
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            // Use HttpRequestMessage to add the Prefer header
            var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = content
            };
            request.Headers.Add("Prefer", "return=representation");

            var response = await _httpClient.SendAsync(request);
            var responseJson = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"[SupabaseRestService] Response: {responseJson}");
            response.EnsureSuccessStatusCode();
            var created = JsonSerializer.Deserialize<List<UserExternalAccount>>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return created ?? new List<UserExternalAccount>();
        }

        public async Task<List<UserExternalAccount>> UpdateUserExternalAccountAsync(Guid id, UserExternalAccount account)
        {
            var url = $"{_baseUrl}/user_external_accounts?id=eq.{id}";
            var json = JsonSerializer.Serialize(account);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            var method = new HttpMethod("PATCH");
            var request = new HttpRequestMessage(method, url) { Content = content };
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var responseJson = await response.Content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(responseJson))
            {
                // No content to deserialize, treat as success
                return new List<UserExternalAccount>();
            }
            var updated = JsonSerializer.Deserialize<List<UserExternalAccount>>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return updated ?? new List<UserExternalAccount>();
        }

        public async Task<bool> DeleteUserExternalAccountAsync(Guid id)
        {
            var url = $"{_baseUrl}/user_external_accounts?id=eq.{id}";
            var response = await _httpClient.DeleteAsync(url);
            response.EnsureSuccessStatusCode();
            return response.IsSuccessStatusCode;
        }

        public async Task<List<UserExternalAccount>> GetUserExternalAccountsByUserIdAsync(Guid userId)
        {
            var url = $"{_baseUrl}/user_external_accounts?user_id=eq.{userId}&select=*";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var accounts = JsonSerializer.Deserialize<List<UserExternalAccount>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return accounts ?? new List<UserExternalAccount>();
        }

        public async Task<List<Organization>> GetOrganizationsAsync()
        {
            var url = $"{_baseUrl}/organizations?select=*";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var organizations = JsonSerializer.Deserialize<List<Organization>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return organizations ?? new List<Organization>();
        }

        public async Task<List<Organization>> InsertOrganizationAsync(Organization organization)
        {
            var url = $"{_baseUrl}/organizations";
            var json = JsonSerializer.Serialize(organization);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            response.EnsureSuccessStatusCode();
            var responseJson = await response.Content.ReadAsStringAsync();
            var created = JsonSerializer.Deserialize<List<Organization>>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return created ?? new List<Organization>();
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            var url = $"{_baseUrl}/users?id=eq.{userId}&select=*";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var users = JsonSerializer.Deserialize<List<User>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return users?.FirstOrDefault();
        }
    }
}