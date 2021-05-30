import { Injectable, Logger } from '@nestjs/common';
import { Provider } from '../provider.model';
import { writeFileSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Compute = require('@google-cloud/compute');

@Injectable()
export class GcloudWatcher {
  private readonly logger = new Logger(GcloudWatcher.name);
  provider: any;
  compute: any;
  config: any;
  project: string;

  async watch(provider: Provider): Promise<void> {
    this.logger.debug('Watching Gcloud resources...');

    this.provider = provider;
    this.config = JSON.parse(provider.metadata.gcpConfig);
    this.project = this.config.project_id;

    writeFileSync(
      `./gcloud-${provider.id}-${this.project}.key.json`,
      JSON.stringify(this.config),
    );

    this.compute = new Compute({
      projectId: this.project,
      keyFilename: `./gcloud-${provider.id}-${this.project}.key.json`,
    });
    this.compute.zone(provider.metadata.gcpZone);
    this.compute.region(provider.metadata.gcpRegion);

    await this.watchVMs();
    await this.watchIPs();
  }

  async watchVMs() {
    const [items] = await this.compute.getVMs();

    if (items.length === 0) {
      this.logger.log('No VMs running');
    }

    for (const item of items) {
      this.logger.debug(`Instance Name: ${item.id}`);
    }
  }

  async watchIPs() {
    const [items] = await this.compute.getAddresses();

    if (items.length === 0) {
      this.logger.log('No IPs open');
    }

    for (const item of items) {
      this.logger.debug(`IPs Name: ${item.id}`);
    }
  }
}
