Add-Type -AssemblyName System.Drawing

$sizes = @(16, 32, 48, 128)
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $s, $s
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'HighQuality'
    $g.Clear([System.Drawing.Color]::FromArgb(9, 9, 15))

    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($s, $s),
        [System.Drawing.Color]::FromArgb(99, 102, 241),
        [System.Drawing.Color]::FromArgb(167, 139, 250)
    )

    $cx = $s / 2
    $cy = $s / 2
    $r = $s * 0.35
    $pts = @()

    for ($i = 0; $i -lt 10; $i++) {
        $angle = [math]::PI / 2 + $i * [math]::PI / 5
        if ($i % 2 -eq 0) { $rad = $r } else { $rad = $r * 0.45 }
        $px = [float]($cx + $rad * [math]::Cos($angle))
        $py = [float]($cy - $rad * [math]::Sin($angle))
        $pts += [System.Drawing.PointF]::new($px, $py)
    }

    $g.FillPolygon($brush, $pts)
    $g.Dispose()
    $bmp.Save("$dir\icon$s.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created icon${s}.png"
}
