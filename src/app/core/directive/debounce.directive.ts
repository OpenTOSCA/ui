/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Tobias Wältken
 */
import { debounce } from 'rxjs/operator/debounce';
import { Http } from '@angular/http';
import { async } from '@angular/core/testing/src/testing';

import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';


@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[opentosca-ui-debounce]',
    // tslint:disable-next-line:use-host-property-decorator
    host: {
        '[(ngModel)]': 'inputValue'
    }
})
export class DebounceDirective {

    @Input()
    opentoscaUiDebounce = 300;

    @Output()
    debouncedValue: EventEmitter<string> = new EventEmitter<string>();

    inputValue: string;

    constructor(private elementRef: ElementRef, private http: Http) {
        Observable
            .fromEvent(elementRef.nativeElement, 'keyup')
            .map(() => this.inputValue)
            .debounceTime(this.opentoscaUiDebounce)
            .distinctUntilChanged()
            .subscribe(input => {
                this.debouncedValue.emit(input);
            });
    }
}
