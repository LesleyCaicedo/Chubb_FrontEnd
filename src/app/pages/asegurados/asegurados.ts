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
import { ModalSeguros } from './modals/modal-seguros/modal-seguros';
import { AlertService } from '../../services/alert';
import { RegistroAsegurado } from './modals/registro.asegurado/registro.asegurado';

@Component({
  selector: 'app-asegurados',
  imports: [NgIcon, Paginador, AseguradosCargaMasiva, CommonModule, ModalSeguros, RegistroAsegurado],
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
  @ViewChild(RegistroAsegurado) registroComp!: RegistroAsegurado;
  aseguradoEditar: AseguradoModel | null = null;
  listaAsegurados: AseguradoModel[] = [];
  registrosFiltrados: number = 0;
  registrosTotales: number = 0;
  urlEliminar: string = '';
  aseguradoSeleccionado: number | null = null;

  filtros: FiltradoModel = {
    termino: '',
    paginaActual: 1,
    tamanioPagina: 10
  };

  // Filtros para consultar seguros
  filtrosSeguros = {
    termino: '',
    paginaActual: 1,
    tamanioPagina: 100
  };

  constructor(private aseguradoService: Asegurado, private alertService: AlertService) { }

  ngOnInit(): void {
    this.obtenerAsegurados();
  }

  ngAfterViewInit(): void {
    fromEvent(this.filtroTexto.nativeElement, 'input')
      .pipe(
        map((event: any) => (event.target as HTMLInputElement).value),
        debounceTime(1000),
        distinctUntilChanged()
      ).subscribe((texto: string) => {
        this.filtros.termino = texto;
        this.obtenerAsegurados();
      });
  }

  obtenerAsegurados() {
    this.aseguradoService.obtenerAsegurados(this.filtros).subscribe({
      next: (resp: any) => {
        this.listaAsegurados = resp.datos.asegurados;
        this.registrosTotales = resp.datos.registrosTotales;
        this.registrosFiltrados = resp.datos.registrosFiltrados;
      },
      error: (error) => {
        this.alertService.error('error', 'Error al cargar asegurados');
      }
    });
  }

  editarAsegurado(index: number) {
    this.aseguradoEditar = { ...this.listaAsegurados[index] };
  }

  async eliminarAsegurado(asegurado: AseguradoModel) {
    this.aseguradoService.obtenerSeguros(this.filtrosSeguros, asegurado.idAsegurado).subscribe({
      next: async (res: any) => {
        const seguros = res.datos.asegurado || [];
        
        if (seguros.length > 0) {
          const nombresSeguros = seguros
            .map((s: any) => s.nombre || 'Asegurado sin nombre')
            .join(', ');
          
          this.alertService.error(
            'No se puede eliminar',
            `El asegurado "${asegurado.nombre}" tiene ${seguros.length} seguro(s) asignado(s). Debe remover todos los seguros antes de eliminarlo.`
          );
          return;
        }

        const confirmado = await this.alertService.mostrarConfirmacion(
          '¿Estás seguro?',
          `¿Deseas eliminar a "${asegurado.nombre}"?`,
          'warning',
          'Sí, eliminar',
          'Cancelar'
        );

        if (confirmado) {
          this.aseguradoService.EliminarAsegurado(asegurado.idAsegurado).subscribe({
            next: () => {
              this.alertService.success('¡Eliminado!', 'Asegurado eliminado exitosamente');
              this.obtenerAsegurados();
            },
            error: (error) => {
              const mensaje = error?.error?.mensaje || 'No se pudo eliminar el asegurado';
              this.alertService.error('Error', mensaje);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al verificar seguros:', error);
        this.alertService.error('Error', 'No se pudo verificar los seguros del asegurado');
      }
    });
  }

  onChangeViewValue(event: any) {
    this.filtros.tamanioPagina = Number(event.target.value);
    this.obtenerAsegurados();
  }

  onPageChange(num: number) {
    this.filtros.paginaActual = num;
    this.obtenerAsegurados();
  }

  get seFiltra(): boolean {
    return this.filtros.termino !== '';
  }

  getEdad(fechaNacimiento: string | Date): number {
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  }

  EventoExitoso(exitoso: boolean) {
    if (exitoso) {
      this.alertService.success('¡Éxito!', 'Seguro registrado correctamente');
      this.obtenerAsegurados();
    }
  }

  abrirDetalleAsegurado(idAsegurado: number): void {
    if (this.aseguradoSeleccionado === idAsegurado) {
      this.aseguradoSeleccionado = null;
      setTimeout(() => {
        this.aseguradoSeleccionado = idAsegurado;
      }, 0);
    } else {
      this.aseguradoSeleccionado = idAsegurado;
    }
  }

  abrirModalRegistroNuevo() {
    this.registroComp?.open();
  }

  abrirModalEditar(asegurado: AseguradoModel) {
    this.registroComp?.open(asegurado);
  }

  cerrarModal(): void {
    this.aseguradoSeleccionado = null;
  }
}