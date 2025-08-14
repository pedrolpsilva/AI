import { Test, TestingModule } from '@nestjs/testing';
import { Vl02Service } from './vl02.service';

describe('Vl02Service', () => {
  let service: Vl02Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Vl02Service],
    }).compile();

    service = module.get<Vl02Service>(Vl02Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
