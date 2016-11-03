/**
 * Created by Michael Falkenthal on 01.09.16.
 */
import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Application} from './application.model';
import {ApplicationReference} from './application-reference.model';
import {PlanParameters} from './plan-parameters.model';
import {AdministrationService} from './administration.service';

@Injectable()
export class ApplicationService {

    constructor(private http: Http, private adminService: AdministrationService) {
    }

    /**
     * Retrieve a list of references to deployed applications
     * @returns {Promise<ApplicationReference[]>}
     */
    getApps(): Promise<ApplicationReference[]> {
        const url = this.adminService.getContainerAPIUrl() + '/CSARs';
        let headers = new Headers({'Accept': 'application/json'});
        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => response.json().References as ApplicationReference[])
            .catch(this.handleError);
    }

    getBuildPlanParameters(appID: string): Promise<PlanParameters> {
        // /containerapi/CSARs/FlinkApp_ServiceTemplate_DUMMY.csar/BoundaryDefinitions/Interfaces/OpenTOSCA-Lifecycle-Interface/
        // Operations/instantiate/Plan/FlinkApp_ServiceTemplate_buildPlan

        // firstly, fetch plans to find buildplan --> don't use self reference
        const url = this.adminService.getContainerAPIUrl() + '/CSARs/' + appID + '.csar' + this.adminService.getBuildPlanPath();
        let headers = new Headers({'Accept': 'application/json'});
        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => {
                    let references = response.json().References as ApplicationReference[];

                    for (let ref of references) {
                        // we pick the first reference that is not the self reference to the plan resource
                        if (ref.title !== 'Self') {
                            return this.http.get(ref.href, {headers: headers})
                                .toPromise()
                                .then(planParam => planParam.json() as PlanParameters)
                                .catch(this.handleError);
                        }
                    }
                    // okay, we did not get a reference to a plan, so reject the promise
                    this.handleError(new Error('No reference to build plan available'));
                }
            )
            .catch(this.handleError);
    }

    startProvisioning(appID: string, params: PlanParameters): Promise<any> {
        const url = this.adminService.getContainerAPIUrl() + '/CSARs/' + appID + '.csar' + '/Instances';
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
            .catch(this.handleError);
    }

    pollForResult(pollUrl: string): Promise<PlanParameters> {
        let headers = new Headers({
            'Accept': 'application/json'
        });
        console.log('Polling for plan result');
        return this.http.get(pollUrl, {headers: headers})
            .toPromise()
            .then(response => {
                let res = response.json() as {result: {status: string}};
                if (res.result && res.result.status && res.result.status === 'PENDING') {
                    console.log('Received not final plan result, polling again in 500ms');
                    return new Promise((resolve) => setTimeout(() => resolve(this.pollForResult(pollUrl)), 500));
                } else {
                    // we got a plan result
                    return Promise.resolve(response.json());
                }
            })
            .catch(this.handleError);
    }

    /*searchApps(term: string): Observable<Application[]> {
     console.log('Searching Apps');
     return  this.http.get(this.containerAPI + `/?name=${term}`)
     .map((r: Response) => r.json().data as Application[]);
     }*/

    /*getApp(id: string): Promise<Application> {
     return this.getApps()
     .then(references => references.find(ref => ref.title === id))
     .catch(this.handleError);;
     }*/

    /**
     * Retrieve app description from data.json
     * @param appID CSAR id/name (e.g. XYZ.csar)
     * @returns {Promise<Application>}
     */
    getAppDescription(appID: string): Promise<Application> {
        // Remove .csar if present
        if (appID.indexOf('.csar') > -1) {
            appID = appID.split('.')[0];
        }

        const metaDataUrl = this.adminService.getContainerAPIUrl() + '/CSARs/' + appID + '.csar' + '/Content/SELFSERVICE-Metadata';
        const dataJSONUrl = metaDataUrl + '/data.json';
        let headers = new Headers({'Accept': 'application/json'});

        return this.http.get(dataJSONUrl, {headers: headers})
            .toPromise()
            .then(response => {
                let app = response.json() as Application;
                app.id = appID;
                app.iconUrl = metaDataUrl + '/' + app.iconUrl;
                app.imageUrl = metaDataUrl + '/' + app.imageUrl;
                for (let i in app.screenshotUrls) {
                    if (app.screenshotUrls[i]) {
                        app.screenshotUrls[i] = metaDataUrl + '/' + app.screenshotUrls[i];
                    }
                }
                return app;
            })
            .catch(this.handleError);
    }

    /*deleteApp(id: number): Promise<void> {
     let url = `$` + this.applicationsUrl + `/${id}`;
     return this.http.delete(url, {headers: this.headers})
     .toPromise()
     .then(() => null)
     .catch(this.handleError);
     }*/

    /**
     * Print errors to console
     * @param error
     * @returns {Promise<void>|Promise<T>}
     */
    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

}
