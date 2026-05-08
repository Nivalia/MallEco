import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigManagerService } from './config-manager.service';
import { join } from 'path';
import { configurations } from '../../config/configuration';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(), 'config', '.env'),
      isGlobal: true,
      cache: true,
      load: configurations,
    }),
  ],
  providers: [ConfigManagerService, ConfigService],
  exports: [ConfigManagerService, ConfigService],
})
export class GlobalConfigModule {}
