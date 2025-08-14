import { Test, TestingModule } from '@nestjs/testing';
import { St8300Service } from './st8300.service';

describe('St8300Service', () => {
  let service: St8300Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [St8300Service],
    }).compile();

    service = module.get<St8300Service>(St8300Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
