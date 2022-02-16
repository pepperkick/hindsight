import { Module } from '@nestjs/common';
import { GcloudWatcher } from './gcloud.watcher';
import { WatchersService } from './watchers.service';
import { ServersModule } from '../servers/servers.module';
import { DigitalOceanWatcher } from './digitalocean.watcher';
import { AzureWatcher } from './azure.watcher';
import { BinarylaneWatcher } from './binarylane.watcher';
import { LinodeWatcher } from './linode.watcher';
import { KubernetesWatcher } from './kubernetes.watcher';
import { LongRunningWatcher } from './longrunning.watcher';

@Module({
  imports: [ServersModule],
  providers: [
    WatchersService,
    GcloudWatcher,
    DigitalOceanWatcher,
    AzureWatcher,
    BinarylaneWatcher,
    LinodeWatcher,
    KubernetesWatcher,
    LongRunningWatcher,
  ],
  exports: [
    GcloudWatcher,
    DigitalOceanWatcher,
    AzureWatcher,
    BinarylaneWatcher,
    LinodeWatcher,
    KubernetesWatcher,
    LongRunningWatcher,
  ],
})
export class WatchersModule {}
