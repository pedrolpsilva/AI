import { Module } from '@nestjs/common';
import { St8310Service } from './st8310.service';
import { St8310Controller } from './st8310.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [St8310Controller],
  providers: [St8310Service, AuthService]
})
export class St8310Module {}
