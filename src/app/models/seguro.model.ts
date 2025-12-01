export interface SeguroModel {
  idSeguro: number;
  nombre: string;
  codigo: string;
  sumaAsegurada: number;
  prima: number;
  edadMin: number | null;
  edadMax: number | null;
  eliminado: boolean;
}
