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
 *     Michael Wurster - initial implementation
 */
import { ApplicationManagementState } from '../application-management/application-management.reducer';
import { RepositoryManagementState } from '../repository-management/repository-management.reducer';
import { ConfigurationState } from '../configuration/configuration.reducer';
import { BreadcrumbState } from '../core/component/breadcrumb/breadcrumb.reducer';

export interface AppState {
    container?: ApplicationManagementState;
    repository?: RepositoryManagementState;
    administration?: ConfigurationState;
    breadcrumb?: BreadcrumbState;
}
