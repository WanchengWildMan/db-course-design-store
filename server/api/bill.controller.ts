import {
  Controller,
  Post,
  Delete,
  Put,
  Get,
  Logger,
  Req,
  Res,
  Next,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { BillService } from 'server/dao/impl/bill.service';
const $sql = new BillService();
@ApiTags('收银台')
@Controller('/api/bill')
export class BillController {
  /**
   * 保存一张收银单
   */
  @Post('/saveBill')
  saveBill(@Req() req, @Res() res, @Next() next) {
    $sql.saveBill(req, res, next);
  }

  /**
   * 获取指定员工指定页数的进货单数据
   */
  @Get('/findBillByEmployeeAndPage')
  findBillByEmployeeAndPage(@Req() req, @Res() res, @Next() next) {
    $sql.findBillByEmployeeAndPage(req, res, next);
  }

  /**
   * 获取所有进货单指定页数（管理员）
   */
  @Get('/findBillByPage')
  findBillByPage(@Req() req, @Res() res, @Next() next) {
    $sql.findBillByPage(req, res, next);
  }

  /**
   * 获取指定员工的收银信息
   */
  @Get('/findAllCommodityByEmployeeAndPage')
  findAllCommodityByEmployeeAndPage(@Req() req, @Res() res, @Next() next) {
    $sql.findAllCommodityByEmployeeAndPage(req, res, next);
  }

  /***
   * 获取指定收银单号的详细信息
   */
  @Get('/findCommodityByBillId')
  findCommodityByBillId(@Req() req, @Res() res, @Next() next) {
    $sql.findCommodityByBillId(req, res, next);
  }

  /**
   * 获取收银单中商品信息的总数
   */
  @Get('/findCountByInfo')
  findCountByInfo(@Req() req, @Res() res, @Next() next) {
    $sql.findCountByInfo(req, res, next);
  }

  /**
   * 删除指定收银单据
   */
  @Delete('/deleteBillByBillId/:billId')
  deleteBillByBillId(@Req() req, @Res() res, @Next() next) {
    $sql.deleteBillByBillId(req, res, next);
  }
}
