import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('boxorg.db');

const createRecordsTable = `
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `;
// Create the "tags" table.
const createTagsTable = `
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag TEXT UNIQUE NOT NULL
      )
    `;
// Create the "record_tags" junction table.
const createRecordTagsTable = `
      CREATE TABLE IF NOT EXISTS record_tags (
        record_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (record_id, tag_id),
        FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `;

// Execute table creation.
db.execSync(createRecordsTable);
db.execSync(createTagsTable);
db.execSync(createRecordTagsTable);

// Create indexes for fast lookups.
db.execSync(`CREATE INDEX IF NOT EXISTS idx_record_tags_record ON record_tags(record_id)`);
db.execSync(`CREATE INDEX IF NOT EXISTS idx_record_tags_tag ON record_tags(tag_id)`);

// ===========================================================================
// Records CRUD
// ===========================================================================

/**
 * Creates a new record.
 * @param name The name for the record.
 * @returns The ID of the newly created record.
 */
export function createRecord(name: string): number {
    const stmt = db.prepareSync(`INSERT INTO records (name) VALUES (?)`);
    const info = stmt.executeSync(name);
    return info.lastInsertRowId as number;
}

/**
 * Retrieves a record by its ID.
 * @param id The record ID.
 * @returns The record object or undefined if not found.
 */
export function getRecordById(id: number) {
    const stmt = db.prepareSync(`SELECT * FROM records WHERE id = ?`);
    return stmt.executeSync(id);
}

/**
 * Updates a record's name.
 * @param id The record ID.
 * @param name The new name.
 * @returns True if a record was updated; otherwise, false.
 */
export function updateRecord(id: number, name: string): boolean {
    const stmt = db.prepareSync(`UPDATE records SET name = ? WHERE id = ?`);
    const info = stmt.executeSync(name, id);
    return info.changes > 0;
}

/**
 * Deletes a record.
 * @param id The record ID.
 * @returns True if a record was deleted; otherwise, false.
 */
export function deleteRecord(id: number) {
    const stmt = db.prepareSync(`DELETE FROM records WHERE id = ?`);
    const info = stmt.executeSync(id);
    return info.changes > 0;
}

// ===========================================================================
// Tags CRUD
// ===========================================================================

/**
 * Creates a new tag. If the tag already exists, it returns the existing tag's ID.
 * @param tag The tag text.
 * @returns The tag ID.
 */
export function createTag(tag: string) {
    // Using INSERT OR IGNORE ensures duplicates are not created.
    const stmt = db.prepareSync(`INSERT OR IGNORE INTO tags (tag) VALUES (?)`);
    stmt.executeSync(tag);
    // Fetch the tag's id (whether newly inserted or pre-existing).
    const getStmt = db.prepareSync(`SELECT id FROM tags WHERE tag = ?`);
    const row = getStmt.executeSync(tag);
    return row.id;
}

/**
 * Retrieves a tag by its ID.
 * @param id The tag ID.
 * @returns The tag object or undefined if not found.
 */
export function getTagById(id: number) {
    const stmt = db.prepareSync(`SELECT * FROM tags WHERE id = ?`);
    return stmt.executeSync(id);
}

/**
 * Retrieves a tag by its text.
 * @param tag The tag text.
 * @returns The tag object or undefined if not found.
 */
export function getTagByName(tag: string) {
    const stmt = db.prepareSync(`SELECT * FROM tags WHERE tag = ?`);
    return stmt.executeSync(tag);
}

/**
 * Updates a tag's text.
 * @param id The tag ID.
 * @param newTag The new tag text.
 * @returns True if a tag was updated; otherwise, false.
 */
export function updateTag(id: number, newTag: string): boolean {
    const stmt = db.prepareSync(`UPDATE tags SET tag = ? WHERE id = ?`);
    const info = stmt.executeSync(newTag, id);
    return info.changes > 0;
}

/**
 * Deletes a tag.
 * @param id The tag ID.
 * @returns True if a tag was deleted; otherwise, false.
 */
export function deleteTag(id: number): boolean {
    const stmt = db.prepareSync(`DELETE FROM tags WHERE id = ?`);
    const info = stmt.executeSync(id);
    return info.changes > 0;
}

// ===========================================================================
// Tag Assignment (Many-to-Many)
// ===========================================================================

/**
 * Assigns a tag to a record. Creates the tag if it does not exist.
 * @param recordId The ID of the record.
 * @param tag The tag text.
 */
export function assignTagToRecord(recordId: number, tag: string): void {
    // Ensure the tag exists (or create it).
    const tagId = createTag(tag);
    // Insert into the junction table. INSERT OR IGNORE prevents duplicate assignments.
    const stmt = db.prepareSync(`INSERT OR IGNORE INTO record_tags (record_id, tag_id) VALUES (?, ?)`);
    stmt.executeSync(recordId, tagId);
}

/**
 * Removes a tag assignment from a record.
 * @param recordId The ID of the record.
 * @param tag The tag text.
 */
export function removeTagFromRecord(recordId: number, tag: string): void {
    const tagRow = getTagByName(tag);
    if (!tagRow) {
        // The tag does not exist; nothing to remove.
        return;
    }
    const stmt = db.prepareSync(`DELETE FROM record_tags WHERE record_id = ? AND tag_id = ?`);
    stmt.executeSync(recordId, tagRow.id);
}

/**
 * Retrieves all tags assigned to a record.
 * @param recordId The record ID.
 * @returns An array of tag objects.
 */
export function getTagsForRecord(recordId: number) {
    const stmt = db.prepareSync(`
      SELECT t.id, t.tag
      FROM tags t
      INNER JOIN record_tags rt ON t.id = rt.tag_id
      WHERE rt.record_id = ?
    `);
    return stmt.executeSync<{ id: number; tag: string }[]>(recordId);
}

/**
 * Retrieves all records that have been assigned a specific tag.
 * @param tag The tag text.
 * @returns An array of record objects.
 */
export function getRecordsForTag(tag: string) {
    const stmt = db.prepareSync(`
      SELECT r.id, r.name
      FROM records r
      INNER JOIN record_tags rt ON r.id = rt.record_id
      INNER JOIN tags t ON rt.tag_id = t.id
      WHERE t.tag = ?
    `);
    return stmt.executeSync(tag);
}
