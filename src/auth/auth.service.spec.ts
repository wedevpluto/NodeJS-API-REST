import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById:    jest.fn(),
    create:      jest.fn(),
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
        { provide: UsersService,  useValue: mockUsersService  },
        { provide: JwtService,    useValue: mockJwtService    },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ─── register ────────────────────────────────────────────
  describe('register', () => {
    const dto = { email: 'test@test.com', password: '123456', name: 'Juan' };

    it('deberia registrar un usuario correctamente', async () => {
      mockUsersService.create.mockResolvedValue({ id: 1, ...dto, role: 'MOZO' });
      const result = await service.register(dto);
      expect(result).toHaveProperty('id', 1);
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it('deberia hashear la password antes de crear el usuario', async () => {
      mockUsersService.create.mockResolvedValue({ id: 1, ...dto, role: 'MOZO' });
      await service.register(dto);
      const llamada = mockUsersService.create.mock.calls[0][0];
      expect(llamada.password).not.toBe(dto.password);
      const esHash = await bcrypt.compare(dto.password, llamada.password);
      expect(esHash).toBe(true);
    });
  });

  // ─── login ───────────────────────────────────────────────
  describe('login', () => {
    it('deberia retornar tokens si las credenciales son correctas', async () => {
      const user = {
        id: 1,
        email: 'test@test.com',
        password: await bcrypt.hash('123456', 10),
        role: 'ADMIN',
      };
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
      const user = {
        id: 1,
        email: 'test@test.com',
        password: await bcrypt.hash('correcta', 10),
        role: 'ADMIN',
      };
      mockUsersService.findByEmail.mockResolvedValue(user);
      await expect(service.login({ email: 'test@test.com', password: 'incorrecta' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── refresh ─────────────────────────────────────────────
  describe('refresh', () => {
    it('deberia retornar nuevos tokens con usuario valido', async () => {
      const fullUser = { id: 1, email: 'test@test.com', role: 'ADMIN' };
      mockUsersService.findById.mockResolvedValue(fullUser);

      const result = await service.refresh({ userId: 1, email: 'test@test.com', role: 'ADMIN' });
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('deberia lanzar UnauthorizedException si el usuario no existe', async () => {
      mockUsersService.findById.mockResolvedValue(null);
      await expect(service.refresh({ userId: 999, email: 'x@x.com', role: 'MOZO' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});