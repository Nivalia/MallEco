import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../infrastructure/auth/strategies/jwt.strategy';
import { LocalStrategy } from '../../infrastructure/auth/strategies/local.strategy';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    RedisModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret') || 'default_secret',
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
