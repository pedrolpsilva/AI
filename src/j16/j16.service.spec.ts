import { Test, TestingModule } from '@nestjs/testing';
import { J16Service } from './j16.service';

describe('J16Service', () => {
  let service: J16Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [J16Service],
    }).compile();

    service = module.get<J16Service>(J16Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
