import { Test, TestingModule } from '@nestjs/testing';
import { TeltonikaService } from './teltonika.service';

describe('TeltonikaService', () => {
  let service: TeltonikaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeltonikaService],
    }).compile();

    service = module.get<TeltonikaService>(TeltonikaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
