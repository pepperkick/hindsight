import { Injectable, Logger } from "@nestjs/common";
import { ServersService } from '../servers/servers.service';
import { WatchersService } from './watchers.service';
import { Provider } from '../providers/provider.model';
import Linodev4 from 'linode-v4';

@Injectable()
export class LinodeWatcher{
    private readonly logger = new Logger(LinodeWatcher.name);

    constructor(
        private readonly serversService: ServersService,
        private readonly watchersService: WatchersService,
    ) {}

    async watch(provider: Provider): Promise<void>{
        this.logger.debug('Watching Linode resources...');

        const server = new Linodev4(
            provider.metadata.linodeApiKey
        );

        const list = await server.linodes.instances.list();
        await this.watchResources('Instances', list.data)
    }   

    async watchResources(
        type: string,
        items: any
    ){
       if(items.length === 0){
           this.logger.log(`No ${type} resource is allocated`);
       }

       for(const item of items){
            this.logger.log(`Allocated ${type}, Name: ${item.tags[1]} (${item.id})`);
            const { id, tags } = item;

            // Example of name: lighthouse-60b4536ffc91d9001ad85b86
            const serverId = tags[1].split('-')[1];
            // TODO: Check if first part is lighthouse

            // Check if the lighthouse server is open
            // If the server is not open then resources are assumed to be orphaned
            if(!(await this.serversService.isOpenById(serverId))) {
                await this.watchersService.printOrphanReport(
                    'Linode',
                    type,
                    item.tags[1],
                    id,
                    serverId
              );
            }else{
                this.logger.debug(
                  `Resource ${item.id} (${type}) is allocated by ${serverId}`,
                );
            }

            // TODO: Check for how long the resources are allocated for
       }
    }

}