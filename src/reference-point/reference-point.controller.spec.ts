import { Test, TestingModule } from '@nestjs/testing';
import { ReferencePointController } from './reference-point.controller';

describe('ReferencePointController', () => {
  let controller: ReferencePointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferencePointController],
    }).compile();

    controller = module.get<ReferencePointController>(ReferencePointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
