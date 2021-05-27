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

//使用连接池，提升性能
let pak = function (code, result) {
  return {
    code: code,
    msg: result,
  };
};
@Injectable()
export class BillService {
  private readonly pool: mysql.Pool;
  constructor() {
    this.pool = mysql.createPool($util.extend({}, $conf.mysql));
  }
  //添加收银单
  saveBill(req, res, next) {
    const bill = req.body; //请求体中商品编号
    const billId = $util.uuid(8, 10); //收银信息编号
    let values = [];
    let data = bill.billInfo;
    let len = data.length;
    for (let i = 0; i < len; i++) {
      values.push([
        $util.uuid(8, 10),
        billId,
        data[i].commodityId,
        data[i].commodityNum,
      ]);
    }
    this.pool.getConnection((err, connection: Connection) => {
      connection.beginTransaction((err) => {
        if (err) {
          console.log(err);
          return;
        }
        //收银单的商品信息
        let saveCommodityOfBill = (callback) => {
          connection.query(
            $sql.saveCommodityOfBill,
            //!!!!!!!!!
            [values],
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        //收银单的其他信息
        let saveBillOfOther = (callback) => {
          let billList = bill.billList;
          connection.query(
            $sql.saveBillOfOther,
            [
              billId,
              billList.member.memberId == '' ? null : billList.member.memberId,
              billList.cashierId == ''
                ? req.session.user.id
                : billList.cashierId,
              parseFloat(billList.totalMoney),
              billList.totalNum,
              billList.systemTime,
              new Date(),
            ],
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        //更新商品库存数量信息
        let updateCommodityFaceNum = (callback) => {
          if (!req.session.user) {
            callback(err, null);
            return;
          }
          let commodityValues = [];
          for (let i = 0; i < len; i++) {
            commodityValues.push([data[i].commodityNum, data[i].commodityId]);
          }

          commodityValues.forEach(
            function (item) {
              connection.query(
                $sql.updateBillToStore,
                [item[0], item[1]],
                // (err, result) => {
                //   if (err) {
                //     callback(err, null);
                //     return;
                //   }
                //   callback(null, result);
                // }
              );
            },
            () => {
              callback(null, '');
            },
          );
        };
        //如果是会员，则添加次数和累计消费金额
        let updateMemberConsume = (callback) => {
          let param = bill.billList;
          if (param.member.memberId !== '') {
            connection.query(
              $userSql.member.updateMemberConsume,
              [parseFloat(param.totalMoney), param.member.memberId],
              (err, result) => {
                if (err) {
                  callback(err, null);
                  return;
                }
                callback(null, result);
              },
            );
          } else {
            callback(null, '');
          }
        };
        async.series(
          [
            saveBillOfOther,
            saveCommodityOfBill,
            updateCommodityFaceNum,
            // TODO
            // updateMemberConsume,
          ],
          (err, result) => {
            if (err) {
              connection.rollback(() => {
                $util.closeConnection(
                  res,
                  pak(false, '添加收银单失败'),
                  connection,
                );
              });
              return;
            }
            //提交
            connection.commit((err) => {
              if (err) {
                return;
              }
              $util.closeConnection(
                res,
                pak(true, '添加收银单成功'),
                connection,
              );
            });
          },
        );
      });
    });
  }

  //获取员工指定页数的收银单管理信息
  findBillByEmployeeAndPage(req, res, next) {
    if (!req.session.user) {
      return;
    }
    this.pool.getConnection((err, connection: Connection) => {
      if (err) return;
      let findModel = req.query.findModel;
      let pageModel = JSON.parse(req.query.pageModel);
      connection.beginTransaction((err) => {
        let getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.findBillByEmployeeAndPage,
              findModel,
              pageModel,
              false,
            ),
            req.session.user.id,
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        let getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.findBillCountByEmployee,
              findModel,
              true,
            ),
            req.session.user.id,
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        $util.commonCommit(res, [getList, getCount], connection);
      });
    });
  }
  //获取所有的进货单（管理员）
  findBillByPage(req, res, next) {
    if (!req.session.user || req.session.user.roleId != 5) {
      return;
    }
    this.pool.getConnection((err, connection: Connection) => {
      let findModel = req.query.findModel;
      let pageModel = JSON.parse(req.query.pageModel);
      connection.beginTransaction((err) => {
        let getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.findBillByPage,
              findModel,
              pageModel,
              true,
            ),
            req.session.user.id,
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        let getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.findBillCountByAdmin,
              findModel,
              false,
            ),
            req.session.user.id,
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        $util.commonCommit(res, [getList, getCount], connection);
      });
    });
  }
  //获取指定收银单的详细信息
  findCommodityByBillId(req, res, next) {
    const param = req.query;
    this.pool.getConnection((err, connection: Connection) => {
      if (err) throw err;
      connection.query(
        $sql.findCommodityByBillId,
        param.billId,
        (err, result) => {
          if (result) {
            result = {
              code: true,
              result: result,
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
  //获取指定员工指定页数的进货单商品
  findAllCommodityByEmployeeAndPage(req, res, next) {
    let findModel = req.query.findModel;
    let pageModel = JSON.parse(req.query.pageModel);
    if (!req.session.user) {
      return;
    }
    this.pool.getConnection((err, connection: Connection) => {
      connection.beginTransaction((err) => {
        if (err) return;
        //获取指定数据
        let getList = (callback) => {
          let sql = '';
          let param = [];
          if (req.session.user.roleId === 5) {
            sql = $util.commonMergerSql(
              $sql.findAllCommodityByAdminAndPage,
              findModel,
              pageModel,
              true,
            );
          } else {
            sql = $util.commonMergerSql(
              $sql.findBillCommodityCountByEmployee,
              findModel,
              pageModel,
              false,
            );
            param.push(req.session.user.id);
          }
          connection.query(sql, param, (err, result) => {
            if (err) {
              callback(err, null);
              return;
            } else callback(null, result);
          });
        };
        //获取指定查询条件的总数
        let getCount = (callback) => {
          let countSql = '';
          let countParam = [];
          if (req.session.user.roleId === 5) {
            countSql = $util.commonMergerCountSql(
              $sql.findBillCommodityCountByAdmin,
              findModel,
              true,
            );
          } else {
            countSql = $util.commonMergerCountSql(
              $sql.findBillCommodityCountByEmployee,
              findModel,
              true,
            );
            countParam.push(req.session.user.id);
          }
          connection.query(countSql, countParam, (err, result) => {
            if (err) {
              callback(err, null);
              return;
            } else callback(null, result);
          });
        };
        $util.commonCommit(res, [getList, getCount], connection);
      });
    });
  }
  //获取收银单中商品信息的总数
  findCountByInfo(req, res, next) {
    this.pool.getConnection((err, connection: Connection) => {
      if (err) throw err;
      //TODO
      connection.query($sql.findBillCommodityCountByAdmin, (err, result) => {
        if (result) {
          result = pak(true, result);
        }
        $util.closeConnection(res, result, connection);
      });
    });
  }
  //删除收银单相关信息
  deleteBillByBillId(req, res, next) {
    const param = req.params; //参数
    this.pool.getConnection((err, connection: Connection) => {
      connection.beginTransaction((err) => {
        if (err) {
          console.log(err);
          return;
        }

        let deleteBillByBillId = (callback) => {
          connection.query(
            $sql.deleteBillByBillId,
            param.billId,
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        //同时删除收银单的信息
        let deleteBillCommodityByBillId = (callback) => {
          connection.query(
            $sql.deleteBillCommodityByBillId,
            param.billId,
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        async.series(
          [deleteBillCommodityByBillId, deleteBillByBillId],
          (err, result) => {
            //有错误就回滚
            if (err) {
              connection.rollback(() => {
                $util.closeConnection(
                  res,
                  pak(false, '删除单据失败'),
                  connection,
                );
              });
              return;
            }
            //提交
            connection.commit((err) => {
              if (err) {
                return;
              }
              $util.closeConnection(res, pak(true, '删除单据成功'), connection);
            });
          },
        );
      });
    });
  }
}
