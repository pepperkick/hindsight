import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ProviderType {
  KubernetesNode = 'KUBERNETES_NODE',
  GCloud = 'GCLOUD',
  Azure = 'AZURE',
  DigitalOcean = 'DIGITAL_OCEAN',
  Vultr = 'VULTR',
  BinaryLane = 'BINARYLANE',
  Linode = 'LINODE',
}

@Schema()
export class Provider extends Document {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true, type: String })
  type: ProviderType;

  @Prop({ required: true, type: Number })
  limit: number;

  @Prop({ required: true, type: String })
  region: string;

  @Prop({ required: true, type: Number })
  priority: number;

  @Prop({ type: Object })
  metadata: {
    // Common
    image?: string;
    hidden?: boolean;
    autoClose?: {
      time: number;
      min: number;
    };

    // Kubernetes
    kubeConfig?: string;
    kubePorts?: { min: number; max: number };
    kubeIp?: string;
    kubeHostname?: string;
    kubeNamespace?: string;

    // Google Cloud
    gcpConfig?: string;
    gcpRegion?: string;
    gcpZone?: string;
    gcpVmImage?: string;
    gcpMachineType?: string;

    // Azure
    azureTenantId?: string;
    azureUsername?: string;
    azurePassword?: string;
    azureClientId?: string;
    azureSubscriptionId?: string;
    azureLocation?: string;
    azureImage?: string;
    azureRootPassword?: string;
    azureMachineType?: string;

    // Digital Ocean
    digitalOceanToken?: string;
    digitalOceanRegion?: string;
    digitalOceanMachineType?: string;
    digitalOceanMachineImage?: string;
    digitalOceanSSHKeyId?: number;
    digitalOceanImageName?: string;

    // Vultr
    vultrApiKey?: string;
    vultrPlanId?: number;
    vultrLocationId?: number;

    // BinaryLane
    binarylaneApiKey?: string;
    binarylaneMachineSize?: string;
    binarylaneMachineImage?: string;
    binarylaneRegion?: string;
    binarylaneImageInstance?: string;
    binarylaneSSHKey?: string;

    // Linode
    linodeApiKey?: string;
    linodeImageName?: string;
    linodeRegion?: string;
    linodeRootPassword?: string;
    linodeSSHKey?: string[];
    linodeMachineSize?: string;
  };
}

export const ProviderSchema = SchemaFactory.createForClass(Provider);
