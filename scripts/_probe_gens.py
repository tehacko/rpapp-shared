import sqlite3
import json
import re

db = (
    r"C:\Users\corne\AppData\Roaming\Cursor\User\workspaceStorage"
    r"\2b54244fe4e1331ab262d339c5fe4dce\state.vscdb"
)
con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
cur = con.cursor()
cur.execute("SELECT value FROM ItemTable WHERE key='aiService.generations'")
val = cur.fetchone()[0]
if isinstance(val, memoryview):
    val = val.tobytes()
text = val.decode("utf-8") if isinstance(val, bytes) else str(val)
data = json.loads(text)
print("generations", len(data))
for g in data:
    desc = g.get("textDescription") or ""
    if "ConfirmDialog" in desc or "spacing-3xl" in desc or "theme-runtime" in desc:
        print("---")
        print("uuid", g.get("generationUUID"))
        print(desc[:2000])
        print("...")
con.close()
