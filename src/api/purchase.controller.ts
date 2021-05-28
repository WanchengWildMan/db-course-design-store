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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PurchaseService } from 'src/dao/impl/purchase.service';

const $sql = new PurchaseService();

@ApiTags('进货')
@Controller('/api/purchase')
export class PurchaseController {
  /**
   * 保存一张进货单
   */
  @Post('/savePurchase')
  savePurchase(@Req() req, @Res() res, @Next() next) {
    $sql.savePurchase(req, res, next);
  }

  /**
   * 获取指定员工指定页数的进货单数据
   */
  @Get('/findPurchaseByEmployeeAndPage')
  findPurchaseByEmployeeAndPage(@Req() req, @Res() res, @Next() next) {
    $sql.findPurchaseByEmployeeAndPage(req, res, next);
  }

  /**
   * 获取所有进货单指定页数（管理员）
   */
  @Get('/findPurchaseByPage')
  findPurchaseByPage(@Req() req, @Res() res, @Next() next) {
    $sql.findPurchaseByPage(req, res, next);
  }

  /**
   * 获取操作进货单信息
   */
  @Get('/findPurchaseListMessage')
  findPurchaseListMessage(@Req() req, @Res() res, @Next() next) {
    $sql.findPurchaseListMessage(req, res, next);
  }

  /**
   * 获取指定员工所制单的商品信息
   */
  @Get('/findAllPurchaseByEmployeeAndPage')
  findAllPurchaseByEmployeeAndPage(@Req() req, @Res() res, @Next() next) {
    $sql.findAllPurchaseByEmployeeAndPage(req, res, next);
  }

  /**
   * 审核进货单
   */
  @Put('/reviewPurchase')
  reviewPurchase(@Req() req, @Res() res, @Next() next) {
    $sql.reviewPurchase(req, res, next);
  }

  /**
   * 删除指定进货单
   */
  @Delete('/deletePurchaseById/:serialId/:reviewId')
  deletePurchaseById(@Req() req, @Res() res, @Next() next) {
    $sql.deletePurchaseById(req, res, next);
  }
}
