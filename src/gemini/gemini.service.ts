import { Injectable, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Para acessar variáveis de ambiente
import axios, { AxiosInstance, AxiosError } from 'axios'; // Importe AxiosInstance e AxiosError para tipagem

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly geminiApi: AxiosInstance;

  constructor(private configService: ConfigService) {
  }
}