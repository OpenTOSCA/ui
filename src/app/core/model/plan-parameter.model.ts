/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 */
export class PlanParameter {
    // Deprecated
    public Name: string;        // tslint:disable-line:variable-name
    public Type: string;        // tslint:disable-line:variable-name
    public Required: string;    // tslint:disable-line:variable-name
    public Value: string;       // tslint:disable-line:variable-name

    // New API Model
    public name: string;
    public type: string;
    public required: string;
    public value: string;
}
