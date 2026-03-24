import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEndpoint])],
  providers: [],
  exports: [TypeOrmModule],
})
export class WebhooksModule {}
