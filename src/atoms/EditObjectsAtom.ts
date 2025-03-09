import { atom } from '@gothub-team/got-atom';

type EditObjects = {
    index: number;
    objects: (EditObject | undefined)[];
};

export type EditObject = {
    deleted: boolean;
    uri?: string;
    tags?: string[];
};

export const EditObjectsAtom = atom<EditObjects>({ index: 0, objects: [] });
