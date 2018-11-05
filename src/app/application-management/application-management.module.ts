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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationManagementRoutingModule } from './application-management-routing.module';
import { ConfigurationService } from './../configuration/configuration.service';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { CoreModule } from '../core/core.module';
import { ApplicationInstanceDetailComponent } from './application-instance-detail/application-instance-detail.component';
import { ApplicationInstanceDetailResolverService } from './application-instance-detail/application-instance-detail-resolver.service';
import { ApplicationInstanceListComponent } from './application-instance-list/application-instance-list.component';
import { ApplicationUploadComponent } from './application-upload/application-upload.component';
import { ApplicationDetailResolverService } from './application-detail/application-detail-resolver.service';
import { ApplicationComponent } from './application/application.component';
import { ApplicationOverviewComponent } from './application-overview/application-overview.component';
import { RouterModule } from '@angular/router';
import {
    AccordionModule,
    ButtonModule,
    DataTableModule,
    DialogModule,
    FieldsetModule,
    ProgressBarModule,
    SharedModule,
    ToolbarModule,
    TooltipModule
} from 'primeng/primeng';
import { FormsModule } from '@angular/forms';
import { NgxUploaderModule } from 'ngx-uploader';
import { NgSpinKitModule } from 'ng-spin-kit';
import { DeploymentCompletionService } from '../core/service/deployment-completion.service';
import { BuildplanMonitorComponent } from './buildplan-monitor/buildplan-monitor.component';
import { ManagementPlanListComponent } from './management-plan-list/management-plan-list.component';
import { ManagementPlanExecutionDialogComponent } from './management-plan-execution-dialog/management-plan-execution-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    imports: [
        ApplicationManagementRoutingModule,
        CommonModule,
        FormsModule,
        DialogModule,
        DataTableModule,
        SharedModule,
        NgxUploaderModule,
        TooltipModule,
        ProgressBarModule,
        NoopAnimationsModule,
        NgSpinKitModule,
        RouterModule,
        FieldsetModule,
        AccordionModule,
        CoreModule,
        ToolbarModule,
        ButtonModule
    ],
    declarations: [
        ApplicationDetailComponent,
        ApplicationInstanceDetailComponent,
        ApplicationInstanceListComponent,
        ApplicationUploadComponent,
        ApplicationComponent,
        ApplicationOverviewComponent,
        BuildplanMonitorComponent,
        ManagementPlanListComponent,
        ManagementPlanExecutionDialogComponent
    ],
    providers: [
        ConfigurationService,
        ApplicationInstanceDetailResolverService,
        ApplicationDetailResolverService,
        DeploymentCompletionService
    ]
})
export class ApplicationManagementModule {
}
