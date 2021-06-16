/**
 * Created by Administrator on 2017/5/10.
 */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
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
import { Employee } from 'server/entities/employee.entity';
import { Category } from 'server/entities/category.entity';

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
        let isinsert = false;
        if (!bill.billId) isinsert = true;
        billExtend.billInfos = undefined;
        //把顾客员工存了
        let billSaved = await queryRunner.manager
          .getRepository(BillToPeople)
          .save(billExtend);
        // .save(bill);
        for (let i in bill.billInfos)
          Object.assign(bill.billInfos[i], { billId: billSaved.billId });
        let resultTemp = [];
        if (bill.billInfos.length == 0) {
          resultTemp.push({
            saveBillInfoResult: { errors: ['不能添加空账单！'], result: [] },
            saveInventoryResult: { result: [], errors: ['不能添加空账单！'] },
          });
        }
        for (let billInfo of bill.billInfos) {
          let r1 = await queryRunner.manager
            .getRepository(BillInfo)
            .save(billInfo);
          let r2 = {};
          if (isinsert) {
            let r2Temp = await this.inventoryService.updateInventory({
              isPurchase: false,
              commodityId: billInfo.commodityId,
              num: billInfo.commodityNum,
            },queryRunner);
            if (r2Temp.errors.length > 0) {
              throw new BadRequestException(r2Temp.errors[0]);
            }
            r2 = r2Temp.result;
          }
          resultTemp.push({
            saveBillInfoResult: r1,
            saveInventoryResult: r2,
          });

          // console.log(billInfo);
        }

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
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      errors.push(err);
      console.log('-------------------');
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      //判空定错
      res.json({ errors: errors, result: result });
    }
  }

  async findBillGroupByCategory(req, res, next) {
    let findInfo = $util.getQueryInfo(req, 'findInfo', res);
    findInfo = { where: findInfo };
    try {
      // let result = await getManager()
      //   .createQueryBuilder(BillInfo, 'bi')
      //   .leftJoinAndMapOne('bi.commodity', 'c', 'c.commodityId=bi.commodityId')
      //   .leftJoinAndMapOne('bi.category',Category, 'ca', 'ca.categoryId=c.categoryId')
      //   .select(['SUM(bi.totalMoney) as totalMoney'  ,'SUM(bi.commodityNum) as commodityNum','ca.name as name'])
      //   .getMany();
      let result = await getManager().query(`
SELECT
	SUM(bi.commodityNum) AS num,SUM(bi.totalMoney) AS money,ca.NAME AS categoryName 
FROM
	bill_info bi
	LEFT JOIN commodity c ON c.commodityId = bi.commodityId
	LEFT JOIN category ca ON ca.categoryId = c.categoryId 
GROUP BY
	ca.name
      `);
      res.json({ errors: [], result: result });
    } catch (err) {
      console.log(err);
      res.status(400).json({ errors: [err], result: [] });
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
    let errors = [];
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
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      errors.push(err);
      res.status(400).json({ errors: [err], result: [] });
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      res.json({ errors: errors, result: result });
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
    if (notGroup === 'false') notGroup = false;
    let findInfo = $util.getQueryInfo(req, 'findInfo', res);
    if (findInfo.where) findInfo = findInfo.where;
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
          //不能map内2层的对象！
          .leftJoinAndMapOne(
            'bi.commodity',
            Commodity,
            'commodity',
            'commodity.commodityId=bi.commodityId',
          )
          .leftJoinAndMapOne(
            'bi.category',
            Category,
            'category',
            'category.categoryId=commodity.categoryId',
          )
          //三层不行，必须单独开一个属性
          .leftJoinAndMapOne(
            'bi.employee',
            Employee,
            'e',
            'e.employeeId=bp.employeeId',
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
        // result.filter((el) => {
        //   !findInfo ||
        //     !findInfo.categoryId ||
        //     el.commodity.category == findInfo.categoryId;
        // });
        // console.log(billInfos);
        await queryRunner.commitTransaction();
        result = page(billInfos, pageInfo.page, pageInfo.currentPage);
      } else {
        bills = await getManager().getRepository(BillToPeople).find(whereStr);

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
    console.log(billId);
    const commodityId = req.query.commodityId;
    let deleteInfo = {};
    let errors = [];
    let result = [];
    if (billId) Object.assign(deleteInfo, { billId: billId });

    if (commodityId) Object.assign(deleteInfo, { commodityId: commodityId });
    console.log(deleteInfo);
    if (Object.keys(deleteInfo).length == 0)
      throw new ForbiddenException('未给定信息！无法删除！');
    else {
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        let billExists = await queryRunner.manager.find(BillInfo, deleteInfo);
        for (let billInfo of billExists) {
          result.push(await queryRunner.manager.delete(BillInfo, deleteInfo));
          await this.inventoryService.updateInventory({
            isPurchase: true,
            commodityId: billInfo.commodityId,
            num: billInfo.commodityNum,
          });
        }
        queryRunner.commitTransaction();
      } catch (err) {
        console.log(err);
        errors.push(err);
      } finally {
        if (result.length == 0 && errors.length == 0)
          errors = ['删除失败！该收银单已删除'];
        await queryRunner.release();
        res.json({ errors: errors, result: result });
      }
    }
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
