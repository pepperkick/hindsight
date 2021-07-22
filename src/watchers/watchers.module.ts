import { Module } from '@nestjs/common';
import { GcloudWatcher } from './gcloud.watcher';
import { WatchersService } from './watchers.service';
import { ServersModule } from '../servers/servers.module';
import { DigitalOceanWatcher } from './digitalocean.watcher';
import { AzureWatcher } from './azure.watcher';

@Module({
  imports: [ServersModule],
  providers: [
    WatchersService,
    GcloudWatcher,
    DigitalOceanWatcher,
    AzureWatcher,
  ],
  exports: [GcloudWatcher, DigitalOceanWatcher, AzureWatcher],
})
export class WatchersModule {}
