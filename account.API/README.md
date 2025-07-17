# Account.API Documentation

## Google OAuth2 Integration & Token Management

### Overview
This backend provides seamless Google OAuth2 authentication and token management for users. It ensures that Google access tokens are always valid by automatically refreshing them when needed. This is critical for integrations with Google APIs (Calendar, Drive, etc.) and external automation tools like N8N.

---

## API Endpoints

### 1. Get Valid Google Access Token

**Endpoint:**
```
GET /api/client/{clientId}/tokens
```
- **Purpose:** Returns a valid Google access token for the specified user. Automatically refreshes the token if expired or near expiry.
- **Authentication:** Protected by API key or other mechanism (see your deployment's requirements).

**Path Parameter:**
- `clientId` (GUID): The unique identifier of the user/client in your system.

**Request Example:**
```
GET /api/client/123e4567-e89b-12d3-a456-426614174000/tokens
Authorization: ApiKey {your_api_key}
```

**Success Response (200 OK):**
```json
{
  "google": {
    "access_token": "ya29.a0AfH6SMB...",
    "expires_at": "2024-07-17T12:34:56Z",
    "refresh_token": "1//0g..."
  }
}
```

**Error Responses:**
- `404 Not Found` — No Google account found for this user.
- `400 Bad Request` — Failed to obtain valid Google access token.

**Usage Notes:**
- Use the `access_token` for all Google API calls on behalf of the user.
- The endpoint will refresh the token if it is expired or about to expire (within 5 minutes).
- The `refresh_token` is included for completeness but should not be exposed to untrusted clients.
- This endpoint is ideal for N8N, backend services, or any trusted integration that needs a valid Google token.

---

## Google OAuth2 Flow (Summary)

1. **User Authentication:**
   - User authenticates via Google OAuth2 (handled by `/oauth-callback` and related endpoints).
   - Access and refresh tokens are securely stored in the database.

2. **Token Usage:**
   - When a Google API call is needed, call `/api/client/{clientId}/tokens` to get a valid access token.
   - The backend checks if the token is expired or near expiry and refreshes it if needed.
   - The database is updated with new tokens as required.

3. **Security:**
   - Refresh tokens are never exposed to the frontend or untrusted clients.
   - All sensitive endpoints are protected by authentication (API key, JWT, etc.).

---

## Best Practices
- Always use the backend to manage Google tokens; never handle refresh logic on the client.
- Protect all token-related endpoints with strong authentication.
- Regularly audit token access and refresh logs for security.

---

For more details on the full OAuth2 flow, user management, and other endpoints, see the rest of this documentation or contact the backend team. 