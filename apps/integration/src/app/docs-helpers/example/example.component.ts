import { Component, Input, Type } from '@angular/core';

interface ComponentConfig {
    name: string;
    componentRef: Type<any>;
}

@Component({
    selector: 'lib-example',
    templateUrl: './example.component.html',
    styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
    @Input() config: ComponentConfig;
}
