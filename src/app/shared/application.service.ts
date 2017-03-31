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
import { BuildplanPollResource } from './model/buildplan-poll-resource.model';
import { OpenToscaLogger } from './helper';
import { Path } from './helper';
import { PlanParameters } from './model/plan-parameters.model';
import { ReferenceHelper } from './helper';
import { ResourceReference } from './model/resource-reference.model';
import { PlanOperationMetaData } from './model/planOperationMetaData.model';
import { PlanInstance } from './model/plan-instance.model';

import * as _ from 'lodash';
import { ApplicationInstanceProperties } from './model/application-instance-properties.model';
import { ObjectHelper } from './helper/ObjectHelper';
import { Observable } from 'rxjs';

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

    constructor(private http: Http,
                private adminService: AdministrationService,
                private logger: OpenToscaLogger) {
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
        this.logger.log('[application.service][deleteAppFromContainer]', 'Sending delete to ' + url);
        return this.http.delete(url, {headers: headers})
            .toPromise();
    }

    deleteApplicationInstance(appInstanceURL: string): Promise<any> {
        this.logger.log('[application.service][deleteApplicationInstance]', 'Trying to delete: ' + appInstanceURL);
        return this.http.delete(appInstanceURL)
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
            .catch(err => this.logger.handleError('[application.service][getApps]', err));
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
            .catch(err => this.logger.handleError('[application.service][getPlanOutputParameter]', err));
    }

    /**
     * Lookup the parameters required by the buildplan of a CSAR
     * @param appID
     * @returns {Observable<PlanParameters>}
     */
    getBuildPlanParameters(appID: string): Observable<PlanOperationMetaData> {
        return this.getServiceTemplatePath(appID)
            .flatMap(serviceTemplatePath => {
                const url = new Path(serviceTemplatePath)
                    .append(this.adminService.getBuildPlanPath()).toString();
                return this.http.get(url, {headers: this.adminService.getDefaultAcceptJSONHeaders()})
                    .map(response => response.json() as PlanOperationMetaData)
                    .catch(err => this.logger.handleObservableError('[application.service][getBuildPlanParameters]', err));
            })
            .catch(err => this.logger.handleObservableError('[application.service][getBuildPlanParameters]', err));
    }

    getTerminationPlan(appID: string): Observable<any> {
        return this.getServiceTemplatePath(appID)
            .flatMap(serviceTemplatePath => {
                const url = new Path(serviceTemplatePath)
                    .append(this.adminService.getTerminationPlanPath()).toString();
                return this.http.get(url, {headers: this.adminService.getDefaultAcceptJSONHeaders()})
                    .map(response => response.json() as PlanOperationMetaData)
                    .catch(err => this.logger.handleObservableError('[application.service][getTerminationPlan]', err));
            })
            .catch(err => this.logger.handleObservableError('[application.service][getTerminationPlan]', err));
    }

    /**
     * Fetches the URL to the ServiceTemplate of the given AppID
     * @param appID
     * @returns {Promise<string>}
     */
    getServiceTemplatePath(appID: string): Observable<string> {
        const url = new Path(this.adminService.getContainerAPIURL())
            .append('CSARs')
            .append(ApplicationService.fixAppID(appID))
            .append('ServiceTemplates')
            .toString();

        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});

        return this.http.get(url, reqOpts)
            .map(response => {
                let resRefs = response.json().References as Array<ResourceReference>;
                for (let ref of resRefs) {
                    if (!ReferenceHelper.isSelfReference(ref)) {
                        return ref.href;
                    }
                }
                this.logger.handleObservableError('[application.service][getServiceTemplatePath]', new Error(JSON.stringify(resRefs)));
            })
            .catch(err => this.logger.handleObservableError('[application.service][getServiceTemplatePath]', err));
    }

    /**
     * Triggers the provisioning of a new service instance
     * @param appID ID (CSAR name) of the service which shall be provisioned
     * @param planMetaData PlanParameters object that containes required input parameters for the buildplan
     * @returns {Promise<BuildplanPollResource>}
     */
    startProvisioning(appID: string, planMetaData: PlanOperationMetaData): Promise<BuildplanPollResource> {
        this.logger.log('[application.service][startProvisioning]', 'Starting Provisioning');
        this.logger.log('[application.service][startProvisioning]', 'Build Plan Operation Meta Data are: ' + JSON.stringify(planMetaData));
        this.logger.log('[application.service][startProvisioning]', 'Posting to: ' + planMetaData.Reference.href);
        let headers = new Headers(this.adminService.getDefaultAcceptJSONHeaders());
        headers.append('Content-Type', 'text/plain');

        return this.http.post(planMetaData.Reference.href, planMetaData.Plan, {headers: headers})
            .toPromise()
            .then(response => {
                this.logger.log('[application.service][startProvisioning]', 'Server responded to post: ' + response);
                return response.json();
            })
            .catch(err => this.logger.handleError('[application.service][startProvisioning]', err));
    }

    pollForServiceTemplateInstanceCreation(pollURL: string): Promise<string> {
        const waitTime = 10000;

        this.logger.log('[application.service][pollForServiceTemplateInstanceCreation]', 'Polling for service template instance creation: ' + pollURL);
        return this.http.get(pollURL, {headers: this.adminService.getDefaultAcceptJSONHeaders()})
            .toPromise()
            .then(result => {
                let references = result.json().References as Array<ResourceReference>;
                this.logger.log('[application.service][pollForServiceTemplateInstanceCreation]', 'Poll returned: ' + JSON.stringify(references));
                if (references.length === 2) {
                    this.logger.log('[application.service][pollForServiceTemplateInstanceCreation]',
                        'Found 2 entries in references list now searching for reference to new ServiceTemplateInstance');
                    for (let ref of references) {
                        if (!ReferenceHelper.isSelfReference(ref)) {
                            this.logger.log('[application.service][pollForServiceTemplateInstanceCreation]',
                                'Found new ServiceTemplateInstance: ' + JSON.stringify(ref));
                            return ref.href;
                        }
                    }
                    // ohoh, we did not find a reference that is not self reference
                    this.logger.handleError('[application.service][pollForServiceTemplateInstanceCreation]', new Error('There are only self references in returned list of ServiceTemplateInstances'));  // tslint:disable-line:max-line-length
                } else {
                    // ServiceTemplateInstance not created yet, query again
                    this.logger.log('[application.service][pollForServiceTemplateInstanceCreation]',
                        'ServiceTemplateInstance not created yet, polling again in ' + waitTime + ' ms');
                    return new Promise((resolve) => setTimeout(() => resolve(this.pollForServiceTemplateInstanceCreation(pollURL)), waitTime));
                }
            })
            .catch(err => this.logger.handleError('[application.service][pollForServiceTemplateInstanceCreation]', err));
    }

    getPlanOutput(url: string): Promise<PlanParameters> {
        return this.http.get(url, {headers: this.adminService.getDefaultAcceptJSONHeaders()})
            .toPromise()
            .then(response => response.json())
            .catch(err => this.logger.handleError('[application.service][getPlanoutput]', err));
    }

    /**
     * Poll for finishing of a buildplan
     * @param pollUrl URL retrieved from buildplan call (POST to CSAR resource)
     * @returns {Promise<PlanParameters>}
     */
    pollForPlanFinish(pollUrl: string): Promise<PlanInstance> {
        const reqOpts = new RequestOptions({headers: this.adminService.getDefaultAcceptJSONHeaders()});
        this.logger.log('[application.service][pollForPlanFinish]', 'Polling for plan result');
        const waitTime = 10000;
        return this.http.get(pollUrl, reqOpts)
            .toPromise()
            .then(response => {
                let res = response.json() as PlanInstance;

                if (res.PlanInstance && res.PlanInstance.State === 'running') {
                    this.logger.log('[application.service][pollForPlanFinish]', 'Plan still running, polling again in ' + waitTime + ' ms');
                    return new Promise((resolve) => setTimeout(() => resolve(this.pollForPlanFinish(pollUrl)), waitTime));
                } else {
                    // now fetch the output
                    this.logger.log('[application.service][pollForPlanFinish]', 'Plan finished with result ' + JSON.stringify(res));
                    return res;
                }
            })
            .catch(err => this.logger.handleError('[application.service][pollForPlanFinish]', err));
    }

    /**
     * Returns a list of service template instances of the given appID.
     * We fetch the first service template found for the given appID.
     * @param appID
     * @returns {Promise<Array<ResourceReference>>}
     */
    getServiceTemplateInstancesByAppID(appID: string): Promise<Array<ResourceReference>> {
        appID = ApplicationService.fixAppID(appID);

        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});

        return this.getServiceTemplatePath(appID).toPromise()
            .then(url => {
                    const serviceTemplateInstancesURL = new Path(url)
                        .append('Instances')
                        .toString();

                    return this.http.get(serviceTemplateInstancesURL, reqOpts)
                        .toPromise()
                        .then(result => {
                            let refs = result.json().References as Array<ResourceReference>;
                            for (let ref in refs) {
                                if (refs[ref].title.toLowerCase() === 'self') {
                                    refs.splice(+ref, 1);
                                }
                            }

                            return refs;
                        })
                        .catch(reason => this.logger.handleError('[application.service][getServiceTemplateInstancesByAppID]', reason));
                }
            ).catch(reason => this.logger.handleError('[application.service][getServiceTemplateInstancesByAppID]', reason));
    }

    getProvisioningStateOfServiceTemplateInstances(refs: Array<ResourceReference>): Promise<Array<any>> {
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        let promises = <any>[];

        for (let ref of refs) {
            const statusURL = new Path(ref.href)
                .append('State')
                .toString();
            promises.push(this.http.get(statusURL, reqOpts).toPromise().then(result => result.json()));
        }

        return Promise.all(promises);
    }

    getPropertiesOfServiceTemplateInstances(refs: Array<ResourceReference>): Promise<Array<ApplicationInstanceProperties>> {
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        let promises = <any>[];

        for (let ref of refs) {
            const url = new Path(ref.href)
                .append('Properties')
                .toString();
            promises.push(this.http.get(url, reqOpts).retry(3).toPromise()
                .then(result => {
                    let properties = result.json();
                    let selfServiceUrl = ObjectHelper.getObjectsByPropertyDeep(properties, 'selfserviceApplicationUrl');
                    let instanceProperties = new ApplicationInstanceProperties(ref, result.json());
                    if (selfServiceUrl.length > 0) {
                        instanceProperties.selfServiceApplicationURL = selfServiceUrl[0]['selfserviceApplicationUrl'];
                    }
                    return instanceProperties;
                }));
        }

        return Promise.all<ApplicationInstanceProperties>(promises);
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
            .catch(err => this.logger.handleError('[application.service][getAllInstances]', err));
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
     * @returns {Observable<Application>}
     */
    getAppDescription(appID: string): Observable<Application> {
        appID = ApplicationService.fixAppID(appID);
        const metaDataUrl = this.adminService.getContainerAPIURL() + '/CSARs/' + appID + '/Content/SELFSERVICE-Metadata';
        const dataJSONUrl = metaDataUrl + '/data.json';
        let headers = new Headers({'Accept': 'application/json'});

        return this.http.get(dataJSONUrl, {headers: headers})
            .map((response: any) => {
                let app: Application = new Object(response.json()) as Application;
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
            .catch((err: any) => {
                if (err.status === 404) {
                    // we found a CSAR that does not contain a data.json, so use default values
                    let app = new Application();
                    app.id = appID.indexOf('.csar') > -1 ? appID.split('.')[0] : appID;
                    app.csarName = appID;
                    app.displayName = appID.indexOf('.csar') > -1 ? appID.split('.')[0] : appID;
                    app.categories = ['others'];
                    app.iconUrl = '../../assets/img/Applications_Header_Icon.png';
                    app.imageUrl = '';
                    return Observable.of(app);
                } else {
                    this.logger.handleObservableError('[application.service][getAppDescription]', err);
                }
            });
    }
}
