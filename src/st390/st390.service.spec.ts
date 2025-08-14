import { Test, TestingModule } from '@nestjs/testing';
import { St390Service } from './st390.service';

describe('St390Service', () => {
  let service: St390Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [St390Service],
    }).compile();

    service = module.get<St390Service>(St390Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
