import { Injectable, Logger } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { Provider } from 'providers/provider.model';
import { ServersService } from 'servers/servers.service';
import { WatchersService } from './watchers.service';
import * as config from '../../config.json';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Compute = require('@google-cloud/compute');

@Injectable()
export class GcloudWatcher {
  private readonly logger = new Logger(GcloudWatcher.name);
  compute: any;
  config: any;
  project: string;
  resourceMap: {
    [key: string]: {
      ip: any;
      vm: any;
    };
  } = {};

  constructor(
    private readonly serversService: ServersService,
    private readonly watchersService: WatchersService,
  ) {}

  async watch(provider: Provider): Promise<void> {
    this.logger.debug('Watching Gcloud resources...');

    this.config = JSON.parse(provider.metadata.gcpConfig);
    this.project = this.config.project_id;

    writeFileSync(
      `./gcloud-${provider._id}-${this.project}.key.json`,
      JSON.stringify(this.config),
    );

    this.compute = new Compute({
      projectId: this.project,
      keyFilename: `./gcloud-${provider._id}-${this.project}.key.json`,
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

      // Example of id: qixalite-60b4536ffc91d9001ad85b86
      const [label, serverId] = id.split('-');
      if (label !== config.label) {
        continue;
      }

      // Check if the lighthouse server is open
      // If the server is not open then resources are assumed to be orphaned
      if (!(await this.serversService.isOpenById(serverId))) {
        try {
          await this.removeResource(type, id, serverId, item);
        } catch (error) {
          this.logger.error(error);
          await this.watchersService.printOrphanReport(
            'Gcloud',
            type,
            item.id,
            id,
            serverId,
          );
        }
      } else {
        this.logger.debug(
          `Resource ${item.id} (${type}) is allocated by ${serverId}`,
        );
      }
    }
  }

  async removeResource(type: string, id: string, serverId: string, item: any) {
    this.logger.debug(`Removing Gcloud ${type} resource...`);

    if (!this.resourceMap[id])
      this.resourceMap[id] = {
        ip: undefined,
        vm: undefined,
      };

    if (type === 'External IPs') {
      this.resourceMap[id].ip = item;
    } else if (type === 'Virtual Machines') {
      this.resourceMap[id].vm = item;
    }

    if (this.resourceMap[id].ip && this.resourceMap[id].vm) {
      const vm = this.resourceMap[id].vm;
      const ip = this.resourceMap[id].ip;

      // Delete the vm
      this.logger.debug(`Removing VM...`);
      await vm.delete();
      this.logger.debug(`Waiting for VM to remove...`);
      await vm.waitFor('TERMINATED', {
        timeout: 600,
      });

      // Delete the ip
      this.logger.debug(`Removing IP...`);
      await ip.delete();

      await this.watchersService.printDeletionReport(
        'Gcloud',
        'Virtual Machines',
        item.id,
        id,
        serverId,
      );
    } else if (this.resourceMap[id].ip) {
      const ip = this.resourceMap[id].ip;

      // Delete the ip
      this.logger.debug(`Removing IP...`);
      await ip.delete();

      await this.watchersService.printDeletionReport(
        'Gcloud',
        'External IPs',
        item.id,
        id,
        serverId,
      );
    }
  }
}
