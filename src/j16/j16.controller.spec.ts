import { Test, TestingModule } from '@nestjs/testing';
import { J16Controller } from './j16.controller';

describe('J16Controller', () => {
  let controller: J16Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [J16Controller],
    }).compile();

    controller = module.get<J16Controller>(J16Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
