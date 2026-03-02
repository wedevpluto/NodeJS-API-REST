import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('deberia retornar tokens si las credenciales son correctas', async () => {
      const user = { id: 1, email: 'test@test.com', password: await bcrypt.hash('123456', 10), role: 'ADMIN' };
      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.login({ email: 'test@test.com', password: '123456' });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('deberia lanzar UnauthorizedException si el usuario no existe', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'noexiste@test.com', password: '123456' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('deberia lanzar UnauthorizedException si la password es incorrecta', async () => {
      const user = { id: 1, email: 'test@test.com', password: await bcrypt.hash('correcta', 10), role: 'ADMIN' };
      mockUsersService.findByEmail.mockResolvedValue(user);

      await expect(service.login({ email: 'test@test.com', password: 'incorrecta' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});