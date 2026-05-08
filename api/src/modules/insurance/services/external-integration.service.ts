import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { ClaimRecord } from '../entities/claim-record.entity';
import { RenewalRecord } from '../entities/renewal-record.entity';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';

@Injectable()
export class ExternalIntegrationService {
  private externalSystemsConfig: any;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly rabbitMQService: RabbitMQService,
  ) {
    this.externalSystemsConfig = this.configService.get('externalSystems') || {};
  }

  /**
   * 同步保单到外部系统
   * @param policy 保单对象
   * @returns 同步结果
   */
  async syncPolicyToExternalSystem(
    policy: InsurancePolicy,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const insuranceSystemConfig = this.externalSystemsConfig.insurance || {};
      if (!insuranceSystemConfig.enabled) {
        return { success: false, message: '外部保险系统未启用' };
      }

      const url = `${insuranceSystemConfig.baseUrl}/api/policies`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${insuranceSystemConfig.apiKey}`,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            policyNumber: policy.policyNumber,
            insuranceCompanyId: policy.insuranceCompanyId,
            insuranceProductId: policy.insuranceProductId,
            policyHolderId: policy.policyHolderId,
            effectiveDate: policy.effectiveDate,
            expiryDate: policy.expiryDate,
            premium: policy.premium,
            policyStatus: policy.policyStatus,
            channelId: policy.channelId,
            upstreamChannelId: policy.upstreamChannelId,
          },
          { headers },
        ),
      );

      // 发送同步成功消息
      await this.rabbitMQService.emit('insurance.policy.sync.external.success', {
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        externalSystemResponse: response.data,
      });

      return { success: true, data: response.data };
    } catch (error) {
      // 发送同步失败消息
      await this.rabbitMQService.emit('insurance.policy.sync.external.failed', {
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        error: error.message,
      });

      throw new InternalServerErrorException(`同步保单到外部系统失败: ${error.message}`);
    }
  }

  /**
   * 同步理赔记录到外部系统
   * @param claim 理赔记录对象
   * @returns 同步结果
   */
  async syncClaimToExternalSystem(
    claim: ClaimRecord,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const insuranceSystemConfig = this.externalSystemsConfig.insurance || {};
      if (!insuranceSystemConfig.enabled) {
        return { success: false, message: '外部保险系统未启用' };
      }

      const url = `${insuranceSystemConfig.baseUrl}/api/claims`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${insuranceSystemConfig.apiKey}`,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            claimNumber: claim.claimNumber,
            policyId: claim.policyId,
            claimDate: claim.claimDate,
            reportDate: claim.reportDate,
            claimAmount: claim.claimAmount,
            claimType: claim.claimType,
            claimReason: claim.claimReason,
            accidentLocation: claim.accidentLocation,
            claimStatus: claim.claimStatus,
          },
          { headers },
        ),
      );

      // 发送同步成功消息
      await this.rabbitMQService.emit('insurance.claim.sync.external.success', {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        externalSystemResponse: response.data,
      });

      return { success: true, data: response.data };
    } catch (error) {
      // 发送同步失败消息
      await this.rabbitMQService.emit('insurance.claim.sync.external.failed', {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        error: error.message,
      });

      throw new InternalServerErrorException(`同步理赔到外部系统失败: ${error.message}`);
    }
  }

  /**
   * 同步续保记录到外部系统
   * @param renewal 续保记录对象
   * @returns 同步结果
   */
  async syncRenewalToExternalSystem(
    renewal: RenewalRecord,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const insuranceSystemConfig = this.externalSystemsConfig.insurance || {};
      if (!insuranceSystemConfig.enabled) {
        return { success: false, message: '外部保险系统未启用' };
      }

      const url = `${insuranceSystemConfig.baseUrl}/api/renewals`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${insuranceSystemConfig.apiKey}`,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            renewalNumber: renewal.renewalNumber,
            originalPolicyId: renewal.originalPolicyId,
            policyId: renewal.policyId,
            renewalDate: renewal.renewalDate,
            effectiveDate: renewal.effectiveDate,
            expiryDate: renewal.expiryDate,
            premium: renewal.premium,
            originalPremium: renewal.originalPremium,
            premiumChange: renewal.premiumChange,
            renewalStatus: renewal.renewalStatus,
          },
          { headers },
        ),
      );

      // 发送同步成功消息
      await this.rabbitMQService.emit('insurance.renewal.sync.external.success', {
        renewalId: renewal.id,
        renewalNumber: renewal.renewalNumber,
        externalSystemResponse: response.data,
      });

      return { success: true, data: response.data };
    } catch (error) {
      // 发送同步失败消息
      await this.rabbitMQService.emit('insurance.renewal.sync.external.failed', {
        renewalId: renewal.id,
        renewalNumber: renewal.renewalNumber,
        error: error.message,
      });

      throw new InternalServerErrorException(`同步续保到外部系统失败: ${error.message}`);
    }
  }

  /**
   * 从外部系统获取理赔状态
   * @param claimNumber 理赔单号
   * @returns 理赔状态信息
   */
  async getClaimStatusFromExternalSystem(
    claimNumber: string,
  ): Promise<{ status: number; statusDescription: string; updatedAt: Date }> {
    try {
      const insuranceSystemConfig = this.externalSystemsConfig.insurance || {};
      if (!insuranceSystemConfig.enabled) {
        throw new BadRequestException('外部保险系统未启用');
      }

      const url = `${insuranceSystemConfig.baseUrl}/api/claims/${claimNumber}/status`;
      const headers = {
        Authorization: `Bearer ${insuranceSystemConfig.apiKey}`,
      };

      const response = await firstValueFrom(this.httpService.get(url, { headers }));

      return {
        status: response.data.status,
        statusDescription: response.data.statusDescription,
        updatedAt: new Date(response.data.updatedAt),
      };
    } catch (error) {
      throw new InternalServerErrorException(`从外部系统获取理赔状态失败: ${error.message}`);
    }
  }

  /**
   * 批量同步保单到外部系统
   * @param policies 保单列表
   * @returns 同步结果统计
   */
  async batchSyncPoliciesToExternalSystem(
    policies: InsurancePolicy[],
  ): Promise<{ total: number; success: number; failed: number; failedItems: any[] }> {
    let successCount = 0;
    let failedCount = 0;
    const failedItems = [];

    for (const policy of policies) {
      try {
        await this.syncPolicyToExternalSystem(policy);
        successCount++;
      } catch (error) {
        failedCount++;
        failedItems.push({
          policyId: policy.id,
          policyNumber: policy.policyNumber,
          error: error.message,
        });
      }
    }

    return {
      total: policies.length,
      success: successCount,
      failed: failedCount,
      failedItems,
    };
  }

  /**
   * 验证外部系统连接
   * @returns 连接状态
   */
  async validateExternalSystemConnection(): Promise<{ connected: boolean; message?: string }> {
    try {
      const insuranceSystemConfig = this.externalSystemsConfig.insurance || {};
      if (!insuranceSystemConfig.enabled) {
        return { connected: false, message: '外部保险系统未启用' };
      }

      const url = `${insuranceSystemConfig.baseUrl}/api/health`;
      const headers = {
        Authorization: `Bearer ${insuranceSystemConfig.apiKey}`,
      };

      const response = await firstValueFrom(this.httpService.get(url, { headers }));

      return { connected: response.status === 200, message: '连接成功' };
    } catch (error) {
      return { connected: false, message: `连接失败: ${error.message}` };
    }
  }

  /**
   * 获取外部系统配置信息
   * @returns 配置信息
   */
  getExternalSystemConfig(): any {
    return this.externalSystemsConfig;
  }
}
