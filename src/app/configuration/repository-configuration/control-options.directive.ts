import { Directive, ElementRef, forwardRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent, merge, Observable, Subscription, timer } from 'rxjs';
import { debounce, flatMap, map } from 'rxjs/operators';

export const DEFAULT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ControlOptionsDirective),
    multi: true
};

@Directive({
    selector: '' +
        'input[type=text][formControlName][opentoscaControlOptions],' +
        'input[type=text][formControl][opentoscaControlOptions],' +
        'input[type=text][ngModel][opentoscaControlOptions]',
    providers: [DEFAULT_VALUE_ACCESSOR]
})
export class ControlOptionsDirective implements ControlValueAccessor, OnInit, OnDestroy {

    events: Subscription;
    onChange;
    onTouched;

    private _controlOptions = {
        updateOn: 'input',
        debounce: null
    };

    constructor(private renderer: Renderer2, private element: ElementRef) {
    }

    @Input() set opentoscaControlOptions(val) {
        this._controlOptions = { ...this._controlOptions, ...val };
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    ngOnInit() {
        const events: Array<Observable<Event>> = this._controlOptions.updateOn.split(' ')
            .map(event => fromEvent(this.element.nativeElement, event));
        this.events = merge(events).pipe(
            flatMap(flat => flat),
            map((e: Event) => ({ type: e.type, value: e.target['value'] })),
            debounce(event => {
                const debounceValue = this._controlOptions.debounce;
                let time = 0;
                if (typeof debounceValue === 'number') {
                    time = debounceValue;
                } else if (typeof debounceValue === 'object') {
                    time = debounceValue[event.type] ? debounceValue[event.type] : 0;
                }
                return timer(time);
            })
        ).subscribe(event => {
            this.onChange(event.value);
        });
    }

    writeValue(value: any): void {
        const normalizedValue = value == null ? '' : value;
        this.renderer.setProperty(this.element.nativeElement, 'value', normalizedValue);
    }

    setDisabledState(isDisabled: boolean): void {
        this.renderer.setProperty(this.element.nativeElement, 'disabled', isDisabled);
    }

    ngOnDestroy() {
        this.events.unsubscribe();
    }
}
