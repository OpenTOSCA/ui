import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'opentosca-ui-search',
    templateUrl: 'search.component.html',
    styleUrls: ['search.component.scss']
})
export class SearchComponent {

    @Input()
    public placeholder = '';

    @Output()
    searchTermChanged: EventEmitter<string> = new EventEmitter<string>();

    public valueChanged(searchTerm: string): void {
        console.log('[search.component] Search value changed:', searchTerm);
        this.searchTermChanged.emit(searchTerm);
    }
}
