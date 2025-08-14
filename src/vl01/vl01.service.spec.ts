import { Test, TestingModule } from '@nestjs/testing';
import { Vl01Service } from './vl01.service';

describe('Vl01Service', () => {
  let service: Vl01Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Vl01Service],
    }).compile();

    service = module.get<Vl01Service>(Vl01Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
