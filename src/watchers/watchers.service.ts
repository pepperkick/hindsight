import { Injectable, Logger } from '@nestjs/common';
import { MessageBuilder, Webhook } from 'discord-webhook-node';
import * as config from '../../config.json';

@Injectable()
export class WatchersService {
  async printOrphanReport(
    provider: string,
    type: string,
    name: string,
    id: string | number,
    lid: string | number,
  ) {
    const logger = new Logger('OrphanResources');

    logger.error(`
    =========== ORPHAN RESOURCE ===========
    PROVIDER: ${provider}
    TYPE:     ${type}
    NAME:     ${name}
    ID:       ${id}
    LID:      ${lid}
    =======================================
    `);

    const hook = new Webhook(config.discordWebhook);
    hook.setUsername('Hindsight');
    const embed = new MessageBuilder()
      .setTitle('Orphan Resource')
      .setAuthor('Hindsight')
      .addField('Resource ID', `${id}`, true)
      .addField('Resource Name', `${name}`, true)
      .addField('Lighthouse ID', `${lid}`, true)
      .addField('Resource Type', type, true)
      .addField('Provider', provider, true)
      .setColor(16711680)
      .setTimestamp();

    await hook.send(embed);
    logger.debug(`Sent discord webhook`);
  }
}
