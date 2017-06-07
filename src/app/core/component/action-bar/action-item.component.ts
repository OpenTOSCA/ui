import { Component, Input } from '@angular/core';

@Component({
    selector: 'opentosca-ui-action-item',
    templateUrl: 'action-item.component.html'
})
export class ActionItemComponent {

    @Input()
    public styles: string;
}
