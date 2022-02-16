import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Server } from './server.model';
import { Model } from 'mongoose';
import { ServerStatus } from '../objects/server-status.enum';

@Injectable()
export class ServersService {
  constructor(
    @InjectModel(Server.name) private readonly repository: Model<Server>,
  ) {}

  async getById(id: string): Promise<Server> {
    return this.repository.findById(id);
  }

  async isOpenById(id: string): Promise<boolean> {
    const server = await this.getById(id);
    return this.isOpen(server);
  }

  isOpen(server: Server): boolean {
    return ![ServerStatus.FAILED, ServerStatus.CLOSED].includes(server.status);
  }

  async getAllRunning(): Promise<Array<Server>> {
    const servers = await this.repository.find();
    const running = [];
    for (const server of servers) {
      if (this.isRunning(server)) running.push(server);
      else continue;
    }
    return running;
  }

  isRunning(server: Server): boolean {
    return [ServerStatus.RUNNING].includes(server.status);
  }
}
