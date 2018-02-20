/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Wurster - initial implementation
 */
import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Component({
    selector: 'opentosca-input-debounce',
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
