import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroExclamationTriangle, heroEye, heroFunnel, heroPencilSquare, heroTrash, heroUserPlus } from '@ng-icons/heroicons/outline';
import { Paginador } from '../../components/paginador/paginador';
import { CommonModule } from '@angular/common';
import { ResponseModel } from '../../models/ResponseModel';
import { SeguroModel } from '../../models/seguro.model';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';
import { FiltradoModel } from '../../models/filtrado.model';
import { Seguro } from '../../services/seguro';
import { RegistroSeguro } from './modals/registro.seguro/registro.seguro';
import { VizualizarAsegurados } from './modals/vizualizar.asegurados/vizualizar.asegurados';
import { AlertService } from '../../services/alert';
import { Account as AccountService } from '../../services/account';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seguros',
  imports: [NgIcon, Paginador, CommonModule, RegistroSeguro, VizualizarAsegurados],
  templateUrl: './seguros.html',
  styleUrl: './seguros.css',
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
export class Seguros {
  @ViewChild('filtroTexto') filtroTexto!: ElementRef;

  urlEliminar: string = '';
  seguroEditar: SeguroModel | null = null;
  listaSeguros: SeguroModel[] = [];
  registrosFiltrados: number = 0;
  registrosTotales: number = 0;
  aseguradoSeleccionado: number | null = null;

  filtros: FiltradoModel = {
    termino: '',
    paginaActual: 1,
    tamanioPagina: 10
  };

  constructor(private seguroService: Seguro, private alertService: AlertService, private accountService: AccountService, private router: Router) {
    const rol = this.accountService.obtenerSesion()?.rol;

    if (rol !== 'Administrador') {
      this.router.navigateByUrl('')
    }
  }

  ngOnInit(): void {
    this.ConsultarSeguros();
  }

  ngAfterViewInit(): void {
    fromEvent(this.filtroTexto.nativeElement, 'input')
      .pipe(
        map((event: any) => (event.target as HTMLInputElement).value),
        debounceTime(1000),
        distinctUntilChanged()
      ).subscribe((texto: string) => {
        this.filtros.termino = texto;
        this.ConsultarSeguros();
      });
  }

  ConsultarSeguros() {
    this.seguroService.ConsultarSeguros(this.filtros).subscribe({
      next: (resp: ResponseModel) => {
        this.listaSeguros = resp.datos.seguros;
        this.registrosFiltrados = resp.datos.registrosFiltrados;
        this.registrosTotales = resp.datos.registrosTotales;
      },
      error: (error) => {
        this.alertService.mostrarAlerta('error', 'Error al cargar seguros', error.message);
      }
    });
  }

  editarSeguro(index: number) {
    this.seguroEditar = { ...this.listaSeguros[index] };
  }

  async eliminarSeguro(seguro: SeguroModel) {
    this.seguroService.ConsultarSeguroId(this.filtros, seguro.idSeguro).subscribe({
      next: async (res: any) => {
        const asegurados = res.datos.seguros || [];

        if (asegurados.length > 0) {
          const nombresAsegurados = asegurados
            .map((s: any) => s.nombre || 'Seguro sin nombre')
            .join(', ');
          
          this.alertService.error(
            'No se puede eliminar',
            `El seguro "${seguro.nombre}" tiene ${asegurados.length} asegurado(s) asignado(s). Debe remover todos los asegurados antes de eliminarlo.`
          );
          return;
        }
        const confirmado = await this.alertService.mostrarConfirmacion(
          '¿Estás seguro?',
          `¿Deseas eliminar "${seguro.nombre}"?`,
          'warning',
          'Sí, eliminar',
          'Cancelar'
        );

        if (confirmado) {
          this.seguroService.EliminarSeguro(seguro.idSeguro).subscribe({
            next: () => {
              this.alertService.success('¡Eliminado!', 'Seguro eliminado exitosamente');
              this.ConsultarSeguros();
            },
            error: () => {
              this.alertService.error('Error', 'No se pudo eliminar');
            }
          });
        }
      }
    })


  }

  EventoExitoso(exitoso: boolean) {
    if (exitoso) {
      this.alertService.success('¡Éxito!',
        this.seguroEditar ? 'Seguro actualizado correctamente' : 'Seguro registrado correctamente'
      );
      this.seguroEditar = null;
      this.ConsultarSeguros(); // Actualizar la tabla automáticamente
    } else {
      this.alertService.error('Error', 'No se pudo completar la operación');
    }
  }

  onChangeViewValue(event: any) {
    this.filtros.tamanioPagina = Number(event.target.value);
    this.ConsultarSeguros();
  }

  onPageChange(num: number) {
    this.filtros.paginaActual = num;
    this.ConsultarSeguros();
  }

  get seFiltra(): boolean {
    return this.filtros.termino !== '';
  }

  abrirDetalleAsegurado(idSeguro: number): void {
    if (this.aseguradoSeleccionado === idSeguro) {
      this.aseguradoSeleccionado = null;
      setTimeout(() => {
        this.aseguradoSeleccionado = idSeguro;
      }, 0);
    } else {
      this.aseguradoSeleccionado = idSeguro;
    }
  }

  cerrarModal(): void {
    this.aseguradoSeleccionado = null;
  }
}