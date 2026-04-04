param(
  [string]$SourcePath = "public/branding/logo.gif",
  [string]$OutputDir = "public",
  [string]$ThemeColor = "#0a1220"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function ConvertTo-Color {
  param([string]$HexColor)

  return [System.Drawing.ColorTranslator]::FromHtml($HexColor)
}

function New-SquareIconBitmap {
  param(
    [System.Drawing.Image]$SourceImage,
    [int]$Size,
    [float]$PaddingRatio = 0.1,
    [System.Drawing.Color]$BackgroundColor
  )

  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

  try {
    $graphics.Clear($BackgroundColor)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $padding = [math]::Round($Size * $PaddingRatio)
    $destinationSize = $Size - ($padding * 2)
    $destinationRect = New-Object System.Drawing.Rectangle($padding, $padding, $destinationSize, $destinationSize)

    $graphics.DrawImage($SourceImage, $destinationRect)
    return $bitmap
  }
  finally {
    $graphics.Dispose()
  }
}

function Save-Png {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path
  )

  try {
    $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $Bitmap.Dispose()
  }
}

function Write-IconFile {
  param(
    [string[]]$PngPaths,
    [string]$IconPath
  )

  $pngEntries = foreach ($path in $PngPaths) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $image = [System.Drawing.Image]::FromStream([System.IO.MemoryStream]::new($bytes))

    try {
      [PSCustomObject]@{
        Width = $image.Width
        Height = $image.Height
        Bytes = $bytes
      }
    }
    finally {
      $image.Dispose()
    }
  }

  $fileStream = [System.IO.File]::Open($IconPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
  $writer = New-Object System.IO.BinaryWriter($fileStream)

  try {
    $writer.Write([UInt16]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]$pngEntries.Count)

    $offset = 6 + (16 * $pngEntries.Count)

    foreach ($entry in $pngEntries) {
      $writer.Write([byte]($(if ($entry.Width -ge 256) { 0 } else { $entry.Width })))
      $writer.Write([byte]($(if ($entry.Height -ge 256) { 0 } else { $entry.Height })))
      $writer.Write([byte]0)
      $writer.Write([byte]0)
      $writer.Write([UInt16]1)
      $writer.Write([UInt16]32)
      $writer.Write([UInt32]$entry.Bytes.Length)
      $writer.Write([UInt32]$offset)
      $offset += $entry.Bytes.Length
    }

    foreach ($entry in $pngEntries) {
      $writer.Write($entry.Bytes)
    }
  }
  finally {
    $writer.Dispose()
    $fileStream.Dispose()
  }
}

$resolvedSourcePath = Resolve-Path -LiteralPath $SourcePath
$resolvedOutputDir = Join-Path (Get-Location) $OutputDir
$backgroundColor = ConvertTo-Color -HexColor $ThemeColor

New-Item -ItemType Directory -Force -Path $resolvedOutputDir | Out-Null

$sourceImage = [System.Drawing.Image]::FromFile($resolvedSourcePath)

try {
  if ($sourceImage.FrameDimensionsList.Count -gt 0) {
    $timeDimension = New-Object System.Drawing.Imaging.FrameDimension($sourceImage.FrameDimensionsList[0])
    $sourceImage.SelectActiveFrame($timeDimension, 0) | Out-Null
  }

  $iconSpecs = @(
    @{ Name = "favicon-16x16.png"; Size = 16; Padding = 0.08 },
    @{ Name = "favicon-32x32.png"; Size = 32; Padding = 0.08 },
    @{ Name = "favicon-48x48.png"; Size = 48; Padding = 0.08 },
    @{ Name = "favicon-64x64.png"; Size = 64; Padding = 0.08 },
    @{ Name = "favicon-256x256.png"; Size = 256; Padding = 0.08 },
    @{ Name = "apple-touch-icon.png"; Size = 180; Padding = 0.12 },
    @{ Name = "android-chrome-192x192.png"; Size = 192; Padding = 0.12 },
    @{ Name = "android-chrome-512x512.png"; Size = 512; Padding = 0.12 },
    @{ Name = "mstile-150x150.png"; Size = 150; Padding = 0.12 }
  )

  foreach ($spec in $iconSpecs) {
    $bitmap = New-SquareIconBitmap -SourceImage $sourceImage -Size $spec.Size -PaddingRatio $spec.Padding -BackgroundColor $backgroundColor
    Save-Png -Bitmap $bitmap -Path (Join-Path $resolvedOutputDir $spec.Name)
  }

  $iconPngs = @(
    (Join-Path $resolvedOutputDir "favicon-16x16.png"),
    (Join-Path $resolvedOutputDir "favicon-32x32.png"),
    (Join-Path $resolvedOutputDir "favicon-48x48.png"),
    (Join-Path $resolvedOutputDir "favicon-64x64.png"),
    (Join-Path $resolvedOutputDir "favicon-256x256.png")
  )

  Write-IconFile -PngPaths $iconPngs -IconPath (Join-Path $resolvedOutputDir "favicon.ico")
}
finally {
  $sourceImage.Dispose()
}
