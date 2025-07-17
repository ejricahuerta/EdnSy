using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using account.API.Models;
using account.API.Authentication;
using account.API.Services;
using System;
using account.API;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Convert.FromBase64String(builder.Configuration["Supabase:JwtSecret"])
        )
    };
})
.AddScheme<ApiKeyAuthenticationSchemeOptions, ApiKeyAuthenticationHandler>("ApiKey", _ => { });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("role", "admin"));
    options.AddPolicy("N8nOnly", policy =>
        policy.RequireClaim("role", "n8n"));
});

builder.Services.AddSingleton<SupabaseRestService>();
builder.Services.AddSingleton<OAuthService>();

// Register OpenAPI services for .NET 9 minimal API
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder
            .WithOrigins("http://localhost:5173", "https://n8n.ednsy.com", "https://ednsy.com")
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Map OpenAPI endpoints and Swagger UI in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowSpecificOrigin");
app.UseAuthentication();
app.UseAuthorization();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync("{\"error\":\"Internal server error\"}");
    });
});

// Health check endpoint (public)
app.MapGet("/health", () => "OK");

// Client endpoints (JWT protected)
app.MapGet("/user/external-accounts", async (SupabaseRestService supabaseRestService, HttpContext context) =>
{
    var userIdClaim = context.User.FindFirst("sub")?.Value;
    if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
    {
        return Results.Unauthorized();
    }
    var accounts = await supabaseRestService.GetUserExternalAccountsByUserIdAsync(userId);
    return Results.Ok(accounts);
}).RequireAuthorization();

app.MapPost("/user/connect/google", async (OAuthUrlRequest request, OAuthService oauthService) =>
{
    // Generate a random state for CSRF protection and to track the flow
    var state = Guid.NewGuid().ToString();
    var oauthUrl = oauthService.GenerateGoogleOAuthUrl(state);
    return Results.Ok(new { oauthUrl, state });
});

app.MapDelete("/user/external-accounts/{id:guid}", async (Guid id, SupabaseRestService supabaseRestService) =>
{
    var success = await supabaseRestService.DeleteUserExternalAccountAsync(id);
    return success ? Results.NoContent() : Results.NotFound();
}).RequireAuthorization();

// Organization endpoints (JWT protected)
app.MapGet("/organizations", async (SupabaseRestService supabaseRestService) =>
{
    var orgs = await supabaseRestService.GetOrganizationsAsync();
    return Results.Ok(orgs);
}).RequireAuthorization();

app.MapPost("/organizations", async (Organization org, SupabaseRestService supabaseRestService) =>
{
    // Input validation
    if (string.IsNullOrWhiteSpace(org.Name))
    {
        return Results.BadRequest(new { error = "Organization name is required." });
    }
    if (org.OwnerId == Guid.Empty)
    {
        return Results.BadRequest(new { error = "OwnerId is required and must be a valid GUID." });
    }
    if (org.CreatedAt == default)
    {
        return Results.BadRequest(new { error = "CreatedAt is required and must be a valid date/time." });
    }
    var created = await supabaseRestService.InsertOrganizationAsync(org);
    return Results.Ok(created);
}).RequireAuthorization();

// n8n endpoints (API Key protected)
app.MapGet("/api/client/{clientId:guid}/tokens", async (Guid clientId, SupabaseRestService supabaseRestService, OAuthService oauthService) =>
{
    var accounts = await supabaseRestService.GetUserExternalAccountsByUserIdAsync(clientId);
    var googleAccount = accounts.FirstOrDefault(a => a.Provider == "google");
    if (googleAccount == null)
    {
        return Results.NotFound(new { error = "No Google account found for this user." });
    }
    // Always return a valid access token (refresh if needed)
    var tokenResponse = await oauthService.GetOrRefreshGoogleAccessTokenAsync(
        googleAccount.AccessToken,
        googleAccount.RefreshToken,
        googleAccount.ExpiresAt
    );
    if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
    {
        return Results.BadRequest(new { error = "Failed to obtain valid Google access token." });
    }
    // If a new token was obtained, update the database
    if (tokenResponse.AccessToken != googleAccount.AccessToken)
    {
        googleAccount.AccessToken = tokenResponse.AccessToken;
        googleAccount.ExpiresAt = tokenResponse.ExpiresAt;
        // Google may not return a new refresh token on refresh
        if (!string.IsNullOrEmpty(tokenResponse.RefreshToken))
        {
            googleAccount.RefreshToken = tokenResponse.RefreshToken;
        }
        await supabaseRestService.UpdateUserExternalAccountAsync(googleAccount.Id, googleAccount);
    }
    Console.WriteLine($"[TokensEndpoint] Returning valid Google access token for user {clientId}");
    return Results.Ok(new {
        google = new {
            access_token = tokenResponse.AccessToken,
            expires_at = tokenResponse.ExpiresAt,
            refresh_token = tokenResponse.RefreshToken
        }
    });
});

app.MapPost("/oauth-callback", async (OAuthCallbackRequest request, OAuthService oauthService, SupabaseRestService supabaseRestService) =>
{
    Console.WriteLine($"[OAuthCallback] Received code: {request.Code}, state: {request.State}");
    // Validate required parameters
    if (string.IsNullOrEmpty(request.Code) || string.IsNullOrEmpty(request.State))
    {
        Console.WriteLine("[OAuthCallback] Missing code or state parameter");
        return Results.BadRequest(new { error = "Missing code or state parameter" });
    }

    try
    {
        // Exchange the authorization code for tokens
        var tokens = await oauthService.ExchangeGoogleCodeForTokens(request.Code);
        if (tokens == null || string.IsNullOrEmpty(tokens.AccessToken))
        {
            Console.WriteLine("[OAuthCallback] Failed to obtain Google tokens.");
            return Results.BadRequest(new { error = "Failed to obtain Google tokens." });
        }
        Console.WriteLine($"[OAuthCallback] Google tokens: {System.Text.Json.JsonSerializer.Serialize(tokens)}");

        // Fetch Google user info
        var userInfo = await oauthService.GetGoogleUserInfoAsync(tokens.AccessToken);
        if (userInfo == null || string.IsNullOrEmpty(userInfo.Email))
        {
            Console.WriteLine("[OAuthCallback] Failed to fetch Google user info.");
            return Results.BadRequest(new { error = "Failed to fetch Google user info." });
        }

        // The state parameter should contain the userId (as set when generating the OAuth URL)
        if (!Guid.TryParse(request.State, out var userId))
        {
            Console.WriteLine($"[OAuthCallback] Invalid state parameter: {request.State}");
            return Results.BadRequest(new { error = "Invalid state parameter." });
        }

        // Check if a Google account already exists for this user
        var existingAccounts = await supabaseRestService.GetUserExternalAccountsByUserIdAsync(userId);
        var googleAccount = existingAccounts.FirstOrDefault(a => a.Provider == "google");

        if (googleAccount != null)
        {
            // Update the existing record
            googleAccount.AccessToken = tokens.AccessToken;
            googleAccount.RefreshToken = tokens.RefreshToken;
            googleAccount.ExpiresAt = tokens.ExpiresAt;
            googleAccount.LinkedAt = DateTime.UtcNow;
            googleAccount.ProviderUserId = userInfo.Email; // Store email
            // Optionally store name if you have a field
            await supabaseRestService.UpdateUserExternalAccountAsync(googleAccount.Id, googleAccount);
        }
        else
        {
            // Insert new record
            var account = new UserExternalAccount
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Provider = "google",
                ProviderUserId = userInfo.Email, // Store email
                AccessToken = tokens.AccessToken,
                RefreshToken = tokens.RefreshToken,
                ExpiresAt = tokens.ExpiresAt,
                LinkedAt = DateTime.UtcNow
            };
            await supabaseRestService.InsertUserExternalAccountAsync(account);
        }

        Console.WriteLine("[OAuthCallback] Google account connected successfully");
        // Generate JWT and return it
        var email = userInfo.Email;
        var name = userInfo.Name ?? "";
        var jwt = oauthService.GenerateJwtToken(userId, email, name);
        Console.WriteLine($"[OAuthCallback] About to return JWT: {jwt}");
        return Results.Ok(new { message = "Google account connected successfully", jwt, email, name });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[OAuthCallback] Exception: {ex.Message}");
        Console.WriteLine(ex.StackTrace);
        Console.WriteLine(ex.InnerException?.Message);
        Console.WriteLine(ex.InnerException?.StackTrace);
        return Results.BadRequest(new { error = ex.Message });
    }
});

// POST /auth/login
app.MapPost("/auth/login", async (AuthRequest request, SupabaseRestService supabaseRestService, OAuthService oauthService) =>
{
    // Minimal input validation for MVP
    if (string.IsNullOrWhiteSpace(request.Provider) ||
        string.IsNullOrWhiteSpace(request.Code) ||
        string.IsNullOrWhiteSpace(request.State))
    {
        return Results.BadRequest(new { error = "Missing required fields." });
    }
    // For now, only support Google login
    if (request.Provider == "google" && !string.IsNullOrEmpty(request.Code))
    {
        var tokens = await oauthService.ExchangeGoogleCodeForTokens(request.Code);
        if (tokens == null || string.IsNullOrEmpty(tokens.AccessToken))
        {
            return Results.BadRequest(new { error = "Failed to obtain Google tokens." });
        }
        // Fetch Google user info
        var userInfo = await oauthService.GetGoogleUserInfoAsync(tokens.AccessToken);
        if (userInfo == null || string.IsNullOrEmpty(userInfo.Email))
        {
            return Results.BadRequest(new { error = "Failed to fetch Google user info." });
        }
        // For now, use state as userId
        if (!Guid.TryParse(request.State, out var userId))
        {
            return Results.BadRequest(new { error = "Invalid state parameter." });
        }
        var accounts = await supabaseRestService.GetUserExternalAccountsByUserIdAsync(userId);
        var googleAccount = accounts.FirstOrDefault(a => a.Provider == "google");
        if (googleAccount == null)
        {
            return Results.BadRequest(new { error = "No Google account found. Please sign up first." });
        }
        // Update ProviderUserId if needed
        if (googleAccount.ProviderUserId != userInfo.Email)
        {
            googleAccount.ProviderUserId = userInfo.Email;
            await supabaseRestService.UpdateUserExternalAccountAsync(googleAccount.Id, googleAccount);
        }
        var email = userInfo.Email;
        var name = userInfo.Name ?? "";
        var jwt = oauthService.GenerateJwtToken(userId, email, name);
        return Results.Ok(new { message = "Login successful", jwt, email, name });
    }
    // TODO: Add email/password logic
    return Results.BadRequest(new { error = "Unsupported login method." });
});

// POST /auth/signup
app.MapPost("/auth/signup", async (AuthRequest request, SupabaseRestService supabaseRestService, OAuthService oauthService) =>
{
    // Minimal input validation for MVP
    if (string.IsNullOrWhiteSpace(request.Provider) ||
        string.IsNullOrWhiteSpace(request.Code) ||
        string.IsNullOrWhiteSpace(request.State))
    {
        return Results.BadRequest(new { error = "Missing required fields." });
    }
    // For now, only support Google signup
    if (request.Provider == "google" && !string.IsNullOrEmpty(request.Code))
    {
        var tokens = await oauthService.ExchangeGoogleCodeForTokens(request.Code);
        if (tokens == null || string.IsNullOrEmpty(tokens.AccessToken))
        {
            return Results.BadRequest(new { error = "Failed to obtain Google tokens." });
        }
        // Fetch Google user info
        var userInfo = await oauthService.GetGoogleUserInfoAsync(tokens.AccessToken);
        if (userInfo == null || string.IsNullOrEmpty(userInfo.Email))
        {
            return Results.BadRequest(new { error = "Failed to fetch Google user info." });
        }
        // For now, use state as userId
        if (!Guid.TryParse(request.State, out var userId))
        {
            return Results.BadRequest(new { error = "Invalid state parameter." });
        }
        var accounts = await supabaseRestService.GetUserExternalAccountsByUserIdAsync(userId);
        var googleAccount = accounts.FirstOrDefault(a => a.Provider == "google");
        if (googleAccount != null)
        {
            return Results.BadRequest(new { error = "Account already exists. Please log in." });
        }
        // Create new account
        var account = new UserExternalAccount
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Provider = "google",
            ProviderUserId = userInfo.Email, // Store email
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken,
            ExpiresAt = tokens.ExpiresAt,
            LinkedAt = DateTime.UtcNow
        };
        await supabaseRestService.InsertUserExternalAccountAsync(account);
        var email = userInfo.Email;
        var name = userInfo.Name ?? "";
        var jwt = oauthService.GenerateJwtToken(userId, email, name);
        return Results.Ok(new { message = "Signup successful", jwt, email, name });
    }
    // TODO: Add email/password logic
    return Results.BadRequest(new { error = "Unsupported signup method." });
});

// User profile endpoint (JWT protected)
app.MapGet("/user/profile", async (SupabaseRestService supabaseRestService, HttpContext context) =>
{
    var userIdClaim = context.User.FindFirst("sub")?.Value;
    if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
    {
        return Results.Unauthorized();
    }
    var user = await supabaseRestService.GetUserByIdAsync(userId);
    if (user == null)
        return Results.NotFound();
    return Results.Ok(new { id = user.Id, email = user.Email, name = user.Name });
}).RequireAuthorization();


app.Run();

// Define the request model for the callback if not already present
public class OAuthCallbackRequest
{
    public string Code { get; set; }
    public string State { get; set; }
    public string Error { get; set; }
}

// Add AuthRequest model
public class AuthRequest
{
    public string Provider { get; set; }
    public string Code { get; set; }
    public string State { get; set; }
    public string Email { get; set; } // For future email/password
    public string Password { get; set; } // For future email/password
}

