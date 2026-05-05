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

try {
    # 1. Register
    $regResponse = Invoke-RestMethod -Uri $registrationUrl -Method Post -Body $registerBody -ContentType "application/json"
    $token = $regResponse.data.accessToken # Common for some APIs to wrap in 'data'
    if (-not $token) { $token = $regResponse.accessToken }
    
    if ($token) {
        Write-Host "Step 1: Register - PASS"
    } else {
        Write-Host "Step 1: Register - FAIL - Token not found in response"
        exit
    }
    
    $headers = @{ Authorization = "Bearer $token" }

    # 3. GET Profile
    try {
        $profileResp = Invoke-RestMethod -Uri $profileUrl -Method Get -Headers $headers
        Write-Host "Step 3: GET Profile - PASS"
    } catch {
        Write-Host "Step 3: GET Profile - FAIL - $($_.Exception.Message)"
        return
    }

    # 4. PUT Profile
    $updateBody = @{
        fullName = "Updated Name"
        dateOfBirth = "2000-01-01"
    } | ConvertTo-Json
    try {
        $updatedProfile = Invoke-RestMethod -Uri $profileUrl -Method Put -Headers $headers -Body $updateBody -ContentType "application/json"
        $data = $updatedProfile.data ? $updatedProfile.data : $updatedProfile
        if ($data.fullName -eq "Updated Name") {
            Write-Host "Step 4: PUT Profile - PASS"
        } else {
            Write-Host "Step 4: PUT Profile - FAIL - Name mismatch: $($data.fullName)"
        }
    } catch {
        Write-Host "Step 4: PUT Profile - FAIL - $($_.Exception.Message)"
    }

    # 5. PUT Address
    $addressBody = @{
        street = "123 Main St"
        city = "New York"
        country = "USA"
    } | ConvertTo-Json
    try {
        $updatedAddress = Invoke-RestMethod -Uri $addressUrl -Method Put -Headers $headers -Body $addressBody -ContentType "application/json"
        $addrData = $updatedAddress.data ? $updatedAddress.data : $updatedAddress
        # Check nested or flat
        if ($addrData.street -eq "123 Main St" -or $addrData.address.street -eq "123 Main St") {
            Write-Host "Step 5: PUT Address - PASS"
        } else {
            Write-Host "Step 5: PUT Address - FAIL - Address mismatch"
        }
    } catch {
        Write-Host "Step 5: PUT Address - FAIL - $($_.Exception.Message)"
    }

    # 6. DELETE Avatar
    try {
        $resp = Invoke-WebRequest -Uri $avatarUrl -Method Delete -Headers $headers
        if ($resp.StatusCode -eq 200) {
            Write-Host "Step 6: DELETE Avatar - PASS"
        } else {
             Write-Host "Step 6: DELETE Avatar - FAIL - Status $($resp.StatusCode)"
        }
    } catch {
        Write-Host "Step 6: DELETE Avatar - FAIL - $($_.Exception.Message)"
    }

} catch {
    Write-Host "Step 1: Register - FAIL - $($_.Exception.Message)"
}
