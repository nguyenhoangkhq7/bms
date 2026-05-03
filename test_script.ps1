$suffix = (Get-Date -Format "yyyyMMddHHmmss")
$body = @{
    username = "mob$suffix"
    fullName = "Mobile User"
    email = "mob$suffix@example.com"
    password = "Password123!"
    phoneNumber = "0912345678"
    streetAddress = "12 Nguyen Trai"
    ward = "Ward 1"
    district = "District 1"
    cityProvince = "HCM"
    dateOfBirth = "2000-01-01"
} | ConvertTo-Json

try {
    $reg = Invoke-WebRequest -Uri "http://localhost/api/v1/identity/auth/register" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    $regData = $reg.Content | ConvertFrom-Json
    Write-Host "REGISTER: PASS ($($reg.StatusCode))"
    $token = $regData.accessToken
    $headers = @{ Authorization = "Bearer $token" }

    try { $p = Invoke-WebRequest -Uri "http://localhost/api/v1/identity/profile" -Method Get -Headers $headers -ErrorAction Stop; Write-Host "GET PROFILE: PASS ($($p.StatusCode))" } catch { Write-Host "GET PROFILE: FAIL" }

    try {
        $pb = @{ fullName="Updated Name"; phoneNumber="0987654321" } | ConvertTo-Json
        $p = Invoke-WebRequest -Uri "http://localhost/api/v1/identity/profile" -Method Put -Headers $headers -Body $pb -ContentType "application/json" -ErrorAction Stop
        Write-Host "PUT PROFILE: PASS ($($p.StatusCode))"
    } catch { Write-Host "PUT PROFILE: FAIL" }

    try {
        $ab = @{ streetAddress="123 New St"; ward="Ward 2"; district="District 2"; cityProvince="Hanoi" } | ConvertTo-Json
        $p = Invoke-WebRequest -Uri "http://localhost/api/v1/identity/profile/address" -Method Put -Headers $headers -Body $ab -ContentType "application/json" -ErrorAction Stop
        Write-Host "PUT ADDRESS: PASS ($($p.StatusCode))"
    } catch { Write-Host "PUT ADDRESS: FAIL" }

    try { $p = Invoke-WebRequest -Uri "http://localhost/api/v1/identity/profile/avatar" -Method Delete -Headers $headers -ErrorAction Stop; Write-Host "DELETE AVATAR: PASS ($($p.StatusCode))" } catch { Write-Host "DELETE AVATAR: FAIL" }

} catch {
    Write-Host "REGISTER: FAIL"
}
