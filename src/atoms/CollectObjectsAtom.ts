import { atom } from '@gothub-team/got-atom';

type CollectObjects = {
    boxId?: number;
    uri?: string;
    index: number;
    objects: EditObject[];
};

export type EditObject = {
    deleted: boolean;
    tags: string[];
    // x,y,w
    rect: [number, number, number];
};

export const CollectObjectsAtom = atom<CollectObjects>({ index: 0, objects: [] });

CollectObjectsAtom.subscribe({ next: console.log });
