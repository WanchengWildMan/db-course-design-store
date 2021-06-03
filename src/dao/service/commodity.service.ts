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
import { validate } from 'class-validator';
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
    const reqCom: Commodity = req.body.commodity;
    const errors = await validate(reqCom);
    if (errors.length > 0) {
      res.json({ errors: errors, result: [] });
    } else
      return await getManager()
        .transaction(async (entityManager: EntityManager) => {
          const commodity: { [propName: string]: any } =
            await entityManager.save(Commodity, reqCom);
          //同时加入库存表
          const inventory = new InventoryInfo();
          this.$inventory.merge(inventory, { commodity: commodity });
          const store = await this.$inventory.save(inventory);
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
    const unitId = req.query.unitId;
    return await this.$unit
      .delete(unitId)
      .then((result) => {
        console.log(result);
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }

  /**
   *   删除指定id的商品信息
   */
  async deleteCommodityById(req, res, next) {
    const commodityId = req.query.commodityId;
    return await this.$commodity
      .save({ commodityId: commodityId, Status: -1 })
      .then((result) => {
        //库存会被级联删除
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }

  /**
   *  查询指定Id的商品信息
   */
  async findCommodityById(req, res, next): Promise<any> {
    const commodityId: string = req.query.commodityId;
    const findInfo =
      !commodityId || commodityId == '' ? null : { commodityId: commodityId };
    this.$commodity
      .find(findInfo)
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }

  /**
   *   模糊查询商品 TODO
   */
  async findCommodityByPage(req, res, next) {
    let pageInfo = req.body.pageInfo;
    let findInfo = req.body.findInfo;
    let key = findInfo.key;
    const COMMODITY_ALIAS = 'c';
    if (key != undefined) {
      Object.assign(findInfo, {
        where: `concat(${Object.keys(new Commodity()).map((e) => {
          return `${COMMODITY_ALIAS}.` + e;
        })}) LIKE '%${!key ? '' : key}%'`,
      });
    } else findInfo = { where: findInfo };

    Object.assign(findInfo, {
      join: {
        alias: COMMODITY_ALIAS,
      },
    });
    console.log(findInfo);
    return await getManager()
      .find(Commodity, findInfo)
      .then((result) => {
        result = pageInfo
          ? $util.page(result, pageInfo.page, pageInfo.currentPage)
          : result;
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
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
  async saveCategory(req, res, next) {
    const data: Category = req.body.category;
    return await this.$category
      .save(data)
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }

  /**
   *   添加一条新的商品单位
   */
  async saveUnit(req, res, next) {
    const unit = req.body.unit;
    return await this.$unit
      .save(unit)
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }
  async findUnitById(req, res, next) {
    const unitId = req.query.unitId;
    const findInfo = unitId ? { unitId: unitId } : null;
    return await this.$unit
      .find(findInfo)
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }
  async findUnitByPage(req, res, next) {
    let findInfo = req.body.findInfo;
    findInfo = { where: findInfo };
    this.$unit
      .find(findInfo)
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }
}
