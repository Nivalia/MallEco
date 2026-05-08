import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

// 实体类
import { InsuranceCompany } from './entities/insurance-company.entity';
import { InsuranceProduct } from './entities/insurance-product.entity';
import { InsuranceProductType } from './entities/insurance-product-type.entity';
import { PolicyHolder } from './entities/policy-holder.entity';
import { Channel } from './entities/channel.entity';
import { InsurancePolicy } from './entities/insurance-policy.entity';
import { SettlementRecord } from './entities/settlement-record.entity';
import { SettlementDetail } from './entities/settlement-detail.entity';
import { ClaimRecord } from './entities/claim-record.entity';
import { RenewalRecord } from './entities/renewal-record.entity';

// 服务层
import { InsuranceCompanyService } from './services/insurance-company.service';
import { InsuranceProductService } from './services/insurance-product.service';
import { InsuranceProductTypeService } from './services/insurance-product-type.service';
import { PolicyHolderService } from './services/policy-holder.service';
import { ChannelService } from './services/channel.service';
import { InsurancePolicyService } from './services/insurance-policy.service';
import { SettlementRecordService } from './services/settlement-record.service';
import { InsuranceStatisticsService } from './services/insurance-statistics.service';
import { ClaimRecordService } from './services/claim-record.service';
import { RenewalRecordService } from './services/renewal-record.service';
import { ExternalIntegrationService } from './services/external-integration.service';
import { ExpiryReminderService } from './services/expiry-reminder.service';

// 控制器层
import { InsuranceController } from './insurance.controller';
import { InsuranceCompanyController } from './controllers/insurance-company.controller';
import { InsuranceProductController } from './controllers/insurance-product.controller';
import { InsuranceProductTypeController } from './controllers/insurance-product-type.controller';
import { PolicyHolderController } from './controllers/policy-holder.controller';
import { ChannelController } from './controllers/channel.controller';
import { InsurancePolicyController } from './controllers/insurance-policy.controller';
import { SettlementRecordController } from './controllers/settlement-record.controller';
import { InsuranceStatisticsController } from './controllers/insurance-statistics.controller';
import { InsuranceChartController } from './controllers/insurance-chart.controller';
import { ClaimRecordController } from './controllers/claim-record.controller';
import { RenewalRecordController } from './controllers/renewal-record.controller';
import { ExternalIntegrationController } from './controllers/external-integration.controller';
import { ExpiryReminderController } from './controllers/expiry-reminder.controller';

// 外部实体和服务
import { Member } from '@modules/framework/entities/member.entity';
import { PointsRecord } from '@modules/framework/entities/points-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InsuranceCompany,
      InsuranceProduct,
      InsuranceProductType,
      PolicyHolder,
      Channel,
      InsurancePolicy,
      SettlementRecord,
      SettlementDetail,
      ClaimRecord,
      RenewalRecord,
      Member,
      PointsRecord,
    ]),
    HttpModule,
  ],
  controllers: [
    InsuranceController,
    InsuranceCompanyController,
    InsuranceProductController,
    InsuranceProductTypeController,
    PolicyHolderController,
    ChannelController,
    InsurancePolicyController,
    SettlementRecordController,
    InsuranceStatisticsController,
    InsuranceChartController,
    ClaimRecordController,
    RenewalRecordController,
    ExternalIntegrationController,
    ExpiryReminderController,
  ],
  providers: [
    InsuranceCompanyService,
    InsuranceProductService,
    InsuranceProductTypeService,
    PolicyHolderService,
    ChannelService,
    InsurancePolicyService,
    SettlementRecordService,
    InsuranceStatisticsService,
    ClaimRecordService,
    RenewalRecordService,
    ExternalIntegrationService,
    ExpiryReminderService,
  ],
  exports: [
    InsuranceCompanyService,
    InsuranceProductService,
    InsuranceProductTypeService,
    PolicyHolderService,
    ChannelService,
    InsurancePolicyService,
    SettlementRecordService,
    InsuranceStatisticsService,
    ClaimRecordService,
    RenewalRecordService,
    ExternalIntegrationService,
    ExpiryReminderService,
  ],
})
export class InsuranceModule {}
