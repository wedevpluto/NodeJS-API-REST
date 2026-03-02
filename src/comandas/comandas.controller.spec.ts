import { Test, TestingModule } from '@nestjs/testing';
import { ComandasController } from './comandas.controller';

describe('ComandasController', () => {
  let controller: ComandasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComandasController],
    }).compile();

    controller = module.get<ComandasController>(ComandasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
