/*
 * Copyright (c) 2021 University of Stuttgart.
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

import { KeycloakService } from 'keycloak-angular';

export const initializeKeycloak = (keycloak: KeycloakService) => (): Promise<boolean> =>
    keycloak
        .init({
            config: {
                url: 'https://login.planqk.de',
                realm: 'planqk',
                clientId: 'planqk-login',
            },
            initOptions: {
                // onLoad: 'check-sso',
            },
            enableBearerInterceptor: false,
        })
        .then((retValue) => retValue);
