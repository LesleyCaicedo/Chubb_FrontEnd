import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AseguradoModel } from '../../../../models/asegurado.model';
import { SeguroModel } from '../../../../models/seguro.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asegurado } from '../../../../services/asegurado';
import { Seguro } from '../../../../services/seguro';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroInformationCircle, heroMagnifyingGlass, heroUser, heroXMark } from '@ng-icons/heroicons/outline';
import { Shareds } from '../../../../commons/utils/shared.util';
import { AlertService } from '../../../../services/alert';
import { Account as AccountService } from '../../../../services/account';

@Component({
  selector: 'app-registro-asegurado',
  imports: [...Shareds, NgIcon],
  templateUrl: './registro.asegurado.html',
  styleUrl: './registro.asegurado.css',
  providers: [provideIcons({
    heroMagnifyingGlass,
    heroUser,
    heroInformationCircle,
    heroXMark
  })]
})
export class RegistroAsegurado {

  @Input() aseguradoUpdt: AseguradoModel | null = null;
  @Output() submitEvent = new EventEmitter<boolean>();
  @ViewChild('modalDialog') modalDialog!: ElementRef<HTMLDialogElement>;

  aseguradoForm: FormGroup = new FormBuilder().group({});
  disable = false;

  segurosDisponibles: SeguroModel[] = [];
  segurosSeleccionados: number[] = [];
  cargandoSeguros = false;

  today: string = new Date().toISOString().split('T')[0];
  usuarioGestor: string = ''; 

  filtros = {
    termino: '',
    paginaActual: 1,
    tamanioPagina: 100
  };
  
  constructor(
    private fb: FormBuilder,
    private aseguradoService: Asegurado,
    private seguroService: Seguro,
    private alertService: AlertService,
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.setEmptyForm();
    this.setupEdadCalculation();
    this.setupFormListeners();
    
    this.usuarioGestor = this.accountService.obtenerSesion()?.nombre || 'usuario_default';
  }

  ngOnChanges(): void {
    if (!this.aseguradoUpdt) return;
    this.obtenerSeguros();
  }

  setEmptyForm() {
    this.aseguradoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      fechaNacimiento: ['', Validators.required],
      edad: [{ value: '', disabled: true }],
      seleccionarSeguros: [false],
      seguros: [[]]
    });
  }

  validarSeguros(): boolean {
    const seleccionarSeguros = this.aseguradoForm.get('seleccionarSeguros')?.value;
    const seguros = this.aseguradoForm.get('seguros')?.value || [];
    
    if (seleccionarSeguros && seguros.length === 0) {
      return false;
    }
    
    return true;
  }

  setupFormListeners(): void {
    this.aseguradoForm.get('seleccionarSeguros')?.valueChanges.subscribe(checked => {
      const control = this.aseguradoForm.get('seguros');

      if (checked) {
        control?.setValidators([Validators.required, Validators.minLength(1)]);
        control?.updateValueAndValidity();
        
        const edad = this.aseguradoForm.get('edad')?.value;
        if (edad && edad > 0) {
          this.cargarSegurosPorEdad(edad);
        }
      } else {
        control?.clearValidators();
        control?.setValue([]);
        control?.updateValueAndValidity();
        this.segurosDisponibles = [];
      }

      control?.markAsUntouched();
    });
  }

  setupEdadCalculation() {
    const fechaNacControl = this.aseguradoForm.get('fechaNacimiento');

    fechaNacControl?.valueChanges.subscribe(fecha => {
      if (fecha) {
        const edad = this.calcularEdad(fecha);
        this.aseguradoForm.get('edad')?.setValue(edad, { emitEvent: false });

        if (edad > 0 && this.aseguradoForm.get('seleccionarSeguros')?.value) {
          this.cargarSegurosPorEdad(edad);
        }
      } else {
        this.aseguradoForm.get('edad')?.setValue('', { emitEvent: false });
        this.segurosDisponibles = [];
      }
    });
  }

  calcularEdad(fechaNacimiento: string | Date | null): number {
    if (!fechaNacimiento) return 0;
    
    let fecha: Date;
    if (typeof fechaNacimiento === 'string') {
      const partes = fechaNacimiento.split('-');
      if (partes.length === 3) {
        fecha = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
      } else {
        fecha = new Date(fechaNacimiento);
      }
    } else {
      fecha = fechaNacimiento;
    }

    if (isNaN(fecha.getTime())) return 0;

    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }

    return edad;
  }

  onFechaNacimientoChange(event: any) {
    const fecha = event.target.value;
    if (fecha) {
      const edad = this.calcularEdad(fecha);
      this.aseguradoForm.get('edad')?.setValue(edad, { emitEvent: false });
      
      if (edad > 0 && this.aseguradoForm.get('seleccionarSeguros')?.value) {
        this.cargarSegurosPorEdad(edad);
      }
    } else {
      this.segurosDisponibles = [];
    }
  }

  // Método para REGISTRO NUEVO - Solo seguros en rango
  cargarSegurosPorEdad(edad: number) {
    this.cargandoSeguros = true;

    this.seguroService.ConsultarSegurosPorEdad(edad).subscribe({
      next: (response) => {
        this.segurosDisponibles = response?.datos?.seguros ?? [];
        this.cargandoSeguros = false;

        if (this.segurosDisponibles.length === 0) {
          this.alertService.info(
            'Sin seguros disponibles',
            `No hay seguros disponibles para la edad ${edad} años.`
          );
        }
      },
      error: (error) => {
        this.segurosDisponibles = [];
        this.cargandoSeguros = false;
        console.error('Error al cargar seguros:', error);
      }
    });
  }

  // Método especial para ACTUALIZACIÓN - Incluye seguros fuera de rango que ya tiene
  cargarSegurosParaActualizacion(edad: number, segurosActuales: number[]) {
    this.cargandoSeguros = true;

    // Cargar seguros disponibles para la edad actual
    this.seguroService.ConsultarSegurosPorEdad(edad).subscribe({
      next: (response) => {
        const segurosDisponiblesEdad = response?.datos?.seguros ?? [];
        const idsDisponibles = segurosDisponiblesEdad.map((s: SeguroModel) => s.idSeguro);
        
        // Identificar seguros que tiene el asegurado pero que están fuera de rango
        const segurosActualesIds = segurosActuales.filter(id => !idsDisponibles.includes(id));
        
        if (segurosActualesIds.length > 0) {
          // Cargar la información completa de esos seguros
          this.cargarSegurosEspecificos(segurosActualesIds, segurosDisponiblesEdad);
        } else {
          this.segurosDisponibles = segurosDisponiblesEdad;
          this.cargandoSeguros = false;
        }
      },
      error: (error) => {
        this.segurosDisponibles = [];
        this.cargandoSeguros = false;
        console.error('Error al cargar seguros:', error);
      }
    });
  }

  // Cargar información de seguros específicos (los que están fuera de rango pero ya los tiene)
  cargarSegurosEspecificos(idsSegurosFueraRango: number[], segurosEnRango: SeguroModel[]) {
    // Cargar todos los seguros para obtener los que están fuera de rango
    this.seguroService.ConsultarSeguros({ 
      paginaActual: 1, 
      tamanioPagina: 1000,
      termino: '' 
    }).subscribe({
      next: (response) => {
        const todosSeguros = response?.datos?.seguros ?? [];
        
        // Filtrar solo los seguros que el asegurado tiene pero están fuera de rango
        const segurosFueraRango = todosSeguros.filter((s: SeguroModel) => 
          idsSegurosFueraRango.includes(s.idSeguro)
        );
        
        // Marcar los seguros fuera de rango con una propiedad especial
        segurosFueraRango.forEach((s: any) => {
          s.fueraDeRango = true;
        });
        
        // Combinar seguros en rango + seguros fuera de rango
        this.segurosDisponibles = [...segurosEnRango, ...segurosFueraRango];
        
        this.cargandoSeguros = false;
        
        if (segurosFueraRango.length > 0) {
          this.alertService.warning(
            'Seguros fuera de rango',
            `El asegurado tiene ${segurosFueraRango.length} seguro(s) que están fuera del rango de edad actual. Puede mantenerlos o quitarlos.`
          );
        }
      },
      error: (error) => {
        // Si falla, al menos mostrar los seguros en rango
        this.segurosDisponibles = segurosEnRango;
        this.cargandoSeguros = false;
        console.error('Error al cargar seguros específicos:', error);
      }
    });
  }

  cargarSeguros() {
    const edad = this.aseguradoForm.get('edad')?.value;
    
    if (edad && edad > 0) {
      this.cargarSegurosPorEdad(edad);
    } else {
      this.cargandoSeguros = true;
      this.seguroService.ConsultarSeguros(this.filtros).subscribe({
        next: (response) => {
          this.segurosDisponibles = response?.datos?.seguros ?? [];
          this.cargandoSeguros = false;
        },
        error: () => {
          this.segurosDisponibles = [];
          this.cargandoSeguros = false;
        }
      });
    }
  }

  toggleSeguro(idSeguro: number) {
    const seguros: number[] = this.aseguradoForm.get('seguros')?.value || [];
    const index = seguros.indexOf(idSeguro);

    if (index > -1) {
      seguros.splice(index, 1);
    } else {
      seguros.push(idSeguro);
    }

    this.aseguradoForm.get('seguros')?.setValue(seguros);
    this.aseguradoForm.get('seguros')?.markAsTouched();
  }

  isSeguroSeleccionado(id: number): boolean {
    const seguros = this.aseguradoForm.get('seguros')?.value || [];
    return seguros.includes(id);
  }

  open(initialAsegurado?: AseguradoModel) {
    if (initialAsegurado) {
      this.aseguradoUpdt = initialAsegurado;
      this.ngOnChanges();
      this.aseguradoForm.get('cedula')?.disable({ emitEvent: false });
    } else {
      this.aseguradoUpdt = null;
      this.setEmptyForm();
      this.segurosSeleccionados = [];
      this.aseguradoForm.get('cedula')?.enable({ emitEvent: false });
    }

    this.modalDialog?.nativeElement.showModal();
  }

  closeModal() {
    this.modalDialog.nativeElement.close();
    this.aseguradoUpdt = null;
    this.segurosSeleccionados = [];
    this.segurosDisponibles = [];
    this.setEmptyForm();
  }

  onSubmit() {
    const seleccionarSeguros = this.aseguradoForm.get('seleccionarSeguros')?.value;
    const seguros = this.aseguradoForm.get('seguros')?.value || [];

    if (seleccionarSeguros && seguros.length === 0) {
      this.aseguradoForm.get('seguros')?.markAsTouched();
      this.aseguradoForm.get('seguros')?.setErrors({ required: true });
    }

    if (!this.aseguradoForm.valid) {
      Object.keys(this.aseguradoForm.controls).forEach(k => {
        this.aseguradoForm.get(k)?.markAsTouched();
      });
      return;
    }

    if (this.aseguradoUpdt) this.ActualizarAsegurado();
    else this.RegistrarAsegurado();
  }

  RegistrarAsegurado() {
    const form = this.aseguradoForm.getRawValue();

    const asegurado: AseguradoModel = {
      idAsegurado: 0,
      nombre: form.nombre,
      cedula: form.cedula,
      telefono: form.telefono,
      fechaNacimiento: form.fechaNacimiento,
      eliminado: false,
      seguros: form.seleccionarSeguros ? form.seguros : [],
      usuarioGestor: this.usuarioGestor
    };

    this.aseguradoService.RegistrarAsegurado(asegurado).subscribe({
      next: () => {
        this.closeModal();
        this.submitEvent.emit(true);
      },
      error: (error) => {
        console.error('Error al registrar asegurado:', error);
        const mensaje = error?.error?.mensaje || 'No se pudo registrar al asegurado';
        this.submitEvent.emit(false);
        this.alertService.error('Error', mensaje);
      }
    });
  }

  ActualizarAsegurado() {
    const form = this.aseguradoForm.getRawValue();

    const asegurado: AseguradoModel = {
      idAsegurado: this.aseguradoUpdt!.idAsegurado,
      nombre: form.nombre,
      cedula: form.cedula,
      telefono: form.telefono,
      fechaNacimiento: form.fechaNacimiento,
      eliminado: this.aseguradoUpdt!.eliminado || false,
      seguros: form.seleccionarSeguros ? form.seguros : [],
      usuarioGestor: this.usuarioGestor
    };

    this.aseguradoService.ActualizarAsegurado(asegurado).subscribe({
      next: () => {
        this.closeModal();
        this.submitEvent.emit(true);
      },
      error: (error) => {
        console.error('Error al actualizar asegurado:', error);
        const mensaje = error?.error?.mensaje || 'No se pudo actualizar al asegurado';
        this.submitEvent.emit(false);
        this.alertService.error('Error', mensaje);
      }
    });
  }

  obtenerSeguros() {
    this.aseguradoService.obtenerSeguros(this.filtros, this.aseguradoUpdt!.idAsegurado).subscribe({
      next: (res: any) => {
        if (res.datos.asegurado.length) {
          const datosAsegurado = res.datos.asegurado[0];
          
          this.aseguradoForm.patchValue({
            nombre: datosAsegurado.nombre,
            cedula: datosAsegurado.cedula,
            telefono: datosAsegurado.telefono,
            fechaNacimiento: datosAsegurado.fechaNacimiento
          });
          
          // Calcular y establecer edad
          const edadCalc = this.calcularEdad(datosAsegurado.fechaNacimiento);
          this.aseguradoForm.get('edad')?.setValue(edadCalc, { emitEvent: false });
          
          // Obtener IDs de seguros que ya tiene el asegurado
          this.segurosSeleccionados = res.datos.asegurado.map((s: any) =>
            typeof s === 'object' ? s.idSeguro : s
          );
          
          // ⚠️ CLAVE: Usar método especial que incluye seguros fuera de rango
          if (edadCalc > 0) {
            this.cargarSegurosParaActualizacion(edadCalc, this.segurosSeleccionados);
          } else {
            this.segurosDisponibles = [];
          }
          
          if (this.segurosSeleccionados.length > 0) {
            this.aseguradoForm.get('seleccionarSeguros')?.setValue(true);
            
            setTimeout(() => {
              this.aseguradoForm.get('seguros')?.setValue(this.segurosSeleccionados);
              this.aseguradoForm.get('seguros')?.updateValueAndValidity();
              this.aseguradoForm.updateValueAndValidity();
            }, 100);
          } else {
            this.aseguradoForm.patchValue({
              seleccionarSeguros: false,
              seguros: []
            });
            this.aseguradoForm.updateValueAndValidity();
          }
        } else {
          this.aseguradoForm.patchValue({
            nombre: this.aseguradoUpdt!.nombre,
            cedula: this.aseguradoUpdt!.cedula,
            telefono: this.aseguradoUpdt!.telefono,
            fechaNacimiento: this.aseguradoUpdt!.fechaNacimiento,
            seleccionarSeguros: false,
            seguros: []
          });
          
          const edadCalc = this.calcularEdad(this.aseguradoUpdt!.fechaNacimiento);
          this.aseguradoForm.get('edad')?.setValue(edadCalc, { emitEvent: false });
          
          if (edadCalc > 0) {
            this.cargarSegurosPorEdad(edadCalc);
          }
          
          this.aseguradoForm.updateValueAndValidity();
        }
      },
      error: (error) => {
        console.error('Error al obtener seguros:', error);
        this.submitEvent.emit(false);
      }
    });
  }

  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) event.preventDefault();
  }

  onlyLetters(event: KeyboardEvent) {
    const char = event.key;
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;

    if (!regex.test(char) && event.key !== 'Backspace') {
      event.preventDefault();
    }
  }

  onKeyDown(event: KeyboardEvent) { }
}