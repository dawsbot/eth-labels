import { database } from "../database";

/**
 * Cannot take in the kysely db object because of type-limitations,
 * So just once we are importing the database object directly
 */
export function up() {
  database.exec("DROP TABLE IF EXISTS new_tokens");
  // For tokens table
  database.exec(`
    CREATE TABLE new_tokens (
      id INTEGER PRIMARY KEY,
      chain_id INTEGER NOT NULL,
      address TEXT NOT NULL,
      label TEXT NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      website TEXT,
      image TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.exec(`
    INSERT INTO new_tokens (id, chain_id, address, label, name, symbol, website, image, created_at, updated_at)
    SELECT id, chain_id, address, label, name, symbol, website, image, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    FROM tokens
  `);

  database.exec("DROP TABLE tokens");
  database.exec("ALTER TABLE new_tokens RENAME TO tokens");

  // For accounts table
  database.exec("DROP TABLE IF EXISTS new_accounts");
  database.exec(`
    CREATE TABLE new_accounts (
      id INTEGER PRIMARY KEY,
      chain_id INTEGER NOT NULL,
      address TEXT NOT NULL,
      label TEXT NOT NULL,
      name_tag TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.exec(`
    INSERT INTO new_accounts (id, chain_id, address, label, name_tag, created_at, updated_at)
    SELECT id, chain_id, address, label, name_tag, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    FROM accounts
  `);

  database.exec("DROP TABLE accounts");
  database.exec("ALTER TABLE new_accounts RENAME TO accounts");

  // Recreate the index for accounts
  database.exec(`
    CREATE UNIQUE INDEX accounts_address_unique_index
    ON accounts (chain_id, address, label, name_tag)
  `);
}

export function down() {
  // For tokens table
  database.exec(`
    CREATE TABLE new_tokens (
      id INTEGER PRIMARY KEY,
      chain_id INTEGER NOT NULL,
      address TEXT NOT NULL,
      label TEXT NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      website TEXT,
      image TEXT
    )
  `);

  database.exec(`
    INSERT INTO new_tokens (id, chain_id, address, label, name, symbol, website, image)
    SELECT id, chain_id, address, label, name, symbol, website, image
    FROM tokens
  `);

  database.exec("DROP TABLE tokens");
  database.exec("ALTER TABLE new_tokens RENAME TO tokens");

  // For accounts table
  database.exec(`
    CREATE TABLE new_accounts (
      id INTEGER PRIMARY KEY,
      chain_id INTEGER NOT NULL,
      address TEXT NOT NULL,
      label TEXT NOT NULL,
      name_tag TEXT
    )
  `);

  database.exec(`
    INSERT INTO new_accounts (id, chain_id, address, label, name_tag)
    SELECT id, chain_id, address, label, name_tag
    FROM accounts
  `);

  database.exec("DROP TABLE accounts");
  database.exec("ALTER TABLE new_accounts RENAME TO accounts");

  // Recreate the index for accounts
  database.exec(`
    CREATE UNIQUE INDEX accounts_address_unique_index
    ON accounts (chain_id, address, label, name_tag)
  `);
}
