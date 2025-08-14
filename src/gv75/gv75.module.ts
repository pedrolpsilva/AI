import { Module } from '@nestjs/common';
import { Gv75Service } from './gv75.service';
import { Gv75Controller } from './gv75.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  providers: [Gv75Service, AuthService],
  controllers: [Gv75Controller]
})
export class Gv75Module {}
