import { Test, TestingModule } from '@nestjs/testing';
import { St390Controller } from './st390.controller';

describe('St390Controller', () => {
  let controller: St390Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [St390Controller],
    }).compile();

    controller = module.get<St390Controller>(St390Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
