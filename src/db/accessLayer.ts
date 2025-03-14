import * as SqLite from 'expo-sqlite';
import { sql } from '../util/sql';
export const db = SqLite.openDatabaseSync('boxorg.db');
// db.closeSync();
// SqLite.deleteDatabaseSync('boxorg.db');

export type ObjectRecord = {
    id: number;
    img_path: string;
    thumb_path: string;
    box_id: number;
};
const createObjectsTable = sql`
    CREATE TABLE IF NOT EXISTS objects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        img_path TEXT,
        thumb_path TEXT,
        box_id INTEGER,
    )
`;

export type TagRecord = {
    id: number;
    tag: string;
};
// Create the "tags" table.
const createTagsTable = sql`
    CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag TEXT UNIQUE NOT NULL
    )
`;

export type ObjectTagRecord = {
    object_id: number;
    tag_id: number;
};
// Create the "object_tags" junction table.
const createObjectTagsTable = sql`
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
db.execSync(sql`CREATE INDEX IF NOT EXISTS idx_object_tags_object ON object_tags(object_id)`);
db.execSync(sql`CREATE INDEX IF NOT EXISTS idx_object_tags_tag ON object_tags(tag_id)`);
db.execSync(sql`CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag)`);

// ===========================================================================
// Objects CRUD
// ===========================================================================

/**
 * Creates a new object.
 * @param name The name for the object.
 */
export function createObject(img_path: string, thumb_path: string) {
    const stmt = db.prepareSync(sql`INSERT INTO objects (img_path, thumb_path) VALUES (?, ?)`);
    const info = stmt.executeSync(img_path, thumb_path);
    return info.lastInsertRowId;
}

/**
 * Retrieves a object by its ID.
 * @param id The object ID.
 */
export function getObjectById(id: number) {
    const stmt = db.prepareSync(sql`SELECT * FROM objects WHERE id = ?`);
    return stmt.executeSync<ObjectRecord[]>(id).getFirstSync();
}

/**
 * Updates a object's name.
 * @param id The object ID.
 * @param name The new name.
 */
export function updateObject(id: number, img_path: string, thumb_path: string): boolean {
    const stmt = db.prepareSync(sql`UPDATE objects SET img_path = ?, thumb_path = ? WHERE id = ?`);
    const info = stmt.executeSync(img_path, thumb_path, id);
    return info.changes > 0;
}

/**
 * Deletes a object.
 * @param id The object ID.
 */
export function deleteObject(id: number) {
    const stmt = db.prepareSync(sql`DELETE FROM objects WHERE id = ?`);
    const info = stmt.executeSync(id);
    return info.changes > 0;
}

// ===========================================================================
// Tags CRUD
// ===========================================================================

/**
 * Creates a new tag. If the tag already exists, it returns the existing tag's ID.
 * @param tag The tag text.
 */
export function createTag(tag: string) {
    // Using INSERT OR IGNORE ensures duplicates are not created.
    try {
        const stmt = db.prepareSync(sql`INSERT INTO tags (tag) VALUES (?)`);
        stmt.executeSync(tag);
    } catch {
        // The tag already exists.  Nothing to do.
    }
    // Fetch the tag's id (whether newly inserted or pre-existing).
    const getStmt = db.prepareSync(sql`SELECT id FROM tags WHERE tag = ?`);
    return getStmt.executeSync<TagRecord>(tag).getFirstSync()?.id;
}

/**
 * Retrieves a tag by its ID.
 * @param id The tag ID.
 */
export function getTagById(id: number) {
    const stmt = db.prepareSync(sql`SELECT * FROM tags WHERE id = ?`);
    return stmt.executeSync<TagRecord>(id).getFirstSync();
}

/**
 * Retrieves a tag by its text.
 * @param tag The tag text.
 */
export function getTagByName(tag: string) {
    const stmt = db.prepareSync(sql`SELECT * FROM tags WHERE tag = ?`);
    return stmt.executeSync<TagRecord>(tag).getFirstSync();
}

/**
 * Updates a tag's text.
 * @param id The tag ID.
 * @param newTag The new tag text.
 */
export function updateTag(id: number, newTag: string): boolean {
    const stmt = db.prepareSync(sql`UPDATE tags SET tag = ? WHERE id = ?`);
    const info = stmt.executeSync(newTag, id);
    return info.changes > 0;
}

/**
 * Deletes a tag.
 * @param id The tag ID.
 */
export function deleteTag(id: number): boolean {
    const stmt = db.prepareSync(sql`DELETE FROM tags WHERE id = ?`);
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
export function assignTagToObject(objectId: number, tag: string) {
    // Ensure the tag exists (or create it).
    const tagId = createTag(tag);
    if (!tagId) {
        return;
    }
    // Insert into the junction table. INSERT OR IGNORE prevents duplicate assignments.
    const stmt = db.prepareSync(sql`INSERT OR IGNORE INTO object_tags (object_id, tag_id) VALUES (?, ?)`);
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
    const stmt = db.prepareSync(sql`DELETE FROM object_tags WHERE object_id = ? AND tag_id = ?`);
    stmt.executeSync(objectId, tagRow.id);
}

/**
 * Retrieves all objects.
 */
export function getObjects() {
    const stmt = db.prepareSync(sql`SELECT * FROM objects`);
    return stmt.executeSync<ObjectRecord>().getAllSync();
}

/**
 * Retrieves all tags.
 */
export function getTags() {
    const stmt = db.prepareSync(sql`SELECT * FROM tags`);
    return stmt.executeSync<TagRecord>().getAllSync();
}

/**
 * Retrieves all tags assigned to a object.
 * @param objectId The object ID.
 */
export function getTagsForObject(objectId: number) {
    const stmt = db.prepareSync(sql`
        SELECT t.id, t.tag
        FROM tags t
        INNER JOIN object_tags rt ON t.id = rt.tag_id
        WHERE rt.object_id = ?
    `);
    return stmt.executeSync<TagRecord>(objectId).getAllSync();
}

/**
 * Retrieves all objects that have been assigned a specific tag.
 * @param tag The tag text.
 */
export function getObjectsForTag(tag: string) {
    const stmt = db.prepareSync(sql`
        SELECT r.id, r.name
        FROM objects r
        INNER JOIN object_tags rt ON r.id = rt.object_id
        INNER JOIN tags t ON rt.tag_id = t.id
        WHERE t.tag = ?
    `);
    return stmt.executeSync<ObjectRecord>(tag).getAllSync();
}
