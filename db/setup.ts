import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('boxorg.db');

const createObjectsTable = `
      CREATE TABLE IF NOT EXISTS objects (
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
// Create the "object_tags" junction table.
const createObjectTagsTable = `
      CREATE TABLE IF NOT EXISTS object_tags (
        object_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (object_id, tag_id),
        FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `;

// Execute table creation.
db.execSync(createObjectsTable);
db.execSync(createTagsTable);
db.execSync(createObjectTagsTable);

// Create indexes for fast lookups.
db.execSync(`CREATE INDEX IF NOT EXISTS idx_object_tags_object ON object_tags(object_id)`);
db.execSync(`CREATE INDEX IF NOT EXISTS idx_object_tags_tag ON object_tags(tag_id)`);

// ===========================================================================
// Objects CRUD
// ===========================================================================

/**
 * Creates a new object.
 * @param name The name for the object.
 * @returns The ID of the newly created object.
 */
export function createObject(name: string): number {
    const stmt = db.prepareSync(`INSERT INTO objects (name) VALUES (?)`);
    const info = stmt.executeSync(name);
    return info.lastInsertRowId as number;
}

/**
 * Retrieves a object by its ID.
 * @param id The object ID.
 * @returns The object object or undefined if not found.
 */
export function getObjectById(id: number) {
    const stmt = db.prepareSync(`SELECT * FROM objects WHERE id = ?`);
    return stmt.executeSync(id);
}

/**
 * Updates a object's name.
 * @param id The object ID.
 * @param name The new name.
 * @returns True if a object was updated; otherwise, false.
 */
export function updateObject(id: number, name: string): boolean {
    const stmt = db.prepareSync(`UPDATE objects SET name = ? WHERE id = ?`);
    const info = stmt.executeSync(name, id);
    return info.changes > 0;
}

/**
 * Deletes a object.
 * @param id The object ID.
 * @returns True if a object was deleted; otherwise, false.
 */
export function deleteObject(id: number) {
    const stmt = db.prepareSync(`DELETE FROM objects WHERE id = ?`);
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
 * Assigns a tag to a object. Creates the tag if it does not exist.
 * @param objectId The ID of the object.
 * @param tag The tag text.
 */
export function assignTagToObject(objectId: number, tag: string): void {
    // Ensure the tag exists (or create it).
    const tagId = createTag(tag);
    // Insert into the junction table. INSERT OR IGNORE prevents duplicate assignments.
    const stmt = db.prepareSync(`INSERT OR IGNORE INTO object_tags (object_id, tag_id) VALUES (?, ?)`);
    stmt.executeSync(objectId, tagId);
}

/**
 * Removes a tag assignment from a object.
 * @param objectId The ID of the object.
 * @param tag The tag text.
 */
export function removeTagFromObject(objectId: number, tag: string): void {
    const tagRow = getTagByName(tag);
    if (!tagRow) {
        // The tag does not exist; nothing to remove.
        return;
    }
    const stmt = db.prepareSync(`DELETE FROM object_tags WHERE object_id = ? AND tag_id = ?`);
    stmt.executeSync(objectId, tagRow.id);
}

/**
 * Retrieves all tags assigned to a object.
 * @param objectId The object ID.
 * @returns An array of tag objects.
 */
export function getTagsForObject(objectId: number) {
    const stmt = db.prepareSync(`
      SELECT t.id, t.tag
      FROM tags t
      INNER JOIN object_tags rt ON t.id = rt.tag_id
      WHERE rt.object_id = ?
    `);
    return stmt.executeSync<{ id: number; tag: string }[]>(objectId);
}

/**
 * Retrieves all objects that have been assigned a specific tag.
 * @param tag The tag text.
 * @returns An array of object objects.
 */
export function getObjectsForTag(tag: string) {
    const stmt = db.prepareSync(`
      SELECT r.id, r.name
      FROM objects r
      INNER JOIN object_tags rt ON r.id = rt.object_id
      INNER JOIN tags t ON rt.tag_id = t.id
      WHERE t.tag = ?
    `);
    return stmt.executeSync(tag);
}
