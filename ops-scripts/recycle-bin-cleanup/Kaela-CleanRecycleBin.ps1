# Kaela - Auto Clean Recycle Bin (Toko Prestasi)
# Hapus PERMANEN item Recycle Bin yang tanggal buangnya sudah lebih dari $ThresholdDays hari.
# Item yang lebih baru dari threshold TIDAK disentuh -- ada jeda aman.
#
# Jadwal: Task Scheduler, harian jam 21:15 (sebelum auto-shutdown 22:00), di Prestasi-01 (Kiri)
# dan Prestasi-Server (Kanan) masing-masing.
#
# PENTING: script ini TIDAK menyentuh D:\KAELA PROJECT\.KAELA-TRASH -- itu folder proyek lain,
# aturannya beda (cuma Olan boleh kosongin). Script ini murni Recycle Bin Windows bawaan.

param(
    [int]$ThresholdDays = 7
)

# Log ditaruh di sebelah script ini sendiri (bukan path hardcode) -- portable
# baik ditaruh di C:\Users\PRESTASI\ (Kiri) maupun C:\Users\USER\ (Kanan).
$logDir  = Join-Path $PSScriptRoot "KaelaLogs"
$logPath = Join-Path $logDir "recyclebin-clean.log"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp [$env:COMPUTERNAME] $Message" | Out-File -FilePath $logPath -Append -Encoding utf8
}

function Get-DeletedDate {
    param($Item, $RecycleBinFolder)
    # Cara 1 (paling akurat, bebas masalah locale): ExtendedProperty
    try {
        $prop = $Item.ExtendedProperty("System.Recycle.DateDeleted")
        if ($prop) { return [datetime]$prop }
    } catch { }
    # Cara 2 (fallback): GetDetailsOf kolom index 2, parse pakai culture aktif
    try {
        $raw = $RecycleBinFolder.GetDetailsOf($Item, 2)
        $raw = $raw -replace "[\u200e\u200f]", ""  # buang karakter arah tak terlihat kadang muncul
        return [datetime]::Parse($raw, [System.Globalization.CultureInfo]::CurrentCulture)
    } catch { }
    return $null
}

Write-Log "=== Mulai cek Recycle Bin (ambang: >$ThresholdDays hari) ==="

try {
    $shell = New-Object -ComObject Shell.Application
    $recycleBin = $shell.Namespace(10)  # 10 = CSIDL_BITBUCKET (Recycle Bin)
    $cutoff = (Get-Date).AddDays(-$ThresholdDays)

    $items = @($recycleBin.Items())
    $deletedCount = 0
    $skippedCount = 0
    $errorCount = 0

    foreach ($item in $items) {
        $deletedDate = Get-DeletedDate -Item $item -RecycleBinFolder $recycleBin
        $name = $item.Name

        if (-not $deletedDate) {
            Write-Log "LEWATI (gak bisa baca tanggal): $name"
            $skippedCount++
            continue
        }

        if ($deletedDate -lt $cutoff) {
            try {
                Remove-Item -LiteralPath $item.Path -Recurse -Force -ErrorAction Stop
                Write-Log "HAPUS PERMANEN: $name (dibuang $deletedDate)"
                $deletedCount++
            } catch {
                Write-Log "ERROR hapus '$name': $($_.Exception.Message)"
                $errorCount++
            }
        } else {
            $skippedCount++
        }
    }

    Write-Log "Selesai. Dihapus permanen: $deletedCount | Dilewati (masih dalam $ThresholdDays hari / gagal baca): $skippedCount | Error: $errorCount"
} catch {
    Write-Log "ERROR FATAL: $($_.Exception.Message)"
}
