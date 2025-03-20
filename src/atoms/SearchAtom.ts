import { atom } from '@gothub-team/got-atom';

type Search = {
    show: boolean;
    query: string;
};

export const SearchAtom = atom<Search>({ show: false, query: '' });

// SearchAtom.subscribe({ next: console.log });
