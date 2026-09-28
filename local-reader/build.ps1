$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
& .venv/Scripts/python.exe -m pip install pyinstaller==6.19.0
if ($LASTEXITCODE -ne 0) { throw 'PyInstaller installation failed.' }
$catalogPath = (Resolve-Path '../src/data/styles.json').Path
$imagesPath = (Resolve-Path '../public/images/styles').Path
$assetsPath = (Resolve-Path 'assets').Path
& .venv/Scripts/python.exe -m PyInstaller --noconfirm --clean --windowed --onedir --name HBRStyleReader --specpath build --distpath dist --workpath build/pyinstaller --add-data "$catalogPath;catalog" --add-data "$imagesPath;public/images/styles" --add-data "$assetsPath;assets" app.py
if ($LASTEXITCODE -ne 0) { throw 'Packaging failed.' }
Copy-Item -LiteralPath README.md -Destination dist/HBRStyleReader/README.md
Write-Host 'Ready: dist/HBRStyleReader/HBRStyleReader.exe'
