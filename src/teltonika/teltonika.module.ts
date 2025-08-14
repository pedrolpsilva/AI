import { Module } from '@nestjs/common';
import { TeltonikaService } from './teltonika.service';
import { TeltonikaController } from './teltonika.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  providers: [TeltonikaService, AuthService],
  controllers: [TeltonikaController]
})
export class TeltonikaModule {}
