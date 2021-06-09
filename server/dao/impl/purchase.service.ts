import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import * as crypto from 'crypto';
import * as $util from '../../util/util';
import { $conf } from '../../conf/db';
import { purchaseMapSql as $sql } from '../map/purchaseMap';
import async from 'async';
import Connection from 'mysql/lib/Connection';
const pak = function (code, msg) {
  return {
    code: code,
    msg: msg,
  };
};

@Injectable()
export class PurchaseService {
  private readonly pool: mysql.Pool;
  constructor() {
    this.pool = mysql.createPool($util.extend({}, $conf.mysql));
    crypto;
  }
  //添加进货单
  savePurchase(req, res, next) {
    const purchase = req.body;
    const serialId = $util.uuid(8, 10); //入库流水号
    const reviewId = $util.uuid(8, 10); //入库审核号
    const values = [];
    const len = purchase.purchaseCommodityData.length;
    const data = purchase.purchaseCommodityData;
    for (let i = 0; i < len; i++) {
      values.push([
        $util.uuid(8, 10),
        serialId,
        data[i].commodityId,
        data[i].num,
      ]);
    }
    this.pool.getConnection((err, connection: Connection) => {
      connection.beginTransaction((err) => {
        if (err) {
          console.log(err);
          return;
        }
        //进货单中的进货信息
        const savePurchaseOfCommodity = (callback) => {
          connection.query(
            $sql.savePurchaseOfCommodity,
            [values],
            (err, result) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        //进货单的其他信息
        const savePurchaseOfOther = (callback) => {
          connection.query(
            $sql.savePurchaseOfOther,
            [
              serialId,
              purchase.serialDate,
              parseFloat(purchase.totalMoney),
              reviewId,
              purchase.serialDesc,
            ],
            (err, result) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        //进货单审核信息
        const savePurchaseOfReview = (callback) => {
          if (!req.session.user) {
            callback(err, null);
            return;
          }
          connection.query(
            $sql.savePurchaseOfReview,
            [reviewId, req.session.user.id, new Date(), null, null, 1],
            (err, result) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        async.series(
          [savePurchaseOfReview, savePurchaseOfOther, savePurchaseOfCommodity],
          (err, result) => {
            if (err) {
              //错误回滚
              connection.rollback(() => {
                $util.closeConnection(
                  res,
                  pak(false, '添加进货单失败'),
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
                pak(true, '添加进货单成功'),
                connection,
              );
            });
          },
        );
      });
    });
  }
  //获取指定员工指定页数的进货单管理信息(我的进货单)
  findPurchaseByEmployeeAndPage(req, res, next) {
    if (!req.session.user) {
      return;
    }
    this.pool.getConnection((err, connection: Connection) => {
      if (err) return;
      const findInfo = req.query.findInfo;
      const pageInfo = $util.getQueryInfo(req, 'pageInfo', res);
      connection.beginTransaction((err) => {
        const getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.findPurchaseByEmployeeAndPage,
              findInfo,
              pageInfo,
              false,
            ),
            req.session.user.id,
            (err, result) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        const getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.findPurchaseCountByEmployee,
              findInfo,
              true,
            ),
            req.session.user.id,
            (err, result) => {
              if (err) {
                console.error(err);
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
  findPurchaseByPage(req, res, next) {
    if (!req.session.user || req.session.user.roleId !== 5) {
      return;
    }
    this.pool.getConnection((err, connection: Connection) => {
      if (err) return;
      const findInfo = req.query.findInfo;
      const pageInfo = $util.getQueryInfo(req, 'pageInfo', res);
      connection.beginTransaction((err) => {
        const getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.findPurchaseByPage,
              findInfo,
              pageInfo,
              false,
            ),
            (err, result) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        const getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.findPurchaseCountByAdmin,
              findInfo,
              true,
            ),
            req.session.user.id,
            (err, result) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        $util.commonCommit(res, [getList, getCount], connection);
      });
    });
    /*this.pool.getConnection((err, connection:Connection)=> {
          connection.query($sql.findPurchaseByPage, (err, result) => {
            let r = {};
            if(result) {
              r = {
                code : true,
                result: result
              }
            }
            $util.closeConnection(res, r,connection);
          });
        });*/
  }
  //查询进货单操作信息
  findPurchaseListMessage(req, res, next) {
    const params = req.query;
    this.pool.getConnection((err, connection: Connection) => {
      connection.beginTransaction((err) => {
        if (err) {
          console.log(err);
          return;
        }
        const findCommodityByPurchaseId = (callback) => {
          connection.query(
            $sql.findCommodityByPurchaseId,
            [params.serialId],
            (err, result) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        const findReviewByReviewId = (callback) => {
          connection.query(
            $sql.findReviewByReviewId,
            [params.reviewId],
            (err, result) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        const findPurchaseOtherByPurchaseId = (callback) => {
          connection.query(
            $sql.findPurchaseOtherByPurchaseId,
            [params.serialId],
            (err, result) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        async.series(
          [
            findCommodityByPurchaseId,
            findReviewByReviewId,
            findPurchaseOtherByPurchaseId,
          ],
          (err, result) => {
            const r = function (code, msg) {
              return {
                code: code,
                result: result,
                msg: msg,
              };
            };
            if (err) {
              //错误回滚
              connection.rollback(() => {
                $util.closeConnection(
                  res,
                  pak(false, '获取进货单失败'),
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
                pak(true, '获取进货单成功'),
                connection,
              );
            });
          },
        );
      });
    });
  }
  //获取指定员工指定页数的进货单商品
  findAllPurchaseByEmployeeAndPage(req, res, next) {
    /*let sql = '';
                let param=[];*/
    const findInfo = req.query.findInfo;
    const pageInfo = $util.getQueryInfo(req, 'pageInfo', res);
    if (!req.session.user) {
      return;
    }
    this.pool.getConnection((err, connection: Connection) => {
      connection.beginTransaction((err) => {
        if (err) return;
        //获取指定数据
        const getList = (callback) => {
          let sql = '';
          let param = [];
          if (req.session.user.roleId === 5) {
            sql = $sql.findAllPurchaseByAdminAndPage;
          } else {
            sql = $sql.findAllPurchaseByEmployeeAndPage;
            param.push(req.session.user.id);
          }
          connection.query(
            $util.commonMergerSql(sql, findInfo, pageInfo, false),
            param,
            (err, result) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        //获取指定查询条件的总数
        const getCount = (callback) => {
          let countSql = '';
          let countParam = [];
          if (req.session.user.roleId === 5) {
            countSql = $sql.findAllPurchaseCountByAdmin;
          } else {
            countSql = $sql.findAllPurchaseCountByEmployee;
            countParam.push(req.session.user.id);
          }
          connection.query(
            $util.commonMergerCountSql(countSql, findInfo, true),
            countParam,
            (err, result) => {
              if (err) {
                console.error(err);
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        $util.commonCommit(res, [getList, getCount], connection);
      });
    });
  }
  //审核进货单
  reviewPurchase(req, res, next) {
    if (!req.session.user) {
      res.json({
        result: {
          code: false,
          msg: '未登录',
        },
      });
    } else if (req.session.user.roleId !== 5) {
      res.json({
        result: {
          code: false,
          msg: '用户没有操作权限',
        },
      });
    } else {
      const param = req.body;
      const values = [];
      const len = param.commodities.length;
      for (let i = 0; i < len; i++) {
        values.push([
          param.commodities[i].num,
          param.commodities[i].commodityId,
        ]);
      }
      this.pool.getConnection((err, connection: Connection) => {
        connection.beginTransaction((err) => {
          if (err) {
            console.log(err);
            return;
          }
          //更新进货单的商品信息
          const updateCommodity = (callback) => {
            async.forEach(
              values,
              function (item) {
                connection.query(
                  $sql.updatePurchaseToStore,
                  [item[0], item[1]],
                  (err, result) => {
                    if (err) {
                      //TODO
                      callback(err, null);
                    } else callback(null, result);
                  },
                );
              },
              () => {
                callback(null, '');
              },
            );
          };
          const updateReview = (callback) => {
            connection.query(
              $sql.updatePurchaseToReview,
              [req.session.user.id, new Date(), param.reviewId],
              (err, result) => {
                if (err) {
                  callback(err, null);
                } else callback(null, result);
              },
            );
          };
          async.series([updateCommodity, updateReview], (err, result) => {
            if (err) {
              //错误回滚
              connection.rollback(() => {
                $util.closeConnection(
                  res,
                  pak(false, '审核进货单失败'),
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
                pak(true, '审核进货单成功'),
                connection,
              );
            });
          });
        });
      });
    }
  }
  //删除指定id的进货单
  deletePurchaseById(req, res, next) {
    const param = req.params; //参数
    this.pool.getConnection((err, connection: Connection) => {
      connection.beginTransaction((err) => {
        if (err) {
          console.log(err);
          return;
        }
        //盘点单的商品信息
        const deletePurchaseOfCommodity = (callback) => {
          connection.query(
            $sql.deletePurchaseOfCommodity,
            param.serialId,
            (err, result) => {
              console.log('deletePurchaseOfCommodity');
              console.log(err);
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        //进货单的其他信息
        const deletePurchaseOfOther = (callback) => {
          connection.query(
            $sql.deletePurchaseOfOther,
            param.serialId,
            (err, result) => {
              console.log('deletePurchaseOfOther');
              console.log(err);
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        //进货单的审核信息
        const deletePurchaseByReview = (callback) => {
          connection.query(
            $sql.deletePurchaseByReview,
            param.reviewId,
            (err, result) => {
              console.log('deletePurchaseByReview');
              console.log(err);
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        async.series(
          [
            deletePurchaseOfCommodity,
            deletePurchaseOfOther,
            deletePurchaseByReview,
          ],
          (err, result) => {
            if (err) {
              //错误回滚
              connection.rollback(() => {
                $util.closeConnection(
                  res,
                  pak(false, '删除进货单据失败'),
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
                pak(true, '删除进货单据成功'),
                connection,
              );
            });
          },
        );
      });
    });
  }
}
