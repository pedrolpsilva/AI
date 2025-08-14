import { Module } from '@nestjs/common';
import { SuntechService } from './suntech.service';
import { SuntechController } from './suntech.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [SuntechController],
  providers: [SuntechService, AuthService]
})
export class SuntechModule {}
