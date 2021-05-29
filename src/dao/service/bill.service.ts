/**
 * Created by Administrator on 2017/5/10.
 */
import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import * as $util from '../../util/util';
import { $conf } from '../../conf/db';
import { $sql } from '../map/billMap';
import { userSqlMap as $userSql } from '../map/userMap';

import async from 'async';
import Connection from 'mysql/lib/Connection';
import { InjectRepository } from '@nestjs/typeorm';
import { BillInfo } from 'src/entities/billInfo.entity';
import { getConnection, Repository } from 'typeorm';
import { InventoryInfo } from '../../entities/inventoryInfo.entity';
import { InventoryService } from './inventory.service';
import { parseForESLint } from '@typescript-eslint/parser';

const ADD = '添加';
const DEL = '删除';
const UPD = '更新';
const FIND = '查找';
const SAVE = '保存';
//使用连接池，提升性能
let pak = (ok: boolean, item: string, opr: string) => {
  return { code: ok, msg: item + opr + (ok ? '成功' : '失败') };
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
  async saveBill(req, res, next) {
    const data = req.body; //请求体中商品编号
    // const billId = $util.uuid(8, 10) //收银信息编号
    let values = [];
    let bills = data.billInfos;
    // let len = data.length

    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let results = [];
    try {
      for (let bill of bills) {
        const billInfo = new BillInfo();
        queryRunner.manager.merge(BillInfo, billInfo, bill);
        const commodityIds = bill.commodityIds;
        const commodityNumStrArr = billInfo.commodityNum;
        let commodityNum = billInfo.commodityNum;
        // commodityNumStrArr.split(',').forEach((el) => {
        //   commodityNum.push(parseFloat(el));
        // });
        let saveBillInfoResult = await queryRunner.manager.save(BillInfo, billInfo);
        let saveInventoryResults = [];
        for (let i in commodityIds) {
          let r = await this.inventoryService.updateInventory({
            isPurchase: false,
            commodityId: commodityIds[i],
            num: commodityNum[i],
          });
          saveInventoryResults.push(r.plainResult);
        }
        results.push({
          saveBillInfoResult: pak(saveBillInfoResult.billId != undefined, '收银单', SAVE),
          saveInventoryResults: saveInventoryResults,
        });
      }
      queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      $util.jsonWrite(res, results);
    }
  }

  //获取员工指定页数的收银单管理信息
  async findBillByEmployeeAndPage(req, res, next) {
    let findInfo = req.body.findInfo;
    // let pageInfo = JSON.parse(req.query.pageInfo)
    let pageInfo = req.body.pageInfo;
    let employeeId = req.findInfo.employeeId;
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
    // this.pool.getConnection((err, connection: Connection) => {
    //   if (err) return

    //   connection.beginTransaction((err) => {
    //     let getList = (callback) => {
    //       connection.query(
    //         $util.commonMergerSql(
    //           $sql.findBillByEmployeeAndPage,
    //           findInfo,
    //           pageInfo,
    //           false,
    //         ),
    //         req.session.user.id,
    //         (err, result) => {
    //           if (err) {
    //             callback(err, null)
    //           } else callback(null, result)
    //         },
    //       )
    //     }
    //     let getCount = (callback) => {
    //       connection.query(
    //         $util.commonMergerCountSql(
    //           $sql.findBillCountByEmployee,
    //           findInfo,
    //           true,
    //         ),
    //         req.session.user.id,
    //         (err, result) => {
    //           if (err) {
    //             callback(err, null)
    //           } else callback(null, result)
    //         },
    //       )
    //     }
    //     $util.commonCommit(res, [getList, getCount], connection)
    //   })
    // })
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
      // if (!req.session.user || req.session.user.roleId != 5) {
      //   return
      // }
    let findInfo = req.body.findInfo;
    // let pageInfo = JSON.parse(req.query.pageInfo)
    let pageInfo = req.body.pageInfo;

    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    let result = [];
    await queryRunner.startTransaction();
    let bills = [];
    try {
      bills = await queryRunner.manager.find(
        BillInfo,
        findInfo.categoryId,
      );
      await queryRunner.commitTransaction();
      result = bills.slice(
        (pageInfo.currentPage - 1) * pageInfo.page,
        Math.min(pageInfo.currentPage * pageInfo.page, bills.length),
      );

    } catch (err) {
      console.log(err);
      $util.jsonWrite(res, pak(false, '收银单', ADD));
      await queryRunner.rollbackTransaction();
    } finally {
      $util.jsonWrite(res, result);
      await queryRunner.release();
    }
    // this.pool.getConnection((err, connection: Connection) => {
    //   connection.beginTransaction((err) => {
    //     let getList = (callback) => {
    //       connection.query(
    //         $util.commonMergerSql(
    //           $sql.findBillByPage,
    //           findInfo,
    //           pageInfo,
    //           true,
    //         ),
    //         req.session.user.id,
    //         (err, result) => {
    //           if (err) {
    //             callback(err, null)
    //           } else callback(null, result)
    //         },
    //       )
    //     }
    //     let getCount = (callback) => {
    //       connection.query(
    //         $util.commonMergerCountSql(
    //           $sql.findBillCountByAdmin,
    //           findInfo,
    //           false,
    //         ),
    //         req.session.user.id,
    //         (err, result) => {
    //           if (err) {
    //             callback(err, null)
    //           } else callback(null, result)
    //         },
    //       )
    //     }
    //     $util.commonCommit(res, [getList, getCount], connection)
    //   })
    // })
  }

  //获取指定收银单的详细信息
  async findCommodityByBillId(req, res, next) {
    const querys = req.query;
    return await this.$billInfo
      .find({ billId: querys.billId })

      .then((result) => {
        $util.jsonWrite(res, pak(true, '收银单', ADD));
      })
      .catch((err) => {
        console.log(err);
        $util.jsonWrite(res, pak(false, '收银单', ADD));
      });
  }

  // //获取指定员工指定页数的进货单商品
  // findAllCommodityByEmployeeAndPage(req, res, next) {
  //   let findInfo = req.query.findInfo
  //   let pageInfo = JSON.parse(req.query.pageInfo)
  //   if (!req.session.user) {
  //     return
  //   }

  //   this.$billInfo.find({ s: findInfo.startDate })
  //   this.pool.getConnection((err, connection: Connection) => {
  //     connection.beginTransaction((err) => {
  //       if (err) return
  //       //获取指定数据
  //       let getList = (callback) => {
  //         let sql = ''
  //         let param = []
  //         if (req.session.user.roleId === 5) {
  //           sql = $util.commonMergerSql(
  //             $sql.findAllCommodityByAdminAndPage,
  //             findInfo,
  //             pageInfo,
  //             true,
  //           )
  //         } else {
  //           sql = $util.commonMergerSql(
  //             $sql.findBillCommodityCountByEmployee,
  //             findInfo,
  //             pageInfo,
  //             false,
  //           )
  //           param.push(req.session.user.id)
  //         }
  //         connection.query(sql, param, (err, result) => {
  //           if (err) {
  //             callback(err, null)
  //             return
  //           } else callback(null, result)
  //         })
  //       }
  //       //获取指定查询条件的总数
  //       let getCount = (callback) => {
  //         let countSql = ''
  //         let countParam = []
  //         if (req.session.user.roleId === 5) {
  //           countSql = $util.commonMergerCountSql(
  //             $sql.findBillCommodityCountByAdmin,
  //             findInfo,
  //             true,
  //           )
  //         } else {
  //           countSql = $util.commonMergerCountSql(
  //             $sql.findBillCommodityCountByEmployee,
  //             findInfo,
  //             true,
  //           )
  //           countParam.push(req.session.user.id)
  //         }
  //         connection.query(countSql, countParam, (err, result) => {
  //           if (err) {
  //             callback(err, null)
  //             return
  //           } else callback(null, result)
  //         })
  //       }
  //       $util.commonCommit(res, [getList, getCount], connection)
  //     })
  //   })
  // }
  // //获取收银单中商品信息的总数
  // findCountByInfo(req, res, next) {
  //   this.pool.getConnection((err, connection: Connection) => {
  //     if (err) throw err
  //     //TODO
  //     connection.query($sql.findBillCommodityCountByAdmin, (err, result) => {
  //       if (result) {
  //         result = pak(true, result)
  //       }
  //       $util.closeConnection(res, result, connection)
  //     })
  //   })
  // }
  // //删除收银单相关信息
  // deleteBillByBillId(req, res, next) {
  //   const param = req.params //参数
  //   this.pool.getConnection((err, connection: Connection) => {
  //     connection.beginTransaction((err) => {
  //       if (err) {
  //         console.log(err)
  //         return
  //       }

  //       let deleteBillByBillId = (callback) => {
  //         connection.query(
  //           $sql.deleteBillByBillId,
  //           param.billId,
  //           (err, result) => {
  //             if (err) {
  //               callback(err, null)
  //             } else callback(null, result)
  //           },
  //         )
  //       }
  //       //同时删除收银单的信息
  //       let deleteBillCommodityByBillId = (callback) => {
  //         connection.query(
  //           $sql.deleteBillCommodityByBillId,
  //           param.billId,
  //           (err, result) => {
  //             if (err) {
  //               callback(err, null)
  //             } else callback(null, result)
  //           },
  //         )
  //       }
  //       async.series(
  //         [deleteBillCommodityByBillId, deleteBillByBillId],
  //         (err, result) => {
  //           //有错误就回滚
  //           if (err) {
  //             connection.rollback(() => {
  //               $util.closeConnection(
  //                 res,
  //                 pak(false, '删除单据失败'),
  //                 connection,
  //               )
  //             })
  //             return
  //           }
  //           //提交
  //           connection.commit((err) => {
  //             if (err) {
  //               return
  //             }
  //             $util.closeConnection(res, pak(true, '删除单据成功'), connection)
  //           })
  //         },
  //       )
  //     })
  //   })
  // }
}
