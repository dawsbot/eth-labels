import type { Kysely } from "kysely";

/**************************************************************************************************
 Notes about the patterns in this file:

 * Uses features introduced in Postgres 15, so this will not work on older versions.

 * Uses ULIDs as the surrogate key for most tables so that we don't rely on sequences, allowing
 tables to be partitioned in the future if needed. ULIDs still have temporal ordering unlike
 most UUIDs.

 * Uses created_at/updated_at columns to refer to database row create/update time, NOT
 the creation time of the entity on the Farcaster network itself.
 Separate columns (e.g. "timestamp") represent when the content was created on Farcaster.

 * Declares columns in a particular order to minimize storage on disk. If the declaration order
 looks odd, remember it's to reduce disk space.
 See https://www.2ndquadrant.com/en/blog/on-rocks-and-sand/ for more info.

 * Uses bytea columns to store raw bytes instead of text columns with `0x` prefixed strings, since
 raw bytes reduce storage space, reduce index size, are faster to query (especially with joins),
 and avoid case sensitivity issues when dealing with string comparison.

 * Uses B-tree indexes (the default) for most columns representing a hash digest, since you can
 perform lookups on those hashes matching by prefix, whereas you can't do this with hash indexes.

 * Declares some indexes that we think might be useful for data analysis and general querying,
 but which aren't actually required by the shuttle itself.

 * Declares partial indexes (via a WHERE predicate) to reduce the size of the index and ensure
 only relevant rows are returned (e.g. ignoring soft-deleted rows, etc.)

 * Uses JSON columns instead of native Postgres array columns to significantly reduce on-disk
 storage (JSON is treated like TEXT) at the cost of slightly slower querying time. JSON columns
 can also be more easily modified over time without requiring a schema migration.

 * Declares foreign keys to ensure correctness. This means that the shuttle will not process
 a message if it refers to content that has not yet been seen, since that would violate the FK
 constraint. Instead, it will put the message into an unprocessed message queue and try again
 once the content it references has been processed. If you want to remove data that was
 pruned/revoked/deleted, you can hard delete the corresponding row in the messages table, and
 the downstream tables referencing that message will also be deleted.
 **************************************************************************************************/

export const up = async (db: Kysely<unknown>) => {
  await db.schema
    .createTable("tokens")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("chainId", "integer", (col) => col.notNull())
    .addColumn("address", "text", (col) => col.notNull())
    .addColumn("label", "text", (col) => col.notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("symbol", "text", (col) => col.notNull())

    .addColumn("website", "text", (col) => col) // nullable
    .addColumn("image", "text", (col) => col) // nullable

    .execute();

  await db.schema
    .createIndex("tokens_address_unique_index")
    .on("tokens")
    .column("chainId")
    .column("address")
    .column("label")
    .unique()
    .execute();
};

export const down = async (db: Kysely<unknown>) => {
  await db.schema.dropTable("tokens").ifExists().execute();
};
