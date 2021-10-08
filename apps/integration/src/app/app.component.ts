import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
    selector: 'lib-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    readonly form = this.fb.group({
        rating: 3,
        counter: 1,
        combobox: 'Banana',
        toggle: true,
    });

    readonly comboboxOptions = ['Banana', 'Apple', 'Pineapple', 'Avocado', 'Cherry', 'Lemon', 'Orange'];

    constructor(private fb: FormBuilder) {}
}
