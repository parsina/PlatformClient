import {Component, OnDestroy, OnInit} from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/dark';
import {DateAxisDataItem} from '@amcharts/amcharts4/charts';
import * as am4plugins_bullets from '@amcharts/amcharts4/plugins/bullets';
import {MarketService} from '../../service/market.service';
import {PointedCircle} from '@amcharts/amcharts4/plugins/bullets';
import { shareReplay, takeUntil} from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

am4core.useTheme(am4themes_animated);

@Component({
    selector: 'app-list-groups',
    templateUrl: './demo.html',
    styles: []
})
export class Demo implements OnInit, OnDestroy {

    constructor(private marketService: MarketService) {
    }

    heading = 'List Groups';
    subheading = 'These can be used with other components and elements to create stunning and unique new elements for your UIs.';
    icon = 'pe-7s-paint icon-gradient bg-sunny-morning';

    private chart: any;
    private series: any;
    private seriesAsk: any;
    private seriesBid: any;
    private bullet: any;
    private bulletAsk: any;
    private bulletBid: any;
    private bulletIsHover: boolean = false;
    private dateAxis: any;
    private valueAxis: any;
    private priceLine: any;
    private ask: any;
    private bid: any;

    private symbol: any;
    private symbols = ['EURUSD', 'AUDUSD', 'GBPUSD', 'USDJPY'];
    private timeFrame = 30;
    private records = 100;

    private accountBalance: any;
    private rewardBalance: any;
    private amountStr: any;
    private amount: any;
    private interval: any;
    private spread: boolean;
    private payout: any;
    private return: any;

    private allowTrade: boolean;

    private edgeStart: any = 300;
    private edgeEnd: any = 600;

    private subscription = new Subscription();

    private orderList: Array<{ id: any, traderId: any, orderType: any, price: any, endPrice: any, date: any, endDate: any, range: any, startRange: any, endRange: any, timeFrame: number, symbol: any }> = [];
    private selectedOrderList: Array<{ id: any, traderId: any, orderType: any, price: any, endPrice: any, date: any, endDate: any, range: any, startRange: any, endRange: any, timeFrame: number, symbol: any }> = [];

    ngOnInit(): void {
        this.symbol = 'EURUSD';
        this.spread = false;
        this.allowTrade = false;
        this.accountBalance = 1000;
        this.rewardBalance = 100;
        this.amountStr = 5;
        this.amount = 0;
        this.return = 0;
        this.configChart();
        this.loadDataToChart();
        this.loadOrderList();
        this.updatePayout();
        this.updateReturn();
        this.addEffects();
    }

    configChart(): void {
        this.chart = am4core.create('demoChart', am4charts.XYChart);
        this.chart.hiddenState.properties.opacity = 0;
        this.chart.padding(0, 0, 0, 0);
        this.chart.background.fill = am4core.color('#555555');
        this.chart.zoomOutButton.disabled = true;
        // this.chart.cursor = new am4charts.XYCursor();

        this.dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        this.dateAxis.periodChangeDateFormats.setKey('second', '[bold]h:mm a');
        this.dateAxis.periodChangeDateFormats.setKey('minute', '[bold]h:mm a');
        this.dateAxis.periodChangeDateFormats.setKey('hour', '[bold]h:mm a');
        this.dateAxis.renderer.grid.template.location = 0;
        this.dateAxis.renderer.axisFills.template.disabled = false;
        this.dateAxis.renderer.ticks.template.disabled = false;
        // this.dateAxis.minZoomCount = 5;
        // this.dateAxis.groupData = true;
        // this.dateAxis.groupCount = 1500;
        this.dateAxis.gridIntervals.setAll([
            {timeUnit: 'second', count: 1},
            {timeUnit: 'second', count: 30},
            {timeUnit: 'minute', count: 1},
            {timeUnit: 'minute', count: 2},
            {timeUnit: 'minute', count: 3},
            {timeUnit: 'minute', count: 5},
            {timeUnit: 'minute', count: 10},
            {timeUnit: 'minute', count: 15}
        ]);

        this.valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());

        this.series = this.chart.series.push(new am4charts.LineSeries());
        this.series.dataFields.dateX = 'date';
        this.series.dataFields.valueY = 'price';
        this.series.stroke = am4core.color('#ffffff');
        this.series.strokeOpacity = 1;

        this.seriesAsk = this.chart.series.push(new am4charts.LineSeries());
        this.seriesAsk.dataFields.dateX = 'date';
        this.seriesAsk.dataFields.valueY = 'ask';
        this.seriesAsk.stroke = am4core.color('#ffffff');
        // this.seriesAsk.strokeOpacity = 0.3;
        this.seriesAsk.strokeOpacity = 0.0;

        this.seriesBid = this.chart.series.push(new am4charts.LineSeries());
        this.seriesBid.dataFields.dateX = 'date';
        this.seriesBid.dataFields.valueY = 'bid';
        this.seriesBid.stroke = am4core.color('#ffffff');
        // this.seriesBid.strokeOpacity = 0.3;
        this.seriesBid.strokeOpacity = 0.0;

        // Drop-shaped tooltips
        // this.series.tooltip.background.cornerRadius = 20;
        // this.series.tooltip.background.strokeOpacity = 0;
        // this.series.tooltip.pointerOrientation = 'vertical';
        // this.series.tooltip.label.minWidth = 40;
        // this.series.tooltip.label.minHeight = 40;
        // this.series.tooltip.label.textAlign = 'middle';
        // this.series.tooltip.label.textValign = 'middle';

        this.priceLine = this.valueAxis.axisRanges.create();
        this.priceLine.label.inside = true;
        this.priceLine.grid.strokeDasharray = '3,3';
        this.priceLine.grid.stroke = am4core.color('#ffffff');
        this.priceLine.grid.strokeOpacity = 0.5;
        this.priceLine.label.properties.verticalCenter = 'bottom';
        this.priceLine.label.properties.align = 'right';
        this.priceLine.label.fill = am4core.color('yellow');

        this.chart.events.on('datavalidated', () => {
            this.dateAxis.zoom({start: 0.0, end: 1.5});
        });
    }

    loadDataToChart(): void {
        this.chart.data = [];
        this.series.bullets.clear();
        this.seriesAsk.bullets.clear();
        this.seriesBid.bullets.clear();
        const currentData: Array<{ id: any, date: any, price: any, ask: any, bid: any, priceDisabled: any, askDisabled: any, bidDisabled: any, fill: any, rotation: any }> = [];
        let i: number;

        let sub = this.marketService.getMarketData(this.records, this.timeFrame, this.symbol).subscribe(data => {
            for (i = 0; i < data.length; i++) {
                {
                    currentData.push({
                        id: data[i].id,
                        date: new Date(data[i].dateTime),
                        price: data[i].price,
                        ask: data[i].ask,
                        bid: data[i].bid,
                        priceDisabled: data[i].priceDisabled,
                        askDisabled: data[i].askDisabled,
                        bidDisabled: data[i].bidDisabled,
                        fill: am4core.color(data[i].fill),
                        rotation: data[i].rotation
                    });
                }
            }
            this.chart.data = currentData;
        });
        this.subscription.add(sub);
        this.startInterval();
    }

    loadOrderList(): void {
        this.updateOrders();
        this.orderList = [];
        let sub = this.marketService.getOrderList(this.timeFrame, this.symbol).subscribe(data => {
            let i;
            for (i = 0; i < data.length; i++) {
                this.pushOrder(data[i]);
            }
        });
        this.subscription.add(sub);
        this.updateBullets();
    }

    addDataToChart(data: any): void {
        if(this.chart.data.length === 0)
            return;
        let currentDate = new Date(data.dateTime);
        let lastDate = this.chart.data[this.chart.data.length - 1 ].date;
        while (currentDate > lastDate) {
            let id = data.id;
            lastDate = new Date(lastDate.getTime() + 1000);
            currentDate.setMilliseconds(0);
            lastDate.setMilliseconds(0);
            if(currentDate.toTimeString().split(' ')[0].trim() != lastDate.toTimeString().split(' ')[0].trim()){
                id = id + "___";
            }

            this.chart.addData({
                id: id,
                date: lastDate,
                price: data.price,
                ask: data.ask,
                bid: data.bid,
                priceDisabled: true,
                askDisabled: true,
                bidDisabled: true,
                fill: am4core.color('gray'),
                rotation: 0
            }, 1);
        }
    }

    startInterval(): void {
        this.interval = setInterval(() => {
            let sub = this.marketService.getLastRecord(this.symbol).subscribe(data => {
                if (!this.chart.isDisposed()) {
                    this.addDataToChart(data);
                    this.priceLine.value = data.price;
                    this.ask = data.ask;
                    this.bid = data.bid;
                    this.priceLine.label.text = data.price;
                    // this.updateBullets();
                    this.updateOrders();
                    this.updateOrderListCurrentTimeFrame();
                    if (this.selectedOrderList.length > 0 && !this.bulletIsHover) {
                        this.showPriceRange(this.selectedOrderList[this.selectedOrderList.length - 1]);
                    }
                }
            });
            // console.log(sub);
            this.subscription.add(sub);
        }, 1000);
    }

    updateOrderListCurrentTimeFrame(): any {
        let count = 0;
        this.selectedOrderList = [];
        for (let i = 0; i < this.orderList.length; i++) {
            if (this.orderList[i].timeFrame === this.timeFrame) {
                this.selectedOrderList[count] = this.orderList[i];
                count++;
            }
        }
    }

    updateOrders(): void {
        const date = new Date();
        for (let i = 0; i < this.orderList.length; i++) {
            const range: DateAxisDataItem = this.orderList[i].range;
            const startRange: DateAxisDataItem = this.orderList[i].startRange;
            const endRange: DateAxisDataItem = this.orderList[i].endRange;
            range.axisFill.fillOpacity = 0.0;
            startRange.axisFill.fillOpacity = 0.0;
            endRange.axisFill.fillOpacity = 0.0;
            range.label.fillOpacity = 0.0;
            if (this.orderList[i].timeFrame === this.timeFrame && this.orderList[i].symbol === this.symbol && this.orderList[i].endDate >= date) {
                let sub = this.marketService.updateOrder(this.orderList[i].id, this.priceLine.value).subscribe(data => {
                    if(this.orderList.length === 0)
                        return;
                    this.orderList[i].endPrice = data.endPrice;
                });
                this.subscription.add(sub);
            }
        }
    }

    changeSymbol(symbol: any): void {
        clearInterval(this.interval);
        this.symbol = symbol;
        this.loadDataToChart();
        this.loadOrderList();
    }

    sendOrder(orderType: string): void {

        this.allowTrade = false;
        let total = this.accountBalance + this.rewardBalance;
        if(this.amount > total)
            return;
        this.rewardBalance = this.rewardBalance - this.amount;
        if(this.rewardBalance < 0){
            this.accountBalance = this.accountBalance + this.rewardBalance;
            this.rewardBalance = 0;
        }

        let data = this.chart.data[this.chart.data.length - 1];

        let sub = this.marketService.sendOrder(orderType, this.timeFrame, this.symbol, this.spread, data)
            .subscribe(data => {
            data.dateTime = this.chart.data[this.chart.data.length - 1].date;
            data.endDateTime = new Date(data.dateTime.getTime() + (this.timeFrame * 1000));
            this.pushOrder(data);
            this.chart.data[this.chart.data.length - 1].priceDisabled = this.spread;
            this.chart.data[this.chart.data.length - 1].askDisabled = !(this.spread && orderType === 'CALL');
            this.chart.data[this.chart.data.length - 1].bidDisabled = !(this.spread && orderType === 'PUT');
            this.chart.data[this.chart.data.length - 1].fill = am4core.color('gray');
            this.chart.data[this.chart.data.length - 1].rotation = orderType === 'CALL' ? 0 : 180;
            this.updateBullets();
        });
        this.subscription.add(sub);
        if(this.subscription){
            console.log(this.subscription);
            setTimeout(() => { this.subscription.unsubscribe();console.log(this.subscription); }, 3000);

        }
    }

    pushOrder(data: any): void {
        let date = new Date(data.dateTime)
        let endDate = new Date(data.endDateTime);

        // this.orderList[this.orderList.length - 1].date = ;
        // this.orderList[this.orderList.length - 1].endDate = new Date(this.chart.data[this.chart.data.length - 1].date.getTime() + (this.timeFrame * 1000));


        this.orderList.push({
            id: data.id,
            traderId: data.trader.id,
            orderType: data.type,
            price: data.price,
            endPrice: data.endPrice,
            date: date,
            endDate: endDate,
            range: this.createRange(new Date(date.getTime() + this.edgeStart), new Date(endDate.getTime() + this.edgeEnd), false),
            startRange: this.createRange(new Date(date.getTime() + this.edgeStart), new Date(date.getTime() + this.edgeEnd), true),
            endRange: this.createRange(new Date(endDate.getTime() + this.edgeStart), new Date(endDate.getTime() + this.edgeEnd), true),
            timeFrame: data.timeFrame,
            symbol: data.symbol
        });
    }

    createRange(date: any, endDate: any, edge: boolean): any {
        const range = this.dateAxis.axisRanges.create();
        range.date = date;
        range.endDate = endDate;
        range.grid.strokeOpacity = 0.0;
        range.axisFill.fill = edge ? am4core.color('#ffffff') : am4core.color('#888888');
        range.axisFill.fillOpacity = 0.0;
        range.label.inside = true;
        range.label.properties.horizontalCenter = 'left';
        range.label.properties.valign = 'top';
        range.label.fill = am4core.color('yellow');
        range.label.fillOpacity = 0.0;
        return range;
    }

    showPriceRange(data: any): void {

        if (!this.chart.data || this.chart.data.length === 0 || data.timeFrame != this.timeFrame) {
            return;
        }

        this.updateOrders();

        const range: DateAxisDataItem = data.range;
        const startRange: DateAxisDataItem = data.startRange;
        const endRange: DateAxisDataItem = data.endRange;

        const endDate = data.endDate;
        const currentDate = this.chart.data[this.chart.data.length - 1].date;

        const price = data.price;
        const endPrice = data.endPrice;
        range.axisFill.fillOpacity = 0.0;
        startRange.axisFill.fillOpacity = 0.0;
        endRange.axisFill.fillOpacity = 0.0;
        range.label.text = 'Expired';

        if ((this.bulletIsHover || endDate > currentDate) && data.orderType === 'CALL') {
            startRange.axisFill.fillOpacity = 0.9;
            endRange.axisFill.fillOpacity = 0.9;
            range.axisFill.fillOpacity = 0.5;
            range.label.fillOpacity = 1;
            range.axisFill.fill = endPrice > price ? am4core.color('#00ff00') : am4core.color('#888888');
            if (endDate > currentDate) {
                const expiry = new Date(endDate.getTime() - currentDate);
                if (this.timeFrame <= 60) {
                    range.label.text = '00:' + (expiry.getSeconds() < 10 ? '0' + expiry.getSeconds() : expiry.getSeconds());
                } else {
                    range.label.text = (expiry.getMinutes() < 10 ? '0' + expiry.getMinutes() : expiry.getMinutes()) + ':' + (expiry.getSeconds() < 10 ? '0' + expiry.getSeconds() : expiry.getSeconds());
                }
            }
        } else if ((this.bulletIsHover || endDate > currentDate) && data.orderType === 'PUT') {
            startRange.axisFill.fillOpacity = 0.9;
            endRange.axisFill.fillOpacity = 0.9;
            range.axisFill.fillOpacity = 0.5;
            range.label.fillOpacity = 1;
            range.axisFill.fill = endPrice < price ? am4core.color('#ff0000') : am4core.color('#888888');
            if (endDate > currentDate) {
                const expiry = new Date(endDate.getTime() - currentDate);
                if (this.timeFrame <= 60) {
                    range.label.text = '00:' + (expiry.getSeconds() < 10 ? '0' + expiry.getSeconds() : expiry.getSeconds());
                } else {
                    range.label.text = (expiry.getMinutes() < 10 ? '0' + expiry.getMinutes() : expiry.getMinutes()) + ':' + (expiry.getSeconds() < 10 ? '0' + expiry.getSeconds() : expiry.getSeconds());
                }

            }
        }
    }

    updateBullets(): void {
        this.series.bullets.pop();
        const bullet = this.createBullet('priceDisabled');
        this.series.bullets.push(bullet);
        const bulletHover = bullet.states.create('hover');
        bulletHover.properties.scale = 1.3;

        this.seriesAsk.bullets.pop();
        const bulletAsk = this.createBullet('askDisabled');
        this.seriesAsk.bullets.push(bulletAsk);
        const bulletAskHover = bulletAsk.states.create('hover');
        bulletAskHover.properties.scale = 1.3;

        this.seriesBid.bullets.pop();
        const bulletBid = this.createBullet('bidDisabled');
        this.seriesBid.bullets.push(bulletBid);
        const bulletBidHover = bulletBid.states.create('hover');
        bulletBidHover.properties.scale = 1.3;

        this.allowTrade = true;
    }

    createBullet(disabled: string): PointedCircle {
        const bullet = new am4plugins_bullets.PointedCircle();
        bullet.fillOpacity = 0.8;
        bullet.radius = 12;
        bullet.disabled = true;
        bullet.rotation = 0;
        bullet.propertyFields.disabled = disabled;
        bullet.propertyFields.fill = 'fill';
        bullet.propertyFields.rotation = 'rotation';

        bullet.events.on('positionchanged', ev => {

            const bulletValue: number = ev.target.dataItem.values.valueY.value;
            const bulletDate = ev.target.dataItem.dates.dateX;
            const lastDate = this.chart.data[this.chart.data.length - 1].date;
            let index = 0;
            let price = this.priceLine.value;
            let rotation;
            for(let i = 0; i < this.chart.data.length; i++){
                if(!this.chart.data[i].disabled && this.chart.data[i].date === bulletDate){
                    index = i;
                    if (lastDate.getTime() > bulletDate.getTime() + (this.timeFrame * 1000)) {
                        if(this.chart.data[index + this.timeFrame]) {
                            price = this.chart.data[index + this.timeFrame].price;
                        }
                    }
                    rotation = this.chart.data[index].rotation;
                    break;
                }
            }



            if (rotation === 0) {
                ev.target.fill = price > bulletValue ? am4core.color('green') : am4core.color('gray');
            } else if (rotation === 180) {
                ev.target.fill = price < bulletValue ? am4core.color('red') : am4core.color('gray');
            }
        });

        bullet.events.on('over', ev => {
            this.bulletIsHover = true;
            let bulletTime = ev.target.dataItem.dates.dateX.toTimeString().split(' ')[0];
            for (let i = 0; i < this.orderList.length; i++) {
                if (this.orderList[i].timeFrame === this.timeFrame) {
                    let orderTime = this.orderList[i].date.toTimeString().split(' ')[0];
                    if (bulletTime === orderTime) {
                        this.showPriceRange(this.orderList[i]);
                    }
                }
            }
        });

        bullet.events.on('out', ev => {
            this.bulletIsHover = false;
            this.updateOrderListCurrentTimeFrame();
            if (this.selectedOrderList.length > 0 && !this.bulletIsHover) {
                this.showPriceRange(this.selectedOrderList[this.selectedOrderList.length - 1]);
            }
        });

        return bullet;
    }

    changeTimeFrame(t: number): void {
        if (this.timeFrame !== 30 && t === 0) { // 30 sec
            clearInterval(this.interval);
            this.timeFrame = 30;
            this.records = 100;
            this.dateAxis.renderer.minGridDistance = 100;
            this.chart.events.on('datavalidated', () => {
                this.dateAxis.zoom({start: 0.0, end: 1.5});
            });
            this.loadDataToChart();
            this.loadOrderList();
            this.updatePayout();
            this.updateReturn();
        } else if (this.timeFrame !== 60 && t === 1) { // 1 min
            clearInterval(this.interval);
            this.timeFrame = 60;
            this.records = 150;
            this.payout = this.spread ? 100 : 90;
            this.dateAxis.renderer.minGridDistance = 200;
            this.chart.events.on('datavalidated', () => {
                this.dateAxis.zoom({start: 0.0, end: 1.6});
            });
            this.loadDataToChart();
            this.loadOrderList();
            this.updatePayout();
            this.updateReturn();
        } else if (this.timeFrame !== 120 && t === 2) { // 2 min
            clearInterval(this.interval);
            this.timeFrame = 120;
            this.records = 300;
            this.payout = this.spread ? 100 : 90;
            this.dateAxis.renderer.minGridDistance = 100;
            this.chart.events.on('datavalidated', () => {
                this.dateAxis.zoom({start: 0.0, end: 1.7});
            });
            this.loadDataToChart();
            this.loadOrderList();
            this.updatePayout();
            this.updateReturn();
        } else if (this.timeFrame !== 180 && t === 3) { // 3 min
            clearInterval(this.interval);
            this.timeFrame = 180;
            this.records = 300;
            this.payout = this.spread ? 100 : 85;
            this.dateAxis.renderer.minGridDistance = 200;
            this.chart.events.on('datavalidated', () => {
                this.dateAxis.zoom({start: 0.0, end: 1.7});
            });
            this.loadDataToChart();
            this.loadOrderList();
            this.updatePayout();
            this.updateReturn();
        } else if (this.timeFrame !== 300 && t === 5) { // 5 min
            clearInterval(this.interval);
            this.timeFrame = 300;
            this.records = 500;
            this.payout = this.spread ? 100 : 80;
            this.dateAxis.renderer.minGridDistance = 200;
            this.chart.events.on('datavalidated', () => {
                this.dateAxis.zoom({start: 0.0, end: 1.7});
            });
            this.loadDataToChart();
            this.loadOrderList();
            this.updatePayout();
            this.updateReturn();
        } else if (this.timeFrame !== 600 && t === 10) { // 10 min
            clearInterval(this.interval);
            this.timeFrame = 600;
            this.records = 700;
            this.payout = this.spread ? 100 : 75;
            this.dateAxis.renderer.minGridDistance = 200;
            this.chart.events.on('datavalidated', () => {
                this.dateAxis.zoom({start: 0.0, end: 2});
            });
            this.loadDataToChart();
            this.loadOrderList();
            this.updatePayout();
            this.updateReturn();
        } else if (this.timeFrame !== 900 && t === 15) { // 15 min
            clearInterval(this.interval);
            this.timeFrame = 900;
            this.records = 1000;
            this.payout = this.spread ? 100 : 70;
            this.dateAxis.renderer.minGridDistance = 300;
            this.chart.events.on('datavalidated', () => {
                this.dateAxis.zoom({start: 0.2, end: 2});
            });
            this.loadDataToChart();
            this.loadOrderList();
            this.updatePayout();
            this.updateReturn();
        }
    }

    updateAmount(amount: any): void {
        this.amountStr = amount;
        this.updatePayout();
        this.updateReturn();
    }

    updateReturn(): void {
        this.amount = parseFloat(this.amountStr.toString().replace(/,/g, ''));
        this.allowTrade = this.amount >= 5 && this.amount <= 1000;
        this.return = this.allowTrade ? this.amount + (this.payout * this.amount / 100) : 0;
    }

    spreadMode(checked: boolean): void {
        this.spread = checked;
        this.updatePayout();
        this.updateReturn();
    }

    showAskBidLevels(show: boolean): void {
        this.seriesAsk.strokeOpacity = show ? 0.3 : 0.0;
        this.seriesBid.strokeOpacity = show ? 0.3 : 0.0;
    }

    updatePayout(): void {
        if (this.timeFrame === 30) {
            this.edgeStart = 300;
            this.edgeEnd = 600;
            this.payout = this.spread ? 100 : 95;
        } else if (this.timeFrame === 60) {
            this.edgeStart = 200;
            this.edgeEnd = 700;
            this.payout = this.spread ? 100 : 90;
        } else if (this.timeFrame === 120) {
            this.edgeStart = 0;
            this.edgeEnd = 1000;
            this.payout = this.spread ? 100 : 90;
        } else if (this.timeFrame === 180) {
            this.edgeStart = 0;
            this.edgeEnd = 1300;
            this.payout = this.spread ? 100 : 85;
        } else if (this.timeFrame === 300) {
            this.edgeStart = 0;
            this.edgeEnd = 1700;
            this.payout = this.spread ? 95 : 80;
        } else if (this.timeFrame === 600) {
            this.edgeStart = 0;
            this.edgeEnd = 3000;
            this.payout = this.spread ? 90 : 75;
        } else if (this.timeFrame === 900) {
            this.edgeStart = 0;
            this.edgeEnd = 4000;
            this.payout = this.spread ? 85 : 70;
        }
    }

    // all the below is optional, makes some fancy effects
    addEffects(): void {
        this.series.fillOpacity = 1;
        const gradient = new am4core.LinearGradient();
        gradient.addColor(this.chart.colors.getIndex(0), 0.0);
        gradient.addColor(this.chart.colors.getIndex(0), 0.5);
        this.series.fill = gradient;

        // this makes date axis labels to fade out
        this.dateAxis.renderer.labels.template.adapter.add('fillOpacity', (fillOpacity, target) => {
            const dataItem = target.dataItem;
            return dataItem.position;
        });

        // need to set this, otherwise fillOpacity is not changed and not set
        this.dateAxis.events.on('validated', () => {
            am4core.iter.each(this.dateAxis.renderer.labels.iterator(), label => {
                // @ts-ignore
                label.fillOpacity = label.fillOpacity;
            });
        });

        // bullet at the front of the line
        const bullet = this.series.createChild(am4charts.CircleBullet);
        bullet.circle.radius = 2;
        bullet.fillOpacity = 1;
        bullet.fill = am4core.color('#ffffff');
        bullet.poleHeight = 1;
        bullet.isMeasured = false;

        this.series.events.on('validated', () => {
            if (this.series.dataItems.last) {
                bullet.moveTo(this.series.dataItems.last.point);
                bullet.validatePosition();
            }
        });
    }

    ngOnDestroy(): void {
        clearInterval(this.interval);
        this.chart.dispose();
        this.dateAxis.dispose();
        this.valueAxis.dispose();
        this.series.dispose();
        this.seriesBid.dispose();
        this.seriesAsk.dispose();
    }
}
