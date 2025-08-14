import { Module } from '@nestjs/common';
import { Fmc130Controller } from './fmc130.controller';
import { Fmc130Service } from './fmc130.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [Fmc130Controller],
  providers: [Fmc130Service, AuthService]
})
export class Fmc130Module {}
