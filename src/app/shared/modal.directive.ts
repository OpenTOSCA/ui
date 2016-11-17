/*******************************************************************************
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 *******************************************************************************/
import {ModalModule, ModalOptions} from 'ng2-bootstrap/ng2-bootstrap';
import {Directive, Input, AfterViewInit, OnDestroy, Output, EventEmitter} from '@angular/core';

@Directive({
    selector: '[bsModal]',
    exportAs: 'bs-modal'
})
export class ModalDirective implements AfterViewInit, OnDestroy {

    private _config: ModalOptions;
    @Output() public onShow: EventEmitter<ModalDirective> = new EventEmitter();
    @Output() public onShown: EventEmitter<ModalDirective> = new EventEmitter();
    @Output() public onHide: EventEmitter<ModalDirective> = new EventEmitter();
    @Output() public onHidden: EventEmitter<ModalDirective> = new EventEmitter();

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }

    @Input()
    public set config(conf: ModalOptions) {
        this._config = conf;
    };

}
