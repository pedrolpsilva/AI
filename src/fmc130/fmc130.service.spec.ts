import { Test, TestingModule } from '@nestjs/testing';
import { Fmc130Service } from './fmc130.service';

describe('Fmc130Service', () => {
  let service: Fmc130Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Fmc130Service],
    }).compile();

    service = module.get<Fmc130Service>(Fmc130Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
