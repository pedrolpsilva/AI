import { Test, TestingModule } from '@nestjs/testing';
import { GrcadService } from './grcad.service';

describe('GrcadService', () => {
  let service: GrcadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrcadService],
    }).compile();

    service = module.get<GrcadService>(GrcadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
