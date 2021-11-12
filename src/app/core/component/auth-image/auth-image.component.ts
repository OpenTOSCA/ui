import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {PlanQkPlatformLoginService} from "../../../services/plan-qk-platform-login.service";
import {take} from "rxjs/operators";
import {AuthImageLoaderService} from "../../../services/auth-image-loader.service";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
    selector: 'opentosca-auth-image',
    templateUrl: './auth-image.component.html',
    styleUrls: ['./auth-image.component.scss'],
})
export class AuthImageComponent implements OnChanges {

    @Input() src: string;
    @Input() alt: string

    public imageURL: string | SafeUrl;
    public altString: string;

    constructor(private planqkPlatformLoginService: PlanQkPlatformLoginService,
                private authImageLoader: AuthImageLoaderService,
                private sanitizer: DomSanitizer
    ) {
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.src != null) {
            if (this.src == null) {
                this.imageURL = null;
                return;
            }
            // TODO ingore for non PlanQK Repository
            this.planqkPlatformLoginService.isLoggedIn().pipe(take(1)).subscribe((isLoggedIn) => {
                if (!isLoggedIn) {
                    this.imageURL = this.src;
                    return;
                }
                this.authImageLoader.loadAuthImage(this.src).subscribe(url => {
                    this.imageURL = this.sanitizer.bypassSecurityTrustResourceUrl(url)
                });
            });

        }
    }

}
