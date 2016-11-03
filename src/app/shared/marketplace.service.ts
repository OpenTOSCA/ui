/**
 * Created by Michael Falkenthal on 01.09.16.
 */
import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Application} from './application.model';
import {MarketplaceApplicationReference} from './marketplace-application-reference.model';

@Injectable()
export class MarketplaceService {

    private containerAPI = 'http://192.168.209.229:1337/containerapi';

    constructor(private http: Http) {
    }

    /**
     * Retrieve a list of references to applications available on the marketplace
     * @param marketPlaceUrl URL to marketplace
     * @returns {Promise<ApplicationReference[]>}
     */
    getAppsFromMarketPlace(marketPlaceUrl: string): Promise<MarketplaceApplicationReference[]> {
        const url = marketPlaceUrl;
        let headers = new Headers({'Accept': 'application/json'});
        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => response.json() as MarketplaceApplicationReference[])
            .catch(this.handleError);
    }

    getAppFromMarketPlace(appReference: MarketplaceApplicationReference, marketPlaceUrl: string) {
        ///{ns}/[id}/selfserviceportal/
        const url = marketPlaceUrl + encodeURIComponent(appReference.namespace) + '/' + appReference.id + '/selfserviceportal/';
        let headers = new Headers({'Accept': 'application/json'});
        return this.http.get(url, {headers: headers})
            .toPromise()
            .then(response => response.json());
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

        const metaDataUrl = this.containerAPI + '/CSARs/' + appID + '.csar' + '/Content/SELFSERVICE-Metadata';
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
