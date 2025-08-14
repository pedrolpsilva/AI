import { Test, TestingModule } from '@nestjs/testing';
import { Gv75Service } from './gv75.service';

describe('Gv75Service', () => {
  let service: Gv75Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Gv75Service],
    }).compile();

    service = module.get<Gv75Service>(Gv75Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
