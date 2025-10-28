import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DashboardKPIData {
  stockTotal: number;
  stockValue: number;
  totalEntries: number;
  entriesValue: number;
  totalExits: number;
  exitsValue: number;
}

export interface CategoryData {
  name: string;
  stock: number;
  value: number;
  entries: number;
  entriesValue: number;
  exits: number;
  exitsValue: number;
}

export interface MonthlyData {
  month: string;
  entries: number;
  entriesValue: number;
  exits: number;
  exitsValue: number;
}

export interface TopProduct {
  name: string;
  value: number;
  status?: 'normal' | 'low-stock' | 'out-of-stock';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {

  constructor() { }

  getKPIData(): Observable<DashboardKPIData> {
    // Simulation de données - à remplacer par un appel API réel
    const mockData: DashboardKPIData = {
      stockTotal: 366,
      stockValue: 54852.09,
      totalEntries: 992,
      entriesValue: 291428.95,
      totalExits: 702,
      exitsValue: 297931.00
    };

    return of(mockData).pipe(delay(500));
  }

  getCategoryData(): Observable<CategoryData[]> {
    const mockData: CategoryData[] = [
      {
        name: 'Biscuits',
        stock: 254,
        value: 17750,
        entries: 562,
        entriesValue: 167360,
        exits: 338,
        exitsValue: 171550
      },
      {
        name: 'Consoles',
        stock: 70,
        value: 25792,
        entries: 189,
        entriesValue: 68550,
        exits: 147,
        exitsValue: 67960
      },
      {
        name: 'Electro',
        stock: 27,
        value: 10589,
        entries: 151,
        entriesValue: 53925,
        exits: 133,
        exitsValue: 57320
      },
      {
        name: 'SmartPhone',
        stock: 15,
        value: 721,
        entries: 90,
        entriesValue: 1594,
        exits: 84,
        exitsValue: 1141
      }
    ];

    return of(mockData).pipe(delay(300));
  }

  getMonthlyData(): Observable<MonthlyData[]> {
    const mockData: MonthlyData[] = [
      {
        month: 'janv',
        entries: 137,
        entriesValue: 51548,
        exits: 71,
        exitsValue: 38305
      },
      {
        month: 'févr',
        entries: 184,
        entriesValue: 76664,
        exits: 100,
        exitsValue: 60320
      },
      {
        month: 'mars',
        entries: 142,
        entriesValue: 38248,
        exits: 187,
        exitsValue: 69065
      },
      {
        month: 'avr',
        entries: 106,
        entriesValue: 48081,
        exits: 253,
        exitsValue: 74985
      },
      {
        month: 'mai',
        entries: 423,
        entriesValue: 76047,
        exits: 91,
        exitsValue: 55176
      }
    ];

    return of(mockData).pipe(delay(400));
  }

  getTopProducts(): Observable<TopProduct[]> {
    const mockData: TopProduct[] = [
      { name: 'IPHONE 13 PRO', value: 129500 },
      { name: 'GOOGLE PIXEL S', value: 42010 },
      { name: 'Cuisinière CANDY', value: 35400 }
    ];

    return of(mockData).pipe(delay(200));
  }

  getProductsToReplenish(): Observable<TopProduct[]> {
    const mockData: TopProduct[] = [
      { name: 'Cuisinière CANDY', value: 0, status: 'out-of-stock' },
      { name: 'NINTENDO SWITCH', value: 0, status: 'low-stock' },
      { name: 'Réfrigérateur WHIRLPOOL', value: 0, status: 'low-stock' }
    ];

    return of(mockData).pipe(delay(200));
  }

  // Méthode pour filtrer les données selon les filtres sélectionnés
  filterData(filters: any): Observable<any> {
    // Ici vous pouvez implémenter la logique de filtrage
    // Pour l'instant, on retourne les données complètes
    return this.getKPIData();
  }
}





















































