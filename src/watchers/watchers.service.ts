import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WatchersService {
  printOrphanReport(
    provider: string,
    type: string,
    id: string,
    name: string | number,
  ) {
    const logger = new Logger('OrphanResources');

    logger.error(`
    =========== ORPHAN RESOURCE ===========
    PROVIDER: ${provider}
    TYPE:     ${type}
    NAME:     ${name}
    ID:       ${id}
    =======================================
    `);
  }
}
