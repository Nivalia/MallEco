import { Module } from '@nestjs/common';
import { MonitoringController } from './controllers/monitoring.controller';
import { MonitoringRootController } from './controllers/monitoring-root.controller';
import { MonitoringService } from './services/monitoring.service';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';

@Module({
  controllers: [MonitoringController, MonitoringRootController],
  providers: [MonitoringService, RabbitMQService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
