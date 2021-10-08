import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarRatingModule } from './star-rating/star-rating.module';
import { CounterModule } from './counter/counter.module';
import { ComboboxModule } from './combobox/combobox.module';
import { ToggleModule } from './toggle/toggle.module';

const MODULES: Type<any>[] = [StarRatingModule, CounterModule, ComboboxModule, ToggleModule];

@NgModule({
    imports: [CommonModule, ...MODULES],
    exports: [...MODULES],
})
export class ControlsModule {}
