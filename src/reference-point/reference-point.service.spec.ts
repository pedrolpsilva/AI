import { Test, TestingModule } from '@nestjs/testing';
import { ReferencePointService } from './reference-point.service';

describe('ReferencePointService', () => {
  let service: ReferencePointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReferencePointService],
    }).compile();

    service = module.get<ReferencePointService>(ReferencePointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
