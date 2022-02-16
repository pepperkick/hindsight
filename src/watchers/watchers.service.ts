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

    if (!config.discordWebhook) return;

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

  async printDeletionReport(
    provider: string,
    type: string,
    name: string,
    id: string | number,
    lid: string | number,
  ) {
    const logger = new Logger('DeletedResources');

    logger.log(`
    =========== DELETED RESOURCE ===========
    PROVIDER: ${provider}
    TYPE:     ${type}
    NAME:     ${name}
    ID:       ${id}
    LID:      ${lid}
    ========================================
    `);

    if (!config.discordWebhook) return;

    const hook = new Webhook(config.discordWebhook);
    hook.setUsername('Hindsight');
    const embed = new MessageBuilder()
      .setTitle('Deleted Resource')
      .setAuthor('Hindsight')
      .addField('Resource ID', `${id}`, true)
      .addField('Resource Name', `${name}`, true)
      .addField('Lighthouse ID', `${lid}`, true)
      .addField('Resource Type', type, true)
      .addField('Provider', provider, true)
      .setColor(0x4caf50)
      .setTimestamp();

    await hook.send(embed);
    logger.debug(`Sent discord webhook`);
  }

  async printLongRunningReport(
    provider: string,
    game: string,
    lid: string | number,
    runtime: string,
  ) {
    const logger = new Logger('LongRunningResources');

    logger.warn(`
    =========== LONG RUNNING RESOURCE ===========
    PROVIDER: ${provider}
    GAME:     ${game}
    LID:      ${lid}
    RUNNING:  ${runtime}
    =============================================
    `);

    if (!config.discordWebhook) return;

    const hook = new Webhook(config.discordWebhook);
    hook.setUsername('Hindsight');
    const embed = new MessageBuilder()
      .setTitle('Long Running Resource')
      .setAuthor('Hindsight')
      .addField('Lighthouse ID', `${lid}`, true)
      .addField('Game', `${game}`, true)
      .addField('Provider', provider, true)
      .addField('Running Time', runtime, true)
      .setColor(0xffff00)
      .setTimestamp();

    await hook.send(embed);
    logger.debug(`Sent discord webhook`);
  }
}
