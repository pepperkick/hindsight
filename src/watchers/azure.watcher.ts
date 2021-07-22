import { Injectable, Logger } from '@nestjs/common';
import { ServersService } from '../servers/servers.service';
import { WatchersService } from './watchers.service';
import { Provider } from '../providers/provider.model';
import {
  ComputeManagementClient,
  ComputeManagementModels,
  ComputeManagementMappers,
} from '@azure/arm-compute';
import * as msRestNodeAuth from '@azure/ms-rest-nodeauth';
import { IDroplet } from 'dots-wrapper/dist/modules/droplet';

@Injectable()
export class AzureWatcher {
  private readonly logger = new Logger(AzureWatcher.name);

  constructor(
    private readonly serversService: ServersService,
    private readonly watchersService: WatchersService,
  ) {}

  async watch(provider: Provider): Promise<void> {
    this.logger.debug('Watching Azure resources...');

    const auth = await msRestNodeAuth.loginWithUsernamePasswordWithAuthResponse(
      provider.metadata.azureUsername,
      provider.metadata.azurePassword,
    );
    const client = new ComputeManagementClient(
      auth.credentials,
      provider.metadata.azureSubscriptionId,
    );
    const list = await client.virtualMachines.listAll();
    await this.watchResources('Virtual Machines', list);
  }

  async watchResources(
    type: string,
    items: ComputeManagementModels.VirtualMachinesListAllResponse,
  ) {
    if (items.length === 0) {
      this.logger.log(`No ${type} resource is allocated`);
    }

    for (const item of items) {
      this.logger.log(`Allocated ${type}, Name: ${item.name} (${item.id})`);
      const { id, name } = item;

      // Example of name: lighthouse-60b4536ffc91d9001ad85b86
      const serverId = name.split('-')[1];
      // TODO: Check if first part is lighthouse

      // Check if the lighthouse server is open
      // If the server is not open then resources are assumed to be orphaned
      if (!(await this.serversService.isOpenById(serverId))) {
        await this.watchersService.printOrphanReport(
          'Azure',
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

      // TODO: Check for how long the resources are allocated for
    }
  }
}
