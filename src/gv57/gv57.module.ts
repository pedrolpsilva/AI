import { Module } from '@nestjs/common';
import { Gv57Service } from './gv57.service';
import { Gv57Controller } from './gv57.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  providers: [Gv57Service, AuthService],
  controllers: [Gv57Controller]
})
export class Gv57Module {}
