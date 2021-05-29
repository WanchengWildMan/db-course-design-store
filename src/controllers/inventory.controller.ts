import { Controller, Post, Delete, Put, Get, Logger, Req, Res, Next } from '@nestjs/common';

;
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from 'src/dao/service/inventory.service';


@ApiTags('库存,盘点')
@Controller('/api/inventory')
export class InventoryController {
  constructor(private readonly $sql: InventoryService) {
    console.log("InventoryController construct")
  }

  /**
   * 保存一张盘点单
   */
  @Post('/updateInventory')
  async saveInventory(@Req() req) {
    return await this.$sql.updateInventory(req.updateInfo);
  }

  // /**
  //  * 获取指定员工的盘点单（员工盘点单功能）
  //  */
  // @Get('/findInventoryByEmployeeAndPage')
  // findInventoryByEmployeeAndPage(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.findInventoryByEmployeeAndPage(req, res, next);
  // }

  /**
   * 获取所有的盘点单（管理员）
   */
  @Get('/findInventoryByPage')
  async findInventoryByPage(@Req() req, @Res() res, @Next() next) {
    console.log(req);
    return await this.$sql.findInventoryByPage(req, res, next);
  }

  // /**
  //  * 获取指定员工所制单的商品信息
  //  */
  // @Get('/findAllInventoryCommodityByEmployeeAndPage')
  // findAllInventoryCommodityByEmployeeAndPage(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.findAllInventoryCommodityByEmployeeAndPage(req, res, next);
  // }

  // /**
  //  * 获取指定盘点单的详细信息
  //  */
  // @Get('/findInventoryListMessage')
  // findInventoryListMessage(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.findInventoryListMessage(req, res, next);
  // }

  //TODO

  // /**
  //  * 审核盘点单
  //  */
  // @Put('/updateInventoryByReview')
  // updateInventoryByReview(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.updateInventoryByReview(req, res, next);
  // }

  // /**
  //  * 删除指定盘点单
  //  */
  // @Delete('/deleteInventoryById/:inventoryId/:reviewId')
  // deleteInventoryById(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.deleteInventoryById(req, res, next);
  // }
}
