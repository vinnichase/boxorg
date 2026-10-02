import * as FileSystem from 'expo-file-system/legacy';
import { EditObject } from '../atoms/CollectObjectsAtom';
import { assignTagToObject, createObject, openDb, updateObject } from '../db/accessLayer';
import { saveBoxTags } from './boxTags';

export const saveObjects = async (
    boxId: number,
    objects: EditObject[],
    boxTags: Record<number, string[]>,
): Promise<void> => {
    const docDir = FileSystem.documentDirectory;
    if (objects.length === 0 || !docDir) return;

    // only boxes that actually receive an object get their tag draft saved
    const savedBoxIds = new Set(objects.filter((o) => !o.deleted).map((o) => o.boxId ?? boxId));
    for (const savedBoxId of savedBoxIds) {
        const tags = boxTags[savedBoxId];
        tags && saveBoxTags(savedBoxId, tags);
    }

    const db = openDb();

    for (const object of objects) {
        if (object.deleted) continue;

        const objectBoxId = object.boxId ?? boxId;

        const objectId = createObject(db, objectBoxId);
        if (!objectId) continue;

        const imageFilename = objectId + '.jpg';

        objectId && updateObject(db, objectId, imageFilename, imageFilename, objectBoxId);
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
