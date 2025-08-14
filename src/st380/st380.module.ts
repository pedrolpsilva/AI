import { Module } from '@nestjs/common';
import { St380Controller } from './st380.controller';
import { St380Service } from './st380.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [St380Controller],
  providers: [St380Service, AuthService]
})
export class St380Module {}
