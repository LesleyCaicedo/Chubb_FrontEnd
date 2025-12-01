// src/app/services/alert.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  /**
   * Muestra una alerta toast usando DaisyUI
   */
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

    // Auto-remover después de 3 segundos
    setTimeout(() => {
      alertContainer.classList.add('animate-fade-out');
      setTimeout(() => alertContainer.remove(), 300);
    }, 3000);
  }

  /**
   * Muestra un diálogo de confirmación
   */
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
        <dialog id="modal_confirmacion_${Date.now()}" class="modal modal-open">
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

  /**
   * Atajos para tipos específicos de alertas
   */
  success(titulo: string, mensaje?: string): void {
    this.mostrarAlerta('success', titulo, mensaje);
  }

  error(titulo: string, mensaje?: string): void {
    this.mostrarAlerta('error', titulo, mensaje);
  }

  warning(titulo: string, mensaje?: string): void {
    this.mostrarAlerta('warning', titulo, mensaje);
  }

  info(titulo: string, mensaje?: string): void {
    this.mostrarAlerta('info', titulo, mensaje);
  }

  /**
   * Atajo para confirmación de eliminación
   */
  confirmarEliminacion(nombreItem: string): Promise<boolean> {
    return this.mostrarConfirmacion(
      '¿Estás seguro?',
      `¿Deseas eliminar "${nombreItem}"? Esta acción no se puede deshacer.`,
      'warning',
      'Sí, eliminar',
      'Cancelar'
    );
  }
}