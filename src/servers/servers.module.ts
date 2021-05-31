import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Server, ServerSchema } from './server.model';
import { ServersService } from './servers.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
  ],
  providers: [ServersService],
  exports: [ServersService],
})
export class ServersModule {}
