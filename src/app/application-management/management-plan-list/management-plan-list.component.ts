/*
 * Copyright (c) 2018 University of Stuttgart.
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the Apache Software License 2.0
 * which is available at https://www.apache.org/licenses/LICENSE-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0 OR Apache-2.0
 */

import { Component, Input, OnInit } from '@angular/core';
import { ServiceTemplateInstance } from '../../core/model/service-template-instance.model';
import { ManagementPlanService } from '../../core/service/management-plan.service';
import { PlanList } from '../../core/model/plan-list.model';
import { Plan } from '../../core/model/plan.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'opentosca-management-plan-list',
    templateUrl: './management-plan-list.component.html'
})
export class ManagementPlanListComponent implements OnInit {

    @Input()
    instance: ServiceTemplateInstance;

    plans: Observable<PlanList>;

    plan: Plan;
    dialogVisible = false;

    constructor(private mplanService: ManagementPlanService) {
    }

    ngOnInit() {
        this.plans = this.mplanService.getManagementPlans(this.instance);
    }

    showDialog(plan: Plan): void {
        if (this.dialogVisible) {
            alert('Error');
        }

        this.plan = plan;
        this.dialogVisible = true;
    }
}
