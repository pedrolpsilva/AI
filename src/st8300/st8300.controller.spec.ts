import { Test, TestingModule } from '@nestjs/testing';
import { St8300Controller } from './st8300.controller';

describe('SuntechController', () => {
  let controller: St8300Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [St8300Controller],
    }).compile();

    controller = module.get<St8300Controller>(St8300Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
