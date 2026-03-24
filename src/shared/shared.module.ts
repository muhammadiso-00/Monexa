import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdempotencyKey } from './idempotency/idempotency-key.entity';
import { OutboxEvent } from './events/outbox-event.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([IdempotencyKey, OutboxEvent])],
  providers: [],
  exports: [TypeOrmModule],
})
export class SharedModule {}
