import { Injectable, Logger } from '@nestjs/common';
import { ServersService } from '../servers/servers.service';
import { WatchersService } from './watchers.service';
import * as moment from 'moment';
import * as config from '../../config.json';

@Injectable()
export class LongRunningWatcher {
  private readonly logger = new Logger(LongRunningWatcher.name);

  constructor(
    private readonly serversService: ServersService,
    private readonly watchersService: WatchersService,
  ) {}

  async watch(): Promise<void> {
    if (!config.monitorLongRunningInstances.enabled) return;

    this.logger.debug('Monitoring Long Running resources...');

    // Get all running lighthouse instances
    const servers = await this.serversService.getLongRunningServers(
      config.monitorLongRunningInstances.threshold,
    );

    for (const server of servers) {
      await this.watchersService.printLongRunningReport(
        server.provider,
        server.game,
        server._id,
        this.convertRunTimeFormat(
          moment(Date.now()).diff(server.createdAt, 'milliseconds'),
        ),
      );
    }
  }

  convertRunTimeFormat(ms: number) {
    // Conversion of millisecond of time into hours, minutes and seconds format
    let seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    seconds = Math.floor(seconds % 3600);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${hours} Hour(s) ${minutes} Minute(s) ${seconds} Second(s)`;
  }
}
