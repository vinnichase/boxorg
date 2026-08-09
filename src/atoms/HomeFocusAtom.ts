import { atom } from '@gothub-team/got-atom';

export type HomeFocusState = 'search' | 'none';

export const HomeFocusAtom = atom<HomeFocusState>('none');
