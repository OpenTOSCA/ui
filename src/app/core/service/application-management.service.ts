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
import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { ConfigurationService } from '../../configuration/configuration.service';
import { OpenToscaLoggerService } from './open-tosca-logger.service';
import { Path } from '../util/path';
import { ResourceReference } from '../model/resource-reference.model';
import { PlanParameters } from '../model/plan-parameters.model';
import { Observable } from 'rxjs/Observable';
import { PlanOperationMetaData } from '../model/planOperationMetaData.model';
import { ReferenceHelper } from '../util/reference-helper';
import { BuildplanPollResource } from '../model/buildplan-poll-resource.model';
import { PlanInstance } from '../model/plan-instance.model';
import { ApplicationInstanceProperties } from '../model/application-instance-properties.model';
import { ObjectHelper } from '../util/object-helper';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/platform-browser';
import { CsarList } from '../model/new-api/csar-list.model';
import { Csar } from 'app/core/model/new-api/csar.model';
import { ServiceTemplateInstance } from '../model/new-api/service-template-instance.model';
import { Plan } from '../model/new-api/plan.model';

@Injectable()
export class ApplicationManagementService {
    /**
     * Helper that ensures that appID always ends with .csar
     * @param appID
     * @returns {string}
     */
    public fixAppID(appID: string): string {
        return _.endsWith(appID.toLowerCase(), '.csar') ? appID : appID + '.csar';
    }

    constructor(private http: Http,
                private configService: ConfigurationService,
                private logger: OpenToscaLoggerService,
                @Inject(DOCUMENT) private document: any) {
    }

    /**
     * Deletes the app from the container
     * @param appID
     * @returns {Observable<any>}
     */
    deleteAppFromContainer(appID: string): Observable<any> {
        const url = new Path(this.configService.getContainerAPIURL())
            .append('csars')
            .append(this.fixAppID(appID))
            .toString();
        this.logger.log('[application.service][deleteAppFromContainer]', 'Sending delete to ' + url);
        return this.http.delete(url);
    }

    /**
     * Load meta data of all CSARs from container
     * @returns {Observable<Array<Csar>>}
     */
    getResolvedApplications(): Observable<Array<Csar>> {
        const url = new Path(this.configService.getContainerAPIURL())
            .append('csars')
            .toString();
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(url, reqOpts)
            .map((response: Response) => response.json())
            .map((response: CsarList) => {
                const observables: Array<Observable<Csar>> = [];
                for (const entry of response.csars) {
                    observables.push(this.http.get(entry._links['self'].href, reqOpts)
                        .map((rawCsar: Response) => rawCsar.json())
                    );
                }
                return observables.length > 0 ? Observable.forkJoin(observables) : Observable.of([]);
            })
            .flatMap(result => result);
    }

    /**
     * Lookup the parameters required by the buildplan of a CSAR
     * @param appID
     * @returns {Observable<Plan>}
     */
    getBuildPlan(appID: string): Observable<Plan> {
        return this.getServiceTemplatePathNG(appID)
            .flatMap(serviceTemplatePath => {
                const url = new Path(serviceTemplatePath)
                    .append('buildplans')
                    .toString();
                const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
                return this.http.get(url, reqOpts)
                    // Todo For now it is okay to fetch the first build plan but we have to keep this in mind
                    .map(response => response.json()['plans'][0] as Plan)
                    .catch(err => this.logger.handleObservableError('[application.service][getBuildPlan]', err));
            })
            .catch(err => this.logger.handleObservableError('[application.service][getBuildPlan]', err));
    }

    getTerminationPlan(appID: string): Observable<PlanOperationMetaData> {
        return this.getServiceTemplatePath(appID)
            .flatMap(serviceTemplatePath => {
                const url = new Path(serviceTemplatePath)
                    .append(this.configService.getTerminationPlanPath()).toString();
                const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
                return this.http.get(url, reqOpts)
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
        const url = new Path(this.configService.getContainerAPIURL())
            .append('containerapi')
            .append('CSARs')
            .append(this.fixAppID(appID))
            .append('ServiceTemplates')
            .toString();

        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});

        return this.http.get(url, reqOpts)
            .map(response => {
                const resRefs = response.json().References as Array<ResourceReference>;
                for (const ref of resRefs) {
                    if (!ReferenceHelper.isSelfReference(ref)) {
                        return ref.href;
                    }
                }
                this.logger.handleObservableError('[application.service][getServiceTemplatePath]', new Error(JSON.stringify(resRefs)));
            })
            .catch(err => this.logger.handleObservableError('[application.service][getServiceTemplatePath]', err));
    }

    // TODO
    getServiceTemplatePathNG(appID: string): Observable<string> {

        const url = new Path(this.configService.getContainerAPIURL())
            .append('csars')
            .append(this.fixAppID(appID))
            .append('servicetemplates')
            .toString();

        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});

        return this.http.get(url, reqOpts)
            .map(response => {
                return response.json().service_templates[0]._links.self.href;
            })
            .catch(err => this.logger.handleObservableError('[application.service][getServiceTemplatePath]', err));
    }

    // TODO
    triggerPlan(url: string, parameters: any): void {
        this.http.post(url, parameters, {headers: new Headers({'Accept': 'application/json'})})
            .toPromise()
            .then(response => {
                this.logger.log('[application.service][triggerPlan]', 'Server responded to post: ' + response);
            })
            .catch(err => this.logger.handleError('[application.service][triggerPlan]', err));
    }

    /**
     * Triggers the provisioning of a new service instance
     * @param appID ID (CSAR name) of the service which shall be provisioned
     * @param plan PlanParameters object that containes required input parameters for the buildplan
     * @returns {Promise<BuildplanPollResource>}
     */
    startProvisioning(plan: Plan): Observable<string> {
        this.logger.log('[application.service][startProvisioning]', 'Starting Provisioning');
        this.logger.log('[application.service][startProvisioning]', 'Build Plan Operation Meta Data are: ' + JSON.stringify(plan));
        const url = new Path(plan._links['self'].href)
            .append('instances')
            .toString();
        this.logger.log('[application.service][startProvisioning]', 'Posting to: ' + url);

        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});

        return this.http.post(url, plan.input_parameters, reqOpts)
            .map((response: Response) => {
                this.logger.log('[application.service][startProvisioning]', 'Response headers are: ' + response.headers);
                return response.headers['Location'];
            })
            .catch(err => this.logger.handleError('[application.service][startProvisioning]', err));
    }

    pollForServiceTemplateInstanceCreation(pollURL: string): Promise<ServiceTemplateInstance> {
        const waitTime = 10000;

        this.logger.log('[application.service][pollForServiceTemplateInstanceCreation]',
            'Polling for service template instance creation: ' + pollURL);
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(pollURL, reqOpts)
            .toPromise()
            .then(result => {
                const references = result.json().References as Array<ResourceReference>;
                this.logger.log('[application.service][pollForServiceTemplateInstanceCreation]',
                    'Poll returned: ' + JSON.stringify(references));
                if (references.length === 2) {
                    this.logger.log('[application.service][pollForServiceTemplateInstanceCreation]',
                        'Found 2 entries in references list now searching for reference to new ServiceTemplateInstance');
                    for (const ref of references) {
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
                    return new Promise((resolve) => setTimeout(() => resolve(
                        this.pollForServiceTemplateInstanceCreation(pollURL)), waitTime)
                    );
                }
            })
            .catch(err => this.logger.handleError('[application.service][pollForServiceTemplateInstanceCreation]', err));
    }

    getPlanOutput(url: string): Promise<PlanParameters> {
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(url, reqOpts)
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
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        this.logger.log('[application.service][pollForPlanFinish]', 'Polling for plan result');
        const waitTime = 10000;
        return this.http.get(pollUrl, reqOpts)
            .toPromise()
            .then(response => {
                const res = response.json() as PlanInstance;

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
    getServiceTemplateInstancesByAppID(appID: string): Observable<Array<ResourceReference>> {
        appID = this.fixAppID(appID);

        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});

        return this.getServiceTemplatePath(appID).first()
            .flatMap((url) => {
                const serviceTemplateInstancesURL = new Path(url)
                    .append('Instances')
                    .toString();

                return this.http.get(serviceTemplateInstancesURL, reqOpts)
                    .map(result => {
                        const refs = result.json().References as Array<ResourceReference>;
                        for (const ref in refs) {
                            if (refs[ref].title.toLowerCase() === 'self') {
                                refs.splice(+ref, 1);
                            }
                        }
                        return refs;
                    })
                    .catch(reason => this.logger.handleError('[application.service][getServiceTemplateInstancesByAppID]', reason));
            })
            .catch((reason: any) => this.logger.handleObservableError('[application.service][getServiceTemplateInstancesByAppID]', reason));
    }

    getPropertiesOfServiceTemplateInstances(refs: Array<ResourceReference>): Observable<Array<ApplicationInstanceProperties>> {
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        const observables = <any>[];

        for (const ref of refs) {
            const url = new Path(ref.href)
                .append('Properties')
                .toString();
            observables.push(this.http.get(url, reqOpts).retry(3)
                .map(result => {
                    const properties = result.json();
                    const selfServiceUrl = ObjectHelper.getObjectsByPropertyDeep(properties, 'selfserviceApplicationUrl');
                    const instanceProperties = new ApplicationInstanceProperties(ref, result.json());
                    if (selfServiceUrl.length > 0) {
                        instanceProperties.selfServiceApplicationURL = selfServiceUrl[0]['selfserviceApplicationUrl'];
                    }
                    return instanceProperties;
                }));
        }

        return Observable.forkJoin<ApplicationInstanceProperties>(observables);
    }

    /**
     * Checks if an App with given appID is already deployed in container.
     * Returns true if already deployed and false if not, so be sure to handle this in <then callback>
     * @param appID
     * @returns {Promise<boolean>}
     */
    isAppDeployedInContainer(appID: string): Promise<boolean> {
        appID = this.fixAppID(appID);

        const csarUrl = new Path(this.configService.getContainerAPIURL())
            .append('csars')
            .append(appID)
            .toString();
        const headers = new Headers({'Accept': 'application/json'});
        return this.http.get(csarUrl, {headers: headers})
            .toPromise()
            .then(response => true)
            .catch(reason => false);
    }

    /**
     * Retrieve csar description of given CSAR ID
     * @param csarID CSAR ID (e.g. XYZ.csar)
     * @returns {Observable<Csar>}
     */
    getCsarDescriptionByCsarID(csarID: string): Observable<Csar> {
        csarID = this.fixAppID(csarID);
        const url = new Path(this.configService.getContainerAPIURL())
            .append('csars')
            .append(csarID)
            .toString();
        const reqOpts = new RequestOptions({headers: new Headers({'Accept': 'application/json'})});
        return this.http.get(url, reqOpts)
            .map((response: Response) => response.json() as Csar)
            .catch((err: any) => this.logger
                .handleObservableError('[application.service][getCsarDescriptionByCsarID]', err));
    }
}
