import { Pipe, PipeTransform } from '@angular/core';
import * as Fuse from 'fuse.js';

@Pipe({ name: 'fuzzySearch' })
export class FuzzySearchPipe implements PipeTransform {

    transform<T>(items: T[], searchTerm: string, searchFields: Array<string>): T[] {

        if (!searchTerm || searchTerm.length === 0) {
            return items;
        }

        console.log('[fuzzy-search.pipe] Search term:', searchTerm);
        console.log('[fuzzy-search.pipe] Items:', items);

        const options = {
            // See http://fusejs.io
            shouldSort: true,
            threshold: 0.4,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 2,
            keys: searchFields
        };

        const fuse: Fuse = new Fuse(items, options);
        const filteredItems: T[] = fuse.search<T>(searchTerm);

        console.log('[fuzzy-search.pipe] Filtered Items:', filteredItems);
        return filteredItems;
    }
}
