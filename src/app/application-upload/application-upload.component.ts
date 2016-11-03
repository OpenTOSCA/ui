import {Component, OnInit, NgZone, trigger, state, style, transition, animate} from '@angular/core';
import {ApplicationService} from '../shared/application.service';

@Component({
    selector: 'opentosca-application-upload',
    templateUrl: 'src/app/application-upload/application-upload.component.html',
    animations: [
        trigger('fadeInOut', [
            state('in', style({'opacity': 1})),
            transition('void => *', [
                style({'opacity': 0}),
                animate('500ms ease-out')
            ]),
            transition('* => void', [
                style({'opacity': 1}),
                animate('500ms ease-in')
            ])
        ])
    ]
})

export class ApplicationUploadComponent implements OnInit {
    public uploadInProgress: boolean = true;
    public deploymentInProgress: boolean = false;
    public deploymentDone: boolean = false;
    public max: number = 100;
    public dynamic: number = 0;
    public currentSpeed: string;
    public failureMessage: string;

    private zone: NgZone;
    private lastUpdate: number;
    private uploadFile: any;
    private options: Object;

    ngOnInit(): void {
        this.zone = new NgZone({enableLongStackTrace: false});
        this.options = {
            url: 'http://192.168.209.229:1337/containerapi/CSARs',
            customHeaders: {
                'Accept': 'application/octet-stream'
            },
            filterExtensions: true,
            allowedExtensions: ['csar'],
            calculateSpeed: true
        };
    }

    constructor(private appService: ApplicationService) {
    }

    handleUpload(data: any): void {
        this.zone.run(() => {
            this.uploadFile = data;
            this.dynamic = data.progress.percent;
            if (this.dynamic < 100) {
                this.deploymentInProgress = false;
                this.deploymentDone = false;
            } else {
                this.deploymentInProgress = true;
            }
            if (data.status === 201) {
                this.deploymentDone = true;
            }
            if (data.status === 500) {
                this.failureMessage = data.statusText;
            }
            this.updateCurrentSpeed(data.progress.speedHumanized);

        });
    }

    resetUploadStats(): void {
        this.uploadInProgress = true;
        this.deploymentInProgress = false;
        this.dynamic = 0;
    }

    updateCurrentSpeed(speed: string): void {
        if (this.lastUpdate === undefined) {
            this.lastUpdate = Date.now();
            this.setCurrentSpeed(speed);
        }
        if ((Date.now() - this.lastUpdate) > 500) {
            this.setCurrentSpeed(speed);
            this.lastUpdate = Date.now();
        }
    }

    setCurrentSpeed(speed: string): void {
        if (speed) {
            this.currentSpeed = speed;
        }
    }

}
