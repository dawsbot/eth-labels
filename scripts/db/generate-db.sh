# Reads from filesystem and inserts all of this into a single sqlite db
# This sqlite file is located at scripts/db/db.sqlite3
rm scripts/db/db.sqlite3
bun run scripts/db/migrator.ts
bun run scripts/db/seed.ts
