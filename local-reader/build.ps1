$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
& .venv/Scripts/python.exe -m pip install pyinstaller==6.19.0
if ($LASTEXITCODE -ne 0) { throw 'PyInstaller installation failed.' }
& .venv/Scripts/python.exe build_catalog.py
if ($LASTEXITCODE -ne 0) { throw 'Reader catalog validation failed.' }
$referencePath = (Resolve-Path 'reference-data').Path
$assetsPath = (Resolve-Path 'assets').Path
& .venv/Scripts/python.exe prepare_icon.py
if ($LASTEXITCODE -ne 0) { throw 'Icon preparation failed.' }
& .venv/Scripts/python.exe -m PyInstaller --noconfirm --clean --windowed --onedir --icon "$assetsPath/app.ico" --name HBRStyleReader --specpath build --distpath dist --workpath build/pyinstaller --add-data "$referencePath;local-reader/reference-data" --add-data "$assetsPath;assets" app.py
if ($LASTEXITCODE -ne 0) { throw 'Packaging failed.' }
Move-Item -LiteralPath dist/HBRStyleReader/HBRStyleReader.exe -Destination dist/HBRStyleReader/HBRStyleReader-Daphne.exe
Copy-Item -LiteralPath README.md -Destination dist/HBRStyleReader/README.md
Compress-Archive -Path dist/HBRStyleReader -DestinationPath dist/HBRStyleReader-Windows.zip -Force
Write-Host 'Ready: dist/HBRStyleReader/HBRStyleReader-Daphne.exe'
