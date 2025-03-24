import { atom } from '@gothub-team/got-atom';

type SegmentImage = {
    uri: string;
    width: number;
    height: number;
};

export const SegmentImageAtom = atom<SegmentImage | null>(null);

// SegmentImageAtom.subscribe({ next: console.log });
