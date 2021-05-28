import {
  createConnection,
  EntityManager,
  getManager,
  Repository,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Commodity } from '../../entities/commodity.entity';
import * as $util from '../../util/util';
import { Category } from '../../entities/category.entity';
import { Unit } from '../../entities/unit.entity';

import { commoditySqlMap as $sql } from '../map/commodityMap';
import { InventoryInfo } from '../../entities/inventoryInfo.entity';

@Injectable()
export class CommodityService {
  constructor(
    @InjectRepository(Commodity)
    private readonly $commodity: Repository<Commodity>,
    @InjectRepository(Category)
    private readonly $category: Repository<Category>,
    @InjectRepository(Unit)
    private readonly $unit: Repository<Unit>,
    @InjectRepository(InventoryInfo)
    private readonly $inventory: Repository<InventoryInfo>,
  ) {}

  pak(ok: boolean, item: string, opr: string) {
    return { code: ok, msg: item + opr + (ok ? '成功' : '失败') };
  }

  readonly ADD = '添加';
  readonly DEL = '删除';
  readonly UPD = '更新';
  readonly FIND = '查找';

  /**
   *   添加一条商品信息
   */
  async saveCommodity(req, res, next) {
    const reqCom: Commodity = req.body;
    const commodityId = $util.uuid(8, 10);
    return await getManager()
      .transaction(async (entityManager: EntityManager) => {
        const commodity: { [propName: string]: any } = await entityManager.save(
          Commodity,
          reqCom,
        );
        //同时加入库存表
        const inventory = new InventoryInfo();
        this.$inventory.merge(inventory, { commodity: commodity });
        const store = await entityManager.insert(InventoryInfo, inventory);
      })
      .then((result) => {
        $util.jsonWrite(res, this.pak(true, '商品', this.ADD));
      })
      .catch((err) => {
        console.log(err);
        $util.jsonWrite(res, this.pak(false, '商品', this.ADD));
      });
  }

  /**
   *   删除指定id的商品单位
   */
  async deleteUnitById(req, res, next) {
    const param = req.params.unitId;
    return await this.$unit
      .delete({ unitId: param })
      .then((result) => {
        console.log(result);
        if (result.raw.affectedRows > 0)
          $util.jsonWrite(res, this.pak(true, '商品单位', this.DEL));
        else $util.jsonWrite(res, this.pak(false, '商品单位', this.DEL));
      })
      .catch((err) => {
        console.log(err);
        $util.jsonWrite(res, this.pak(false, '商品单位', this.DEL));
      });
  }

  /**
   *   删除指定id的商品信息
   */
  async deleteCommodityById(req, res, next) {
    const param: string = req.query.commodityId;
    return await this.$unit
      .delete(param)
      .then((result) => {
        $util.jsonWrite(res, this.pak(true, '商品信息', this.DEL));
      })
      .catch((err) => {
        console.log(err);
        $util.jsonWrite(res, this.pak(false, '商品信息', this.DEL));
      });
  }

  /**
   *  查询指定Id的商品信息
   */
  async findCommodityById(req, res, next): Promise<any> {
    const param: string = req.query.commodityId;
    return await (!param || param == ''
      ? this.$commodity.find()
      : this.$commodity.find({ commodityId: param })
    )
      .then((result) => {
        $util.jsonWrite(res, result);
      })
      .catch((err) => {
        console.log(err);
        $util.jsonWrite(res, this.pak(false, '商品信息', this.FIND));
      });
  }

  /**
   *   模糊查询商品 TODO
   */
  async findLikeCommodity(req, res, next) {
    let param = req.commodityKey;

    return await getManager()
      .find(Commodity, {
        where: $sql.findLikeCommodityWhere + ` LIKE '%${!param ? '' : param}%'`,
        join: {
          alias: 'c',
        },
      })
      .then((result) => {
        $util.jsonWrite(res, result);
      })
      .catch((err) => {
        console.log(err);
        $util.jsonWrite(res, this.pak(false, '商品信息', this.FIND));
      });

    // $util.closeConnection(res,)
    // .createQueryBuilder("c")
    // .leftJoinAndSelect(Unit,'u','c.commodityId=u.')
    // .where($sql.findLikeCommodityWhere, { str: param ? undefined : param })
    // .getMany();
  }

  /**
   *   添加一个新的商品类型
   */
  async saveSort(req, res, next) {
    const data: Category = req.body;
    return await this.$category
      .save(data)
      .then((result) => {
        $util.jsonWrite(res, this.pak(true, '商品类型', this.ADD));
      })
      .catch((err) => {
        console.log(err);
        $util.jsonWrite(res, this.pak(false, '商品类型', this.ADD));
      });
  }

  /**
   *   添加一条新的商品单位
   */
  async saveUnit(req, res, next) {
    const data: Unit = req.body;
    return await this.$unit
      .save(data)
      .then((result) => {
        $util.jsonWrite(res, this.pak(true, '商品单位', this.ADD));
      })
      .catch((err) => {
        console.log(err);
        $util.jsonWrite(res, this.pak(false, '商品单位', this.ADD));
      });
  }
}
