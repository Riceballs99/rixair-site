# Server static pentru previzualizare locala — http://localhost:8080
$root = Join-Path $PSScriptRoot "docs"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Site-ul ruleaza la http://localhost:8080  (inchide fereastra ca sa opresti)" -ForegroundColor Green
Start-Process "http://localhost:8080"
$mime = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="application/javascript; charset=utf-8";
  ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".gif"="image/gif"; ".webp"="image/webp"; ".svg"="image/svg+xml";
  ".ico"="image/x-icon"; ".woff"="font/woff"; ".woff2"="font/woff2"; ".ttf"="font/ttf"; ".xml"="application/xml"; ".txt"="text/plain"; ".json"="application/json" }
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
    if ($path -eq "") { $path = "index.html" }
    $fp = Join-Path $root $path
    if (Test-Path $fp -PathType Container) { $fp = Join-Path $fp "index.html" }
    if (-not (Test-Path $fp) -and [System.IO.Path]::GetExtension($fp) -eq "") { $fp = "$fp/index.html" }
    if (Test-Path $fp -PathType Leaf) {
      $ctx.Response.Headers.Add("Cache-Control","no-store, no-cache, must-revalidate")
      $bytes = [System.IO.File]::ReadAllBytes($fp)
      $ext = [System.IO.Path]::GetExtension($fp).ToLower()
      if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - " + $path)
      $ctx.Response.Ou