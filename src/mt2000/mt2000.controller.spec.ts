import { Test, TestingModule } from '@nestjs/testing';
import { Mt2000Controller } from './mt2000.controller';

describe('Mt2000Controller', () => {
  let controller: Mt2000Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Mt2000Controller],
    }).compile();

    controller = module.get<Mt2000Controller>(Mt2000Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
