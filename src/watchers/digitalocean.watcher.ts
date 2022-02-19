import { Injectable, Logger } from '@nestjs/common';
import { createApiClient } from 'dots-wrapper';
import { ServersService } from 'servers/servers.service';
import { Provider } from 'providers/provider.model';
import { WatchersService } from './watchers.service';
import { IDroplet } from 'dots-wrapper/dist/modules/droplet';
import * as config from '../../config.json';

@Injectable()
export class DigitalOceanWatcher {
  private readonly logger = new Logger(DigitalOceanWatcher.name);

  constructor(
    private readonly serversService: ServersService,
    private readonly watchersService: WatchersService,
  ) {}

  async watch(provider: Provider): Promise<void> {
    this.logger.debug('Watching DigitalOcean resources...');

    const client = createApiClient({
      token: provider.metadata.digitalOceanToken,
    });
    const {
      data: { droplets },
    } = await client.droplet.listDroplets({});

    await this.watchResources('Instances', droplets);
  }

  async watchResources(type: string, items: IDroplet[]) {
    if (items.length === 0) {
      this.logger.log(`No ${type} resource is allocated`);
    }

    for (const item of items) {
      this.logger.log(`Allocated ${type}, Name: ${item.name} (${item.id})`);
      const { id, name } = item;

      // Example of name: qixalite-60b4536ffc91d9001ad85b86
      const [label, serverId] = name.split('-');
      if (label !== config.label) {
        continue;
      }

      // Check if the lighthouse server is open
      // If the server is not open then resources are assumed to be orphaned
      if (!(await this.serversService.isOpenById(serverId))) {
        await this.watchersService.printOrphanReport(
          'DigitalOcean',
          type,
          item.name,
          id,
          serverId,
        );
      } else {
        this.logger.debug(
          `Resource ${item.id} (${type}) is allocated by ${serverId}`,
        );
      }
    }
  }
}
