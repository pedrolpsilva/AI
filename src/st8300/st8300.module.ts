import { Module } from '@nestjs/common';
import { St8300Service } from './st8300.service';
import { St8300Controller } from './st8300.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [St8300Controller],
  providers: [St8300Service, AuthService]
})
export class St8300Module {}
