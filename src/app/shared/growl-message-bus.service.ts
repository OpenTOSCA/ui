/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 *     Jasmin Guth - initial implementation
 */
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Message } from 'primeng/components/common/api';

@Injectable()
export class GrowlMessageBusService {

    private _bus: Subject<Message> = new Subject();
    public messages: Observable<Message> = this._bus.asObservable();

    constructor() {
    }

    public emit(m: Message): void {
        this._bus.next(m);
    }
}
