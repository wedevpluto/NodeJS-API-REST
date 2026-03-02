import { Test, TestingModule } from '@nestjs/testing';
import { ArqueosController } from './arqueos.controller';

describe('ArqueosController', () => {
  let controller: ArqueosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArqueosController],
    }).compile();

    controller = module.get<ArqueosController>(ArqueosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
