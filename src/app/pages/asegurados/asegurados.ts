import { heroExclamationTriangle, heroEye, heroFunnel, heroPencilSquare, heroTrash, heroUserPlus } from '@ng-icons/heroicons/outline';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Paginador } from '../../components/paginador/paginador';
import { AseguradosCargaMasiva } from '../asegurados-carga-masiva/asegurados-carga-masiva';
import { CommonModule } from '@angular/common';
import { FiltradoModel } from '../../models/filtrado.model';
import { AseguradoModel } from '../../models/asegurado.model';
import { Asegurado } from '../../services/asegurado';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';
import { ModalSeguros } from './modal-seguros/modal-seguros';

@Component({
  selector: 'app-asegurados',
  imports: [NgIcon, Paginador, AseguradosCargaMasiva, CommonModule, ModalSeguros],
  templateUrl: './asegurados.html',
  styleUrl: './asegurados.css',
  providers: [
    provideIcons({
      heroFunnel,
      heroUserPlus,
      heroPencilSquare,
      heroTrash,
      heroExclamationTriangle,
      heroEye
    })
  ]
})
export class Asegurados implements OnInit {
  @ViewChild('filtroTexto') filtroTexto!: ElementRef;
  listaAsegurados: AseguradoModel[] | null = null;
  registrosFiltrados: number = 0;
  registrosTotales: number = 0;
  urlEliminar: string = '';
  aseguradoSeleccionado: number = 0;

  filtros: FiltradoModel = {
    termino: '',
    paginaActual: 1,
    tamanioPagina: 10 // Cambiar esto si se cambia el valor por defecto en el select del html
  };

  constructor(private aseguradoService: Asegurado) { }

  ngOnInit(): void {
    this.obtenerAsegurados();
  }

  ngAfterViewInit(): void {
    // Aplica tiempo de espera para filtro automatico al escribir sobre input
    fromEvent(this.filtroTexto.nativeElement, 'input')
      .pipe(
        map((event: any) => (event.target as HTMLInputElement).value),
        debounceTime(1000),
        distinctUntilChanged()
      ).subscribe((texto: string) => {
        this.filtros.termino = texto;
        this.obtenerAsegurados();
      })
  }

  obtenerAsegurados() {
    this.aseguradoService.obtenerAsegurados(this.filtros).subscribe({
      next: (resp: any) => {
        this.listaAsegurados = resp.datos.asegurados;
        this.registrosTotales = resp.datos.registrosTotales;
        this.registrosFiltrados = resp.datos.registrosFiltrados;
      }
    })
  }

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


  getEdad(fechaNacimiento: string | Date): number {
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    // Ajustar si aún no cumple años este año
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  }

  EventoExitoso(evento: any) {
    if(evento) {
      this.obtenerAsegurados();
    }
  }

}
