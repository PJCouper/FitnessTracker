import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "../material.module";

@NgModule({
    imports: [
        MaterialModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule
    ],
    exports: [
        MaterialModule,
        CommonModule,
        FormsModule,
        FlexLayoutModule
    ]
})
export class SharedModule {}