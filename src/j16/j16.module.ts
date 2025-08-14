import { Module } from '@nestjs/common';
import { J16Controller } from './j16.controller';
import { J16Service } from './j16.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [J16Controller],
  providers: [J16Service, AuthService]
})
export class J16Module {}
