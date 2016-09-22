/**
 * Created by Michael Falkenthal on 01.09.16.
 */
import {Injectable} from '@angular/core';
import {Headers, Http, Response} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {Application} from './application.model';
import {toPromise} from "rxjs/operator/toPromise";
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ApplicationService {
    private applicationsUrl = 'app/applications';
    private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http) {
    }

    getApps(): Promise<Application[]> {
        return this.http.get(this.applicationsUrl)
            .toPromise()
            .then(response => response.json().data as Application[])
            .catch(this.handleError);
    }

    searchApps(term: string): Observable<Application[]> {
        console.log('Searching Apps');
        return  this.http.get(this.applicationsUrl + `/?name=${term}`)
            .map((r: Response) => r.json().data as Application[]);
    }

    getApp(id: number): Promise<Application> {
        return this.getApps()
            .then(app => app.find(app => app.id === id));
    }

    updateApp(app: Application): Promise<Application> {
        const url = this.applicationsUrl + `/${app.id}`;
        return this.http
            .put(url, JSON.stringify(app), {headers: this.headers})
            .toPromise()
            .then(() => app)
            .catch(this.handleError);
    }

    createApp(name: string): Promise<Application> {
        let app = new Application();
        app.name = name;
        const url = this.applicationsUrl + `/${name}`;
        return this.http
            .post(url, JSON.stringify(app), {headers: this.headers})
            .toPromise()
            .then(() => app)
            .catch(this.handleError);
    }

    deleteApp(id: number): Promise<void> {
        let url = `$` + this.applicationsUrl + `/${id}`;
        return this.http.delete(url, {headers: this.headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

}
