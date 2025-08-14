import { Test, TestingModule } from '@nestjs/testing';
import { Mt2000Service } from './mt2000.service';

describe('Mt2000Service', () => {
  let service: Mt2000Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Mt2000Service],
    }).compile();

    service = module.get<Mt2000Service>(Mt2000Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
