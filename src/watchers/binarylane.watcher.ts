import { Injectable, Logger } from '@nestjs/common';
import { Provider } from '../providers/provider.model';
import { ServersService } from 'servers/servers.service';
import { WatchersService } from './watchers.service';
import axios from 'axios';
import * as config from '../../config.json';

@Injectable()
export class BinarylaneWatcher {
  private readonly logger = new Logger(BinarylaneWatcher.name);

  constructor(
    private readonly serversService: ServersService,
    private readonly watchersService: WatchersService,
  ) {}

  async watch(provider: Provider): Promise<void> {
    this.logger.debug('Watching Binarylane resources...');

    //Retrieving json data and filtering the builder instances
    const request = await this.getRequest(provider);
    const list = await this.filterRequest(request.data.servers);

    await this.watchResources('Instances', list);
  }

  async watchResources(type: string, items: any) {
    if (items.length === 0) {
      this.logger.log(`No ${type} resource is allocated`);
    }

    for (const item of items) {
      this.logger.log(`Allocated ${type}, Name: ${item.name} (${item.id})`);
      const { id, name } = item;

      // Example of name: 61583b5d8c379b001ab62bec.qixalite.lighthouse.com
      const serverId = name.split('.')[0];
      // Label check is already done in filterRequest function

      // Check if the lighthouse server is open
      // If the server is not open then resources are assumed to be oprhaned
      if (!(await this.serversService.isOpenById(serverId))) {
        await this.watchersService.printOrphanReport(
          'Binarylane',
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

  async getRequest(provider: Provider) {
    const config = {
      url: 'https://api.binarylane.com.au/v2/servers',
      headers: {
        Authorization: 'Bearer ' + provider.metadata.binarylaneApiKey,
      },
    };
    return await axios(config);
  }

  async filterRequest(items: any) {
    const list = [];
    const pattern = /^[a-zA-z0-9]{24}$/g;
    for (const item of items) {
      // Example of name:             61583b5d8c379b001ab62bec.qixalite.lighthouse.com
      // Example of builder's name:   image-builder-tf2-comp.syd.lighthouse.qixalite.com
      const name = item.name.split('.');

      // Check if the name attribute is of a builder instances
      // Also check via regex for the correct lighthouse instances
      if (name[0] === 'image-builder-tf2-comp') continue;
      if (pattern.test(name[0]) && name[1] === config.label) list.push(item);
    }
    return list;
  }
}
