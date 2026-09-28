"""Package the existing website Daphne artwork as Windows icon resources."""
from pathlib import Path
import shutil

from PIL import Image


def main():
    directory = Path(__file__).resolve().parent
    source = directory.parent / 'public/images/ui/daphne.png'
    assets = directory / 'assets'
    shutil.copyfile(source, assets / 'app.png')
    with Image.open(source) as image:
        image.convert('RGBA').resize((256, 256), Image.Resampling.LANCZOS).save(
            assets / 'app.ico', sizes=[(size, size) for size in (16, 24, 32, 48, 64, 128, 256)])


if __name__ == '__main__':
    main()
