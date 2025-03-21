import { atom } from '@gothub-team/got-atom';

type SegmentImage = {
    base64: string;
    uri: string;
    width: number;
    height: number;
};

export const SegmentImageAtom = atom<SegmentImage | null>(null);

// SegmentImageAtom.subscribe({ next: console.log });
