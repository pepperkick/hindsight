import { Injectable, Logger } from '@nestjs/common';
import { ProviderType } from './providers/provider.model';
import { ProviderService } from './providers/provider.service';
import { GcloudWatcher } from './watchers/gcloud.watcher';
import { DigitalOceanWatcher } from './watchers/digitalocean.watcher';
import { AzureWatcher } from './watchers/azure.watcher';
import { BinarylaneWatcher } from 'watchers/binarylane.watcher';
import { LinodeWatcher } from 'watchers/linode.watcher';
import { KubernetesWatcher } from './watchers/kubernetes.watcher';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private kubeWatched = false;
  private gcloudWatched = false;
  private digitalOceanWatched = false;
  private azureWatched = false;
  private binarylaneWatched = false;
  private linodeWatched = false;

  constructor(
    private readonly kubernetesWatcher: KubernetesWatcher,
    private readonly provider: ProviderService,
    private readonly gcloudWatcher: GcloudWatcher,
    private readonly digitalOceanWatcher: DigitalOceanWatcher,
    private readonly azureWatcher: AzureWatcher,
    private readonly binarylaneWatcher: BinarylaneWatcher,
    private readonly linodeWatcher: LinodeWatcher,
  ) {}

  async start(): Promise<void> {
    this.logger.log('Starting...');

    // Read all providers from DB
    const providers = await this.provider.fetchAll();

    // Loop through each provider
    for (const provider of providers) {
      this.logger.debug(`Watching provider ${provider._id}...`);

      // TODO: Support multiple accounts
      switch (provider.type) {
        case ProviderType.KubernetesNode:
          if (this.kubeWatched) {
            this.logger.log(
              `Skipped ${provider._id} as Kubernetes has been already watched.`,
            );
            continue;
          }

          try {
            await this.kubernetesWatcher.watch(provider);
            this.kubeWatched = true;
          } catch (error) {
            // TODO: Notify failure via discord webhook
            this.logger.error(
              `Failed to read Kubernetes resources`,
              error.stack,
            );
          }
          break;
        case ProviderType.GCloud:
          // Skip watching the same provider again cause one service account returns all info
          if (this.gcloudWatched) {
            this.logger.log(
              `Skipped ${provider._id} as Gcloud has been already watched.`,
            );
            continue;
          }

          try {
            await this.gcloudWatcher.watch(provider);
            this.gcloudWatched = true;
          } catch (error) {
            // TODO: Notify failure via discord webhook
            this.logger.error(`Failed to read Gcloud resources`, error.stack);
          }
          break;
        case ProviderType.DigitalOcean:
          // Skip watching the same provider again cause one service account returns all info
          if (this.digitalOceanWatched) {
            this.logger.log(
              `Skipped ${provider._id} as DigitalOcean has been already watched.`,
            );
            continue;
          }

          try {
            await this.digitalOceanWatcher.watch(provider);
            this.digitalOceanWatched = true;
          } catch (error) {
            // TODO: Notify failure via discord webhook
            this.logger.error(
              `Failed to read DigitalOcean resources`,
              error.stack,
            );
          }
          break;
        case ProviderType.Azure:
          // Skip watching the same provider again cause one service account returns all info
          if (this.azureWatched) {
            this.logger.log(
              `Skipped ${provider._id} as Azure has been already watched.`,
            );
            continue;
          }

          try {
            await this.azureWatcher.watch(provider);
            this.azureWatched = true;
          } catch (error) {
            // TODO: Notify failure via discord webhook
            this.logger.error(`Failed to read Azure resources`, error.stack);
          }
          break;

        case ProviderType.BinaryLane:
          // Skip watching the same provider again cause one service account returns all info
          if (this.binarylaneWatched) {
            this.logger.log(
              `Skipped ${provider._id} as Binarylane has been already watched.`,
            );
            continue;
          }

          try {
            await this.binarylaneWatcher.watch(provider);
            this.binarylaneWatched = true;
          } catch (error) {
            // TODO: Notify failure via discord webhook
            this.logger.error(
              `Failed to read Binarylane resources`,
              error.stack,
            );
          }
          break;

        case ProviderType.Linode:
          // Skip watching the same provider again cause one service account returns all info
          if (this.linodeWatched) {
            this.logger.log(
              `Skipped ${provider._id} as Linode has been already watched.`,
            );
            continue;
          }

          try {
            await this.linodeWatcher.watch(provider);
            this.linodeWatched = true;
          } catch (error) {
            // TODO: Notify failure via discord webhook
            this.logger.error(`Failed to read Linode resources`, error.stack);
          }
          break;

        default:
          this.logger.warn(
            `Skipping ${provider._id} as provider type ${provider.type} is not supported`,
          );
      }
    }
  }
}
