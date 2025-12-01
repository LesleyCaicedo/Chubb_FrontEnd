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

  constructor(private seguroService: Seguro) { }

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
        this.mostrarAlerta('error', 'Error al cargar seguros', error.message);
      }
    });
  }

  editarSeguro(index: number) {
    this.seguroEditar = { ...this.listaSeguros[index] };
  }

  eliminarSeguro(seguro: SeguroModel) {
    this.mostrarConfirmacion(
      '¿Estás seguro?',
      `¿Deseas eliminar el seguro "${seguro.nombre}"?`,
      'warning',
      'Sí, eliminar',
      'Cancelar'
    ).then((confirmado) => {
      if (confirmado) {
        this.seguroService.EliminarSeguro(seguro.idSeguro).subscribe({
          next: (resp: ResponseModel) => {
            this.mostrarAlerta('success', '¡Eliminado!', 'El seguro ha sido eliminado exitosamente');
            this.ConsultarSeguros(); // Actualizar la tabla automáticamente
          },
          error: (error) => {
            this.mostrarAlerta('error', 'Error', 'No se pudo eliminar el seguro');
          }
        });
      }
    });
  }

  EventoExitoso(exitoso: boolean) {
    if (exitoso) {
      this.mostrarAlerta(
        'success',
        '¡Éxito!',
        this.seguroEditar ? 'Seguro actualizado correctamente' : 'Seguro registrado correctamente'
      );
      this.seguroEditar = null;
      this.ConsultarSeguros(); // Actualizar la tabla automáticamente
    } else {
      this.mostrarAlerta('error', 'Error', 'No se pudo completar la operación');
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

  mostrarAlerta(tipo: 'success' | 'error' | 'warning' | 'info', titulo: string, mensaje?: string): void {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'toast toast-top toast-end z-50';

    const iconos = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>`
    };

    const clases = {
      success: 'alert-success',
      error: 'alert-error',
      warning: 'alert-warning',
      info: 'alert-info'
    };

    alertContainer.innerHTML = `
      <div class="alert ${clases[tipo]} shadow-lg animate-fade-in">
        ${iconos[tipo]}
        <div>
          <h3 class="font-bold">${titulo}</h3>
          ${mensaje ? `<div class="text-xs">${mensaje}</div>` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(alertContainer);

    setTimeout(() => {
      alertContainer.classList.add('animate-fade-out');
      setTimeout(() => alertContainer.remove(), 300);
    }, 3000);
  }

 
  mostrarConfirmacion(
    titulo: string,
    mensaje: string,
    tipo: 'warning' | 'info' = 'warning',
    textoConfirmar: string = 'Confirmar',
    textoCancelar: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = `
        <dialog id="modal_confirmacion" class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg flex items-center gap-2">
              ${tipo === 'warning' ?
          `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>` :
          `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`
        }
              ${titulo}
            </h3>
            <p class="py-4">${mensaje}</p>
            <div class="modal-action">
              <button class="btn btn-ghost" id="btn_cancelar">${textoCancelar}</button>
              <button class="btn ${tipo === 'warning' ? 'btn-error' : 'btn-primary'}" id="btn_confirmar">${textoConfirmar}</button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button id="btn_backdrop">close</button>
          </form>
        </dialog>
      `;

      document.body.appendChild(modalContainer);

      const btnConfirmar = modalContainer.querySelector('#btn_confirmar') as HTMLButtonElement;
      const btnCancelar = modalContainer.querySelector('#btn_cancelar') as HTMLButtonElement;
      const btnBackdrop = modalContainer.querySelector('#btn_backdrop') as HTMLButtonElement;

      btnConfirmar?.addEventListener('click', () => {
        modalContainer.remove();
        resolve(true);
      });

      btnCancelar?.addEventListener('click', () => {
        modalContainer.remove();
        resolve(false);
      });

      btnBackdrop?.addEventListener('click', () => {
        modalContainer.remove();
        resolve(false);
      });
    });
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