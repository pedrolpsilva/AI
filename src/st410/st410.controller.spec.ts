import { Test, TestingModule } from '@nestjs/testing';
import { St410Controller } from './st410.controller';

describe('St410Controller', () => {
  let controller: St410Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [St410Controller],
    }).compile();

    controller = module.get<St410Controller>(St410Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
