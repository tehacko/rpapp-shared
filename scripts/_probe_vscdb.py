import sqlite3
import sys

db = sys.argv[1] if len(sys.argv) > 1 else (
    r"C:\Users\corne\AppData\Roaming\Cursor\User\workspaceStorage"
    r"\2b54244fe4e1331ab262d339c5fe4dce\state.vscdb"
)
con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
cur = con.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("tables", cur.fetchall())
cur.execute("SELECT key FROM ItemTable LIMIT 40")
keys = [r[0] for r in cur.fetchall()]
print("keys_sample")
for k in keys:
    print(" ", k)
cur.execute(
    "SELECT key FROM ItemTable WHERE lower(key) LIKE '%history%' "
    "OR lower(key) LIKE '%backup%' OR lower(key) LIKE '%confirm%' "
    "OR lower(key) LIKE '%localhistory%' OR lower(key) LIKE '%timeline%' "
    "LIMIT 80"
)
print("matched_keys")
for (k,) in cur.fetchall():
    print(" ", k)
con.close()
