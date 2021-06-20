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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PurchaseService } from 'server/dao/service/purchase.service';
import { AppGuard } from 'server/app.guard';
import { Roles } from 'server/roles.decorator';

@ApiTags('进货')
@Controller('/api/purchase')
@UseGuards(AppGuard)
export class PurchaseController {
  constructor(private readonly $sql: PurchaseService) {}
  /**
   * 保存一张进货单
   */
  @Post('/savePurchase')
  savePurchase(@Req() req, @Res() res, @Next() next) {
    this.$sql.savePurchase(req, res, next);
  }
  @Post('/saveOnePurchase')
  saveOnePurchase(@Req() req, @Res() res, @Next() next) {
    this.$sql.saveOnePurchase(req, res, next);
  }
  /**
   * 获取指定指定页数的进货单数据
   */
  @Get('/findPurchaseByPage')
  findPurchaseByEmployeeAndPage(@Req() req, @Res() res, @Next() next) {
    this.$sql.findPurchaseByPage(req, res, next);
  }

  /**
   * 删除指定进货单
   */
  @Roles(3)
  @Delete('/deletePurchaseById/')
  deletePurchaseById(@Req() req, @Res() res, @Next() next) {
    this.$sql.deletePurchaseById(req, res, next);
  }
}
