import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Provider, ProviderSchema } from './provider.model';
import { GcloudWatcher } from './watchers/gcloud.watcher';
import { ProviderService } from './provider.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Provider.name, schema: ProviderSchema },
    ]),
  ],
  controllers: [],
  providers: [ProviderService, GcloudWatcher],
  exports: [ProviderService, GcloudWatcher],
})
export class ProviderModule {}
