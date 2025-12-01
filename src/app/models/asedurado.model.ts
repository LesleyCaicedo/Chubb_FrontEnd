export interface AseguradoModel {
  idAsegurado: number;
  nombre: string;
  cedula: string;
  telefono: string;
  edad: number;
  fechaNacimiento: string;
  seguros: number[] | null; 
  eliminado: boolean;
}
