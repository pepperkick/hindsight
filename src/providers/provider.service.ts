import { InjectModel } from '@nestjs/mongoose';
import { Provider } from './provider.model';
import { Model } from 'mongoose';

export class ProviderService {
  constructor(
    @InjectModel(Provider.name) private readonly repository: Model<Provider>,
  ) {}

  async fetchAll(): Promise<Provider[]> {
    return this.repository.find();
  }
}
