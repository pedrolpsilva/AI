import { Module } from '@nestjs/common';
import { St390Service } from './st390.service';
import { St390Controller } from './st390.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  providers: [St390Service, AuthService],
  controllers: [St390Controller]
})
export class St390Module {}
