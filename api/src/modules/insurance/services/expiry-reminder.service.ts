import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExpiryReminderService {
  private readonly DEFAULT_CACHE_TTL = 3600; // 1小时
  private readonly CACHE_KEY_PREFIX = 'insurance:expiry-reminder';

  constructor(
    @InjectRepository(InsurancePolicy)
    private readonly insurancePolicyRepository: Repository<InsurancePolicy>,
    private readonly rabbitMQService: RabbitMQService,
    private readonly cacheService: AdvancedCacheService,
    private readonly configService: ConfigService,
  ) {
    const insuranceCacheConfig = this.configService.get('performance.cache.modules.insurance');
    if (insuranceCacheConfig) {
      this.DEFAULT_CACHE_TTL = insuranceCacheConfig.ttl;
    }
  }

  /**
   * 获取即将到期的保单
   * @param days 天数
   * @returns 即将到期的保单列表
   */
  async getExpiringPolicies(days: number = 30) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:policies:days=${days}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const today = new Date();
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);

        return await this.insurancePolicyRepository
          .createQueryBuilder('policy')
          .where('policy.expiryDate >= :today', { today })
          .andWhere('policy.expiryDate <= :targetDate', { targetDate })
          .andWhere('policy.policyStatus = :policyStatus', { policyStatus: 1 })
          .andWhere('policy.isDel = :isDel', { isDel: 0 })
          .leftJoinAndSelect('policy.insuranceCompany', 'insuranceCompany')
          .leftJoinAndSelect('policy.policyHolder', 'policyHolder')
          .leftJoinAndSelect('policy.insuranceProduct', 'insuranceProduct')
          .orderBy('policy.expiryDate', 'ASC')
          .getMany();
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 生成到期提醒
   * @param days 天数
   * @returns 提醒结果
   */
  async generateExpiryReminders(days: number = 30) {
    const expiringPolicies = await this.getExpiringPolicies(days);
    const reminders = [];

    for (const policy of expiringPolicies) {
      const reminder = {
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        policyHolderName: policy.policyHolder?.holderName,
        insuranceCompanyName: policy.insuranceCompany?.companyName,
        insuranceProductName: policy.insuranceProduct?.productName,
        expiryDate: policy.expiryDate,
        daysUntilExpiry: Math.ceil(
          (policy.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        ),
        reminderDate: new Date(),
      };

      reminders.push(reminder);

      // 发送提醒消息
      await this.rabbitMQService.emit('insurance.policy.expiry_reminder', reminder);
    }

    return {
      totalPolicies: expiringPolicies.length,
      reminders,
      generatedAt: new Date(),
    };
  }

  /**
   * 发送单个保单的到期提醒
   * @param policyId 保单ID
   * @returns 提醒结果
   */
  async sendExpiryReminder(policyId: string) {
    const policy = await this.insurancePolicyRepository.findOne({
      where: { id: policyId },
      relations: ['insuranceCompany', 'policyHolder', 'insuranceProduct'],
    });

    if (!policy) {
      throw new Error(`保单 ID ${policyId} 不存在`);
    }

    const daysUntilExpiry = Math.ceil(
      (policy.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    const reminder = {
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      policyHolderName: policy.policyHolder?.holderName,
      insuranceCompanyName: policy.insuranceCompany?.companyName,
      insuranceProductName: policy.insuranceProduct?.productName,
      expiryDate: policy.expiryDate,
      daysUntilExpiry,
      reminderDate: new Date(),
    };

    // 发送提醒消息
    await this.rabbitMQService.emit('insurance.policy.expiry_reminder', reminder);

    return {
      success: true,
      reminder,
    };
  }

  /**
   * 获取到期提醒统计
   * @param days 天数
   * @returns 统计结果
   */
  async getExpiryReminderStatistics(days: number = 30) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:statistics:days=${days}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const expiringPolicies = await this.getExpiringPolicies(days);

        // 按剩余天数分组
        const groupedByDays: Record<string, InsurancePolicy[]> = {};
        expiringPolicies.forEach(policy => {
          const daysUntilExpiry = Math.ceil(
            (policy.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
          );
          const key = daysUntilExpiry.toString();
          if (!groupedByDays[key]) {
            groupedByDays[key] = [];
          }
          groupedByDays[key].push(policy);
        });

        // 按保险公司分组
        const groupedByCompany: Record<string, InsurancePolicy[]> = {};
        expiringPolicies.forEach(policy => {
          const companyName = policy.insuranceCompany?.companyName || '未知公司';
          if (!groupedByCompany[companyName]) {
            groupedByCompany[companyName] = [];
          }
          groupedByCompany[companyName].push(policy);
        });

        return {
          totalPolicies: expiringPolicies.length,
          groupedByDays,
          groupedByCompany,
          statisticsDate: new Date(),
        };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }
}
