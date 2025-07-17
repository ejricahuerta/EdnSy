using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace account.API.Authentication
{
    public class ApiKeyAuthenticationSchemeOptions : AuthenticationSchemeOptions
    {
        public const string DefaultScheme = "ApiKey";
        public string ApiKeyHeaderName { get; set; } = "X-API-Key";
    }

    public class ApiKeyAuthenticationHandler : AuthenticationHandler<ApiKeyAuthenticationSchemeOptions>
    {
        private readonly IConfiguration _configuration;

        public ApiKeyAuthenticationHandler(
            IOptionsMonitor<ApiKeyAuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock,
            IConfiguration configuration)
            : base(options, logger, encoder, clock)
        {
            _configuration = configuration;
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.ContainsKey(Options.ApiKeyHeaderName))
            {
                return Task.FromResult(AuthenticateResult.Fail("API Key not found."));
            }

            var providedApiKey = Request.Headers[Options.ApiKeyHeaderName].ToString();
            var validApiKey = _configuration["N8nApiKey"];

            if (string.IsNullOrEmpty(validApiKey) || providedApiKey != validApiKey)
            {
                return Task.FromResult(AuthenticateResult.Fail("Invalid API Key."));
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, "n8n-service"),
                new Claim(ClaimTypes.Role, "n8n")
            };

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
} 