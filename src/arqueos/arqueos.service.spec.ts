import { Test, TestingModule } from '@nestjs/testing';
import { ArqueosService } from './application/arqueos.service';
import { ARQUEO_REPOSITORY } from './domain/arqueo.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateArqueoDto } from './dto/create-arqueo.dto';

describe('ArqueosService', () => {
  let service: ArqueosService;

  const mockRepository = {
    findAll:    jest.fn(),
    findById:   jest.fn(),
    findUltimo: jest.fn(),
    save:       jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArqueosService,
        { provide: ARQUEO_REPOSITORY, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ArqueosService>(ArqueosService);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('findAll', () => {
    it('deberia retornar todos los arqueos', async () => {
      const arqueos = [{ id: 1 }, { id: 2 }];
      mockRepository.findAll.mockResolvedValue(arqueos);
      const result = await service.findAll();
      expect(result).toEqual(arqueos);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('deberia retornar un arqueo existente', async () => {
      const arqueo = { id: 1, totalGeneral: 50000 };
      mockRepository.findById.mockResolvedValue(arqueo);
      const result = await service.findById(1);
      expect(result).toEqual(arqueo);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUltimo', () => {
    it('deberia retornar el ultimo arqueo', async () => {
      const arqueo = { id: 5, totalGeneral: 80000 };
      mockRepository.findUltimo.mockResolvedValue(arqueo);
      const result = await service.findUltimo();
      expect(result).toEqual(arqueo);
    });

    it('deberia retornar null si no hay arqueos', async () => {
      mockRepository.findUltimo.mockResolvedValue(null);
      const result = await service.findUltimo();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const dto: CreateArqueoDto = {
      cajeroId:               1,
      billetes1000:           5,
      billetes2000:           3,
      billetes5000:           2,
      billetes10000:          1,
      totalEfectivo:          21000,
      totalDebito:            8000,
      totalCredito:           5000,
      totalTransferencia:     3000,
      totalQr:                2000,
      totalPedidosYaCtaCte:   1500,
      totalPedidosYaEfectivo: 1000,
      totalRappiCtaCte:       800,
      totalRappiEfectivo:     500,
    };

    it('deberia calcular correctamente totalGeneral', async () => {
      mockRepository.save.mockResolvedValue({ id: 1, totalGeneral: 42800 });
      const result = await service.create(dto);
      expect(result.totalGeneral).toBe(42800);
    });

    it('deberia calcular correctamente la diferencia', async () => {
      mockRepository.save.mockResolvedValue({ id: 1, diferencia: 10000 });
      const result = await service.create(dto);
      expect(result.diferencia).toBe(10000);
    });

    it('deberia usar 0 cuando un metodo no se provee', async () => {
      const dtoMinimo: CreateArqueoDto = { cajeroId: 1, totalEfectivo: 5000 };
      mockRepository.save.mockResolvedValue({ id: 1, totalGeneral: 5000, totalDebito: 0, totalCredito: 0 });
      const result = await service.create(dtoMinimo);
      expect(result.totalGeneral).toBe(5000);
    });
  });
});