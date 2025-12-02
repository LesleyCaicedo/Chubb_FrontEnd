import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seguro } from '../../services/seguro';
import { AlertService } from '../../services/alert';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroExclamationTriangle, heroMagnifyingGlass, heroXMark } from '@ng-icons/heroicons/outline';

enum ResponseCode {
  Success = 0,
  Error = 1
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({ 
      heroMagnifyingGlass, 
      heroXMark, 
      heroExclamationTriangle 
    })
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  tipoBusqueda: 'cedula' | 'codigo' = 'cedula';
  terminoBusqueda: string = '';
  resultados: any[] = [];
  buscando: boolean = false;
  busquedaRealizada: boolean = false;

  filtros = {
    paginaActual: 1,
    tamanioPagina: 10,
    termino: ''
  };

  constructor(
    private seguroService: Seguro,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
  }

  buscar(): void {
    if (!this.terminoBusqueda || this.terminoBusqueda.trim() === '') {
      this.alertService.warning(
        'Campo requerido',
        `Por favor ingrese ${this.tipoBusqueda === 'cedula' ? 'una cédula' : 'un código de seguro'}`
      );
      return;
    }

    this.buscando = true;
    this.busquedaRealizada = true;
    this.resultados = [];

    const cedula = this.tipoBusqueda === 'cedula' ? this.terminoBusqueda.trim() : undefined;
    const codigo = this.tipoBusqueda === 'codigo' ? this.terminoBusqueda.trim() : undefined;

    this.seguroService.ConsultaGeneral(this.filtros, cedula, codigo).subscribe({
      next: (response) => {
        this.buscando = false;
        
        if (response.estado === ResponseCode.Success) {
          let dataArray = response.datos;
          
          if (response.datos && response.datos.seguros) {
            dataArray = response.datos.seguros;
          }
          
          if (dataArray && Array.isArray(dataArray) && dataArray.length > 0) {
            this.resultados = dataArray;
            
            const cantidad = dataArray.length;
            const mensaje = this.tipoBusqueda === 'cedula' 
              ? `Se encontraron ${cantidad} seguro${cantidad > 1 ? 's' : ''} asociado${cantidad > 1 ? 's' : ''}`
              : `Se encontraron ${cantidad} asegurado${cantidad > 1 ? 's' : ''} asociado${cantidad > 1 ? 's' : ''}`;
            
            this.alertService.success('Búsqueda exitosa', mensaje);
          } else {
            this.resultados = [];
            this.alertService.info(
              'Sin resultados',
              response.mensaje || 'No se encontraron resultados para la búsqueda'
            );
          }
        } else {
          this.resultados = [];
          this.alertService.error('Error', response.mensaje);
        }
      },
      error: (error) => {
        this.buscando = false;
        console.error('Error en la búsqueda:', error);
        
        this.alertService.error(
          'Error en la búsqueda',
          error?.error?.mensaje || 'Ocurrió un error al realizar la búsqueda. Por favor intente nuevamente.'
        );
      }
    });
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.resultados = [];
    this.tipoBusqueda = 'cedula';
    this.busquedaRealizada = false;
  }

  limpiarResultados(): void {
    this.terminoBusqueda = '';
    this.resultados = [];
    this.busquedaRealizada = false;
  }
}