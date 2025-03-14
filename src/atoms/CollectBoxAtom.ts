import { atom } from '@gothub-team/got-atom';

type CollectBox = {
    boxId?: number;
};

export const CollectBoxAtom = atom<CollectBox>({});
