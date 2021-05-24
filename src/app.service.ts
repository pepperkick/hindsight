import { Injectable, Logger } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Compute = require('@google-cloud/compute');

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async start(): Promise<void> {
    this.logger.log('Starting...');
    await this.checkGoogleCloud();
  }

  async checkGoogleCloud(): Promise<void> {
    this.logger.log('Reading from GCP...');

    const compute = new Compute();
    const [vms] = await compute.getVMs();

    for (const vm of vms) {
      this.logger.log(`Instance Name: ${vm.id}`);
    }
  }
}
