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
import { PlanParameter } from './plan-parameter.model';

export class PlanParameters {
    public ID: string;                                                  // tslint:disable-line:variable-name
    public Name: string;                                                // tslint:disable-line:variable-name
    public PlanType: string;                                            // tslint:disable-line:variable-name
    public PlanLanguage: string;                                        // tslint:disable-line:variable-name
    public InputParameters: Array<{InputParameter: PlanParameter}>;     // tslint:disable-line:variable-name
    public OutputParameters: Array<{OutputParameter: PlanParameter}>;   // tslint:disable-line:variable-name
    public PlanModelReference: {Reference: string};                     // tslint:disable-line:variable-name
}
