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
import { CommodityService } from '../dao/service/commodity.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('商品')
@Controller('/api/commodity')
export class CommodityController {
  private readonly logger: Logger = new Logger('CommodityController');

  constructor(private readonly $sql: CommodityService) {
    console.log('CommodityController constructor');
  }

  /**
   * 添加一个商品类型
   */
  @Post('/addSort')
  addSort(@Req() req, @Res() res, @Next() next) {
    this.$sql.saveSort(req, res, next);
  }

  /**
   * 添加一个商品单位
   */
  @Post('/addUnit')
  addUnit(@Req() req, @Res() res, @Next() next) {
    this.$sql.saveUnit(req, res, next);
  }

  @Post('/addCommodity')
  addCommodity(@Req() req, @Res() res, @Next() next) {
    this.$sql.saveCommodity(req, res, next);
  }

  // /**
  //  * 获取指定页数的商品类型
  //  */
  // @Get('/findSortByPage')
  // findSortByPage(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.findSortByPage(req, res, next);
  // }
  //
  // /**
  //  * 获取指定页数的商品单位
  //  */
  // @Get('/findUnitByPage')
  // findUnitByPage(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.findUnitByPage(req, res, next);
  // }
  //
  /**
   * 获取指定页数的商品资料信息
   */
  // TODO
  @Get('/findCommodityById')
  findCommodityById(@Req() req, @Res() res, @Next() next) {
    this.$sql.findCommodityById(req, res, next);
  }
  //
  // /**
  //  * 获取所有商品指定信息
  //  */
  // @Get('/getSelectCommodityList')
  // getSelectCommodityList(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.getSelectCommodityList(req, res, next);
  // }
  //
  // /**
  //  * 获取所有的商品类型
  //  */
  // @Get('/findAllSort')
  // findAllSort(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.findAllSort(req, res, next);
  // }
  //
  // /**
  //  * 获取所有的商品单位
  //  */
  // @Get('/findAllUnit')
  // findAllUnit(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.findAllUnit(req, res, next);
  // }
  //
  // /**
  //  * 更新指定商品类型
  //  */
  // @Put('/updateSortById')
  // updateSortById(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.updateSortById(req, res, next);
  // }
  //
  // /**
  //  * 更新指定商品单位
  //  */
  // @Put('/updateUnitById')
  // updateUnitById(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.updateUnitById(req, res, next);
  // }
  //
  // /**
  //  * 更新指定商品资料的状态
  //  */
  // @Put('/updateCommodityStatusById')
  // updateCommodityStatusById(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.updateCommodityStatusById(req, res, next);
  // }
  //
  // /**
  //  * 更新指定商品资料的状态
  //  */
  // @Put('/updateCommodityById')
  // updateCommodityById(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.updateCommodityById(req, res, next);
  // }
  //
  // /**
  //  * 删除指定商品类型
  //  */
  // @Delete('/deleteSortById/:categoryId')
  // deleteSortById(@Req() req, @Res() res, @Next() next) {
  //   this.$sql.deleteSortById(req, res, next);
  // }

  /**
   * 删除指定商品单位
   */
  @Delete('/deleteUnitById/:unitId')
  deleteUnitById(@Req() req, @Res() res, @Next() next) {
    this.$sql.deleteUnitById(req, res, next);
  }

  /**
   * 删除指定商品的信息
   */
  @Put('/deleteCommodityById')
  deleteCommodityById(@Req() req, @Res() res, @Next() next) {
    this.$sql.deleteCommodityById(req, res, next);
  }

  /**
   * 模糊查询商品信息
   */
  @Get('/findLikeCommodity')
  async findLikeCommodity(@Req() req, @Res() res, @Next() next) {
    let ans = await this.$sql.findLikeCommodity(req, res, next);
    console.log(ans);
    return ans;
  }
}
