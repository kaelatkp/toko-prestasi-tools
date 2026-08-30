# Kaela - Pasang Scheduled Task "KaelaAutoCleanRecycleBin"
#
# !! JALANKAN DARI POWERSHELL RUN-AS-ADMINISTRATOR !!
# Preseden KaelaAutoShutdown2200 (Kiri, 29 Agu 2026): Register/Set-ScheduledTask kena
# "Access is denied" kalau PowerShell-nya bukan admin. Cara buka admin PowerShell di remote
# session (kalau klik kanan "Run as Administrator" minta kredensial yang gak dipegang):
#   Klik kanan taskbar -> Task Manager -> More details -> File -> Run new task
#   -> ketik "powershell" -> centang "Create this task with administrative privileges" -> OK
#
# Taruh file ini SATU FOLDER sama Kaela-CleanRecycleBin.ps1 (samain lokasi, misal langsung di
# home folder user: C:\Users\PRESTASI\ di Kiri, C:\Users\USER\ di Kanan) lalu jalankan.

$taskName   = "KaelaAutoCleanRecycleBin"
$scriptPath = Join-Path $PSScriptRoot "Kaela-CleanRecycleBin.ps1"

if (-not (Test-Path $scriptPath)) {
    Write-Error "Script gak ketemu di $scriptPath. Pastikan Kaela-CleanRecycleBin.ps1 ada di folder yang sama, baru jalankan ulang."
    exit 1
}

# WAJIB -ExecutionPolicy Bypass -- pelajaran dari KaelaAutoShutdown2200: tanpa ini,
# task "sukses jalan" (LastRunTime normal) tapi actual action gagal diam-diam (LastTaskResult=1)
# kalau Execution Policy komputer itu Undefined/Restricted.
$action   = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
$trigger  = New-ScheduledTaskTrigger -Daily -At 21:15
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings `
    -Description "Kaela: hapus permanen isi Recycle Bin yang sudah lebih dari 7 hari, tiap hari jam 21:15 (sebelum auto-shutdown 22:00)." `
    -Force | Out-Null

Write-Host "Task '$taskName' terpasang di $env:COMPUTERNAME untuk user $env:USERNAME, jadwal harian 21:15."
Write-Host ""
Write-Host "=== VERIFIKASI WAJIB (jangan skip -- pelajaran KaelaAutoShutdown2200) ==="
Write-Host "Test jalanin manual sekarang lalu cek hasilnya:"
Write-Host "  Start-ScheduledTask -TaskName '$taskName'"
Write-Host "  Start-Sleep -Seconds 5"
Write-Host "  Get-ScheduledTaskInfo -TaskName '$taskName' | Select LastRunTime, LastTaskResult"
Write-Host "LastTaskResult HARUS 0. Kalau bukan 0, task 'kelihatan jalan' tapi diam-diam gagal."
Write-Host "Cek juga isi log: Get-Content (Join-Path '$PSScriptRoot' 'KaelaLogs\recyclebin-clean.log') -Tail 10"
