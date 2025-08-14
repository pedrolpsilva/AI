import { Module } from '@nestjs/common';
import { St410Controller } from './st410.controller';
import { St410Service } from './st410.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [St410Controller],
  providers: [St410Service, AuthService]
})
export class St410Module {}
