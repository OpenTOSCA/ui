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

import { Application } from './model/application.model';
import { ResourceReference } from './model/resource-reference.model';
import { PlanParameters } from './model/plan-parameters.model';
import { AdministrationService } from '../administration/administration.service';
import { BuildplanPollResource } from './model/buildplan-poll-resource.model';
import { ApplicationInstance } from './model/application-instance.model';
import { ApplicationInstanceSmartServiceDetails } from './model/application-instance-smartservice-details.model';
import { ErrorHandler } from './helper/handleError';

@Injectable()
export class ApplicationService {

    /**
     * Helper that ensures that appID always ends with .csar
     * @param appID
     * @returns {string}
     */
    static fixAppID(appID: string): string {
        // ensure that appID always ends with .csar
        return appID.indexOf('.csar') === -1 ? appID + '.csar' : appID;
    }

    constructor(private http: Http, private adminService: AdministrationService) {
    }

    /**
     * Deletes the app from the container
     * @param appID
     * @returns {Promise<any>}
     */
    deleteAppFromContainer(appID: string): Promise<any> {
        const url = this.adminService.getContainerAPIURL() + '/CSARs/' + appID;
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
        let headers = new Headers({'Accept': 'application/json'});
        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => response.json().References as ResourceReference[])
            .catch(err => ErrorHandler.handleError('[application.service][getApps]', err));
    }

    /**
     * Lookup the parameters required by the buildplan of a CSAR
     * @param appID
     * @returns {Promise<PlanParameters>}
     */
    getBuildPlanParameters(appID: string): Promise<PlanParameters> {
        // /containerapi/CSARs/FlinkApp_ServiceTemplate_DUMMY.csar/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/
        // Operations/instantiate/Plan/FlinkApp_ServiceTemplate_buildPlan

        // firstly, fetch plans to find buildplan --> don't use self reference
        const url = this.adminService.getContainerAPIURL() + '/CSARs/' + appID + '.csar' + this.adminService.getBuildPlanPath();
        let headers = new Headers({'Accept': 'application/json'});
        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => {
                    let references = response.json().References as ResourceReference[];

                    for (let ref of references) {
                        // we pick the first reference that is not the self reference to the plan resource
                        if (ref.title !== 'Self') {
                            return this.http.get(ref.href, {headers: headers})
                                .toPromise()
                                .then(planParam => planParam.json() as PlanParameters)
                                .catch(err => ErrorHandler.handleError('[application.service][getBuildPlanParameters]', err));
                        }
                    }
                    // okay, we did not get a reference to a plan, so reject the promise
                    ErrorHandler.handleError('[application.service][getBuildPlanParameters]', new Error('No reference to buildplan available'));
                }
            )
            .catch(err => ErrorHandler.handleError('[application.service][getBuildPlanParameters]', err));
    }

    /**
     * Triggers the provisioning of a new service instance
     * @param appID ID (CSAR name) of the service which shall be provisioned
     * @param params PlanParameters object that containes required input parameters for the buildplan
     * @returns {Promise<BuildplanPollResource>}
     */
    startProvisioning(appID: string, params: PlanParameters): Promise<BuildplanPollResource> {
        const url = this.adminService.getContainerAPIURL() + '/CSARs/' + appID + '.csar' + '/Instances';
        console.log(JSON.stringify(params));

        let headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
        });
        return this.http.post(url, params, {headers: headers})
            .toPromise()
            .then(response => {
                console.log('Server responded to post: ' + response);
                return response.json();
            })
            .catch(err => ErrorHandler.handleError('[application.service][startProvisioning]', err));
    }

    /**
     * Poll for finishing of a buildplan
     * @param pollUrl URL retrieved from buildplan call (POST to CSAR resource)
     * @returns {Promise<PlanParameters>}
     */
    pollForResult(pollUrl: string): Promise<PlanParameters> {
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        console.log('Polling for plan result');
        return this.http.get(pollUrl, reqOpts)
            .toPromise()
            .then(response => {
                let res = response.json() as {result: {status: string}};
                if (res.result && res.result.status && res.result.status === 'PENDING') {
                    console.log('Received not final plan result, polling again in 1000ms');
                    return new Promise((resolve) => setTimeout(() => resolve(this.pollForResult(pollUrl)), 1000));
                } else {
                    // we got a plan result
                    return Promise.resolve(response.json());
                }
            })
            .catch(err => ErrorHandler.handleError('[application.service][pollForResult]', err));
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
                    app.iconUrl = '';
                    app.imageUrl = '';
                    return app;
                } else if (err.status === 400) {
                    // there is no CSAR with that id
                    return ErrorHandler.handleError('[application.service][getAppDescription]', err);
                } else {
                    ErrorHandler.handleError('[application.service][getAppDescription]', err);
                }
            });
    }
}
