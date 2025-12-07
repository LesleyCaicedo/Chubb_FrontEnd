import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Asegurado as AseguradoService } from '../../services/asegurado';
import { Account as AccountService } from '../../services/account';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-asegurados-carga-masiva',
  imports: [CommonModule],
  templateUrl: './asegurados-carga-masiva.html',
  styleUrl: './asegurados-carga-masiva.css',
})
export class AseguradosCargaMasiva {
  isDragging = false;
  selectedFile: File | null = null;
  usuarioGestor: string = ''

  @Output() submitEvent = new EventEmitter<boolean>();
  constructor(private http: HttpClient, private aseguradoService: AseguradoService, private accountService: AccountService) {
    this.usuarioGestor = this.accountService.obtenerSesion()?.nombre!;
  }

  // -----------------------------
  // Drag & Drop
  // -----------------------------

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

  // -----------------------------
  // Selección normal por input
  // -----------------------------

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.validateFile(file);
  }

  // -----------------------------
  // Validación del archivo
  // -----------------------------

  validateFile(file: File) {
    const allowed = ['xlsx', 'xls', 'txt'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowed.includes(extension)) {
      alert('Solo se permiten archivos Excel (.xlsx, .xls) o TXT.');
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  // -----------------------------
  // Subida del archivo al backend
  // -----------------------------

  uploadFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.aseguradoService.cargaMasiva(formData, this.usuarioGestor).subscribe({
      next: (res) => {
        Swal.fire({
          title: "Archivo cargado correctamente",
          text: "",
          icon: "success"
        });

        this.selectedFile = null;
        this.closeModal();
        this.submitEvent.next(true);
      },
      error: (err) => {
        alert('Error al subir el archivo');
        this.closeModal();
      }
    });
  }

  closeModal() {
    const modal = document.getElementById('modal_carga_masiva') as HTMLDialogElement;
    modal.close();
  }
}
