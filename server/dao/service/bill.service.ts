/**
 * Created by Administrator on 2017/5/10.
 */
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import * as $util from '../../util/util';

import { InjectRepository } from '@nestjs/typeorm';
import { BillInfo } from 'server/entities/billInfo.entity';
import {
  createQueryBuilder,
  getConnection,
  getManager,
  Repository,
} from 'typeorm';
import { InventoryInfo } from '../../entities/inventoryInfo.entity';
import { InventoryService } from './inventory.service';
import { parseForESLint } from '@typescript-eslint/parser';
import { PageInfo, ROLE_LEVEL_ADMIN } from '../../shop.decl';
import { Commodity } from '../../entities/commodity.entity';
import { validate } from 'class-validator';
import { BillToPeople } from 'server/entities/billToPeople.entity';

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
    @InjectRepository(Commodity)
    private readonly $commodity: Repository<Commodity>,
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
        let billExtend = Object.assign({}, bill);
        billExtend.billInfos = undefined;
        //把顾客员工存了
        let billSaved = await getManager()
          .getRepository(BillToPeople)
          .save(billExtend);
        // .save(bill);
        for (let i in bill.billInfos)
          Object.assign(bill.billInfos[i], { billId: billSaved.billId });
        let resultTemp = [];
        for (let billInfo of bill.billInfos) {
          let r1 = await this.$billInfo.save(billInfo);
          let r2 = await this.inventoryService.updateInventory({
            isPurchase: false,
            commodityId: billInfo.commodityId,
            num: billInfo.commodityNum,
          });
          resultTemp.push({
            saveBillInfoResult: r1,
            saveInventoryResult: r2.result,
          });

          // console.log(billInfo);
        }

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
        // for (let i in commodityInfos) {
        //   let saveInventoryResult = [];
        //   let saveBillInfoResult = [];
        //   let billInfo = new BillInfo();
        //   this.$billInfo.manager.merge(
        //     BillInfo,
        //     billInfo,
        //     commodityInfos[i],
        //     bill,
        //   );
        //   let r1 = await queryRunner.manager.save(BillInfo, billInfo);
        //   saveBillInfoResult.push(r1);

        // }
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
    let findInfo = $util.getQueryInfo(req, 'findInfo', res);
    // let pageInfo = $util.getQueryInfo(req, 'pageInfo', res)
    let pageInfo = $util.getQueryInfo(req, 'pageInfo', res);
    let employeeId = findInfo.employeeId;
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let result = {};

    try {
      result = await queryRunner.manager
        .createQueryBuilder(BillInfo, 'bi')
        .leftJoinAndSelect('bi.employeeId', '', 'bp.billId=bi.billId')
        .leftJoinAndMapOne(
          'bi.commodity',
          Commodity,
          'commodity',
          'commodity.commodityId=bi.commodityId',
        )
        .leftJoinAndMapOne(
          'bi.customerId',
          BillToPeople,
          'bp',
          'bp.billId=bp.billId',
        )
        .getOne();
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
    let notGroup = req.query.notGroup;
    let findInfo = $util.getQueryInfo(req, 'findInfo', res);
    const whereStr = !(findInfo.startDate || findInfo.endDate)
      ? findInfo
      : `${
          findInfo.startDate ? new Date(findInfo.startDate) : new Date(0)
        }<bi.createDate AND bi.createDate<=${
          findInfo && findInfo.endDate ? findInfo.endDate : new Date(Date.now())
        }`;
    // let pageInfo = $util.getQueryInfo(req, 'pageInfo', res)
    let pageInfo: PageInfo = $util.getQueryInfo(req, 'pageInfo', res);
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    let result = [];
    let errors = [];
    await queryRunner.startTransaction();
    let billInfos = [];
    let bills = [];
    let addedMap = {};
    let cnt = 0;
    try {
      if (notGroup) {
        billInfos = await getManager()
          .createQueryBuilder(BillInfo, 'bi')
          .leftJoinAndMapOne(
            'bi.billUser',
            BillToPeople,
            'bp',
            'bi.billId=bp.billId',
          )
          .leftJoinAndMapOne(
            'bi.commodity',
            Commodity,
            'commodity',
            'commodity.commodityId=bi.commodityId',
          )
          .where(whereStr)
          .getMany();

        // for (let i in billInfos) {
        //   let billInfo = billInfos[i];
        //   billInfos[i].billUser.password = undefined;
        //   billInfos[i].IdCard = undefined;
        // }
        // billInfos = await this.$billInfo.find({
        //   where: !(findInfo.startDate || findInfo.endDate)
        //     ? findInfo
        //     : `${
        //         findInfo.startDate ? new Date(findInfo.startDate) : new Date(0)
        //       }<bi.billTime AND bi.billTime<=${
        //         findInfo && findInfo.endDate
        //           ? findInfo.endDate
        //           : new Date(Date.now())
        //       }`,
        // });
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
        // console.log(billInfos);
        await queryRunner.commitTransaction();
        result = page(billInfos, pageInfo.page, pageInfo.currentPage);
      } else {
        bills = await getManager().getRepository(BillToPeople).find();

        // bills=bills.filter(e=>{<=e.billInfos[0].createDate &&
        //   e.billInfos[0].createDate <= findInfo.endDate;})
        // for (let billInfo of billInfos) {
        //   if (!addedMap[billInfo.commodityId]) {
        //     cnt++,
        //       bills.push({
        //         billId: billInfo.billId,
        //         commoditys: [billInfo.commodity],
        //         billUser: billInfos['billUser'],
        //         commodityInfos: [
        //           {
        //             commodityId: billInfo.commodityId,
        //             num: billInfo.commodityNum,
        //             totalMoney: billInfo.totalMoney,
        //           },
        //         ],
        //       });
        //   } else {
        //     bills[addedMap[billInfo.commodityId]].commoditys.push(
        //       billInfo.commodity,
        //     );
        //     bills[addedMap[billInfo.commodityId]].commodityInfos.push({
        //       commodityId: billInfo.commodityId,
        //       num: billInfo.commodityNum,
        //       totalMoney: billInfo.totalMoney,
        //     });
        //   }
        // }
        result = page(bills, pageInfo.page, pageInfo.currentPage);
      }
    } catch (err) {
      console.log(err);
      errors.push(err);
      await queryRunner.rollbackTransaction();
    } finally {
      res.json({ errors: errors, result: result });
      await queryRunner.release();
    }
  }

  //获取指定收银单的详细信息
  async findBillByBillId(req, res, next) {
    const querys = req.query;
    const billId = req.query.billId;
    return await getManager()
      .getRepository(BillToPeople)
      .find({ billId: billId })
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: [err], result: [] });
      });
  }

  async deleteBillByBillId(req, res, next) {
    const querys = req.query;
    const billId = querys.billId;
    const commodityId = req.query.commodityId;
    let deleteInfo = {};
    if (billId) Object.assign(deleteInfo, billId);
    if (commodityId) Object.assign(deleteInfo, commodityId);
    console.log(deleteInfo);
    if (Object.keys(deleteInfo).length == 0)
      throw new ForbiddenException('无法删除！');
    else
      this.$billInfo.manager
        .delete(BillInfo, deleteInfo)
        .then((result) => {
          res.json({ errors: [], result: result });
        })
        .catch((err) => {
          console.log(err);
          // $util.jsonWrite(res, pak(false, `收银单${billId}`, DEL));
          res.json({ errors: [err], result: [] });
        });
  }

  async saveOneBillInfo(req, res, next) {
    let billInfo = req.body.billInfo;
    const billId = billInfo.billId;
    if (billId == '') billInfo.billId = undefined;
    billInfo.commodity = undefined;
    const commodityId = billInfo.commodityId;
    console.log(billInfo);
    this.$billInfo
      .save(billInfo)
      .then((result) => {
        console.log(billInfo);
        console.log(result);
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: [err], result: [] });
      });
  }
}
