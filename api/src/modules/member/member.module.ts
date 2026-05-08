import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberRootController } from './controllers/member-root.controller';
import { MemberService } from './member.service';

@Module({
  controllers: [MemberController, MemberRootController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
