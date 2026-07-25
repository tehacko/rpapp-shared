import sqlite3
import json
import zlib

db = (
    r"C:\Users\corne\AppData\Roaming\Cursor\User\workspaceStorage"
    r"\2b54244fe4e1331ab262d339c5fe4dce\state.vscdb"
)
con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
cur = con.cursor()

for key in ["composer.composerData", "aiService.generations", "history.entries"]:
    cur.execute("SELECT value FROM ItemTable WHERE key=?", (key,))
    row = cur.fetchone()
    if not row:
        print(key, "MISSING")
        continue
    val = row[0]
    if isinstance(val, memoryview):
        val = val.tobytes()
    if isinstance(val, bytes):
        try:
            text = val.decode("utf-8")
        except Exception:
            try:
                text = zlib.decompress(val).decode("utf-8")
            except Exception as e:
                print(key, "bytes", len(val), "decode_err", e)
                continue
    else:
        text = str(val)
    print(key, "len", len(text))
    # search for ConfirmDialog content fragments
    for needle in ["ConfirmDialog", "spacing-3xl", "theme-runtime", "chartThemeTokens"]:
        idx = text.find(needle)
        print(" ", needle, "at", idx)
    print(" preview", text[:300].replace("\n", " "))

con.close()
