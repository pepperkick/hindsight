import { Injectable, Logger } from '@nestjs/common';
import { ProviderType } from './providers/provider.model';
import { ProviderService } from './providers/provider.service';
import { GcloudWatcher } from './watchers/gcloud.watcher';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private gcloudWatched = false;

  constructor(
    private readonly provider: ProviderService,
    private readonly gcloudWatcher: GcloudWatcher,
  ) {}

  async start(): Promise<void> {
    this.logger.log('Starting...');

    // Read all providers from DB
    const providers = await this.provider.fetchAll();

    // Loop through each provider
    for (const provider of providers) {
      this.logger.debug(`Watching provider ${provider._id}...`);

      switch (provider.type) {
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
        default:
          this.logger.warn(
            `Skipping ${provider._id} as provider type ${provider.type} is not supported`,
          );
      }
    }
  }
}
