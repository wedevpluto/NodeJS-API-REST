import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll:  jest.fn().mockResolvedValue({ data: [], meta: {} }),
    findById: jest.fn().mockResolvedValue({ id: 1 }),
    create:   jest.fn().mockResolvedValue({ id: 1 }),
    update:   jest.fn().mockResolvedValue({ id: 1 }),
    delete:   jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('findAll deberia llamar al service con pagination', async () => {
    const pagination = { page: 1, limit: 10 };
    await controller.findAll(pagination as any);
    expect(mockUsersService.findAll).toHaveBeenCalledWith(pagination);
  });

  it('findById deberia llamar al service con el id', async () => {
    await controller.findById('1');
    expect(mockUsersService.findById).toHaveBeenCalledWith(1);
  });

  it('create deberia llamar al service con el dto', async () => {
    const dto = { email: 'test@test.com', password: 'pass123', name: 'Juan', role: Role.MOZO };
    await controller.create(dto as any);
    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
  });

  it('update deberia llamar al service con id y dto', async () => {
    const dto = { name: 'Carlos' };
    await controller.update('1', dto as any);
    expect(mockUsersService.update).toHaveBeenCalledWith(1, dto);
  });

  it('delete deberia llamar al service con el id', async () => {
    await controller.delete('1');
    expect(mockUsersService.delete).toHaveBeenCalledWith(1);
  });
});