import { Test, TestingModule } from '@nestjs/testing';
import { SuntechController } from './st8310.controller';

describe('SuntechController', () => {
  let controller: SuntechController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuntechController],
    }).compile();

    controller = module.get<SuntechController>(SuntechController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
