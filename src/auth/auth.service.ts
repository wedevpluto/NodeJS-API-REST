import { Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(

    private usersService: UsersService,

    private jwtService: JwtService

  ) {}

  async register(dto: RegisterDto) {

    const hash = await bcrypt.hash(dto.password,10);

    return this.usersService.create({

      email: dto.email,

      password: hash,

      name: dto.name

    });

  }

  async login(dto: LoginDto) {

    const user = await this.usersService.findByEmail(dto.email);

    if(!user)
      throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(dto.password,user.password);

    if(!valid)
      throw new Error("Invalid credentials");

    return {

      access_token:

        this.jwtService.sign({

          sub: user.id,

          email: user.email

        })

    };

  }

}