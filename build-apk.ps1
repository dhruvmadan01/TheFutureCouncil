$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\Dhruv Madan\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

$gradleBat = "C:\Users\Dhruv Madan\.gradle\wrapper\dists\gradle-8.13-bin\5xuhj0ry160q40clulazy9h7d\gradle-8.13\bin\gradle.bat"
if (-not (Test-Path $gradleBat)) {
    $gradleBat = "C:\Users\Dhruv Madan\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\bin\gradle.bat"
}

Write-Host "Using JAVA_HOME: $env:JAVA_HOME"
Write-Host "Using ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "Using Gradle: $gradleBat"

Set-Location -Path "android"
& $gradleBat assembleDebug --no-daemon

if (Test-Path "app\build\outputs\apk\debug\app-debug.apk") {
    Copy-Item "app\build\outputs\apk\debug\app-debug.apk" "..\TheFutureCouncil.apk" -Force
    Write-Host "=========================================="
    Write-Host "SUCCESS: APK created at TheFutureCouncil.apk"
    Write-Host "=========================================="
} else {
    Write-Host "ERROR: APK build failed"
}
