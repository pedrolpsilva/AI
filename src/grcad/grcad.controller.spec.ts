import { Test, TestingModule } from '@nestjs/testing';
import { GrcadController } from './grcad.controller';

describe('GrcadController', () => {
  let controller: GrcadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrcadController],
    }).compile();

    controller = module.get<GrcadController>(GrcadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
