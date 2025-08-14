import { Test, TestingModule } from '@nestjs/testing';
import { Gv57Controller } from './gv57.controller';

describe('Gv57Controller', () => {
  let controller: Gv57Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Gv57Controller],
    }).compile();

    controller = module.get<Gv57Controller>(Gv57Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
