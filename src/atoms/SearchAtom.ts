import { atom } from '@gothub-team/got-atom';
import {
    getObjectsWithTags,
    getObjectsWithTagsByBoxId,
    ObjectWithTags,
    openDb,
    searchObjects,
} from '../db/accessLayer';

type Search = {
    show: boolean;
    query: string;
};

export const SearchAtom = atom<Search>({ show: false, query: '' });

// results stay in query order; consecutive hits of one box form a group, and a
// box that shows up again later is merged into its first group
export type SearchResultGroup = {
    boxId: number;
    objects: ObjectWithTags[];
};

export const SearchResultsAtom = atom<SearchResultGroup[]>([]);

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
    const queryResults = (() => {
        if (!trimmedQuery) return getObjectsWithTags(db);
        if (!trimmedQuery.startsWith('#')) return searchObjects(db, trimmedQuery);

        const boxId = parseInt(trimmedQuery.slice(1), 10);
        return Number.isNaN(boxId) ? [] : getObjectsWithTagsByBoxId(db, boxId);
    })();
    const records =
        queryResults?.reduce((acc, o) => {
            const accO = acc[o.id] ?? { ...o, tags: [] };
            o.tag && accO.tags.push(o.tag);
            return {
                ...acc,
                [o.id]: accO,
            };
        }, {} as Record<number, ObjectWithTags>) ?? {};
    db.closeSync();

    const groups = Object.values(records).reduce((acc, object) => {
        const group = acc.find((g) => g.boxId === object.box_id);
        if (group) {
            group.objects.push(object);
            return acc;
        }
        return [...acc, { boxId: object.box_id, objects: [object] }];
    }, [] as SearchResultGroup[]);
    SearchResultsAtom.set(groups);
}
