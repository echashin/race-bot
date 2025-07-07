import { Controller, Get } from '@nestjs/common';
import { CoreService } from './services/core.service';

@Controller()
export class AppController {
  constructor(private readonly coreService: CoreService) {}

  @Get()
  async index(): Promise<string> {
    //await this.coreService.sync();
    return 'race-bot';
  }
}
