import { heroExclamationTriangle, heroFunnel, heroPencilSquare, heroTrash, heroUserPlus } from '@ng-icons/heroicons/outline';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Paginador } from '../../components/paginador/paginador';
import { AseguradosCargaMasiva } from '../asegurados-carga-masiva/asegurados-carga-masiva';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asegurados',
  imports: [NgIcon, Paginador, AseguradosCargaMasiva, CommonModule],
  templateUrl: './asegurados.html',
  styleUrl: './asegurados.css',
  providers: [
    provideIcons({
      heroFunnel,
      heroUserPlus,
      heroPencilSquare,
      heroTrash,
      heroExclamationTriangle
    })
  ]
})
export class Asegurados implements OnInit {
  @ViewChild('filtroTexto') filtroTexto!: ElementRef;
  aseguradoEditar: any;
  urlEliminar: string = '';
  listaAsegurados: any;
  registrosFiltrados: number = 0;
  registrosTotales: number = 0;

  filtros: any = {
    termino: '',
    paginaActual: 1,
    tamanioPagina: 10 // Cambiar esto si se cambia el valor por defecto en el select del html
  };

  constructor() { }

  ngOnInit(): void {
    this.obtenerAsegurados();
  }

  obtenerAsegurados() { }

  editarAsegurado(index: number) { }

  eliminarAsegurado(index: number) { }

  onChangeViewValue(event: any) {
    this.filtros.tamanioPagina = Number(event.target.value);
    this.obtenerAsegurados();
  }

  onPageChange(num: number) {
    this.filtros.paginaActual = num;
    this.obtenerAsegurados();
  }

  get seFiltra(): boolean {
    return this.filtros.termino !== ''
  }

}
