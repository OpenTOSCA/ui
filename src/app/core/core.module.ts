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
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from './component/breadcrumb/breadcrumb.component';
import { SortPipe } from './pipe/sort.pipe';
import { LoggerService } from './service/logger.service';
import { ApplicationManagementService } from './service/application-management.service';
import { ApplicationInstanceManagementService } from './service/application-instance-management.service';
import { ConfigurationModule } from '../configuration/configuration.module';
import { RepositoryService } from './service/repository.service';
import { RouterModule } from '@angular/router';
import { ActionBarComponent } from './component/action-bar/action-bar.component';
import { ActionItemComponent } from './component/action-bar/action-item.component';
import { FuzzySearchPipe } from './pipe/fuzzy-search.pipe';
import { FilterComponent } from './component/filter.component';
import { DeploymentCompletionComponent } from './component/deployment-completion/deployment-completion.component';
import { DeploymentCompletionService } from './service/deployment-completion.service';
import { HumanizeBytesPipe } from './pipe/humanize-bytes.pipe';
import { BreadcrumbModule, ConfirmDialogModule, DialogModule, InputTextModule } from 'primeng/primeng';
import { BuildplanMonitoringService } from './service/buildplan-monitoring.service';
import { FilterOutputParams } from './pipe/filter-output-params.pipe';
import { DebouncedValidatedInputComponent } from './component/input-debounce/debounced-validated-input.component';
import { DebounceDirective } from './directive/debounce.directive';
import { ManagementPlanService } from './service/management-plan.service';
import { DeploymentTestService } from './service/deployment-test.service';

@NgModule({
    imports: [
        BreadcrumbModule,
        CommonModule,
        DialogModule,
        FormsModule,
        RouterModule,
        InputTextModule,
        ConfigurationModule,
        ConfirmDialogModule
    ],
    declarations: [
        ActionBarComponent,
        ActionItemComponent,
        BreadcrumbComponent,
        FuzzySearchPipe,
        DebounceDirective,
        DebouncedValidatedInputComponent,
        FilterComponent,
        DeploymentCompletionComponent,
        SortPipe,
        HumanizeBytesPipe,
        FilterOutputParams,
    ],
    exports: [
        ActionBarComponent,
        ActionItemComponent,
        BreadcrumbComponent,
        FuzzySearchPipe,
        DebounceDirective,
        DebouncedValidatedInputComponent,
        FilterComponent,
        DeploymentCompletionComponent,
        SortPipe,
        HumanizeBytesPipe,
        FilterOutputParams
    ],
    providers: [
        ApplicationInstanceManagementService,
        ApplicationManagementService,
        LoggerService,
        DatePipe,
        RepositoryService,
        DeploymentCompletionService,
        BuildplanMonitoringService,
        ManagementPlanService,
        DeploymentTestService
    ]
})
export class CoreModule {
}
