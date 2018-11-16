import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Directive, forwardRef } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConfigurationService } from '../configuration.service';

@Directive({
    selector: '[opentoscaRepositoryValid]',
    providers: [{
        provide: NG_ASYNC_VALIDATORS,
        useExisting: forwardRef(() => RepositoryValidatorDirective),
        multi: true
    }]
})
export class RepositoryValidatorDirective {

    constructor(private configService: ConfigurationService) {
    }

    validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return this.configService.isRepositoryAvailable(control.value).pipe(
            map((valid) => (valid ? null : { repository: true })),
            catchError(() => null)
        );
    }
}
