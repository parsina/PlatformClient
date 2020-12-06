import {Component, OnInit} from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/dark';
import {DateAxisDataItem} from '@amcharts/amcharts4/charts';
import * as am4plugins_bullets from '@amcharts/amcharts4/plugins/bullets';
import {MarketService} from '../../../service/market.service';

am4core.useTheme(am4themes_animated);

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    styles: []
})
export class TimelineComponent {

    constructor() {
    }

    heading = 'Timelines';
    subheading = 'Timelines are used to show lists of notifications, tasks or actions in a beautiful way.';
    icon = 'pe-7s-light icon-gradient bg-malibu-beach';
}
