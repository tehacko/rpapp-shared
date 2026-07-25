import sqlite3
import json
import sys

db = (
    r"C:\Users\corne\AppData\Roaming\Cursor\User\workspaceStorage"
    r"\2b54244fe4e1331ab262d339c5fe4dce\state.vscdb"
)
con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
cur = con.cursor()

# cursorDiskKV schema
cur.execute("PRAGMA table_info(cursorDiskKV)")
print("cursorDiskKV cols", cur.fetchall())
cur.execute("SELECT key FROM cursorDiskKV LIMIT 40")
print("diskKV keys sample:")
for (k,) in cur.fetchall():
    print(" ", k[:200] if isinstance(k, str) else k)

cur.execute(
    "SELECT key FROM cursorDiskKV WHERE typeof(key)='text' AND ("
    "lower(key) LIKE '%confirm%' OR lower(key) LIKE '%appmodal%' "
    "OR lower(key) LIKE '%theme-runtime%' OR lower(key) LIKE '%admin-app%' "
    "OR lower(key) LIKE '%charttheme%' OR lower(key) LIKE '%file%'"
    ") LIMIT 60"
)
print("diskKV matched:")
rows = cur.fetchall()
for (k,) in rows:
    print(" ", k[:240])

# history.entries size
cur.execute("SELECT length(value) FROM ItemTable WHERE key='history.entries'")
print("history.entries len", cur.fetchone())

con.close()
