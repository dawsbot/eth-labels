# Reads from filesystem and inserts all of this into a single sqlite db
# This sqlite file is located at scripts/db/db.sqlite3
rm scripts/db/db.sqlite3
npx tsx scripts/db/migrator.ts
npx tsx scripts/db/seed.ts
