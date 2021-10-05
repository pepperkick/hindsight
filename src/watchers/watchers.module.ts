import { Module } from '@nestjs/common';
import { GcloudWatcher } from './gcloud.watcher';
import { WatchersService } from './watchers.service';
import { ServersModule } from '../servers/servers.module';
import { DigitalOceanWatcher } from './digitalocean.watcher';
import { AzureWatcher } from './azure.watcher';
import { LinodeWatcher } from './linode.watcher';

@Module({
  imports: [ServersModule],
  providers: [
    WatchersService,
    GcloudWatcher,
    DigitalOceanWatcher,
    AzureWatcher,
    LinodeWatcher
  ],
  exports: [GcloudWatcher, DigitalOceanWatcher, AzureWatcher, LinodeWatcher],
})
export class WatchersModule {}
