import { Test, TestingModule } from '@nestjs/testing';
import { Vl01Controller } from './vl01.controller';

describe('Vl01Controller', () => {
  let controller: Vl01Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Vl01Controller],
    }).compile();

    controller = module.get<Vl01Controller>(Vl01Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
