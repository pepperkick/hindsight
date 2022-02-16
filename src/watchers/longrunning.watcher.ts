import { Injectable, Logger } from '@nestjs/common';
import { ServersService } from '../servers/servers.service';
import { WatchersService } from './watchers.service';
import * as config from '../../config.json';
import { Server } from 'servers/server.model';

@Injectable()
export class LongRunningWatcher {
  private readonly logger = new Logger(LongRunningWatcher.name);

  constructor(
    private readonly serversService: ServersService,
    private readonly watchersService: WatchersService,
  ) {}

  async watch(): Promise<void> {
    this.logger.debug('Monitoring Long Running resources...');

    // Get all running lighthouse instances
    const servers = await this.serversService.getAllRunning();
    await this.watchResources(servers);
  }

  async watchResources(servers: Array<Server>) {
    for (const server of servers) {
      // Check if server is running for a long period of time specified
      const currentTime = new Date();
      const createTime = new Date(server.createdAt);
      const timeDiff = Math.floor(currentTime.valueOf() - createTime.valueOf());

      // Check if time difference exceeds the specified run time limit
      if (timeDiff > parseInt(config.longRunningLimit) * 60000) {
        await this.watchersService.printLongRunningReport(
          server.provider,
          server.game,
          server._id,
          await this.convertRunTimeFormat(timeDiff),
        );
      }
    }
  }

  async convertRunTimeFormat(ms: number) {
    // Conversion of millisecond of time into hours, minutes and seconds format
    let seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    seconds = Math.floor(seconds % 3600);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${hours} Hour(s) ${minutes} Minute(s) ${seconds} Second(s)`;
  }
}
