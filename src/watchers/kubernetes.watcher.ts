import { Injectable, Logger } from '@nestjs/common';
import { createApiClient } from 'dots-wrapper';
import { ServersService } from 'servers/servers.service';
import { Provider } from 'providers/provider.model';
import { WatchersService } from './watchers.service';
import { IDroplet } from 'dots-wrapper/dist/modules/droplet';
import * as config from '../../config.json';
import * as ApiClient from 'kubernetes-client';
import {
  ApiRoot,
  ApisAppsV1NamespacesNameDeployments,
} from 'kubernetes-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { KubeConfig } = require('kubernetes-client');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Request = require('kubernetes-client/backends/request');
const kubes = {};

@Injectable()
export class KubernetesWatcher {
  private readonly logger = new Logger(KubernetesWatcher.name);
  kube: ApiRoot;
  namespace: string;

  constructor(
    private readonly serversService: ServersService,
    private readonly watchersService: WatchersService,
  ) {}

  async watch(provider: Provider): Promise<void> {
    this.logger.debug('Watching Kubernetes resources...');

    const kubeconfig = new KubeConfig();
    kubeconfig.loadFromString(provider.metadata.kubeConfig);
    const backend = new Request({ kubeconfig });
    this.kube = new ApiClient.Client1_13({ backend, version: '1.13' });
    this.namespace = provider.metadata.kubeNamespace;

    const list = await this.kube.apis.app.v1
      .namespaces(this.namespace)
      .deployments.get();
    await this.watchResources('Instances', list);
  }

  async watchResources(type: string, items: any) {
    if (items.length === 0) {
      this.logger.log(`No ${type} resource is allocated`);
    }

    for (const item of items.body.items) {
      const { name } = item.metadata;
      this.logger.log(`Allocated ${type}, Name: ${name}`);

      // Example of name: qixalite-60b4536ffc91d9001ad85b86
      const [label, serverId] = name.split('-');
      if (label !== config.label) {
        continue;
      }

      // Check if the lighthouse server is open
      // If the server is not open then resources are assumed to be orphaned
      if (!(await this.serversService.isOpenById(serverId))) {
        try {
          await this.removeResource(type, serverId, name);
        } catch (error) {
          this.logger.error(error);
          await this.watchersService.printOrphanReport(
            'Kubernetes',
            type,
            item.name,
            serverId,
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

  async removeResource(type: string, serverId: string, name: string) {
    this.logger.debug(`Removing Kuberentes ${type} resource...`);

    await this.kube.apis.app.v1
      .namespaces(this.namespace)
      .deployments(name)
      .delete();

    await this.watchersService.printDeletionReport(
      'Kubernetes',
      type,
      name,
      serverId,
      serverId,
    );
  }
}
