import { Test, TestingModule } from '@nestjs/testing';
import { AnchorController } from './anchor.controller';

describe('AnchorController', () => {
  let controller: AnchorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnchorController],
    }).compile();

    controller = module.get<AnchorController>(AnchorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
