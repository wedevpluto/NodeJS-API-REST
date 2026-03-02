import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({ access_token: 'token', refresh_token: 'refresh' }),
    register: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com' }),
    refresh: jest.fn().mockResolvedValue({ access_token: 'token', refresh_token: 'refresh' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('login deberia retornar tokens', async () => {
    const result = await controller.login({ email: 'test@test.com', password: '123456' });
    expect(result).toHaveProperty('access_token');
  });
});