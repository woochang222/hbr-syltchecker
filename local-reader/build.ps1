$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
& .venv/Scripts/python.exe -m pip install pyinstaller==6.19.0
if ($LASTEXITCODE -ne 0) { throw 'PyInstaller installation failed.' }
& .venv/Scripts/python.exe build_catalog.py
if ($LASTEXITCODE -ne 0) { throw 'Reader catalog validation failed.' }
$referencePath = (Resolve-Path 'reference-data').Path
$assetsPath = (Resolve-Path 'assets').Path
& .venv/Scripts/python.exe -m PyInstaller --noconfirm --clean --windowed --onedir --name HBRStyleReader --specpath build --distpath dist --workpath build/pyinstaller --add-data "$referencePath;local-reader/reference-data" --add-data "$assetsPath;assets" app.py
if ($LASTEXITCODE -ne 0) { throw 'Packaging failed.' }
Copy-Item -LiteralPath README.md -Destination dist/HBRStyleReader/README.md
Write-Host 'Ready: dist/HBRStyleReader/HBRStyleReader.exe'
