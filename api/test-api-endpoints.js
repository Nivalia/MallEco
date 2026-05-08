const request = require('supertest');
const fs = require('fs');
const path = require('path');

// 定义API端点列表
const apiEndpoints = [
  // 根路径
  { path: '/', method: 'GET' },
  { path: '/api', method: 'GET' },
  
  // 认证模块
  { path: '/api/auth', method: 'GET' },
  
  // 买家模块
  { path: '/api/buyer', method: 'GET' },
  { path: '/api/buyer/goods/goods', method: 'GET' },
  { path: '/api/buyer/goods/category', method: 'GET' },
  
  // 卖家模块
  { path: '/api/seller', method: 'GET' },
  
  // 管理模块
  { path: '/api/manager', method: 'GET' },
  
  // RBAC模块
  { path: '/api/rbac', method: 'GET' },
  
  // 购物车模块
  { path: '/api/cart', method: 'GET' },
  
  // 订单模块
  { path: '/api/orders', method: 'GET' },
  
  // 钱包模块
  { path: '/api/wallet', method: 'GET' },
  
  // 商品模块
  { path: '/api/products', method: 'GET' },
  
  // 其他模块
  { path: '/api/insurance', method: 'GET' },
  { path: '/api/system', method: 'GET' },
  { path: '/api/statistics', method: 'GET' },
  { path: '/api/cache', method: 'GET' },
  { path: '/api/users', method: 'GET' },
  { path: '/api/promotion', method: 'GET' },
  { path: '/api/distribution', method: 'GET' },
  { path: '/api/content', method: 'GET' },
  { path: '/api/live', method: 'GET' },
  { path: '/api/payment', method: 'GET' },
  { path: '/api/sms', method: 'GET' },
  { path: '/api/email', method: 'GET' },
  { path: '/api/file', method: 'GET' },
  { path: '/api/common', method: 'GET' },
  { path: '/api/logistics', method: 'GET' },
  { path: '/api/feedback', method: 'GET' },
  { path: '/api/im', method: 'GET' },
  { path: '/api/address', method: 'GET' },
  { path: '/api/member', method: 'GET' },
  { path: '/api/store', method: 'GET' },
  { path: '/api/trade', method: 'GET' },
  { path: '/api/other', method: 'GET' },
  { path: '/api/wechat', method: 'GET' },
  { path: '/api/menu', method: 'GET' },
  { path: '/api/monitoring', method: 'GET' },
  { path: '/api/notification', method: 'GET' },
  { path: '/api/recommendation', method: 'GET' },
  { path: '/api/service-mesh', method: 'GET' },
];

// 测试API端点的函数
async function testApiEndpoints() {
  console.log('开始测试API端点可用性...');
  console.log('=' . repeat(80));
  
  const results = [];
  let availableCount = 0;
  let unavailableCount = 0;
  
  // 遍历所有API端点
  for (const endpoint of apiEndpoints) {
    try {
      console.log(`测试: ${endpoint.method} ${endpoint.path}`);
      
      // 发送请求
      const response = await request('http://localhost:9000')
        [endpoint.method.toLowerCase()](endpoint.path)
        .timeout(5000);
      
      // 检查响应状态
      const isAvailable = response.statusCode >= 200 && response.statusCode < 400;
      
      results.push({
        path: endpoint.path,
        method: endpoint.method,
        statusCode: response.statusCode,
        statusText: response.statusText,
        available: isAvailable
      });
      
      if (isAvailable) {
        availableCount++;
        console.log(`✓ 可用: ${endpoint.method} ${endpoint.path} (${response.statusCode})`);
      } else {
        unavailableCount++;
        console.log(`✗ 不可用: ${endpoint.method} ${endpoint.path} (${response.statusCode})`);
      }
    } catch (error) {
      unavailableCount++;
      results.push({
        path: endpoint.path,
        method: endpoint.method,
        statusCode: 0,
        statusText: 'Connection Error',
        available: false,
        error: error.message
      });
      console.log(`✗ 错误: ${endpoint.method} ${endpoint.path} - ${error.message}`);
    }
    console.log('-'.repeat(80));
  }
  
  // 生成测试报告
  console.log('\n测试报告');
  console.log('=' . repeat(80));
  console.log(`总测试端点: ${apiEndpoints.length}`);
  console.log(`可用端点: ${availableCount}`);
  console.log(`不可用端点: ${unavailableCount}`);
  console.log('=' . repeat(80));
  
  // 显示不可用的端点
  if (unavailableCount > 0) {
    console.log('\n不可用的端点:');
    console.log('-'.repeat(80));
    results.filter(r => !r.available).forEach(result => {
      console.log(`${result.method} ${result.path}`);
      console.log(`  状态: ${result.statusCode} ${result.statusText}`);
      if (result.error) {
        console.log(`  错误: ${result.error}`);
      }
      console.log('');
    });
  }
  
  // 保存测试结果到文件
  const reportPath = path.join(__dirname, 'api-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalEndpoints: apiEndpoints.length,
    availableEndpoints: availableCount,
    unavailableEndpoints: unavailableCount,
    results: results
  }, null, 2));
  
  console.log(`\n测试结果已保存到: ${reportPath}`);
  console.log('测试完成!');
}

// 运行测试
testApiEndpoints().catch(error => {
  console.error('测试过程中发生错误:', error);
  process.exit(1);
});
