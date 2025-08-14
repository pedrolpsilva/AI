import { Test, TestingModule } from '@nestjs/testing';
import { SuntechService } from './suntech.service';

describe('SuntechService', () => {
  let service: SuntechService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuntechService],
    }).compile();

    service = module.get<SuntechService>(SuntechService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
