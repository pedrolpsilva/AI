import { Test, TestingModule } from '@nestjs/testing';
import { St8310Service } from './st8310.service';

describe('St8310Service', () => {
  let service: St8310Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [St8310Service],
    }).compile();

    service = module.get<St8310Service>(St8310Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
