import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async start(): Promise<void> {
    this.logger.log('Hello World!');
  }
}
