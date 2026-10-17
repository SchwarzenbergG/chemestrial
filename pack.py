# Rebuilds Chemestrial.html from the split sources.
# Font files are taken from the current single-file page, or from Schimmerblasen.html.
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
TARGET = ROOT / "Chemestrial.html"
DONOR = pathlib.Path(r"C:\Users\gschw\Code\schimmerblasen\Schimmerblasen.html")
SCRIPTS = ("i18n.js", "logic.js", "celebrate.js", "app.js")

COMMENT = """<!-- Funkelnde Moleküle, eine Datei. Funktioniert ohne weitere Dateien und ohne Internet.
     Schriften: Fraunces (Copyright 2018 The Fraunces Project Authors) und
     Nunito (Copyright 2014 The Nunito Project Authors), SIL Open Font License 1.1.
     https://openfontlicense.org -->
"""


def font_faces():
    source = TARGET if TARGET.exists() else DONOR
    text = source.read_text(encoding="utf-8")
    faces = re.findall(r"@font-face \{.*?\n\}", text, flags=re.S)
    if len(faces) != 2 and source != DONOR and DONOR.exists():
        text = DONOR.read_text(encoding="utf-8")
        faces = re.findall(r"@font-face \{.*?\n\}", text, flags=re.S)
    if len(faces) != 2:
        sys.exit("Expected 2 @font-face blocks, found %s." % len(faces))
    return faces


def main():
    faces = font_faces()
    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    scripts = [(ROOT / name).read_text(encoding="utf-8") for name in SCRIPTS]
    for text in scripts:
        if "</script>" in text.lower():
            sys.exit("A script contains </script> and cannot be inlined as-is.")
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    page = page.replace("<!DOCTYPE html>\n", "<!DOCTYPE html>\n" + COMMENT, 1)
    page = re.sub(r"\n\s*<link rel=\"preconnect\"[^>]*>", "", page)
    page = re.sub(r"\n\s*<link href=\"https://fonts\.googleapis\.com[^\"]*\" rel=\"stylesheet\">", "", page)
    style = "<style>\n" + "\n".join(faces) + "\n" + css + "\n  </style>"
    page = page.replace('<link rel="stylesheet" href="styles.css">', style, 1)
    block = "\n".join("  <script>\n%s\n  </script>" % text for text in scripts)
    needle = "\n".join('  <script src="%s"></script>' % name for name in SCRIPTS)
    if needle not in page:
        sys.exit("Script tags were not found in index.html.")
    page = page.replace(needle, block, 1)
    for mark in ("Funkelnde Moleküle", "Regenperle", "Shimmering Molecules", "@font-face"):
        if mark not in page:
            sys.exit("Bundle is missing %s." % mark)
    for bad in ("fonts.googleapis", "fonts.gstatic", 'href="styles.css"', 'src="i18n.js"', 'src="logic.js"', 'src="app.js"', 'src="celebrate.js"'):
        if bad in page:
            sys.exit("Bundle still refers to %s." % bad)
    TARGET.write_text(page, encoding="utf-8", newline="\n")
    print("wrote %s (%s bytes)" % (TARGET.name, TARGET.stat().st_size))


if __name__ == "__main__":
    main()
