import { Module } from '@nestjs/common';
import { GcloudWatcher } from './gcloud.watcher';
import { WatchersService } from './watchers.service';
import { ServersModule } from '../servers/servers.module';

@Module({
  imports: [ServersModule],
  providers: [WatchersService, GcloudWatcher],
  exports: [GcloudWatcher],
})
export class WatchersModule {}
