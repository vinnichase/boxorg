import * as FileSystem from 'expo-file-system/legacy';
import { EditObject } from '../atoms/CollectObjectsAtom';
import { assignTagToObject, createObject, openDb, updateObject } from '../db/accessLayer';

export const saveObjects = async (boxId: number, objects: EditObject[]): Promise<void> => {
    const docDir = FileSystem.documentDirectory;
    if (objects.length === 0 || !docDir) return;

    const db = openDb();

    for (const object of objects) {
        if (object.deleted) continue;

        const objectId = createObject(db, boxId);
        if (!objectId) continue;

        const imageFilename = objectId + '.jpg';

        objectId && updateObject(db, objectId, imageFilename, imageFilename, boxId);
        for (const tag of object.tags) {
            assignTagToObject(db, objectId, tag);
        }

        await FileSystem.copyAsync({
            from: object.uri,
            to: docDir + imageFilename,
        });
    }

    db.closeSync();
};
