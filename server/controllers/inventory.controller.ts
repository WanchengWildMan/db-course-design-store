import {
  Controller,
  Post,
  Delete,
  Put,
  Get,
  Req,
  Res,
  Next,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from 'server/dao/service/inventory.service';

@ApiTags('库存,盘点')
@Controller('/api/inventory')
export class InventoryController {
  constructor(private readonly $sql: InventoryService) {
    console.log('InventoryController construct');
  }

  /**
   * 获取所有的盘点单（管理员）
   */
  @Get('/findInventoryByPage')
  async findInventoryByPage(@Req() req, @Res() res, @Next() next) {
    return await this.$sql.findInventoryByPage(req, res, next);
  }

  @Post('/saveInventoryLimitById')
  async saveInventoryLimitById(@Req() req, @Res() res, @Next() next) {
    let inventoryInfo = req.body.inventoryInfo;
    this.$sql
      .saveInventoryLimitById(inventoryInfo)
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }
}
