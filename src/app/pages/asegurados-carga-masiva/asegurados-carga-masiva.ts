// asegurados-carga-masiva.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Asegurado as AseguradoService } from '../../services/asegurado';
import { Seguro as SeguroService } from '../../services/seguro';
import { Account as AccountService } from '../../services/account';
import Swal from 'sweetalert2';

interface Seguro {
  idSeguro: number;
  nombre: string;
  prima: number;
  edadMin?: number;
  edadMax?: number;
  esGeneral: boolean;
  codigo?: string;
}

interface Regla {
  idSeguro: number;
  nombreSeguro: string;
  prima: number;
  esGeneral: boolean;
  edadMinima?: number;
  edadMaxima?: number;
  rangoOriginalSeguro?: string;
}

@Component({
  selector: 'app-asegurados-carga-masiva',
  imports: [CommonModule, FormsModule],
  templateUrl: './asegurados-carga-masiva.html',
  styleUrl: './asegurados-carga-masiva.css',
})
export class AseguradosCargaMasiva {
  isDragging = false;
  selectedFile: File | null = null;
  usuarioGestor: string = '';
  
  incluirGenerales: boolean = false;
  edadMin: string = '';
  edadMax: string = '';
  cargando: boolean = false;
  segurosDisponibles: Seguro[] = [];
  seguroSeleccionado: string = '';
  reglas: Regla[] = [];
  mostrarParametrizacion: boolean = false;
  
  @Output() submitEvent = new EventEmitter<boolean>();
  
  constructor(
    private http: HttpClient, 
    private aseguradoService: AseguradoService,
    private seguroService: SeguroService,
    private accountService: AccountService
  ) {
    this.usuarioGestor = this.accountService.obtenerSesion()?.nombre || 'usuario_default';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    this.validateFile(file);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.validateFile(file);
  }

  validateFile(file: File) {
    const allowed = ['xlsx', 'xls', 'txt'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowed.includes(extension)) {
      Swal.fire({
        title: "Formato no válido",
        text: "Solo se permiten archivos Excel (.xlsx, .xls) o TXT.",
        icon: "error"
      });
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  toggleParametrizacion() {
    this.mostrarParametrizacion = !this.mostrarParametrizacion;
    if (!this.mostrarParametrizacion) {
      this.limpiarParametrizacion();
    }
  }

  limpiarParametrizacion() {
    this.segurosDisponibles = [];
    this.seguroSeleccionado = '';
    this.reglas = [];
    this.edadMin = '';
    this.edadMax = '';
    this.incluirGenerales = false;
  }

  consultarSeguros(): void {
    const edadMinNum = this.edadMin ? parseInt(this.edadMin) : null;
    const edadMaxNum = this.edadMax ? parseInt(this.edadMax) : null;

    if (edadMinNum !== null && edadMaxNum !== null && edadMinNum > edadMaxNum) {
      Swal.fire({
        title: "Rango inválido",
        text: "La edad mínima no puede ser mayor que la edad máxima.",
        icon: "warning"
      });
      return;
    }

    this.cargando = true;

    this.seguroService.ConsultarSegurosPorRangoEdad(edadMinNum, edadMaxNum, this.incluirGenerales).subscribe({
      next: (response) => {
        this.segurosDisponibles = response.datos.seguros.map((s: any) => ({
          idSeguro: s.idSeguro,
          nombre: s.nombre,
          prima: s.prima,
          edadMin: s.edadMin,
          edadMax: s.edadMax,
          esGeneral: s.edadMin === null && s.edadMax === null,
          codigo: s.codigo
        }));
        this.cargando = false;

        if (this.segurosDisponibles.length === 0) {
          Swal.fire({
            title: "Sin resultados",
            text: "No se encontraron seguros para los criterios especificados.",
            icon: "info"
          });
        }
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire({
          title: "Error al consultar seguros",
          text: err.error?.mensaje || "Ocurrió un error inesperado",
          icon: "error"
        });
      }
    });
  }

  agregarRegla(): void {
    if (!this.seguroSeleccionado) {
      Swal.fire({
        title: "Falta selección",
        text: "Debe seleccionar un seguro.",
        icon: "warning"
      });
      return;
    }

    const seguro = this.segurosDisponibles.find(
      s => s.idSeguro === parseInt(this.seguroSeleccionado)
    );
    
    if (!seguro) return;

    const edadMinNum = this.edadMin ? parseInt(this.edadMin) : undefined;
    const edadMaxNum = this.edadMax ? parseInt(this.edadMax) : undefined;

    if (!seguro.esGeneral && (this.edadMin || this.edadMax) && (!this.edadMin || !this.edadMax)) {
      Swal.fire({
        title: "Rango incompleto",
        text: "Si defines un rango de edad, debes ingresar tanto la edad mínima como la máxima.",
        icon: "warning"
      });
      return;
    }

    const nuevaRegla: Regla = {
      idSeguro: seguro.idSeguro,
      nombreSeguro: seguro.nombre,
      prima: seguro.prima,
      esGeneral: seguro.esGeneral && !edadMinNum && !edadMaxNum,
      edadMinima: edadMinNum,
      edadMaxima: edadMaxNum,
      rangoOriginalSeguro: seguro.esGeneral 
        ? 'Sin restricción' 
        : `${seguro.edadMin || '0'}-${seguro.edadMax || '∞'}`
    };
    
    this.reglas.push(nuevaRegla);
    
    this.edadMin = '';
    this.edadMax = '';
    this.incluirGenerales = false;
    this.segurosDisponibles = [];
    this.seguroSeleccionado = '';

    Swal.fire({
      title: "Regla agregada",
      text: `Se agregó la regla para el seguro "${nuevaRegla.nombreSeguro}"`,
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });
  }

  eliminarRegla(index: number): void {
    Swal.fire({
      title: '¿Eliminar regla?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reglas.splice(index, 1);
        Swal.fire({
          title: 'Eliminada',
          text: 'La regla fue eliminada correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }

  uploadFile() {
    if (!this.selectedFile) {
      Swal.fire({
        title: "Falta archivo",
        text: "Debe seleccionar un archivo para cargar.",
        icon: "warning"
      });
      return;
    }

    if (this.mostrarParametrizacion && this.reglas.length === 0) {
      Swal.fire({
        title: "Falta configuración",
        text: "Debe agregar al menos una regla de asignación.",
        icon: "warning"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    
    const reglasLimpias = this.mostrarParametrizacion && this.reglas.length > 0 
      ? this.reglas.map(r => ({
          idSeguro: r.idSeguro,
          nombreSeguro: r.nombreSeguro,
          prima: r.prima,
          edadMinima: r.edadMinima ?? null,
          edadMaxima: r.edadMaxima ?? null
        }))
      : undefined;
    
    this.cargando = true;

    this.aseguradoService.cargaMasiva(formData, this.usuarioGestor, reglasLimpias).subscribe({
      next: (res) => {
        this.cargando = false;
        
        Swal.fire({
          title: "Archivo cargado correctamente",
          html: this.mostrarParametrizacion 
            ? `<p>Se procesaron <strong>${this.reglas.length} regla(s)</strong> de asignación.</p>`
            : "Se asignaron seguros automáticamente según las restricciones de edad de cada seguro.",
          icon: "success"
        });

        this.resetForm();
        this.closeModal();
        this.submitEvent.next(true);
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error completo:', err);
        Swal.fire({
          title: "Error al subir el archivo",
          text: err.error?.mensaje || err.message || "Ocurrió un error inesperado",
          icon: "error"
        });
      }
    });
  }
  resetForm() {
    this.selectedFile = null;
    this.mostrarParametrizacion = false;
    this.limpiarParametrizacion();
  }

  closeModal() {
    const modal = document.getElementById('modal_carga_masiva') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  }
}