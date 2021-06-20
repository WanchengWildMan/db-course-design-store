import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as mysql from 'mysql';
import { getConnection, Repository } from 'typeorm';
import { PurchaseInfo } from '../../entities/purchaseInfo.entity';
import * as $util from '../../util/util';
import { InventoryService } from './inventory.service';

const pak = (ok: boolean, item: string, opr: string) => {
  return { code: ok, msg: item + opr + (ok ? '成功' : '失败') };
};
const ADD = '添加';
const DEL = '删除';
const UPD = '更新';
const FIND = '查找';
const SAVE = '保存';

@Injectable()
export class PurchaseService {
  private readonly pool: mysql.Pool;

  constructor(
    @InjectRepository(PurchaseInfo)
    private readonly $purchase: Repository<PurchaseInfo>,
    private readonly $inventorySql: InventoryService,
  ) {}

  //添加进货单
  async saveOnePurchase(req, res, next) {
    const purchaseInfo = req.body.purchaseInfo;
    this.$purchase
      .save(purchaseInfo)
      .then((result) => {
        this.$inventorySql.updateInventory({
          isPurchase: true,
          commodityId: purchaseInfo.commodityId,
          num: purchaseInfo.commodityNum,
        });
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }

  /**
   *
   * @param purchaseInfos
   */
  async savePurchase(req, res, next) {
    const purchaseInfos = req.body.purchaseInfos;
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let result = [];
    let errors = [];
    try {
      for (let purchaseInfo of purchaseInfos) {
        //这里又是浅复制！！！！！！！！！！！
        const r = await queryRunner.manager.save(
          PurchaseInfo,
          Object.assign({}, purchaseInfo),
        );
        if (!purchaseInfo.purchaseId) {
          const r2 = await this.$inventorySql.updateInventory(
            {
              isPurchase: true,
              commodityId: purchaseInfo.commodityId,
              num: purchaseInfo.commodityNum,
            },
            queryRunner,
          );
          if (r2.errors.length > 0) throw new Error(r2.errors[0]);
        }
        result.push(r);
      }
    } catch (err) {
      console.log(err);
      errors.push(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      res.json({ errors: errors, result: result });
    }
  }

  //获取指定员工指定页数的进货单管理信息
  async findPurchaseByPage(req, res, next) {
    let findInfo = $util.getQueryInfo(req, 'findInfo', res);
    if (!findInfo.where) findInfo = { where: findInfo };
    let pageInfo = $util.getQueryInfo(req, 'pageInfo', res);
    if (pageInfo)
      pageInfo = {
        skip:
          pageInfo.page && pageInfo.currentPage
            ? (pageInfo.currentPage - 1) * pageInfo.page
            : 0,
        take: pageInfo.page ? pageInfo.page : undefined,
      };
    Object.assign(findInfo, pageInfo);
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let result = {};
    let errors = [];
    try {
      result = await queryRunner.manager.find(PurchaseInfo, findInfo);
      // console.log(result)
      queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      errors.push(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      res.json({ errors: errors, result: result });
    }
  }

  async deletePurchaseById(req, res, next) {
    const purchaseId = req.query.purchaseId;
    let purchase: PurchaseInfo = new PurchaseInfo();
    let errors = [];
    let result = [];
    try {
      purchase = await this.$purchase.findOne({ purchaseId: purchaseId });
    } catch (err) {
      res.json({ errors: err, result: [] });
    }
    if (!purchase)
      res.json({ errors: `不存在进货单${purchaseId}`, result: [] });
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let r = await queryRunner.manager.delete(PurchaseInfo, {
        purchaseId: purchaseId,
      });
      await this.$inventorySql.updateInventory(
        {
          isPurchase: false,
          commodityId: purchase.commodityId,
          num: purchase.commodityNum,
        },
        queryRunner,
      );
      queryRunner.commitTransaction();
      result.push(r);
    } catch (err) {
      errors.push(err);
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      res.json({ errors: errors, result: result });
    }
  }
}
