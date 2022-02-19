import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Server } from './server.model';
import { Model } from 'mongoose';
import { ServerStatus } from '../objects/server-status.enum';
import * as moment from 'moment';

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

  /**
   * Return servers that are open more than threshold
   *
   * @param threshold Minutes
   */
  async getLongRunningServers(threshold: number): Promise<Server[]> {
    const runningServers = await this.getAllRunning();
    return runningServers.filter((server) =>
      moment(server.createdAt).add(threshold, 'minutes').isBefore(),
    );
  }

  async getAllRunning(): Promise<Server[]> {
    return this.repository.find({
      status: ServerStatus.RUNNING,
    });
  }
}
