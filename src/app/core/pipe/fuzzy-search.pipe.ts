import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fuzzySearch' })
export class FuzzySearchPipe implements PipeTransform {

    transform<T>(items: Array<T>, searchTerm: string): Array<T> {

        if (!searchTerm || searchTerm.length === 0) {
            return items;
        }

        console.log('[fuzzy-search.pipe] Items:', items);
        console.log('[fuzzy-search.pipe] Search term:', searchTerm);

        return items;
    }
}
