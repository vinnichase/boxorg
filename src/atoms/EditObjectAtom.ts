import { atom } from '@gothub-team/got-atom';
import { ObjectWithTags } from '../db/accessLayer';

export const EditObjectAtom = atom<ObjectWithTags | null>(null);
