import { Test, TestingModule } from '@nestjs/testing';
import { Vl03Controller } from './vl03.controller';

describe('Vl03Controller', () => {
  let controller: Vl03Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Vl03Controller],
    }).compile();

    controller = module.get<Vl03Controller>(Vl03Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
