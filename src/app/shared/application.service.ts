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
 *     Jasmin Guth - initial implementation
 */
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { AdministrationService } from '../administration/administration.service';
import { Application } from './model/application.model';
import { ApplicationInstance } from './model/application-instance.model';
import { ApplicationInstanceSmartServiceDetails } from './model/application-instance-smartservice-details.model';
import { BuildplanPollResource } from './model/buildplan-poll-resource.model';
import { ErrorHandler } from './helper/handleError';
import { Path } from './helper/Path';
import { PlanParameters } from './model/plan-parameters.model';
import { ReferenceHelper } from './helper/ReferenceHelper';
import { ResourceReference } from './model/resource-reference.model';
import { BuildPlanOperationMetaData } from './model/buildPlanOperationMetaData.model';
import { PlanInstance } from './model/plan-instance.model';

import * as _ from 'lodash';

@Injectable()
export class ApplicationService {

    /**
     * Helper that ensures that appID always ends with .csar
     * @param appID
     * @returns {string}
     */
    static fixAppID(appID: string): string {
        return _.endsWith(appID.toLowerCase(), '.csar') ? appID : appID + '.csar';
    }

    constructor(private http: Http, private adminService: AdministrationService) {
    }

    /**
     * Deletes the app from the container
     * @param appID
     * @returns {Promise<any>}
     */
    deleteAppFromContainer(appID: string): Promise<any> {
        const url = new Path(this.adminService.getContainerAPIURL())
            .append('CSARs')
            .append(ApplicationService.fixAppID(appID))
            .toString();
        let headers = new Headers({'Accept': 'text/plain'});
        return this.http.delete(url, {headers: headers})
            .toPromise();
    }

    /**
     * Retrieve a list of references to deployed applications
     * @returns {Promise<ResourceReference[]>}
     */
    getApps(): Promise<ResourceReference[]> {
        const url = this.adminService.getContainerAPIURL() + '/CSARs';
        return this.http.get(url, {headers: this.adminService.getDefaultAcceptJSONHeaders()})
            .toPromise()
            .then(response => response.json().References as ResourceReference[])
            .catch(err => ErrorHandler.handleError('[application.service][getApps]', err));
    }

    /**
     * Fetches PlanParameters
     * @param url
     * @returns {Promise<PlanParameters>}
     */
    getPlanOutputParameter(url: string): Promise<PlanParameters> {
        return this.http.get(url, {headers: this.adminService.getDefaultAcceptJSONHeaders()})
            .toPromise()
            .then(result => result.json() as PlanParameters)
            .catch(err => ErrorHandler.handleError('[application.service][getPlanOutputParameter]', err));
    }

    /**
     * Lookup the parameters required by the buildplan of a CSAR
     * @param appID
     * @returns {Promise<PlanParameters>}
     */
    getBuildPlanParameters(appID: string): Promise<BuildPlanOperationMetaData> {
        // /containerapi/CSARs/FlinkApp_ServiceTemplate_DUMMY.csar/ServiceTemplates/<pick first>/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/
        // Operations/instantiate/Plan/FlinkApp_ServiceTemplate_buildPlan

        return this.getServiceTemplatePath(appID)
            .then(serviceTemplatePath => {
                const url = new Path(serviceTemplatePath).append(this.adminService.getBuildPlanPath()).toString();
                return this.http.get(url, {headers: this.adminService.getDefaultAcceptJSONHeaders()})
                    .toPromise()
                    .then(response => response.json() as BuildPlanOperationMetaData)
                    .catch(err => ErrorHandler.handleError('[application.service][getBuildPlanParameters]', err));
            })
            .catch(err => ErrorHandler.handleError('[application.service][getBuildPlanParameters]', err));
    }

    /**
     * Fetches the URL to the ServiceTemplate of the given AppID
     * @param appID
     * @returns {Promise<string>}
     */
    getServiceTemplatePath(appID: string): Promise<string> {
        const url = new Path(this.adminService.getContainerAPIURL())
            .append('CSARs')
            .append(ApplicationService.fixAppID(appID))
            .append('ServiceTemplates').toString();

        return this.http.get(url, {headers: this.adminService.getDefaultAcceptJSONHeaders()})
            .toPromise()
            .then(response => {
                let resRefs = response.json().References as Array<ResourceReference>;
                for (let ref of resRefs) {
                    if (!ReferenceHelper.isSelfReference(ref)) {
                        return ref.href;
                    }
                }
                Promise.reject(new Error(JSON.stringify(resRefs)));
            })
            .catch(err => ErrorHandler.handleError('[application.service][getServiceTemplatePath]', err));
    }

    /**
     * Triggers the provisioning of a new service instance
     * @param appID ID (CSAR name) of the service which shall be provisioned
     * @param planMetaData PlanParameters object that containes required input parameters for the buildplan
     * @returns {Promise<BuildplanPollResource>}
     */
    startProvisioning(appID: string, planMetaData: BuildPlanOperationMetaData): Promise<BuildplanPollResource> {
        console.log(JSON.stringify(planMetaData));
        let headers = new Headers(this.adminService.getDefaultAcceptJSONHeaders());
        headers.append('Content-Type', 'text/plain');

        return this.http.post(planMetaData.Reference.href, planMetaData.Plan, {headers: headers})
            .toPromise()
            .then(response => {
                console.log('Server responded to post: ' + response);
                return response.json();
            })
            .catch(err => ErrorHandler.handleError('[application.service][startProvisioning]', err));
    }

    pollForServiceTemplateInstanceCreation(pollURL: string): Promise<string> {
        return this.http.get(pollURL, {headers: this.adminService.getDefaultAcceptJSONHeaders()})
            .toPromise()
            .then(result => {
                let references = result.json().References as Array<ResourceReference>;
                if (references.length === 2) {
                    for (let ref of references) {
                        if (!ReferenceHelper.isSelfReference(ref)) {
                            return ref.href;
                        }
                    }
                    // ohoh, we did not find a reference that is not self reference
                    ErrorHandler.handleError('[application.service][pollForServiceTemplateInstanceCreation]', new Error('There are only self references in returned list of ServiceTemplateInstances'));    // tslint:disable-line:max-line-length
                } else {
                    // ServiceTemplateInstance not created yet, query again
                    return new Promise((resolve) => setTimeout(() => resolve(this.pollForServiceTemplateInstanceCreation(pollURL)), 1000));
                }
            })
            .catch(err => ErrorHandler.handleError('[application.service][pollForServiceTemplateInstanceCreation]', err));
    }

    getPlanOutput(url: string): Promise<PlanParameters> {
        return this.http.get(url, {headers: this.adminService.getDefaultAcceptJSONHeaders()})
            .toPromise()
            .then(response => response.json())
            .catch(err => ErrorHandler.handleError('[application.service][getPlanoutput]', err));
    }

    /**
     * Poll for finishing of a buildplan
     * @param pollUrl URL retrieved from buildplan call (POST to CSAR resource)
     * @returns {Promise<PlanParameters>}
     */
    pollForPlanFinish(pollUrl: string): Promise<PlanInstance> {
        const reqOpts = new RequestOptions({headers: this.adminService.getDefaultAcceptJSONHeaders()});
        console.log('Polling for plan result');
        return this.http.get(pollUrl, reqOpts)
            .toPromise()
            .then(response => {
                let res = response.json() as PlanInstance;

                if (res.PlanInstance && res.PlanInstance.State === 'running') {
                    console.log('Plan is still running, polling again in 1000ms');
                    return new Promise((resolve) => setTimeout(() => resolve(this.pollForPlanFinish(pollUrl)), 1000));
                } else {
                    // now fetch the output
                    return res;
                }
            })
            .catch(err => ErrorHandler.handleError('[application.service][pollForPlanFinish]', err));
    }

    /**
     * Returns a list of instances for the given appID
     * @param appID
     * @returns {Promise<Array<ResourceReference>>}
     */
    getServiceTemplateInstancesByCsarName(appID: string): Promise<Array<ResourceReference>> {
        appID = ApplicationService.fixAppID(appID);
        const instanceAPIUrl = this.adminService.getContainerAPIURL() + '/instancedata/serviceInstances';
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(instanceAPIUrl, reqOpts)
            .toPromise()
            .then(result => result.json().References as Array<ResourceReference>)
            .catch(err => ErrorHandler.handleError('[application.service][getServiceTemplateInstancesByCsarName]', err));
    }

    /**
     * Returns a list of all service instances
     * @returns {Promise<Array<ResourceReference>>}
     */
    getAllInstances(): Promise<Array<ResourceReference>> {
        const instanceAPIUrl = this.adminService.getContainerAPIURL() + '/instancedata/serviceInstances';
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(instanceAPIUrl, reqOpts)
            .toPromise()
            .then(result => result.json().References as Array<ResourceReference>)
            .catch(err => ErrorHandler.handleError('[application.service][getAllInstances]', err));
    }

    /**
     * Checks if an App with given appID is already deployed in container
     * @param appID
     * @returns {Promise<boolean>}
     */
    isAppDeployedInContainer(appID: string): Promise<boolean> {
        appID = ApplicationService.fixAppID(appID);
        const csarUrl = this.adminService.getContainerAPIURL() + '/CSARs/' + appID;
        let headers = new Headers({'Accept': 'application/json'});
        return this.http.get(csarUrl, {headers: headers})
            .toPromise()
            .then(response => true)
            .catch(reason => false);
    }

    /**
     * Retrieve app description from data.json
     * @param appID CSAR id/name (e.g. XYZ.csar)
     * @returns {Promise<Application>}
     */
    getAppDescription(appID: string): Promise<Application> {
        appID = ApplicationService.fixAppID(appID);
        const metaDataUrl = this.adminService.getContainerAPIURL() + '/CSARs/' + appID + '/Content/SELFSERVICE-Metadata';
        const dataJSONUrl = metaDataUrl + '/data.json';
        let headers = new Headers({'Accept': 'application/json'});

        return this.http.get(dataJSONUrl, {headers: headers})
            .toPromise()
            .then(response => {
                let app = response.json() as Application;
                // we only use appIDs without .csar for navigation in new ui, since angular2 router did not route to paths containing '.'
                app.id = appID.indexOf('.csar') > -1 ? appID.split('.')[0] : appID;
                app.iconUrl = metaDataUrl + '/' + app.iconUrl;
                app.imageUrl = metaDataUrl + '/' + app.imageUrl;
                for (let i in app.screenshotUrls) {
                    if (app.screenshotUrls[i]) {
                        app.screenshotUrls[i] = metaDataUrl + '/' + app.screenshotUrls[i];
                    }
                }
                return app;
            })
            .catch(err => {
                if (err.status === 404) {
                    // we found a CSAR that does not contain a data.json, so use default values
                    let app = new Application();
                    app.id = appID.indexOf('.csar') > -1 ? appID.split('.')[0] : appID;
                    app.csarName = appID;
                    app.displayName = appID.indexOf('.csar') > -1 ? appID.split('.')[0] : appID;
                    app.categories = ['others'];
                    app.iconUrl = '../../assets/img/Applications_Header_Icon.png';
                    app.imageUrl = '';
                    return app;
                } else {
                    ErrorHandler.handleError('[application.service][getAppDescription]', err);
                }
            });
    }
}
