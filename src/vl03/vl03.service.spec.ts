import { Test, TestingModule } from '@nestjs/testing';
import { Vl03Service } from './vl03.service';

describe('Vl03Service', () => {
  let service: Vl03Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Vl03Service],
    }).compile();

    service = module.get<Vl03Service>(Vl03Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
