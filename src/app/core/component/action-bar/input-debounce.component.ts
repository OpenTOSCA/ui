import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Component({
    selector: 'opentosca-ui-input-debounce',
    template: '<input type="text" class="form-control" [placeholder]="placeholder" [(ngModel)]="inputValue">'
})
export class InputDebounceComponent {

    @Input()
    delay = 300;

    @Input()
    placeholder: string;

    @Output()
    value: EventEmitter<string> = new EventEmitter<string>();

    inputValue: string;

    constructor(private elementRef: ElementRef) {
        const s = Observable.fromEvent(elementRef.nativeElement, 'keyup')
                            .map(() => this.inputValue)
                            .debounceTime(this.delay)
                            .distinctUntilChanged();
        s.subscribe(input => {
            console.log('[input-debounce.component] Publish Input:', input);
            this.value.emit(input);
        });
    }
}
