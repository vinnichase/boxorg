import * as SqLite from 'expo-sqlite';
import { sql } from '../util/sql';
// SqLite.deleteDatabaseSync('boxorg.db');
export const openDb = () => SqLite.openDatabaseSync('boxorg.db');

const db = openDb();
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
        box_id INTEGER
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

db.closeSync();
// ===========================================================================
// Objects CRUD
// ===========================================================================

export type ObjectWithTags = { id: number; thumb_path: string; box_id: number; tags: string[] };

/**
 * Creates a new object.
 * @param box_id The box ID.
 */
export function createObject(db: SqLite.SQLiteDatabase, box_id: number) {
    try {
        const stmt = db.prepareSync(sql`INSERT INTO objects (box_id) VALUES (?)`);
        const info = stmt.executeSync(box_id);
        return info.lastInsertRowId;
    } catch (e) {
        console.error(e);
    }
}

/**
 * Retrieves a object by its ID.
 * @param id The object ID.
 */
export function getObjectById(db: SqLite.SQLiteDatabase, id: number) {
    try {
        const stmt = db.prepareSync(sql`SELECT * FROM objects WHERE id = ?`);
        return stmt.executeSync<ObjectRecord[]>(id).getFirstSync();
    } catch (e) {
        console.error(e);
    }
}

/**
 * Updates a object's name.
 * @param id The object ID.
 * @param name The new name.
 */
export function updateObject(
    db: SqLite.SQLiteDatabase,
    id: number,
    img_path: string,
    thumb_path: string,
    box_id: number,
): boolean {
    try {
        const stmt = db.prepareSync(sql`UPDATE objects SET img_path = ?, thumb_path = ?, box_id = ? WHERE id = ?`);
        const info = stmt.executeSync(img_path, thumb_path, box_id, id);
        return info.changes > 0;
    } catch (e) {
        console.error(e);
        return false;
    }
}

/**
 * Deletes a object.
 * @param id The object ID.
 */
export function deleteObject(db: SqLite.SQLiteDatabase, id: number) {
    try {
        const stmt = db.prepareSync(sql`DELETE FROM objects WHERE id = ?`);
        const info = stmt.executeSync(id);
        return info.changes > 0;
    } catch (e) {
        console.error(e);
    }
}

// ===========================================================================
// Tags CRUD
// ===========================================================================

/**
 * Creates a new tag. If the tag already exists, it returns the existing tag's ID.
 * @param tag The tag text.
 */
export function createTag(db: SqLite.SQLiteDatabase, tag: string) {
    // Using INSERT OR IGNORE ensures duplicates are not created.
    try {
        const stmt = db.prepareSync(sql`INSERT INTO tags (tag) VALUES (?)`);
        stmt.executeSync(tag);
    } catch {
        // The tag already exists.  Nothing to do.
    }
    try {
        // Fetch the tag's id (whether newly inserted or pre-existing).
        const getStmt = db.prepareSync(sql`SELECT id FROM tags WHERE tag = ?`);
        return getStmt.executeSync<TagRecord>(tag).getFirstSync()?.id;
    } catch (e) {
        console.error(e);
    }
}

/**
 * Retrieves a tag by its ID.
 * @param id The tag ID.
 */
export function getTagById(db: SqLite.SQLiteDatabase, id: number) {
    try {
        const stmt = db.prepareSync(sql`SELECT * FROM tags WHERE id = ?`);
        return stmt.executeSync<TagRecord>(id).getFirstSync();
    } catch (e) {
        console.error(e);
    }
}

/**
 * Retrieves a tag by its text.
 * @param tag The tag text.
 */
export function getTagByName(db: SqLite.SQLiteDatabase, tag: string) {
    try {
        const stmt = db.prepareSync(sql`SELECT * FROM tags WHERE tag = ?`);
        return stmt.executeSync<TagRecord>(tag).getFirstSync();
    } catch (e) {
        console.error(e);
    }
}

/**
 * Updates a tag's text.
 * @param id The tag ID.
 * @param newTag The new tag text.
 */
export function updateTag(db: SqLite.SQLiteDatabase, id: number, newTag: string): boolean {
    try {
        const stmt = db.prepareSync(sql`UPDATE tags SET tag = ? WHERE id = ?`);
        const info = stmt.executeSync(newTag, id);
        return info.changes > 0;
    } catch (e) {
        console.error(e);
        return false;
    }
}

/**
 * Deletes a tag.
 * @param id The tag ID.
 */
export function deleteTag(db: SqLite.SQLiteDatabase, id: number): boolean {
    try {
        const stmt = db.prepareSync(sql`DELETE FROM tags WHERE id = ?`);
        const info = stmt.executeSync(id);
        return info.changes > 0;
    } catch (e) {
        console.error(e);
        return false;
    }
}

// ===========================================================================
// Tag Assignment (Many-to-Many)
// ===========================================================================

/**
 * Assigns a tag to a object. Creates the tag if it does not exist.
 * @param objectId The ID of the object.
 * @param tag The tag text.
 */
export function assignTagToObject(db: SqLite.SQLiteDatabase, objectId: number, tag: string) {
    // Ensure the tag exists (or create it).
    const tagId = createTag(db, tag);
    if (!tagId) {
        return;
    }
    try {
        // Insert into the junction table. INSERT OR IGNORE prevents duplicate assignments.
        const stmt = db.prepareSync(sql`INSERT OR IGNORE INTO object_tags (object_id, tag_id) VALUES (?, ?)`);
        stmt.executeSync(objectId, tagId);
    } catch (e) {
        console.error(e);
    }
}

/**
 * Removes a tag assignment from a object.
 * @param objectId The ID of the object.
 * @param tag The tag text.
 */
export function removeTagFromObject(db: SqLite.SQLiteDatabase, objectId: number, tag: string): void {
    const tagRow = getTagByName(db, tag);
    if (!tagRow) {
        // The tag does not exist; nothing to remove.
        return;
    }
    try {
        const stmt = db.prepareSync(sql`DELETE FROM object_tags WHERE object_id = ? AND tag_id = ?`);
        stmt.executeSync(objectId, tagRow.id);
    } catch (e) {
        console.error(e);
    }
}

/**
 * Retrieves all objects.
 */
export function getObjects(db: SqLite.SQLiteDatabase) {
    try {
        const stmt = db.prepareSync(sql`SELECT * FROM objects`);
        return stmt.executeSync<ObjectRecord>().getAllSync();
    } catch (e) {
        console.error(e);
    }
}

/**
 * Retrieves all objects.
 */
export function searchObjects(db: SqLite.SQLiteDatabase, query: string) {
    try {
        const stmt = db.prepareSync(
            sql`SELECT objects.id, objects.thumb_path, objects.box_id, tags.tag FROM objects INNER JOIN object_tags ON objects.id = object_tags.object_id INNER JOIN tags ON object_tags.tag_id = tags.id WHERE tags.tag LIKE ?`,
        );
        return stmt
            .executeSync<{
                id: number;
                thumb_path: string;
                box_id: number;
                tag: string;
            }>(`%${query.toUpperCase()}%`)
            .getAllSync();
    } catch (e) {
        console.error(e);
    }
}

/**
 * Retrieves all tags.
 */
export function getTags(db: SqLite.SQLiteDatabase) {
    try {
        const stmt = db.prepareSync(sql`SELECT * FROM tags`);
        return stmt.executeSync<TagRecord>().getAllSync();
    } catch (e) {
        console.error(e);
    }
}

/**
 * Retrieves all tags assigned to a object.
 * @param objectId The object ID.
 */
export function getTagsForObject(db: SqLite.SQLiteDatabase, objectId: number) {
    try {
        const stmt = db.prepareSync(sql`
        SELECT t.id, t.tag
        FROM tags t
        INNER JOIN object_tags rt ON t.id = rt.tag_id
        WHERE rt.object_id = ?
    `);
        return stmt.executeSync<TagRecord>(objectId).getAllSync();
    } catch (e) {
        console.error(e);
    }
}

/**
 * Retrieves all objects that have been assigned a specific tag.
 * @param tag The tag text.
 */
export function getObjectsForTag(db: SqLite.SQLiteDatabase, tag: string) {
    try {
        const stmt = db.prepareSync(sql`
        SELECT r.id, r.name
        FROM objects r
        INNER JOIN object_tags rt ON r.id = rt.object_id
        INNER JOIN tags t ON rt.tag_id = t.id
        WHERE t.tag = ?
    `);
        return stmt.executeSync<ObjectRecord>(tag).getAllSync();
    } catch (e) {
        console.error(e);
    }
}
