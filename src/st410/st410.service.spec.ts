import { Test, TestingModule } from '@nestjs/testing';
import { St410Service } from './st410.service';

describe('St410Service', () => {
  let service: St410Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [St410Service],
    }).compile();

    service = module.get<St410Service>(St410Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
