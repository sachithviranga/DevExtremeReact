/* tslint:disable:max-line-length */


import {
    Component,
    OnInit,
    OnDestroy,
    NgModule,
    Host,
    SkipSelf,
    Input,
    ContentChildren,
    forwardRef,
    QueryList
} from '@angular/core';




import DevExpress from 'devextreme/bundles/dx.all';

import {
    NestedOptionHost,
} from 'devextreme-angular/core';
import { NestedOption } from 'devextreme-angular/core';
import { DxiRangeComponent } from './range-dxi';


@Component({
    selector: 'dxo-range-container',
    template: '',
    styles: [''],
    providers: [NestedOptionHost]
})
export class DxoRangeContainerComponent extends NestedOption implements OnDestroy, OnInit  {
    @Input()
    get backgroundColor(): DevExpress.common.charts.ChartsColor | string {
        return this._getOption('backgroundColor');
    }
    set backgroundColor(value: DevExpress.common.charts.ChartsColor | string) {
        this._setOption('backgroundColor', value);
    }

    @Input()
    get offset(): number {
        return this._getOption('offset');
    }
    set offset(value: number) {
        this._setOption('offset', value);
    }

    @Input()
    get orientation(): string {
        return this._getOption('orientation');
    }
    set orientation(value: string) {
        this._setOption('orientation', value);
    }

    @Input()
    get palette(): string | Array<string> {
        return this._getOption('palette');
    }
    set palette(value: string | Array<string>) {
        this._setOption('palette', value);
    }

    @Input()
    get paletteExtensionMode(): string {
        return this._getOption('paletteExtensionMode');
    }
    set paletteExtensionMode(value: string) {
        this._setOption('paletteExtensionMode', value);
    }

    @Input()
    get ranges(): Array<any | { color?: DevExpress.common.charts.ChartsColor | string, endValue?: number, startValue?: number }> {
        return this._getOption('ranges');
    }
    set ranges(value: Array<any | { color?: DevExpress.common.charts.ChartsColor | string, endValue?: number, startValue?: number }>) {
        this._setOption('ranges', value);
    }

    @Input()
    get width(): number | { end?: number, start?: number } {
        return this._getOption('width');
    }
    set width(value: number | { end?: number, start?: number }) {
        this._setOption('width', value);
    }

    @Input()
    get horizontalOrientation(): string {
        return this._getOption('horizontalOrientation');
    }
    set horizontalOrientation(value: string) {
        this._setOption('horizontalOrientation', value);
    }

    @Input()
    get verticalOrientation(): string {
        return this._getOption('verticalOrientation');
    }
    set verticalOrientation(value: string) {
        this._setOption('verticalOrientation', value);
    }


    protected get _optionPath() {
        return 'rangeContainer';
    }


    @ContentChildren(forwardRef(() => DxiRangeComponent))
    get rangesChildren(): QueryList<DxiRangeComponent> {
        return this._getOption('ranges');
    }
    set rangesChildren(value) {
        this.setChildren('ranges', value);
    }

    constructor(@SkipSelf() @Host() parentOptionHost: NestedOptionHost,
            @Host() optionHost: NestedOptionHost) {
        super();
        parentOptionHost.setNestedOption(this);
        optionHost.setHost(this, this._fullOptionPath.bind(this));
    }


    ngOnInit() {
        this._addRecreatedComponent();
    }

    ngOnDestroy() {
        this._addRemovedOption(this._getOptionPath());
    }


}

@NgModule({
  declarations: [
    DxoRangeContainerComponent
  ],
  exports: [
    DxoRangeContainerComponent
  ],
})
export class DxoRangeContainerModule { }
