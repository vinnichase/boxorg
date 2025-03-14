import { atom } from '@gothub-team/got-atom';

type CollectObjects = {
    boxId?: number;
    index: number;
    objects: EditObject[];
};

export type EditObject = {
    deleted: boolean;
    uri: string;
    tags: string[];
};

export const CollectObjectsAtom = atom<CollectObjects>({ index: 0, objects: [] });

CollectObjectsAtom.subscribe({ next: console.log });
