[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidateSet('Preflight', 'Deploy')]
  [string]$Mode
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$requiredEnvironment = @(
  'FTP_ANDERSEN_MAIN_HOST',
  'FTP_ANDERSEN_MAIN_USER',
  'FTP_ANDERSEN_MAIN_PASS',
  'FTP_ANDERSEN_MAIN_PORT',
  'FTP_ANDERSEN_TOOLS_PATH'
)
$releaseRoot = Join-Path $PSScriptRoot 'releases'

function Get-PhysicalItem {
  param([Parameter(Mandatory)] [string]$Path, [Parameter(Mandatory)] [string]$Label)

  if (-not (Test-Path -LiteralPath $Path)) { throw "$Label fehlt: $Path" }
  $item = Get-Item -LiteralPath $Path -Force
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "$Label darf kein Link oder Reparse Point sein: $Path" }
  return $item
}

function Assert-Environment {
  foreach ($name in $requiredEnvironment) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name, 'Process'))) {
      throw "Die erforderliche Credential-Variable $name fehlt."
    }
  }

  $port = 0
  if (-not [int]::TryParse($env:FTP_ANDERSEN_MAIN_PORT, [ref]$port) -or $port -lt 1 -or $port -gt 65535) {
    throw 'FTP_ANDERSEN_MAIN_PORT muss ein gültiger Port sein.'
  }
  if ([string]::IsNullOrWhiteSpace($env:FTP_ANDERSEN_TOOLS_PATH) -or $env:FTP_ANDERSEN_TOOLS_PATH.Contains('..')) {
    throw 'FTP_ANDERSEN_TOOLS_PATH ist kein zulässiger Zielpfad.'
  }
}

function Get-WinScpClient {
  $command = Get-Command 'WinSCP.com' -ErrorAction SilentlyContinue
  if ($null -ne $command -and (Test-Path -LiteralPath $command.Source)) { return $command.Source }

  $knownPath = 'C:\Program Files (x86)\WinSCP\WinSCP.com'
  if (Test-Path -LiteralPath $knownPath) { return $knownPath }
  throw 'WinSCP.com ist nicht installiert oder nicht auffindbar.'
}

function Get-PreparedRelease {
  $root = Get-PhysicalItem -Path $releaseRoot -Label 'Release-Verzeichnis'
  if (-not $root.PSIsContainer) { throw 'Release-Verzeichnis ist kein Verzeichnis.' }

  $candidates = Get-ChildItem -LiteralPath $root.FullName -Directory -Force |
    Where-Object { -not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) } |
    Sort-Object LastWriteTime -Descending

  foreach ($candidate in $candidates) {
    $manifestPath = Join-Path $candidate.FullName 'release.json'
    $webrootPath = Join-Path $candidate.FullName 'site'
    if (-not (Test-Path -LiteralPath $manifestPath) -or -not (Test-Path -LiteralPath $webrootPath)) { continue }

    try {
      $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json -ErrorAction Stop
    } catch {
      continue
    }

    if ($manifest.webroot -ne 'site/' -or $manifest.siteUrl -ne 'https://tools.andersen-webworks.de' -or $manifest.sourceDirty -ne $false) { continue }
    $webroot = Get-PhysicalItem -Path $webrootPath -Label 'Release-Webroot'
    if (-not $webroot.PSIsContainer) { continue }

    $entries = Get-ChildItem -LiteralPath $webroot.FullName -Recurse -Force
    if ($entries | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }) { continue }
    $files = @($entries | Where-Object { -not $_.PSIsContainer })
    if ($files.Count -ne $manifest.fileCount -or $files.Count -eq 0) { continue }
    if (-not (Test-Path -LiteralPath (Join-Path $webroot.FullName 'index.html')) -or -not (Test-Path -LiteralPath (Join-Path $webroot.FullName 'sitemap.xml'))) { continue }

    return [pscustomobject]@{
      Id = $manifest.releaseId
      Webroot = $webroot.FullName
      FileCount = $files.Count
    }
  }

  throw 'Kein vollständiger, sauberer Produktionsrelease für tools.andersen-webworks.de gefunden.'
}

function Escape-WinScpText {
  param([Parameter(Mandatory)] [string]$Value)
  return $Value.Replace('"', '""')
}

Assert-Environment
$release = Get-PreparedRelease
$winScp = Get-WinScpClient

if ($Mode -eq 'Preflight') {
  Write-Output "Preflight bereit: $($release.Id), $($release.FileCount) Dateien."
  return
}

$encodedUser = [Uri]::EscapeDataString($env:FTP_ANDERSEN_MAIN_USER)
$encodedPass = [Uri]::EscapeDataString($env:FTP_ANDERSEN_MAIN_PASS)
$sessionUrl = "ftp://$encodedUser`:$encodedPass@$($env:FTP_ANDERSEN_MAIN_HOST):$($env:FTP_ANDERSEN_MAIN_PORT)/"
$localWebroot = Escape-WinScpText -Value $release.Webroot
$remotePath = Escape-WinScpText -Value $env:FTP_ANDERSEN_TOOLS_PATH
$remoteDirectory = if ($remotePath.EndsWith('/')) { $remotePath } else { "$remotePath/" }
$temporaryScript = Join-Path ([IO.Path]::GetTempPath()) "clautz-ftp-$([Guid]::NewGuid().ToString('N')).txt"

try {
  $commands = @(
    'option batch abort',
    'option confirm off',
    'option failonnomatch on',
    "open `"$sessionUrl`"",
    "put -transfer=binary -nopreservetime `"$localWebroot\*`" `"$remoteDirectory`"",
    'exit'
  )
  [IO.File]::WriteAllLines($temporaryScript, $commands, [Text.UTF8Encoding]::new($false))

  & $winScp '/ini=nul' "/script=$temporaryScript"
  if ($LASTEXITCODE -ne 0) {
    throw "WinSCP endete mit Exit-Code $LASTEXITCODE."
  }
} finally {
  if (Test-Path -LiteralPath $temporaryScript) {
    [IO.File]::Delete($temporaryScript)
  }
}

Write-Output "Deploy übertragen: $($release.Id), $($release.FileCount) Dateien."
