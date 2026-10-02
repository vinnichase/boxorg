import { atom } from '@gothub-team/got-atom';
import { loadBoxTags } from '../service/boxTags';
import { setPath } from '../util/setPath';

type CollectObjects = {
    boxId?: number;
    // box tag drafts per box number entered on collect or label; saved with
    // the objects for the boxes that end up receiving one
    boxTags: Record<number, string[]>;
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

export const CollectObjectsAtom = atom<CollectObjects>({ index: 0, objects: [], boxTags: {} });

// a box number entered on collect or label pulls the box's saved tags into the
// draft once; later edits stay in the draft until the collect save
export const loadCollectBoxTags = (boxId: number) =>
    CollectObjectsAtom.set((a) => (a.boxTags[boxId] ? a : setPath(['boxTags', boxId], loadBoxTags(boxId), a)));

// CollectObjectsAtom.subscribe({ next: console.log });
