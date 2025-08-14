import { Test, TestingModule } from '@nestjs/testing';
import { St380Controller } from './st380.controller';

describe('St380Controller', () => {
  let controller: St380Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [St380Controller],
    }).compile();

    controller = module.get<St380Controller>(St380Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
