import { Injectable, Logger } from '@nestjs/common';
import { GcloudWatcher } from './providers/watchers/gcloud.watcher';
import { Model } from 'mongoose';
import { Provider, ProviderType } from './providers/provider.model';
import { InjectModel } from '@nestjs/mongoose';
import { ProviderService } from './providers/provider.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly provider: ProviderService,
    private readonly gcp: GcloudWatcher,
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
          await this.gcp.watch(provider);
          break;
        default:
          this.logger.warn(
            `Skipping ${provider._id} as provider type ${provider.type} is not supported`,
          );
      }
    }
  }
}
