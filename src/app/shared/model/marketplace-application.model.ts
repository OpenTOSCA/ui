/**
 * Copyright (c) 2016 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     Michael Falkenthal - initial implementation
 */
export class MarketplaceApplication {
    name: string;
    logoPath: string;
    topologyTemplatePath: string;

    id: string;
    csarName: string;
    csarURL: string;
    displayName: string;
    categories: string[];
    version: string;
    authors: string[];
    description: string;
    iconUrl: string;
    imageUrl: string;
    screenshotUrls: string[];
    options: Object[];
    inContainer: boolean;

}
