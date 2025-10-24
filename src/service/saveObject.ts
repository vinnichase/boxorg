import {
    assignTagToObject,
    getObjectTags,
    ObjectWithTags,
    openDb,
    removeTagFromObject,
    updateObjectBoxId,
} from '../db/accessLayer';

export const saveObject = async (object: ObjectWithTags): Promise<void> => {
    const db = openDb();

    updateObjectBoxId(db, object.id, object.box_id);

    const existingTags = getObjectTags(db, object.id)?.map((t) => t.tag) || [];
    const newTags = object.tags.filter((tag) => !existingTags.includes(tag));
    const removedTags = existingTags.filter((tag) => !object.tags.includes(tag));

    for (const tag of newTags) {
        assignTagToObject(db, object.id, tag);
    }

    for (const tag of removedTags) {
        removeTagFromObject(db, object.id, tag);
    }

    db.closeSync();
};
