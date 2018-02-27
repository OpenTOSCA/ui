/**
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 */

import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ServiceTemplateInstance } from '../../core/model/new-api/service-template-instance.model';
import { ManagementPlanService } from '../../core/service/management-plan.service';
import { PlanList } from '../../core/model/new-api/plan-list.model';

@Component({
    selector: 'opentosca-management-plan-list',
    templateUrl: './management-plan-list.component.html'
})
export class ManagementPlanListComponent implements OnInit {

    @Input()
    instance: ServiceTemplateInstance;

    plans: Observable<PlanList>;

    constructor(private mplanService: ManagementPlanService) {
    }

    ngOnInit() {
        this.plans = this.mplanService.getManagementPlans(this.instance);
    }
}
