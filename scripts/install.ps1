<#
.SYNOPSIS
  Install Trilium Symbiont for Kiro and/or Claude Code on Windows.

.DESCRIPTION
  Links every skills\sb-* folder (directory junctions, no admin rights needed) and the steering file
  from this repo into the client's folders, so edits in the repo are live at once. Safe to run again.
  Linux / macOS: scripts/install.sh.
  Not covered (see docs/install.md): the Trilium MCP server with your token, and Claude Desktop (ZIP upload).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1 -ClaudeCode
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Kiro -ClaudeCode -DryRun
#>
param(
  [switch]$Kiro,        # skills into ~\.kiro\skills, steering into ~\.kiro\steering
  [switch]$ClaudeCode,  # skills into ~\.claude\skills, steering imported in ~\.claude\CLAUDE.md
  [switch]$DryRun       # only show what would change
)
Set-StrictMode -Version 3
$ErrorActionPreference = 'Stop'

if (-not ($Kiro -or $ClaudeCode)) {
  Write-Host 'Usage: .\scripts\install.ps1 [-Kiro] [-ClaudeCode] [-DryRun]   (give at least one client)'
  exit 2
}

$Repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Steering = Join-Path $Repo 'steering\trilium-symbiont.md'
if (-not ((Test-Path $Steering) -and (Test-Path (Join-Path $Repo 'skills')))) {
  Write-Error 'Run this from a complete trilium-symbiont checkout.'
}

# Get-Item that also finds dangling links (Test-Path is $false for those).
function Get-Entry([string]$Path) { Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue }
function Get-LinkTarget($Item) { if ($Item -and $Item.LinkType) { [string]@($Item.Target)[0] } else { $null } }
# Remove only the link itself. Never Remove-Item -Recurse on a junction: in Windows PowerShell 5.1 that
# deletes the target's contents.
function Remove-Link($Item) { if (-not $DryRun) { $Item.Delete() } }

function Install-Skills([string]$Dst) {
  Write-Host "Skills -> $Dst"
  if (-not $DryRun) { New-Item -ItemType Directory -Force -Path $Dst | Out-Null }
  foreach ($skill in Get-ChildItem (Join-Path $Repo 'skills') -Directory -Filter 'sb-*') {
    $link = Join-Path $Dst $skill.Name
    $item = Get-Entry $link
    if ($item -and $item.LinkType -and ((Get-LinkTarget $item) -eq $skill.FullName)) {
      Write-Host "  ok       $($skill.Name)"; continue
    }
    if ($item -and $item.LinkType) {
      Write-Host "  relink   $($skill.Name)"; Remove-Link $item
    } elseif ($item) {
      Write-Host "  replace  $($skill.Name) (was a copied folder, now a link)"
      if (-not $DryRun) { Remove-Item -LiteralPath $link -Recurse -Force }
    } else {
      Write-Host "  link     $($skill.Name)"
    }
    if (-not $DryRun) { New-Item -ItemType Junction -Path $link -Target $skill.FullName | Out-Null }
  }
  # remove links into this repo whose skill no longer exists; nothing else is touched
  $skillsRoot = (Join-Path $Repo 'skills') + '\'
  if (Test-Path $Dst) {
    foreach ($item in Get-ChildItem -LiteralPath $Dst -Force -Filter 'sb-*' | Where-Object { $_.LinkType }) {
      $target = Get-LinkTarget $item
      if ($target -and $target.StartsWith($skillsRoot, [StringComparison]::OrdinalIgnoreCase) -and -not (Test-Path $target)) {
        Write-Host "  remove   $($item.Name) (skill was removed)"; Remove-Link $item
      }
    }
  }
}

# Append one line, UTF-8 without BOM, starting on a new line if the file does not end with one.
function Add-Line([string]$File, [string]$Line) {
  $prefix = ''
  if ((Test-Path $File) -and (Get-Item $File).Length -gt 0) {
    $text = [IO.File]::ReadAllText($File)
    if (-not $text.EndsWith("`n")) { $prefix = "`n" }
  }
  [IO.File]::AppendAllText($File, "$prefix$Line`n", (New-Object Text.UTF8Encoding $false))
}

if ($Kiro) {
  Write-Host '== Kiro'
  Install-Skills (Join-Path $HOME '.kiro\skills')
  $dir = Join-Path $HOME '.kiro\steering'
  $link = Join-Path $dir 'trilium-symbiont.md'
  Write-Host "Steering -> $link"
  $item = Get-Entry $link
  if ($item -and $item.LinkType -and ((Get-LinkTarget $item) -eq $Steering)) {
    Write-Host '  ok'
  } elseif ($DryRun) {
    Write-Host '  link (or copy, if symbolic links are not allowed)'
  } else {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    if ($item) { if ($item.LinkType) { $item.Delete() } else { Remove-Item -LiteralPath $link -Force } }
    try {
      New-Item -ItemType SymbolicLink -Path $link -Target $Steering | Out-Null
      Write-Host '  linked'
    } catch {
      Copy-Item -LiteralPath $Steering -Destination $link
      Write-Warning ('A file symlink needs Developer Mode or an admin shell, so the steering was COPIED. ' +
        'Re-run this script after steering changes, or enable Developer Mode and re-run to link it.')
    }
  }
}

if ($ClaudeCode) {
  Write-Host '== Claude Code'
  Install-Skills (Join-Path $HOME '.claude\skills')
  $md = Join-Path $HOME '.claude\CLAUDE.md'
  $line = '@' + ($Steering -replace '\\', '/')
  Write-Host "Steering -> import in $md"
  $lines = if (Test-Path $md) { @(Get-Content -LiteralPath $md -Encoding UTF8) } else { @() }
  if ($lines -contains $line) {
    Write-Host '  ok'
  } else {
    $old = @($lines | Where-Object { $_ -match 'steering/trilium-symbiont\.md' })
    if ($old.Count) {
      Write-Host "  note: $md imports the steering from another path; check and remove the old line:"
      $old | ForEach-Object { Write-Host "    $_" }
    }
    if (-not $DryRun) {
      New-Item -ItemType Directory -Force -Path (Split-Path $md) | Out-Null
      Add-Line $md $line
    }
    Write-Host '  added'
  }
}

Write-Host ''
Write-Host ('Done' + $(if ($DryRun) { ' (dry run, nothing changed)' } else { '' }) + '.')
Write-Host "Next: connect the Trilium MCP server as 'trilium' (docs/install.md), start a new session, then /sb-lint"
Write-Host '(or /sb-init on an empty Trilium instance).'
