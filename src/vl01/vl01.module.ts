import { Module } from '@nestjs/common';
import { Vl01Controller } from './vl01.controller';
import { Vl01Service } from './vl01.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [Vl01Controller],
  providers: [Vl01Service, AuthService]
})
export class Vl01Module {}
