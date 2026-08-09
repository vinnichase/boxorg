import { atom } from '@gothub-team/got-atom';

type CollectObjects = {
    boxId?: number;
    image?: {
        uri: string;
        width: number;
        height: number;
    };
    index: number;
    objects: EditObject[];
};

export type EditObject = {
    deleted: boolean;
    uri: string;
    tags: string[];
    boxId?: number;
};

export const CollectObjectsAtom = atom<CollectObjects>({ index: 0, objects: [] });

// CollectObjectsAtom.subscribe({ next: console.log });
