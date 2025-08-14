import { Module } from '@nestjs/common';
import { Vl02Controller } from './vl02.controller';
import { Vl02Service } from './vl02.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [Vl02Controller],
  providers: [Vl02Service, AuthService]
})
export class Vl02Module {}
