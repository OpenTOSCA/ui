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

import {Component, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ServiceTemplateInstance} from '../../core/model/service-template-instance.model';
import {BuildplanMonitoringService} from '../../core/service/buildplan-monitoring.service';
import {PlanInstance} from '../../core/model/plan-instance.model';

@Component({
    selector: 'opentosca-buildplan-monitor',
    templateUrl: './buildplan-monitor.component.html',
    styleUrls: ['./buildplan-monitor.component.scss']
})
export class BuildplanMonitorComponent implements OnInit, OnDestroy {

    @Input('service-template-instance')
    stInstance: ServiceTemplateInstance;

    public bpInstance: PlanInstance;
    selfserviceApplicationUrl: string;
    private timeout: any;

    constructor(private bpMonitor: BuildplanMonitoringService) {
    }

    ngOnDestroy() {
        clearTimeout(this.timeout);
    }

    ngOnInit() {
        this.bpMonitor.getBuildPlan(this.stInstance._links['build_plan_instance'].href)
            .subscribe(result => {
                this.bpInstance = result;
                // this.setSelfServiceApplicationUrl(this.getSelfServiceApplicationUrlFromOutput());
                if (result.state !== 'FINISHED') {
                    this.pollForPlanFinish();
                }
            });
    }

    pollForPlanFinish(): void {
        this.bpMonitor.getBuildPlan(this.stInstance._links['build_plan_instance'].href)
            .subscribe(result => {
                this.bpInstance = result;
                if (result.state !== 'FINISHED') {
                    this.timeout = setTimeout(() => this.pollForPlanFinish(), 2000);
                } else {
                    clearTimeout(this.timeout);
                    this.setSelfServiceApplicationUrl(this.getSelfServiceApplicationUrlFromOutput());
                }
            });
    }

    setSelfServiceApplicationUrl(url: string): void {
        this.selfserviceApplicationUrl = url;
    }

    getSelfServiceApplicationUrlFromOutput(): string {
        for (const out of this.bpInstance.output) {
            if (out.name === 'selfserviceApplicationUrl') {
                return out.value;
            }
        }
        return '';
    }

}
