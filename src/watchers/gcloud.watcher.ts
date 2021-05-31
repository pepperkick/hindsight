import { Injectable, Logger } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { Provider } from 'providers/provider.model';
import { ServersService } from 'servers/servers.service';
import { WatchersService } from './watchers.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Compute = require('@google-cloud/compute');

@Injectable()
export class GcloudWatcher {
  private readonly logger = new Logger(GcloudWatcher.name);
  provider: any;
  compute: any;
  config: any;
  project: string;

  constructor(
    private readonly serversService: ServersService,
    private readonly watchersService: WatchersService,
  ) {}

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

    await this.watchResources('Virtual Machines', await this.compute.getVMs());
    await this.watchResources(
      'External IPs',
      await this.compute.getAddresses(),
    );
  }

  async watchResources(type: string, [items]: any) {
    if (items.length === 0) {
      this.logger.log(`No ${type} resource is allocated`);
    }

    for (const item of items) {
      this.logger.log(`Allocated ${type}, Name: ${item.id}`);
      const { id } = item;
      const serverId = id.split('-')[1];

      // Check if the lighthouse server is open
      // If the server is not open then resources are assumed to be orphaned
      if (!(await this.serversService.isOpenById(serverId))) {
        // TODO: Notify orphan resource via discord webhook
        this.watchersService.printOrphanReport('Gcloud', type, serverId, id);
      } else {
        this.logger.debug(
          `Resource ${item.id} (${type}) is allocated by ${serverId}`,
        );
      }

      // TODO: Check for how long the resources are allocated for
    }
  }
}
