import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { ConfigModule } from '@nestjs/config';
import { TruckService } from 'src/truck/truck.service';

@Module({
  imports: [ConfigModule],
  providers: [GeminiService, TruckService],
  controllers: [GeminiController]
})
export class GeminiModule {}
