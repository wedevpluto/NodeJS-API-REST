import { Arqueo } from './arqueo.entity';

export const ARQUEO_REPOSITORY = Symbol('ARQUEO_REPOSITORY');

export interface ArqueoRepository {
  save(arqueo: Arqueo): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: number): Promise<any | null>;
  findUltimo(): Promise<any | null>;
}