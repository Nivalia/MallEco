import { Module, Global, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { ProductMessageHandler } from './product-message-handler';
import { MessageMessageHandler } from './message-message-handler';
import { OrderMessageHandler } from './order-message-handler';
import { InsuranceMessageHandler } from './insurance-message-handler';
import { ProductsModule } from '../../products/products.module';
import { InsuranceModule } from '@modules/insurance/insurance.module';
// import { MemberModule } from '../../../modules/member/member.module';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: configService.get<string>('RABBITMQ_QUEUE', 'mall_eco_queue'),
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    forwardRef(() => ProductsModule),
    forwardRef(() => InsuranceModule),
    // forwardRef(() => MemberModule)
  ],
  providers: [
    RabbitMQService,
    ProductMessageHandler,
    MessageMessageHandler,
    OrderMessageHandler,
    InsuranceMessageHandler,
  ],
  exports: [ClientsModule, RabbitMQService],
})
export class RabbitMQModule {}
