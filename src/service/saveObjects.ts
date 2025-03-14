import * as FileSystem from 'expo-file-system';
import { EditObject } from '../atoms/CollectObjectsAtom';
import { assignTagToObject, createObject, openDb, updateObject } from '../db/accessLayer';
import { sql } from '../util/sql';

export const saveObjects = async (boxId: number, objects: EditObject[]): Promise<void> => {
    if (objects.length === 0 || !FileSystem.documentDirectory) return;

    const db = openDb();

    for (const object of objects) {
        if (object.deleted) continue;

        const objectId = createObject(db, boxId);
        if (!objectId) continue;

        const imageUri = FileSystem.documentDirectory + objectId + '.jpg';

        objectId && updateObject(db, objectId, imageUri, imageUri, boxId);
        for (const tag of object.tags) {
            assignTagToObject(db, objectId, tag);
        }

        await FileSystem.copyAsync({
            from: object.uri,
            to: imageUri,
        });
    }

    console.log(db.getAllSync(sql`SELECT * FROM objects`));
    console.log(db.getAllSync(sql`SELECT * FROM tags`));
    console.log(db.getAllSync(sql`SELECT * FROM object_tags`));

    db.closeSync();
};
