/**
 * Created by Administrator on 2017/5/10.
 */
import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import * as $util from '../../util/util';

import { InjectRepository } from '@nestjs/typeorm';
import { BillInfo } from 'src/entities/billInfo.entity';
import { getConnection, Repository } from 'typeorm';
import { InventoryInfo } from '../../entities/inventoryInfo.entity';
import { InventoryService } from './inventory.service';
import { parseForESLint } from '@typescript-eslint/parser';
import { PageInfo, ROLE_LEVEL_ADMIN } from '../../shop.decl';
import { Commodity } from '../../entities/commodity.entity';

const ADD = '添加';
const DEL = '删除';
const UPD = '更新';
const FIND = '查找';
const SAVE = '保存';
//使用连接池，提升性能
let pak = (ok: boolean, item: string, opr: string) => {
  return { code: ok, msg: item + opr + (ok ? '成功' : '失败') };
};
let page = (arr: any[], page?: number, currentPage?: number) => {
  let st = currentPage && page ? (currentPage - 1) * page : 0;
  let ed =
    currentPage && page ? Math.min(currentPage * page, arr.length) : arr.length;
  return arr.slice(st, ed);
};

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(BillInfo)
    private readonly $billInfo: Repository<BillInfo>,
    private readonly inventoryService: InventoryService,
  ) {
    console.log('BillService initial');
  }

  //添加收银单
  /**
   *
   * @param bills
   * - @param commoditys:{ commodityId: string, num: number, totalMoney: number }[]
   */
  async saveBill(req, res, next) {
    const bills = req.body.bills; //请求体中商品编号
    // const billId = $util.uuid(8, 10) //收银信息编号
    let values = [];
    // let len = data.length

    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let result = [];
    let errors = [];
    try {
      for (let bill of bills) {
        let resultTemp = [];
        const commodityInfos: {
          commodityId: string;
          commodityNum: number;
          totalMoney: number;
        }[] = bill.commodityInfos;
        // const commodityNumStrArr = billInfo.commodityNum;
        // let commodityNum = billInfo.commodityNum;
        // commodityNumStrArr.split(',').forEach((el) => {
        //   commodityNum.push(parseFloat(el));
        // });
        for (let i in commodityInfos) {
          let saveInventoryResult = [];
          let saveBillInfoResult = [];
          let billInfo = new BillInfo();
          this.$billInfo.manager.merge(
            BillInfo,
            billInfo,
            commodityInfos[i],
            bill,
          );
          let r1 = await queryRunner.manager.save(BillInfo, billInfo);
          saveBillInfoResult.push(r1);
          let r2 = await this.inventoryService.updateInventory({
            isPurchase: false,
            commodityId: billInfo.commodityId,
            num: billInfo.commodityNum,
          });
          console.log(billInfo);
          saveInventoryResult.push(r2.result);
          resultTemp.push({
            saveBillInfoResult: saveBillInfoResult,
            saveInventoryResult: saveInventoryResult,
          });
        }
        result.push(resultTemp);
      }
      queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      errors.push(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      //判空定错
      res.json({ errors: errors, result: result });
    }
  }

  //TODO groupby billId 然后算账
  //获取员工指定页数的收银单管理信息
  async findBillByEmployeeAndPage(req, res, next) {
    let findInfo = req.body.findInfo;
    // let pageInfo = JSON.parse(req.query.pageInfo)
    let pageInfo = req.body.pageInfo;
    let employeeId = findInfo.employeeId;
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let result = {};

    try {
      result = await queryRunner.manager.find(BillInfo, {
        employeeId: employeeId,
      });
      queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      result = pak(false, '收银单', FIND);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      $util.jsonWrite(res, result);
    }
  }

  //获取所有的进货单（管理员）
  //获取在日期范围内的
  async findBillByPage(req, res, next) {
    /**
     * findInfo :
     * {startDate
     * endDate
     * categoryId}
     * pageInfo:
     *  page:  每页显示数据条数
     currentPage :当前页
     }
     */
    if (!req.session.user || req.session.user.roleLevel < ROLE_LEVEL_ADMIN) {
      return;
    }
    let findInfo = req.body.findInfo;
    // let pageInfo = JSON.parse(req.query.pageInfo)
    let pageInfo: PageInfo = req.body.pageInfo;
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    let result = [];
    await queryRunner.startTransaction();
    let billInfos: BillInfo[] = [];
    let bills = [];
    let addedMap = {};
    let cnt = 0;
    try {
      billInfos = await this.$billInfo
        .createQueryBuilder('bi')
        .leftJoinAndSelect(Commodity, 'c', 'c.commodityId=ii.commodityId')
        .where(':startDate<ii.inventoryTime AND bi.billTime<=:endDate', {
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
        .getMany();
      //   .then(result => {
      //
      //   res.json({ errors: [], result: result });
      // }).catch(err => {
      //   console.log(err);
      //   res.json({ errors: err, result: [] });
      // });
      result.filter((el) => {
        !findInfo ||
          !findInfo.categoryId ||
          el.commodity.category == findInfo.categoryId;
      });
      for (let billInfo of billInfos) {
        if (!addedMap[billInfo.commodityId]) {
          cnt++,
            bills.push({
              billId: billInfo.billId,
              commoditys: [billInfo.commodity],
              commodityInfos: [
                {
                  commodityId: billInfo.commodityId,
                  num: billInfo.commodityNum,
                  totalMoney: billInfo.totalMoney,
                },
              ],
            });
        } else {
          bills[addedMap[billInfo.commodityId]].commoditys.push(
            billInfo.commodity,
          );
          bills[addedMap[billInfo.commodityId]].commodityInfos.push({
            commodityId: billInfo.commodityId,
            num: billInfo.commodityNum,
            totalMoney: billInfo.totalMoney,
          });
        }
      }

      await queryRunner.commitTransaction();
      result = page(bills, pageInfo.page, pageInfo.currentPage);
    } catch (err) {
      console.log(err);
      $util.jsonWrite(res, pak(false, '收银单', FIND));
      await queryRunner.rollbackTransaction();
    } finally {
      $util.jsonWrite(res, result);
      await queryRunner.release();
    }
  }

  //获取指定收银单的详细信息
  async findBillByBillId(req, res, next) {
    const querys = req.query;
    const billId = req.query.billId;
    return await this.$billInfo
      .find({ billId: billId })
      .then((result) => {
        $util.jsonWrite(res, result);
      })
      .catch((err) => {
        console.log(err);
        $util.jsonWrite(res, pak(false, `收银单${billId}`, FIND));
      });
  }

  async deleteBillByBillId(req, res, next) {
    const querys = req.query;
    const billId = querys.billId;
    const commodityId = req.query.commodity;
    this.$billInfo.manager
      .delete(BillInfo, { billId: billId, commodityId: commodityId })
      .then((result) => {
        $util.jsonWrite(res, pak(true, `收银单${billId}`, DEL));
      })
      .catch((err) => {
        console.log(err);
        $util.jsonWrite(res, pak(false, `收银单${billId}`, DEL));
      });
  }

  async saveOneBillInfo(req, res, next) {
    if (!req.session.user || req.user.session.employeeId < 2) {
      return;
    }
    const billInfo = req.billInfo;
    const billId = billInfo.billId;
    const commodityId = billInfo.commodityId;
    this.$billInfo
      .save(billInfo)
      .then((result) => {
        $util.jsonWrite(res, pak(true, `收银单信息${billId}`, SAVE));
      })
      .catch((err) => {
        console.log(err);
        $util.jsonWrite(res, pak(false, `收银单信息${billId}`, SAVE));
      });
  }
}
