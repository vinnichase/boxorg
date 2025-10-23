import { ObjectWithTags, openDb, updateObjectBoxId } from '../db/accessLayer';

export const saveObjectBoxId = async (object: ObjectWithTags): Promise<void> => {
    const db = openDb();

    updateObjectBoxId(db, object.id, object.box_id);

    db.closeSync();
};
