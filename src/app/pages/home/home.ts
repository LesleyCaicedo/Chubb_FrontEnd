import { Component } from '@angular/core';
import { DecimalPipe, CurrencyPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [DecimalPipe, CurrencyPipe, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  metrics: any;

  constructor() {
    this.metrics = {
      totalAsegurados: 12458,
      polizasContratadas: 8450,
      primasTotales: 1259843,
      siniestrosReporte: 152,
      crecimientoMensualPct: 3.8,
    };
  }
}
