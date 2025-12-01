import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asegurados-carga-masiva',
  imports: [CommonModule],
  templateUrl: './asegurados-carga-masiva.html',
  styleUrl: './asegurados-carga-masiva.css',
})
export class AseguradosCargaMasiva {
  isDragging = false;
  selectedFile: File | null = null;

  constructor(private http: HttpClient) { }

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
    formData.append('archivo', this.selectedFile);

    // Ajusta la URL a tu API .NET Core
    this.http.post('https://tu-api.com/asegurados/carga-masiva', formData)
      .subscribe({
        next: (res) => {
          alert('Archivo subido correctamente');
          this.selectedFile = null;
        },
        error: (err) => {
          console.error(err);
          alert('Error al subir el archivo');
        }
      });
  }
}
