import { atom } from '@gothub-team/got-atom';
import { getObjectsWithTags, ObjectWithTags, openDb, searchObjects } from '../db/accessLayer';

type Search = {
    show: boolean;
    query: string;
};

export const SearchAtom = atom<Search>({ show: false, query: '' });

export const SearchResultsAtom = atom<ObjectWithTags[]>([]);

SearchAtom.subscribe({
    next: (a) => {
        if (!a.show) return;
        executeSearch();
    },
});

export function executeSearch() {
    const { query } = SearchAtom.get();
    const trimmedQuery = query.trim();
    const db = openDb();
    const records =
        (trimmedQuery ? searchObjects(db, trimmedQuery) : getObjectsWithTags(db))?.reduce((acc, o) => {
            const accO = acc[o.id] ?? { ...o, tags: [] };
            o.tag && accO.tags.push(o.tag);
            return {
                ...acc,
                [o.id]: accO,
            };
        }, {} as Record<number, ObjectWithTags>) ?? {};
    db.closeSync();
    SearchResultsAtom.set(Object.values(records));
}
