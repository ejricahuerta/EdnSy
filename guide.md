# Business App Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Design](#architecture-design)
3. [Frontend (Svelte)](#frontend-svelte)
4. [Backend (.NET API)](#backend-net-api)
5. [Authentication & Authorization](#authentication--authorization)
6. [Google OAuth2 Integration](#google-oauth2-integration)
7. [Stripe Billing Integration](#stripe-billing-integration)
8. [Database Design](#database-design)
9. [Security Considerations](#security-considerations)
10. [Deployment Guide](#deployment-guide)
11. [Testing Strategy](#testing-strategy)
12. [API Reference](#api-reference)

## Overview

This documentation outlines the architecture for a business application built with:
- **Frontend**: Svelte 4+ with SvelteKit
- **Backend**: .NET 8+ API with Entity Framework Core
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth2
- **Payments**: Stripe Customer Portal
- **External Integrations**: Google APIs (Calendar, Sheets, Drive) via N8N

### Key Features
- Google OAuth2 authentication
- Stripe billing portal integration
- Google API token management for external integrations
- Secure token storage and refresh mechanisms
- Clean separation of concerns

## Architecture Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌──────────────────────────────────────┐ │
│  │   Svelte App    │    │         External Apps                │ │
│  │   (Frontend)    │    │         (N8N, etc.)                 │ │
│  └─────────────────┘    └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              .NET 8 API                                     │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │ │
│  │  │Controllers  │ │  Services   │ │      Middleware         │ │ │
│  │  │             │ │             │ │  - Authentication       │ │ │
│  │  │- Auth       │ │- Google     │ │  - Authorization        │ │ │
│  │  │- Billing    │ │- Stripe     │ │  - CORS                 │ │ │
│  │  │- Integration│ │- Token      │ │  - Rate Limiting        │ │ │
│  │  └─────────────┘ │- User       │ └─────────────────────────┘ │ │
│  │                  └─────────────┘                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Entity Framework Core
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  Supabase (PostgreSQL)                     │ │
│  │                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │ │
│  │  │   Users     │ │GoogleTokens │ │      Audit Logs         │ │ │
│  │  │             │ │             │ │                         │ │ │
│  │  │- Id         │ │- UserId     │ │- Id                     │ │ │
│  │  │- Email      │ │- AccessToken│ │- UserId                 │ │ │
│  │  │- Name       │ │- RefreshToken│ │- Action                │ │ │
│  │  │- GoogleId   │ │- ExpiresAt  │ │- Timestamp              │ │ │
│  │  │- StripeId   │ │- Scopes     │ │- Details                │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ External APIs
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐ │
│  │  Google APIs    │ │    Stripe       │ │     N8N             │ │
│  │                 │ │                 │ │                     │ │
│  │- OAuth2         │ │- Customer Portal│ │- Workflow           │ │
│  │- Calendar       │ │- Billing        │ │- Automation         │ │
│  │- Sheets         │ │- Invoices       │ │- Token Consumption  │ │
│  │- Drive          │ │- Subscriptions  │ │                     │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend (Svelte)

### Project Structure
```
src/
├── lib/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── GoogleLoginButton.svelte
│   │   │   └── LoginForm.svelte
│   │   ├── billing/
│   │   │   └── BillingButton.svelte
│   │   └── common/
│   │       ├── Header.svelte
│   │       └── Layout.svelte
│   ├── services/
│   │   ├── authService.js
│   │   ├── billingService.js
│   │   └── apiClient.js
│   └── stores/
│       ├── auth.js
│       ├── billing.js
│       └── user.js
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   ├── login/
│   │   └── +page.svelte
│   └── dashboard/
│       └── +page.svelte
└── app.html
```

### Key Dependencies
```json
{
  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "svelte": "^4.0.0",
    "vite": "^5.0.0"
  },
  "dependencies": {
    "@stripe/stripe-js": "^2.0.0"
  }
}
```

### Environment Variables
```env
# .env
PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
PUBLIC_API_BASE_URL=https://api.yourapp.com
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Backend (.NET API)

### Project Structure
```
YourApp.Api/
├── Controllers/
│   ├── AuthController.cs
│   ├── BillingController.cs
│   ├── IntegrationController.cs
│   └── UserController.cs
├── Models/
│   ├── User.cs
│   ├── GoogleToken.cs
│   └── DTOs/
│       ├── LoginRequest.cs
│       └── UserResponse.cs
├── Services/
│   ├── Interfaces/
│   │   ├── IAuthService.cs
│   │   ├── IGoogleTokenService.cs
│   │   └── IStripeService.cs
│   ├── AuthService.cs
│   ├── GoogleTokenService.cs
│   ├── StripeService.cs
│   └── UserService.cs
├── Data/
│   ├── ApplicationDbContext.cs
│   └── Repositories/
│       ├── IUserRepository.cs
│       └── UserRepository.cs
├── Middleware/
│   ├── AuthenticationMiddleware.cs
│   └── ExceptionMiddleware.cs
└── Program.cs
```

### Key Dependencies
```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.0" />
<PackageReference Include="Stripe.net" Version="43.0.0" />
<PackageReference Include="Google.Apis.Auth" Version="1.68.0" />
```

### Configuration
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.supabase.co;Database=postgres;Username=postgres;Password=your_password"
  },
  "Google": {
    "ClientId": "your_google_client_id",
    "ClientSecret": "your_google_client_secret"
  },
  "Stripe": {
    "PublishableKey": "pk_test_...",
    "SecretKey": "sk_test_..."
  },
  "Jwt": {
    "Key": "your_jwt_secret_key",
    "Issuer": "yourapp.com",
    "Audience": "yourapp.com"
  }
}
```

## Authentication & Authorization

### Google OAuth2 Flow

1. **Frontend**: User clicks "Login with Google"
2. **Google**: User authenticates and grants permissions
3. **Frontend**: Receives authorization code
4. **Backend**: Exchanges code for tokens
5. **Backend**: Validates Google token and creates/updates user
6. **Backend**: Returns JWT for API access

### JWT Implementation

```csharp
// Services/AuthService.cs
public class AuthService : IAuthService
{
    public string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"]
        };
        
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
```

## Google OAuth2 Integration

### Token Storage Model

```csharp
// Models/GoogleToken.cs
public class GoogleToken
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public User User { get; set; }
    
    [Required]
    public string AccessToken { get; set; }
    
    [Required]
    public string RefreshToken { get; set; }
    
    public DateTime ExpiresAt { get; set; }
    
    public string[] Scopes { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### Token Refresh Service

```csharp
// Services/GoogleTokenService.cs
public class GoogleTokenService : IGoogleTokenService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly IUserRepository _userRepository;
    
    public async Task<GoogleToken> RefreshTokenAsync(string userId)
    {
        var existingToken = await _userRepository.GetGoogleTokenAsync(userId);
        
        if (existingToken == null)
            throw new InvalidOperationException("No refresh token found");
        
        var request = new
        {
            client_id = _config["Google:ClientId"],
            client_secret = _config["Google:ClientSecret"],
            refresh_token = existingToken.RefreshToken,
            grant_type = "refresh_token"
        };
        
        var response = await _httpClient.PostAsJsonAsync(
            "https://oauth2.googleapis.com/token", request);
        
        if (!response.IsSuccessStatusCode)
            throw new Exception("Failed to refresh token");
        
        var result = await response.Content.ReadFromJsonAsync<GoogleTokenResponse>();
        
        existingToken.AccessToken = result.AccessToken;
        existingToken.ExpiresAt = DateTime.UtcNow.AddSeconds(result.ExpiresIn);
        existingToken.UpdatedAt = DateTime.UtcNow;
        
        await _userRepository.UpdateGoogleTokenAsync(existingToken);
        
        return existingToken;
    }
    
    public async Task<GoogleToken> GetValidTokenAsync(string userId)
    {
        var token = await _userRepository.GetGoogleTokenAsync(userId);
        
        if (token == null)
            throw new InvalidOperationException("No token found");
        
        // Check if token expires within 5 minutes
        if (token.ExpiresAt <= DateTime.UtcNow.AddMinutes(5))
        {
            token = await RefreshTokenAsync(userId);
        }
        
        return token;
    }
}
```

### N8N Integration Endpoint

```csharp
// Controllers/IntegrationController.cs
[ApiController]
[Route("api/[controller]")]
public class IntegrationController : ControllerBase
{
    private readonly IGoogleTokenService _tokenService;
    
    [HttpGet("google-token/{userId}")]
    [Authorize]
    public async Task<IActionResult> GetGoogleToken(string userId)
    {
        try
        {
            var token = await _tokenService.GetValidTokenAsync(userId);
            
            return Ok(new 
            { 
                access_token = token.AccessToken,
                expires_at = token.ExpiresAt.ToString("O"),
                scopes = token.Scopes
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
```

## Stripe Billing Integration

### Customer Portal Service

```csharp
// Services/StripeService.cs
public class StripeService : IStripeService
{
    public async Task<string> CreateBillingPortalSessionAsync(string customerId, string returnUrl)
    {
        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = customerId,
            ReturnUrl = returnUrl,
        };
        
        var service = new Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(options);
        
        return session.Url;
    }
    
    public async Task<string> CreateCustomerAsync(string email, string name)
    {
        var options = new CustomerCreateOptions
        {
            Email = email,
            Name = name,
        };
        
        var service = new CustomerService();
        var customer = await service.CreateAsync(options);
        
        return customer.Id;
    }
}
```

### Billing Controller

```csharp
// Controllers/BillingController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BillingController : ControllerBase
{
    private readonly IStripeService _stripeService;
    private readonly IUserService _userService;
    
    [HttpPost("portal")]
    public async Task<IActionResult> CreateBillingPortal()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _userService.GetByIdAsync(userId);
        
        if (string.IsNullOrEmpty(user.StripeCustomerId))
        {
            return BadRequest(new { error = "No billing account found" });
        }
        
        var returnUrl = $"{Request.Scheme}://{Request.Host}/dashboard";
        var portalUrl = await _stripeService.CreateBillingPortalSessionAsync(
            user.StripeCustomerId, 
            returnUrl
        );
        
        return Ok(new { url = portalUrl });
    }
}
```

## Database Design

### Entity Framework Configuration

```csharp
// Data/ApplicationDbContext.cs
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<User> Users { get; set; }
    public DbSet<GoogleToken> GoogleTokens { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.GoogleId).IsUnique();
            entity.HasIndex(e => e.StripeCustomerId).IsUnique();
            
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.GoogleId).IsRequired().HasMaxLength(255);
        });
        
        modelBuilder.Entity<GoogleToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).IsUnique();
            
            entity.Property(e => e.AccessToken).IsRequired();
            entity.Property(e => e.RefreshToken).IsRequired();
            entity.Property(e => e.Scopes)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries));
            
            entity.HasOne(e => e.User)
                .WithOne()
                .HasForeignKey<GoogleToken>(e => e.UserId);
        });
    }
}
```

### Database Schema

```sql
-- Users table
CREATE TABLE "Users" (
    "Id" SERIAL PRIMARY KEY,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "Name" VARCHAR(255) NOT NULL,
    "GoogleId" VARCHAR(255) NOT NULL UNIQUE,
    "StripeCustomerId" VARCHAR(255) UNIQUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- GoogleTokens table
CREATE TABLE "GoogleTokens" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL UNIQUE REFERENCES "Users"("Id"),
    "AccessToken" TEXT NOT NULL,
    "RefreshToken" TEXT NOT NULL,
    "ExpiresAt" TIMESTAMP NOT NULL,
    "Scopes" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX "IX_Users_Email" ON "Users" ("Email");
CREATE INDEX "IX_Users_GoogleId" ON "Users" ("GoogleId");
CREATE INDEX "IX_GoogleTokens_UserId" ON "GoogleTokens" ("UserId");
```

## Security Considerations

### Authentication Security
- JWT tokens expire after 7 days
- Refresh tokens stored encrypted in database
- Rate limiting on authentication endpoints
- HTTPS required for all requests

### Token Security
- Google refresh tokens encrypted at rest
- Token refresh happens automatically before expiration
- Scoped permissions for Google APIs
- Audit logging for token access

### API Security
- CORS configured for specific origins
- Request validation and sanitization
- SQL injection prevention via Entity Framework
- Input validation on all endpoints

### Environment Security
```csharp
// Program.cs security configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("https://yourapp.com")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});
```

## Deployment Guide

### Prerequisites
- .NET 8 Runtime
- PostgreSQL (via Supabase)
- Node.js 18+ (for Svelte build)
- Docker (optional)

### Environment Setup

#### Backend (.NET API)
```bash
# Install dependencies
dotnet restore

# Run migrations
dotnet ef database update

# Run application
dotnet run --environment Production
```

#### Frontend (Svelte)
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "YourApp.Api.dll"]
```

### Production Configuration
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-supabase-host;Database=postgres;Username=postgres;Password=your-password;SSL Mode=Require"
  }
}
```

## Testing Strategy

### Unit Tests
```csharp
// Tests/Services/GoogleTokenServiceTests.cs
[Test]
public async Task RefreshTokenAsync_ValidRefreshToken_ReturnsNewToken()
{
    // Arrange
    var mockHttp = new Mock<HttpClient>();
    var service = new GoogleTokenService(mockHttp.Object, _config);
    
    // Act
    var result = await service.RefreshTokenAsync("user123");
    
    // Assert
    Assert.NotNull(result);
    Assert.True(result.ExpiresAt > DateTime.UtcNow);
}
```

### Integration Tests
```csharp
// Tests/Controllers/BillingControllerTests.cs
[Test]
public async Task CreateBillingPortal_AuthenticatedUser_ReturnsPortalUrl()
{
    // Arrange
    var client = _factory.CreateClient();
    client.DefaultRequestHeaders.Authorization = 
        new AuthenticationHeaderValue("Bearer", GetValidJwtToken());
    
    // Act
    var response = await client.PostAsync("/api/billing/portal", null);
    
    // Assert
    response.EnsureSuccessStatusCode();
    var content = await response.Content.ReadAsStringAsync();
    Assert.Contains("https://billing.stripe.com", content);
}
```

### Frontend Tests
```javascript
// src/lib/components/BillingButton.test.js
import { render, fireEvent } from '@testing-library/svelte';
import BillingButton from './BillingButton.svelte';

test('billing button calls service on click', async () => {
  const mockService = {
    openBillingPortal: jest.fn()
  };
  
  const { getByText } = render(BillingButton, {
    props: { billingService: mockService }
  });
  
  await fireEvent.click(getByText('View Billing & Invoices'));
  
  expect(mockService.openBillingPortal).toHaveBeenCalled();
});
```

## API Reference

### Authentication Endpoints

#### POST /api/auth/google-login
Authenticate user with Google OAuth2 token.

**Request:**
```json
{
  "token": "google_oauth_token"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Billing Endpoints

#### POST /api/billing/portal
Create Stripe billing portal session.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

### Integration Endpoints

#### GET /api/integration/google-token/{userId}
Get valid Google access token for external integrations.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "access_token": "ya29.a0...",
  "expires_at": "2024-01-01T12:00:00Z",
  "scopes": ["calendar", "sheets", "drive"]
}
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (development only)"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Monitoring and Logging

### Application Insights Configuration
```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry();

// Custom logging
builder.Services.AddLogging(loggingBuilder =>
{
    loggingBuilder.AddConsole();
    loggingBuilder.AddApplicationInsights();
});
```

### Health Checks
```csharp
builder.Services.AddHealthChecks()
    .AddDbContext<ApplicationDbContext>()
    .AddCheck("stripe", () => 
    {
        // Stripe API health check
        return HealthCheckResult.Healthy();
    });

app.MapHealthChecks("/health");
```

### Performance Monitoring
- Database query performance monitoring
- API endpoint response time tracking
- Token refresh success/failure rates
- Stripe billing portal access metrics

---

**Last Updated:** $(date)
**Version:** 1.0.0