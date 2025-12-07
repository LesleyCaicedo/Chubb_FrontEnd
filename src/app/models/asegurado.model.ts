export interface AseguradoModel {
  idAsegurado: number;
  nombre: string;
  cedula: string;
  telefono: string;
  fechaNacimiento: Date;
  seguros: number[] | null; 
  eliminado: boolean;
  usuarioGestor: string;
}
