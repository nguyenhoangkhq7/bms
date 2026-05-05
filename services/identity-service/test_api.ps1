$registrationUrl = "http://localhost/api/v1/identity/auth/register"
$profileUrl = "http://localhost/api/v1/identity/users/profile"
$addressUrl = "http://localhost/api/v1/identity/users/profile/address"
$avatarUrl = "http://localhost/api/v1/identity/users/profile/avatar"

$uniqueId = [Guid]::NewGuid().ToString().Substring(0,8)
$username = "user_$uniqueId"
$email = "user_$uniqueId@example.com"
$password = "Password123!"

$registerBody = @{
    username = $username
    email    = $email
    password = $password
    fullName = "Test User"
} | ConvertTo-Json

Write-Host "Starting Validation..."

try {
    $regResponse = Invoke-RestMethod -Uri $registrationUrl -Method Post -Body $registerBody -ContentType "application/json"
    $token = $regResponse.accessToken
    if (-not $token) { $token = $regResponse.data.accessToken }
    
    if ($token) {
        Write-Host "Step 1: Register - PASS"
    } else {
        Write-Host "Step 1: Register - FAIL - Token not found."
        exit
    }
    
    $headers = @{ Authorization = "Bearer $token" }

    try {
        $null = Invoke-RestMethod -Uri $profileUrl -Method Get -Headers $headers
        Write-Host "Step 3: GET Profile - PASS"
    } catch {
        Write-Host "Step 3: GET Profile - FAIL - $($_.Exception.Message)"
    }

    $updateBody = @{
        fullName = "Updated Name"
        dateOfBirth = "2000-01-01"
    } | ConvertTo-Json
    try {
        $updatedProfile = Invoke-RestMethod -Uri $profileUrl -Method Put -Headers $headers -Body $updateBody -ContentType "application/json"
        Write-Host "Step 4: PUT Profile - PASS"
    } catch {
        Write-Host "Step 4: PUT Profile - FAIL - $($_.Exception.Message)"
    }

    $addressBody = @{
        street = "123 Main St"
        city = "New York"
        country = "USA"
    } | ConvertTo-Json
    try {
        $null = Invoke-RestMethod -Uri $addressUrl -Method Put -Headers $headers -Body $addressBody -ContentType "application/json"
        Write-Host "Step 5: PUT Address - PASS"
    } catch {
        Write-Host "Step 5: PUT Address - FAIL - $($_.Exception.Message)"
    }

    try {
        $resp = Invoke-WebRequest -Uri $avatarUrl -Method Delete -Headers $headers
        Write-Host "Step 6: DELETE Avatar - PASS"
    } catch {
        Write-Host "Step 6: DELETE Avatar - FAIL - $($_.Exception.Message)"
    }

} catch {
    Write-Host "Step 1: Register - FAIL - $($_.Exception.Message)"
    if ($_.ErrorDetails) { Write-Host "Response: $($_.ErrorDetails.Message)" }
}
