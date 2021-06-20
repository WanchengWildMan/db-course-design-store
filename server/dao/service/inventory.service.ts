//实现与mysql数据库交互
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { Commodity } from '../../entities/commodity.entity';
import { InventoryInfo } from '../../entities/inventoryInfo.entity';
import { PageInfo } from '../../shop.decl';
import * as $util from '../../util/util';

//使用连接池，提升性能
let pak = (ok: boolean, item: string, opr: string) => {
  return { code: ok, msg: item + opr + (ok ? '成功' : '失败') };
};
const ADD = '添加';
const DEL = '删除';
const UPD = '更新';
const FIND = '查找';

/**
 * 不允许直接删除，必须等商品删除后一并
 */
@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryInfo)
    private readonly $inventoryInfo: Repository<InventoryInfo>,
    @InjectRepository(Commodity)
    private readonly $commodity: Repository<Commodity>,
  ) {}

  async updateInventory(
    updateInfo: {
      commodityId: string;
      isPurchase: boolean;
      num: number;
    },
    qR?,
  ) {
    let queryRunner = qR ? qR : getConnection().createQueryRunner();
    let errors = [];
    let result = {};
    let commodityId = updateInfo.commodityId;
    let isPurchase = updateInfo.isPurchase;
    let num = updateInfo.num;
    // await queryRunner.connect()
    // await queryRunner.startTransaction()
    try {
      let inventoryInfo = await queryRunner.manager
        .getRepository(InventoryInfo)
        .findOne({
          commodityId: updateInfo.commodityId,
        });
      if (!inventoryInfo.quantityUpperLimit)
        inventoryInfo.quantityUpperLimit = 10000000;
      if (isPurchase != null && isPurchase != undefined) {
        let zf = isPurchase ? 1 : -1;
        let toNum = inventoryInfo.inventoryNum + zf * num;
        if (
          toNum < inventoryInfo.quantityLowerLimit ||
          toNum > inventoryInfo.quantityUpperLimit
        ) {
          if (zf == 1) throw new ForbiddenException('超出库存上限，禁止进货！');
          else if (zf == -1)
            throw new ForbiddenException('低于库存下限，禁止出货！');
        }
      }
      result = await queryRunner.manager
        .getRepository(InventoryInfo)
        .increment(
          { commodityId: updateInfo.commodityId },
          'inventoryNum',
          updateInfo.isPurchase ? updateInfo.num : -updateInfo.num,
        );
    } catch (err) {
      console.log(err);
      errors.push(err);
    } finally {
      return { errors: errors, result: result };
    }
  }

  /**
   * findInfo:
   * startDate
   * endDate
   * categoryId
   * employeeId
   */
  async findInventoryByPage(req, res, next) {
    // console.log(req);
    // if (!req.session.user || req.session.user.roleId == 1) {
    //   return;
    // }
    let findInfo = $util.getQueryInfo(req, 'findInfo', res);
    let pageInfo: PageInfo = $util.getQueryInfo(req, 'pageInfo', res);
    this.$inventoryInfo
      .createQueryBuilder('ii')
      .leftJoinAndMapOne(
        'ii.commodity',
        Commodity,
        'commodity',
        'commodity.commodityId=ii.commodityId',
      )
      .leftJoinAndMapOne(
        'ii.category',
        'category',
        'category',
        'category.categoryId=commodity.categoryId',
      )
      .where(':startDate<ii.inventoryTime AND ii.inventoryTime<=:endDate', {
        //FIXME
        startDate:
          findInfo && findInfo.startDate
            ? new Date(findInfo.startDate)
            : new Date(0),
        endDate:
          findInfo && findInfo.endDate
            ? findInfo.endDate
            : new Date(Date.now()),
      })
      .getMany()
      .then((result) => {
        // console.log(result)
        result.filter((el) => {
          !findInfo ||
            !findInfo.categoryId ||
            el.commodity.category.categoryId == findInfo.categoryId;
        });
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }

  async saveInventoryLimitById(inventoryInfo) {
    inventoryInfo = Object.assign(
      {},
      {
        commodityId: inventoryInfo.commodityId,
        quantityLowerLimit: inventoryInfo.quantityLowerLimit,
        quantityUpperLimit: inventoryInfo.quantityUpperLimit,
      },
    );
    return await this.$inventoryInfo.save(inventoryInfo);
  }
  async forceUpdateInventory(inventoryInfo) {
    return await this.$inventoryInfo.update(
      { commodityId: inventoryInfo.commodityId },
      inventoryInfo,
    );
  }
}
