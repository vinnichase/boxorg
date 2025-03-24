import * as FileSystem from 'expo-file-system';
import { EditObject } from '../atoms/CollectObjectsAtom';
import { assignTagToObject, createObject, openDb, updateObject } from '../db/accessLayer';

export const saveObjects = async (boxId: number, objects: EditObject[]): Promise<void> => {
    if (objects.length === 0 || !FileSystem.documentDirectory) return;

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
            to: FileSystem.documentDirectory + imageFilename,
        });
    }

    db.closeSync();
};
