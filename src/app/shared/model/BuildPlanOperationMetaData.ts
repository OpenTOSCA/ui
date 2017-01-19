/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal
 */

import { PlanParameters } from './plan-parameters.model';
import { ResourceReference } from './resource-reference.model';

export class BuildPlanOperationMetaData {
    Plan: PlanParameters;
    Reference: ResourceReference;
}
