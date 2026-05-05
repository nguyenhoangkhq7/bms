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
    Write-Host "REGISTER: PASS"
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $text = $reader.ReadToEnd()
    Write-Host "REGISTER: FAIL"
    Write-Host "Response: $text"
}
