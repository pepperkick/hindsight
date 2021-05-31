import { Module } from '@nestjs/common';
import { GcloudWatcher } from './gcloud.watcher';
import { WatchersService } from './watchers.service';
import { ServersModule } from '../servers/servers.module';
import { DigitalOceanWatcher } from './digitalocean.watcher';

@Module({
  imports: [ServersModule],
  providers: [WatchersService, GcloudWatcher, DigitalOceanWatcher],
  exports: [GcloudWatcher, DigitalOceanWatcher],
})
export class WatchersModule {}
