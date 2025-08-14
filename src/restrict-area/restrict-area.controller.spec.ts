import { Test, TestingModule } from '@nestjs/testing';
import { RestrictAreaController } from './restrict-area.controller';

describe('RestrictAreaController', () => {
  let controller: RestrictAreaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestrictAreaController],
    }).compile();

    controller = module.get<RestrictAreaController>(RestrictAreaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
