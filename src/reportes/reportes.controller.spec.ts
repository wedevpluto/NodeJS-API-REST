import { Test, TestingModule } from '@nestjs/testing';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

describe('ReportesController', () => {
  let controller: ReportesController;

  const mockReportesService = {
    ventasDiarias:          jest.fn().mockResolvedValue({ totalGeneral: 5000 }),
    ventasPorMozo:          jest.fn().mockResolvedValue({ mozos: [] }),
    ventasPorMetodoPago:    jest.fn().mockResolvedValue({ metodos: [] }),
    articulosMasVendidos:   jest.fn().mockResolvedValue({ ranking: [] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesController],
      providers: [{ provide: ReportesService, useValue: mockReportesService }],
    }).compile();

    controller = module.get<ReportesController>(ReportesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('ventasDiarias deberia llamar al service con la fecha', async () => {
    await controller.ventasDiarias('2026-03-04');
    expect(mockReportesService.ventasDiarias).toHaveBeenCalledWith('2026-03-04');
  });

  it('ventasDiarias deberia usar fecha de hoy si no se provee', async () => {
    await controller.ventasDiarias(undefined);
    expect(mockReportesService.ventasDiarias).toHaveBeenCalledWith(
      new Date().toISOString().split('T')[0]
    );
  });

  it('ventasPorMozo deberia llamar al service con desde y hasta', async () => {
    await controller.ventasPorMozo('2026-03-01', '2026-03-04');
    expect(mockReportesService.ventasPorMozo).toHaveBeenCalledWith('2026-03-01', '2026-03-04');
  });

  it('ventasPorMetodoPago deberia llamar al service con desde y hasta', async () => {
    await controller.ventasPorMetodoPago('2026-03-01', '2026-03-04');
    expect(mockReportesService.ventasPorMetodoPago).toHaveBeenCalledWith('2026-03-01', '2026-03-04');
  });

  it('articulosMasVendidos deberia llamar al service con los parametros', async () => {
    await controller.articulosMasVendidos('2026-03-01', '2026-03-04', 5);
    expect(mockReportesService.articulosMasVendidos).toHaveBeenCalledWith('2026-03-01', '2026-03-04', 5);
  });
});