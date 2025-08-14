import { Test, TestingModule } from '@nestjs/testing';
import { RestrictAreaService } from './restrict-area.service';

describe('ReferencePointService', () => {
  let service: RestrictAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestrictAreaService],
    }).compile();

    service = module.get<RestrictAreaService>(RestrictAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
