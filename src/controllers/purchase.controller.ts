import { MenuService } from 'src/dao/impl/menu.service';
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
import { PurchaseService } from 'src/dao/service/purchase.service';
import { AppGuard } from 'src/app.guard';

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

  /**
   * 获取指定指定页数的进货单数据
   */
  @Get('/findPurchaseByPage')
  findPurchaseByEmployeeAndPage(@Req() req, @Res() res, @Next() next) {
    this.$sql.findPurchaseByPage(req, res, next);
  }

  // /**
  //  * 审核进货单
  //  */
  // @Put('/reviewPurchase')
  // reviewPurchase(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.reviewPurchase(req, res, next);
  // }

  /**
   * 删除指定进货单
   */
  @Delete('/deletePurchaseById/')
  deletePurchaseById(@Req() req, @Res() res, @Next() next) {
    this.$sql.deletePurchaseById(req, res, next);
  }
}
