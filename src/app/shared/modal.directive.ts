/**
 * Created by Michael Falkenthal on 24.10.16.
 */
import {ModalModule, ModalOptions} from 'ng2-bootstrap/ng2-bootstrap';
import {Directive, Input, AfterViewInit, OnDestroy, Output, EventEmitter} from '@angular/core';

@Directive({
    selector: '[bsModal]',
    exportAs: 'bs-modal'
})
export class ModalDirective implements AfterViewInit, OnDestroy {

    private _config: ModalOptions;
    @Output() public onShow: EventEmitter<ModalDirective> = new EventEmitter();
    @Output() public onShown: EventEmitter<ModalDirective> = new EventEmitter();
    @Output() public onHide: EventEmitter<ModalDirective> = new EventEmitter();
    @Output() public onHidden: EventEmitter<ModalDirective> = new EventEmitter();

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }

    @Input()
    public set config(conf: ModalOptions) {
        this._config = conf;
    };

}
