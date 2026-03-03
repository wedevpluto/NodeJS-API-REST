import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn().mockResolvedValue({ access_token: 'token', refresh_token: 'refresh' }),
    login:    jest.fn().mockResolvedValue({ access_token: 'token', refresh_token: 'refresh' }),
    refresh:  jest.fn().mockResolvedValue({ access_token: 'token', refresh_token: 'refresh' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('register deberia llamar al service con el dto', async () => {
    const dto = { email: 'test@test.com', password: '123456', name: 'Juan' };
    await controller.register(dto as any);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('login deberia llamar al service con el dto', async () => {
    const dto = { email: 'test@test.com', password: '123456' };
    await controller.login(dto as any);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });

  it('refresh deberia llamar al service con el user del request', async () => {
    const req = { user: { id: 1, email: 'test@test.com', role: 'ADMIN' } };
    await controller.refresh(req);
    expect(mockAuthService.refresh).toHaveBeenCalledWith(req.user);
  });

  it('register deberia retornar access_token y refresh_token', async () => {
    const dto = { email: 'test@test.com', password: '123456', name: 'Juan' };
    const result = await controller.register(dto as any);
    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('refresh_token');
  });

  it('login deberia retornar access_token y refresh_token', async () => {
    const dto = { email: 'test@test.com', password: '123456' };
    const result = await controller.login(dto as any);
    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('refresh_token');
  });
});