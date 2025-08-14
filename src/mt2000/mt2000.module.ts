import { Module } from '@nestjs/common';
import { Mt2000Service } from './mt2000.service';
import { Mt2000Controller } from './mt2000.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [Mt2000Controller],
  providers: [Mt2000Service, AuthService]
})
export class Mt2000Module {}
