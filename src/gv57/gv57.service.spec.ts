import { Test, TestingModule } from '@nestjs/testing';
import { Gv57Service } from './gv57.service';

describe('Gv57Service', () => {
  let service: Gv57Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Gv57Service],
    }).compile();

    service = module.get<Gv57Service>(Gv57Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
