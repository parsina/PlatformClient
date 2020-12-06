import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment.prod';
import {time} from '@amcharts/amcharts4/core';

class Observable<T> {
    subscribe(arg0: (data: any) => void): any {
        throw new Error('Method not implemented.');
    }
}

@Injectable({
    providedIn: 'root'
})
export class MarketService {

    constructor(private http: HttpClient) {
    }

    getMarketData(records: any,timeFrame: any, symbol: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('records', records);
        params = params.append('timeFrame', timeFrame);
        params = params.append('symbol', symbol);
        return this.http.get(environment.url + 'platform-rest/api/market/lastData', {params: params});
    }

    getLastRecord(symbol: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('symbol', symbol);
        return this.http.get(environment.url + 'platform-rest/api/market/lastRecord', {params: params});
    }

    getOrderList(timeFrame:any, symbol:any): Observable<any> {
        let params = new HttpParams();
        params = params.append('timeFrame', timeFrame);
        params = params.append('symbol', symbol);
        return this.http.get(environment.url + 'platform-rest/api/market/latestOrders', {params: params});
    }

    sendOrder(orderType: any, timeFrame: any, symbol: any, spread: boolean, tick: any) {
        return this.http.post<any>(environment.url + 'platform-rest/api/market/placeOrder', {type: orderType, timeFrame: timeFrame, symbol: symbol, spread: spread, tick: tick});
    }

    updateOrder(id: number, endPrice: any): Observable<any>{
        return this.http.post(environment.url + 'platform-rest/api/market/updateOrder', {id: id, endPrice: endPrice});
    }
}
