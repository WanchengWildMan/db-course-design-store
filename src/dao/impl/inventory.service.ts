//实现与mysql数据库交互
import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import * as $util from '../../util/util';
import { $conf } from '../../conf/db';
import { inventoryMap as $sql } from '../map/inventoryMap';
import async from 'async';

//使用连接池，提升性能
const pool = mysql.createPool($util.extend({}, $conf.mysql));
@Injectable()
export class InventoryService {
  //提交一张盘点单
  saveInventory(req, res, next) {
    const inventory = req.body; //保存的信息
    const inventoryId = $util.uuid(8, 10); //盘点单号
    const reviewId = $util.uuid(8, 10); //盘点单审核单号
    let values = []; //转换保存多个商品信息
    let data = inventory.commodityList;
    let len = data.length;
    for (let i = 0; i < len; i++) {
      values.push([
        $util.uuid(8, 10),
        inventoryId,
        data[i].commodityId,
        data[i].storeNum,
        data[i].inventoryNum,
      ]);
    }
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.beginTransaction((err) => {
        //保存盘点单中的商品信息
        let saveInventoryOfCommodity = (callback) => {
          connection.query(
            $sql.saveInventoryOfCommodity,
            [values],
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        //保存盘点单的额外信息
        let saveInventoryOfOther = (callback) => {
          let other = inventory.serial;
          connection.query(
            $sql.saveInventoryOfOther,
            [
              inventoryId,
              other.serialDate,
              parseFloat(other.totalMoney),
              reviewId,
              other.serialDesc,
            ],
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        //保存盘点单的审核信息
        let saveInventoryOfReview = (callback) => {
          if (!req.session.user) {
            callback(err, null);
            return;
          }
          connection.query(
            $sql.saveInventoryOfReview,
            [reviewId, req.session.user.id, new Date(), null, null, 1],
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        async.series(
          [
            saveInventoryOfReview,
            saveInventoryOfOther,
            saveInventoryOfCommodity,
          ],
          (err, result) => {
            let r = function (code, result) {
              return {
                code: code,
                msg: result,
              };
            };
            if (err) {
              //错误回滚
              connection.rollback(() => {
                $util.closeConnection(
                  res,
                  r(false, '提交盘点单失败'),
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
              $util.closeConnection(res, r(true, '提交盘点单成功'), connection);
            });
          },
        );
      });
    });
  }
  //获取指定员工的盘点单（员工盘点单功能）
  findInventoryByEmployeeAndPage(req, res, next) {
    if (!req.session.user) {
      return;
    }
    pool.getConnection((err, connection) => {
      if (err) return;
      let findInfo = req.query.findInfo;
      let pageInfo = JSON.parse(req.query.pageInfo);
      connection.beginTransaction((err) => {
        let getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.findInventoryByEmployeeAndPage,
              findInfo,
              pageInfo,
              false,
            ),
            req.session.user.id,
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        let getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.findInventoryCountByEmployee,
              findInfo,
              true,
            ),
            req.session.user.id,
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        $util.commonCommit(res, [getList, getCount], connection);
      });
    });
    /*pool.getConnection((err, connection) => {
      if(err) throw err;
      connection.query($sql.findInventoryByEmployeeAndPage, req.session.user.id, (err, result) =>{
        if(result) {
          result = {
            code : true,
            result  : result
          }
        }
        $util.closeConnection(res, result, connection);
      });
    });*/
  }
  //获取所有的盘点单（管理员）
  findInventoryByPage(req, res, next) {
    if (!req.session.user || req.session.user.roleId !== 5) {
      return;
    }
    pool.getConnection((err, connection) => {
      if (err) return;
      let findInfo = req.query.findInfo;
      let pageInfo = JSON.parse(req.query.pageInfo);
      connection.beginTransaction((err) => {
        let getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.findInventoryByPage,
              findInfo,
              pageInfo,
              false,
            ),
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        let getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.findInventoryCountByAdmin,
              findInfo,
              true,
            ),
            req.session.user.id,
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        $util.commonCommit(res, [getList, getCount], connection);
      });
    });
    /*pool.getConnection((err, connection) => {
      if(err) throw err;
      connection.query($sql.findInventoryByPage, (err, result) => {
        if(result) {
          result = {
            code : true,
            result: result
          }
        }
        $util.closeConnection(res, result,connection);
      });
    });*/
  }
  //获取指定页数的盘点单盘点商品信息
  findAllInventoryCommodityByEmployeeAndPage(req, res, next) {
    /* let sql = '';
    let param=[];*/
    let findInfo = req.query.findInfo;
    let pageInfo = JSON.parse(req.query.pageInfo);
    if (!req.session.user) {
      return;
    }
    pool.getConnection((err, connection) => {
      connection.beginTransaction((err) => {
        if (err) return;
        //获取指定数据
        let getList = (callback) => {
          let sql = '';
          let param = [];
          if (req.session.user.roleId === 5) {
            sql = $sql.findAllInventoryCommodityByAdminAndPage;
          } else {
            sql = $sql.findAllInventoryCommodityByEmployeeAndPage;
            param.push(req.session.user.id);
          }
          connection.query(
            $util.commonMergerSql(sql, findInfo, pageInfo, false),
            param,
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        //获取指定查询条件的总数
        let getCount = (callback) => {
          let countSql = '';
          let countParam = [];
          if (req.session.user.roleId === 5) {
            countSql = $sql.findAllInventoryCommodityCountByAdmin;
          } else {
            countSql = $sql.findAllInventoryCommodityCountByEmployee;
            countParam.push(req.session.user.id);
          }
          connection.query(
            $util.commonMergerCountSql(countSql, findInfo, true),
            countParam,
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        $util.commonCommit(res, [getList, getCount], connection);
      });
    });
    /*if(req.session.user.roleId === 5) {
      sql = $sql.findAllInventoryCommodityByAdminAndPage;
    }else{
      sql = $sql.findAllInventoryCommodityByEmployeeAndPage;
      param.push(req.session.user.id);
    }
    pool.getConnection((err, connection) => {
      connection.query(sql, param, (err, result) => {
        if(result) {
          result = {
            code : true,
            result : result
          }
        }
        $util.closeConnection(res, result, connection);
      })
    });*/
  }
  //查询盘点单操作信息
  findInventoryListMessage(req, res, next) {
    const params = req.query;
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.beginTransaction((err) => {
        //通过盘点单查询多个盘点商品信息
        let findCommodityByInventoryId = (callback) => {
          connection.query(
            $sql.findCommodityByInventoryId,
            [params.inventoryId],
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        //通过盘点单的审核号查询指定审核信息
        let findInventoryReviewByReviewId = (callback) => {
          connection.query(
            $sql.findInventoryReviewByReviewId,
            [params.reviewId],
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        //查询盘点单的其他信息
        let findAllInventoryOtherByInventoryId = (callback) => {
          connection.query(
            $sql.findAllInventoryOtherByInventoryId,
            [params.inventoryId],
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        async.series(
          [
            findCommodityByInventoryId,
            findInventoryReviewByReviewId,
            findAllInventoryOtherByInventoryId,
          ],
          (err, result) => {
            let r = function (code, msg) {
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
                  r(false, '获取盘点单失败'),
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
              $util.closeConnection(res, r(true, '获取盘点单成功'), connection);
            });
          },
        );
      });
    });
  }
  //审核盘点单
  updateInventoryByReview(req, res, next) {
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
      let len = param.commodities.length;
      for (let i = 0; i < len; i++) {
        values.push([
          param.commodities[i].num,
          param.commodities[i].commodityId,
        ]);
      }
      pool.getConnection((err, connection) => {
        connection.beginTransaction((err) => {
          if (err) throw err;
          let updateInventoryToStore = (callback) => {
            async.forEach(
              values,
              (item) => {
                connection.query(
                  $sql.updateInventoryToStore,
                  [item[0], item[1]],
                  (err, result) => {
                    // if (err) {
                    //   callback(err, null);
                    //   return;
                    // }
                    // callback(null, result);
                  },
                );
              },
              () => {
                callback(null, '');
              },
            );
          };
          let updateInventoryToReview = (callback) => {
            connection.query(
              $sql.updateInventoryToReview,
              [req.session.user.id, new Date(), param.reviewId],
              (err, result) => {
                if (err) {
                  callback(err, null);
                  return;
                }
                callback(null, result);
              },
            );
          };
          async.series(
            [updateInventoryToStore, updateInventoryToReview],
            (err, result) => {
              let r = function (code, msg) {
                return {
                  code: code,
                  msg: msg,
                };
              };
              if (err) {
                //错误回滚
                connection.rollback(() => {
                  $util.closeConnection(
                    res,
                    r(false, '审核盘点单失败'),
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
                  r(true, '审核盘点单成功'),
                  connection,
                );
              });
            },
          );
        });
      });
    }
  }
  //删除指定id的盘点单
  deleteInventoryById(req, res, next) {
    const param = req.params; //参数
    pool.getConnection((err, connection) => {
      connection.beginTransaction((err) => {
        if (err) {
          console.log(err);
          return;
        }
        //盘点单的商品信息
        let deleteInventoryOfCommodity = (callback) => {
          connection.query(
            $sql.deleteInventoryOfCommodity,
            param.inventoryId,
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        //盘点单的其他信息
        let deleteInventoryOfOther = (callback) => {
          connection.query(
            $sql.deleteInventoryOfOther,
            param.inventoryId,
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        //盘点单的审核信息
        let deleteInventoryByReview = (callback) => {
          connection.query(
            $sql.deleteInventoryByReview,
            param.reviewId,
            (err, result) => {
              if (err) {
                callback(err, null);
                return;
              }
              callback(null, result);
            },
          );
        };
        async.series(
          [
            deleteInventoryOfCommodity,
            deleteInventoryOfOther,
            deleteInventoryByReview,
          ],
          (err, result) => {
            let r = function (code, result) {
              return {
                code: code,
                msg: result,
              };
            };
            if (err) {
              //错误回滚
              connection.rollback(() => {
                $util.closeConnection(
                  res,
                  r(false, '删除盘点单据失败'),
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
                r(true, '删除盘点单据成功'),
                connection,
              );
            });
          },
        );
      });
    });
  }
}
