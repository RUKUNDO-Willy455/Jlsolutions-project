$ErrorActionPreference = 'Stop'
$root = 'D:\Programming\Vue-based-projects\Jluc duo\jl solutions latest verion\src'

$utf8 = New-Object System.Text.UTF8Encoding($false, $true)
$cp1252 = [System.Text.Encoding]::GetEncoding(1252)

$affected = @()
Get-ChildItem -LiteralPath $root -Recurse -File -Include *.tsx, *.ts, *.js, *.jsx, *.css, *.json | ForEach-Object {
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  try {
    $text = $utf8.GetString($bytes)
    if ($text.Contains("â€") -or $text.Contains("Ã©") -or $text.Contains("Ã¨") -or $text.Contains("Ã ") -or $text.Contains("Ã¢")) {
      $affected += $_.FullName
    }
  } catch { }
}
"===== files containing double-encoded (mojibake) chars ===== "
if ($affected.Count -eq 0) { "  none" } else { $affected | ForEach-Object { "  " + $_.Substring($root.Length) } }

"`n===== repairing ===== "
foreach ($f in $affected) {
  $bytes = [System.IO.File]::ReadAllBytes($f)
  $text = $utf8.GetString($bytes)
  # reverse double-encoding: UTF-8 decode gave mojibake chars -> encode as cp1252 -> decode as utf8
  $cpBytes = $cp1252.GetBytes($text)
  $clean = $utf8.GetString($cpBytes)
  $before = ($text.ToCharArray() | Where-Object { $_ -eq [char]0x00e2 }).Count
  $after = ($clean.ToCharArray() | Where-Object { $_ -eq [char]0x00e2 }).Count
  if ($after -eq 0 -and $before -gt 0) {
    [System.IO.File]::WriteAllBytes($f, $utf8.GetBytes($clean))
    "FIXED  $($f.Substring($root.Length))   (stripped $($before - $after) mojibake chars)"
  } else {
    "SKIPPED $($f.Substring($root.Length))  (mojibake before=$before after=$after - needs manual look)"
  }
}

"`n===== post-fix scan (expect none / empty) ===== "
Get-ChildItem -LiteralPath $root -Recurse -File -Include *.tsx, *.ts, *.js, *.jsx | ForEach-Object {
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  try { $t = $utf8.GetString($bytes) } catch { $t = '' }
  if ($t.Contains("â€") -or $t.Contains("Ã©") -or $t.Contains("Ã¨")) { "  STILL MOJIBAKE: " + $_.FullName.Substring($root.Length) }
}
"  (end scan)"
