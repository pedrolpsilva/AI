import { Test, TestingModule } from '@nestjs/testing';
import { Vl02Controller } from './vl02.controller';

describe('Vl02Controller', () => {
  let controller: Vl02Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Vl02Controller],
    }).compile();

    controller = module.get<Vl02Controller>(Vl02Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
