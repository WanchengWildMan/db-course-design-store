import { Controller, Post, Delete, Put, Get, Logger , Req, Res, Next } from '@nestjs/common';;
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from 'server/dao/impl/inventory.service';

const $sql = new InventoryService();

@ApiTags('库存,盘点')
@Controller('/api/inventory')
export class InventoryController {
  /**
   * 保存一张盘点单
   */
  @Post('/saveInventory')
  saveInventory(@Req() req, @Res() res, @Next() next) {
    $sql.saveInventory(req, res, next);
  }

  /**
   * 获取指定员工的盘点单（员工盘点单功能）
   */
  @Get('/findInventoryByEmployeeAndPage')
  findInventoryByEmployeeAndPage(@Req() req, @Res() res, @Next() next) {
    $sql.findInventoryByEmployeeAndPage(req, res, next);
  }

  /**
   * 获取所有的盘点单（管理员）
   */
  @Get('/findInventoryByPage')
  findInventoryByPage(@Req() req, @Res() res, @Next() next) {
    $sql.findInventoryByPage(req, res, next);
  }

  /**
   * 获取指定员工所制单的商品信息
   */
  @Get('/findAllInventoryCommodityByEmployeeAndPage')
  findAllInventoryCommodityByEmployeeAndPage(@Req() req, @Res() res, @Next() next) {
    $sql.findAllInventoryCommodityByEmployeeAndPage(req, res, next);
  }

  /**
   * 获取指定盘点单的详细信息
   */
  @Get('/findInventoryListMessage')
  findInventoryListMessage(@Req() req, @Res() res, @Next() next) {
    $sql.findInventoryListMessage(req, res, next);
  }
  //TODO

  /**
   * 审核盘点单
   */
  @Put('/updateInventoryByReview')
  updateInventoryByReview(@Req() req, @Res() res, @Next() next) {
    $sql.updateInventoryByReview(req, res, next);
  }

  /**
   * 删除指定盘点单
   */
  @Delete('/deleteInventoryById/:inventoryId/:reviewId')
  deleteInventoryById(@Req() req, @Res() res, @Next() next) {
    $sql.deleteInventoryById(req, res, next);
  }
}
