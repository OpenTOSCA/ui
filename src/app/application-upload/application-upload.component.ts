import {Component, OnInit, NgZone} from '@angular/core';
import {ApplicationService} from "../shared/application.service";

@Component({
    selector: 'opentosca-application-upload',
    templateUrl: 'src/app/application-upload/application-upload.component.html'
})

export class ApplicationUploadComponent implements OnInit {
    private zone: NgZone;
    public uploadInProgress: boolean = true;
    public deploymentInProgress: boolean = false;
    public deploymentDone: boolean = false;
    public max: number = 100;
    public dynamic: number = 0;
    currentSpeed: string;
    uploadFile: any;
    private options: Object;

    ngOnInit(): void {
        this.zone = new NgZone({enableLongStackTrace: false});
        this.options = {
            url: 'http://192.168.209.229:1337/containerapi/CSARs',
            //url: 'http://localhost:10050/upload',
            customHeaders: {
                'Accept': 'application/octet-stream'
            },
            //filterExtensions: true,
            //allowedExtensions: ['csar'],
            calculateSpeed: true
        };
    }

    constructor(private appService: ApplicationService) {
    }

    startUpload(data: any): void {
        this.uploadFile = data;

    }

    handleUpload(data: any): void {
        this.zone.run(() => {
            this.uploadFile = data;
            this.dynamic = data.progress.percent;
            if(this.dynamic < 100){
                this.deploymentInProgress = false;
                this.deploymentDone = false;
            }else{
                this.deploymentInProgress = true;
            }
            if(data.status === 201){
                this.deploymentDone = true;
            }
            this.updateCurrentSpeed(data.progress.speedHumanized);

        });
    }

    private lastUpdate: number;

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
