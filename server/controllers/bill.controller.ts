import {
  Controller,
  Delete,
  Get,
  Next,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppGuard } from 'server/app.guard';
import { Roles } from 'server/roles.decorator';
import { BillService } from '../dao/service/bill.service';

@ApiTags('收银台')
@Controller('/api/bill')
@UseGuards(AppGuard)
export class BillController {
  constructor(private readonly $sql: BillService) {}

  /**
   * 保存一张收银单
   */
  @Post('/saveBill')
  saveBill(@Req() req, @Res() res, @Next() next) {
    this.$sql.saveBill(req, res, next);
  }

  @Post('/saveOneBillInfo')
  saveOneBillInfo(@Req() req, @Res() res, @Next() next) {
    this.$sql.saveOneBillInfo(req, res, next);
  }

  /**
   *
   */
  @Get('/findBillByBillId')
  findBillByBillId(@Req() req, @Res() res, @Next() next) {
    this.$sql.findBillByBillId(req, res, next);
  }

  /**
   * 获取指定员工指定页数的进货单数据
   */
  @Get('/findBillByEmployeeAndPage')
  findBillByEmployeeAndPage(@Req() req, @Res() res, @Next() next) {
    this.$sql.findBillByEmployeeAndPage(req, res, next);
  }

  /**
   * 获取所有进货单（管理员）
   */
  @Get('/findBillByPage')
  findBillByPage(@Req() req, @Res() res, @Next() next) {
    this.$sql.findBillByPage(req, res, next);
  }
  @Get('/findBillGroupByCategory')
  findBillGroupByCategory(@Req() req, @Res() res, @Next() next) {
    this.$sql.findBillGroupByCategory(req, res, next);
  }
  /**
   * 删除指定收银单据
   */
  @Roles(3)
  @Delete('/deleteBillByBillId')
  deleteBillByBillId(@Req() req, @Res() res, @Next() next) {
    this.$sql.deleteBillByBillId(req, res, next);
  }
}
