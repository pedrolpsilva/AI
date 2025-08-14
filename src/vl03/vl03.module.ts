import { Module } from '@nestjs/common';
import { Vl03Controller } from './vl03.controller';
import { Vl03Service } from './vl03.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [Vl03Controller],
  providers: [Vl03Service, AuthService]
})
export class Vl03Module {}
