import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ProviderModule } from './providers/provider.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as config from '../config.json';

@Module({
  imports: [
    MongooseModule.forRoot(config.lighthouseMongodbUri),
    ProviderModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
