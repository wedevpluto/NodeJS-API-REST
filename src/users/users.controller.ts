import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)

@Controller('users')
export class UsersController {

    constructor(
        private usersService: UsersService
    ) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.usersService.findById(Number(id));
    }

    @Post()
    create(@Body() body: CreateUserDto) {
        return this.usersService.create(body);
    }

}