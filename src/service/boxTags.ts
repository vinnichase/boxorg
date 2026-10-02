import { assignTagToBox, deleteUnassignedBoxTags, getBoxTags, openDb, removeTagFromBox } from '../db/accessLayer';

export const loadBoxTags = (boxId: number): string[] => {
    const db = openDb();
    try {
        return getBoxTags(db, boxId)?.map((t) => t.tag) ?? [];
    } finally {
        db.closeSync();
    }
};

// assignments are diffed against the database; the screens decide when to
// call this (with their save button, or right away in the search overlay)
export const saveBoxTags = (boxId: number, tags: string[]): void => {
    const db = openDb();
    try {
        const existingTags = getBoxTags(db, boxId)?.map((t) => t.tag) ?? [];
        const nextTags = tags.filter(Boolean);

        for (const tag of nextTags.filter((tag) => !existingTags.includes(tag))) {
            assignTagToBox(db, boxId, tag);
        }

        for (const tag of existingTags.filter((tag) => !nextTags.includes(tag))) {
            removeTagFromBox(db, boxId, tag);
        }

        deleteUnassignedBoxTags(db);
    } finally {
        db.closeSync();
    }
};
