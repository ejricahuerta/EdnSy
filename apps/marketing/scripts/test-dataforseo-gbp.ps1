# Test DataForSEO my_business_info (GBP) API using app env vars
# Usage: from repo root, run: pwsh -File apps/marketing/scripts/test-dataforseo-gbp.ps1
# Or: cd apps/marketing && pwsh -File scripts/test-dataforseo-gbp.ps1 (keys path is ../../.keys.json)

$EnvPath = Join-Path $PSScriptRoot '../.env.local'

$login = $env:DATAFORSEO_LOGIN
$password = $env:DATAFORSEO_PASSWORD

if ((-not $login) -or (-not $password)) {
	if (Test-Path $EnvPath) {
		$envLines = Get-Content $EnvPath -ErrorAction SilentlyContinue
		foreach ($line in $envLines) {
			if ($line -match '^\s*#') { continue }
			if ($line -match '^\s*DATAFORSEO_LOGIN\s*=\s*(.+)\s*$') { $login = $matches[1].Trim('"').Trim("'"); continue }
			if ($line -match '^\s*DATAFORSEO_PASSWORD\s*=\s*(.+)\s*$') { $password = $matches[1].Trim('"').Trim("'"); continue }
		}
	}
}

$KeysPath = Join-Path $PSScriptRoot '../../../.keys.json'
if (-not (Test-Path $KeysPath)) {
	$KeysPath = Join-Path (Get-Location) '.keys.json'
}
if ((-not $login) -or (-not $password)) {
	if (-not (Test-Path $KeysPath)) {
		Write-Error "Missing DataForSEO credentials. Set DATAFORSEO_LOGIN/PASSWORD in apps/marketing/.env.local (or env), or add dataforseo.login/password to .keys.json."
		exit 1
	}
	$keys = Get-Content -Raw $KeysPath | ConvertFrom-Json
	$login = $keys.dataforseo.login
	$password = $keys.dataforseo.password
}

if ((-not $login) -or (-not $password)) {
	Write-Error "Missing DataForSEO credentials. Set DATAFORSEO_LOGIN/PASSWORD in apps/marketing/.env.local (or env), or add dataforseo.login/password to .keys.json."
	exit 1
}

$pair = "${login}:${password}"
$bytes = [Text.Encoding]::UTF8.GetBytes($pair)
$base64 = [Convert]::ToBase64String($bytes)
$headers = @{
	Authorization = "Basic $base64"
	'Content-Type' = 'application/json'
}
$body = '[{"keyword":"Taylor Tire","location_name":"Toronto,Ontario,Canada","language_code":"en"}]'

Write-Host "POST task_post (Taylor Tire, Toronto,Ontario,Canada)..."
$post = Invoke-RestMethod -Uri 'https://api.dataforseo.com/v3/business_data/google/my_business_info/task_post' -Method Post -Headers $headers -Body $body
$post | ConvertTo-Json -Depth 5

$taskId = $post.tasks[0].id
if (-not $taskId) {
	Write-Host "No task id in response."
	exit 1
}

Write-Host "`nPolling task_get/$taskId (every 3s, max 60s)..."
$deadline = (Get-Date).AddSeconds(60)
do {
	Start-Sleep -Seconds 3
	$get = Invoke-RestMethod -Uri "https://api.dataforseo.com/v3/business_data/google/my_business_info/task_get/$taskId" -Method Get -Headers $headers
	$status = $get.tasks[0].status_code
	Write-Host "  status_code: $status"
	if ($status -eq 20000) {
		Write-Host "`nResult:"
		$get | ConvertTo-Json -Depth 10
		exit 0
	}
} while ((Get-Date) -lt $deadline)

Write-Host "Timeout waiting for result."
exit 1
