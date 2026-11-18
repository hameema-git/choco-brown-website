"""Create clean source and static-hosting ZIPs after running npm run build."""

from hashlib import sha256
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "release"
SOURCE_ENTRIES = (
    "src",
    "public",
    "tests",
    "scripts",
    "README.md",
    "START-HERE.txt",
    "DEPLOYMENT.md",
    "SHOP-OWNER-GUIDE.md",
    "index.html",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "playwright.config.ts",
    "netlify.toml",
    "vercel.json",
    ".nvmrc",
    ".gitignore",
)
EXCLUDED_PARTS = {"node_modules", "downloads", "__pycache__", ".git", ".DS_Store"}


def collect(entry: Path):
    if not entry.exists():
        raise SystemExit(f"Missing required project entry: {entry.relative_to(ROOT)}")
    candidates = [entry] if entry.is_file() else sorted(entry.rglob("*"))
    for path in candidates:
        relative = path.relative_to(ROOT)
        if not path.is_file() or path.is_symlink():
            continue
        if EXCLUDED_PARTS.intersection(relative.parts):
            continue
        if path.name.startswith(".env") or path.suffix in {".zip", ".pyc"}:
            continue
        yield path


def fingerprint(path: Path):
    return sha256(path.read_bytes()).hexdigest()


def verify_build():
    index = ROOT / "dist/index.html"
    if not index.is_file() or "/src/main.tsx" in index.read_text(encoding="utf-8"):
        raise SystemExit("A production build is required. Run npm run build first.")
    for name in ("dm-sans.woff2", "fraunces.woff2", "fraunces-italic.woff2"):
        font = ROOT / "public/fonts" / name
        if not font.is_file() or font.read_bytes()[:4] != b"wOF2":
            raise SystemExit(f"Missing or invalid bundled font: {font.name}")
    for asset in collect(ROOT / "public"):
        built = ROOT / "dist" / asset.relative_to(ROOT / "public")
        if not built.is_file() or fingerprint(asset) != fingerprint(built):
            raise SystemExit(f"Build asset is missing or outdated: {built.relative_to(ROOT)}")


def create_archive(destination: Path, entries):
    with ZipFile(destination, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for source, archive_path in entries:
            archive.write(source, archive_path.as_posix())
    with ZipFile(destination) as archive:
        failed = archive.testzip()
        if failed:
            raise SystemExit(f"Archive integrity check failed: {failed}")
        count = len(archive.namelist())
    print(f"{destination.name}: {count} files, {destination.stat().st_size:,} bytes")


def main():
    verify_build()
    OUTPUT.mkdir(exist_ok=True)
    source_files = [file for entry in SOURCE_ENTRIES for file in collect(ROOT / entry)]
    production_files = list(collect(ROOT / "dist"))
    complete = OUTPUT / "choco-brown-complete.zip"
    live = OUTPUT / "choco-brown-live.zip"
    create_archive(
        complete,
        ((file, Path("choco-brown") / file.relative_to(ROOT))
         for file in source_files + production_files),
    )
    create_archive(
        live,
        ((file, file.relative_to(ROOT / "dist")) for file in production_files),
    )
    checksum_file = OUTPUT / "SHA256SUMS.txt"
    checksum_file.write_text(
        "".join(f"{fingerprint(file)}  {file.name}\n" for file in (complete, live)),
        encoding="utf-8",
    )
    print("Archive integrity and bundled asset checks passed.")
    print(f"SHA-256 checksums: {checksum_file.relative_to(ROOT)}")


if __name__ == "__main__":
    main()