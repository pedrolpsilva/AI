import { Module } from '@nestjs/common';
import { GrcadController } from './grcad.controller';
import { GrcadService } from './grcad.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [GrcadController],
  providers: [GrcadService, AuthService]
})
export class GrcadModule {}
