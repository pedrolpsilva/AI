import { Test, TestingModule } from '@nestjs/testing';
import { TeltonikaController } from './teltonika.controller';

describe('TeltonikaController', () => {
  let controller: TeltonikaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeltonikaController],
    }).compile();

    controller = module.get<TeltonikaController>(TeltonikaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
