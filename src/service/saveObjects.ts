import { EditObject } from '../atoms/CollectObjectsAtom';

export const saveObjects = async (boxId: number, objects: EditObject[]): Promise<void> => {
    console.log(boxId, objects);
};
