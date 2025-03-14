import { EditObject } from '../atoms/CollectObjectsAtom';

export const saveObjects = async (boxId: number, objects: EditObject[]): Promise<void> => {
    for (const object of objects) {
        if (object.deleted) {
            await deleteObject(object.uri);
        } else {
            await saveObject(object.uri, object.tags);
        }
    }
};
