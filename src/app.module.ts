import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProviderModule } from './providers/provider.module';
import { WatchersModule } from './watchers/watchers.module';
import * as config from '../config.json';

@Module({
  imports: [
    MongooseModule.forRoot(config.lighthouseMongodbUri),
    ProviderModule,
    WatchersModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
