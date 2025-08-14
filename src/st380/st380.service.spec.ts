import { Test, TestingModule } from '@nestjs/testing';
import { St380Service } from './st380.service';

describe('St380Service', () => {
  let service: St380Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [St380Service],
    }).compile();

    service = module.get<St380Service>(St380Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
