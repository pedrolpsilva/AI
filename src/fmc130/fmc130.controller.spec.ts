import { Test, TestingModule } from '@nestjs/testing';
import { Fmc130Controller } from './fmc130.controller';

describe('Fmc130Controller', () => {
  let controller: Fmc130Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Fmc130Controller],
    }).compile();

    controller = module.get<Fmc130Controller>(Fmc130Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
