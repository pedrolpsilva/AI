import { Test, TestingModule } from '@nestjs/testing';
import { Gv75Controller } from './gv75.controller';

describe('Gv75Controller', () => {
  let controller: Gv75Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Gv75Controller],
    }).compile();

    controller = module.get<Gv75Controller>(Gv75Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
