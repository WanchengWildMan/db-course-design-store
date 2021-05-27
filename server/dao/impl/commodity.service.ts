import { Injectable } from '@nestjs/common';
import { Pool } from 'mysql';
import * as mysql from 'mysql';
import { $conf } from '../../conf/db';
import { commoditySqlMap as $sql } from '../map/commodityMap';

import async from 'async';
import * as $util from 'server/util/util';
@Injectable()
export class CommodityService {
  private readonly pool: mysql.Pool;
  constructor() {
    this.pool = mysql.createPool($util.extend({}, $conf.mysql));
  }
  //添加商品类型
  saveSort(req, res, next) {
    this.pool.getConnection((err, connection) => {
      const reqCom = req.body;
      connection.query($sql.saveSort, [reqCom.name], (err, result) => {
        if (result) {
          result = {
            code: true,
            msg: '添加商品类型成功',
          };
        }
        $util.closeConnection(res, result, connection);
      });
    });
  }
  //保存一条新的商品单位
  saveUnit(req, res, next) {
    this.pool.getConnection((err, connection) => {
      const reqCom = req.body;
      connection.query($sql.saveUnit, [reqCom.name], (err, result) => {
        if (result) {
          result = {
            code: true,
            msg: '添加商品单位成功',
          };
        }
        $util.closeConnection(res, result, connection);
      });
    });
  }

  //添加商品信息
  saveCommodity(req, res, next) {
    const reqCom = req.body;
    const commodityId = $util.uuid(8, 10);
    this.pool.getConnection((err, connection) => {
      connection.beginTransaction((err) => {
        if (err) {
          console.log(err);
          return;
        }
        const saveCommodity = (callback) => {
          connection.query(
            $sql.saveCommodity,
            [
              commodityId,
              reqCom.categoryId,
              $util.uuid(12, 10),
              reqCom.name,
              reqCom.format,
              reqCom.place,
              reqCom.unitId,
              reqCom.discountRate,
              reqCom.costPrice,
              reqCom.quantityUpperLimit,
              reqCom.quantityLowerLimit,
              new Date(),
              reqCom.provideId,
              reqCom.Status,
              reqCom.remark,
            ],
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        const createStore = (callback) => {
          connection.query(
            $sql.createOneStore,
            [$util.uuid(8, 10), commodityId, 0],
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        async.series([saveCommodity, createStore], (err, result) => {
          const pak = function (code, result) {
            return {
              code: code,
              msg: result,
            };
          };
          if (err) {
            connection.rollback(() => {
              $util.closeConnection(
                res,
                pak(false, '添加商品资料失败'),
                connection,
              );
            });
            return;
          }
          //当前没错误才提交
          connection.commit((err) => {
            if (err) {
              return;
            }
            $util.closeConnection(
              res,
              pak(true, '添加商品资料成功'),
              connection,
            );
          });
        });
      });
    });
  }
  //获取指定页数的商品类型
  findSortByPage(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) return;
      const pageInfo = JSON.parse(req.query.pageInfo);
      connection.beginTransaction((err) => {
        const getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.findSortByPage,
              JSON.stringify({}),
              pageInfo,
              true,
            ),
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        const getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.findSortCount,
              JSON.stringify({}),
              true,
            ),
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
  //获取所有指定的商品类型
  findAllSort(req, res, next) {
    this.pool.getConnection((err, connection) => {
      connection.query($sql.findAllSort, (err, result) => {
        let r = {};
        if (result) {
          r = {
            code: true,
            result: result,
          };
          $util.closeConnection(res, r, connection);
        }
      });
    });
  }
  //获取一定页数的商品单位
  findUnitByPage(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) return;
      const pageInfo = JSON.parse(req.query.pageInfo);
      connection.beginTransaction((err) => {
        const getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.findUnitByPage,
              JSON.stringify({}),
              pageInfo,
              true,
            ),
            (err, result) => {
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        const getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.findUnitCount,
              JSON.stringify({}),
              true,
            ),
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
  //获取所有商品单位
  findAllUnit(req, res, next) {
    this.pool.getConnection((err, connection) => {
      connection.query($sql.findAllUnit, (err, result) => {
        let r = {};
        if (result) {
          r = {
            code: true,
            result: result,
          };
        }
        $util.closeConnection(res, r, connection);
      });
    });
  }
  //获取指定页数的商品单位信息
  findCommodityByPage(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) return;
      const pageInfo = JSON.parse(req.query.pageInfo);
      const findInfo = JSON.parse(req.query.findInfo);
      connection.beginTransaction((err) => {
        let sql = '';
        if (findInfo.categoryId != '') {
          sql += ` AND c.categoryId=${parseInt(findInfo.categoryId)}`;
        }
        if (findInfo.quantityLimit !== 0) {
          if (findInfo.quantityLimit == 1) {
            sql += ' AND s.factStoreNum > c.quantityUpperLimit';
          } else if (findInfo.quantityLimit == -1) {
            sql += ' AND s.factStoreNum < c.quantityLowerLimit';
          }
        }
        if (findInfo.content != '') {
          sql += ` AND concat(c.name, c.barcode,c.commodityId, g.name, u.name) like %${findInfo.content}%`;
        }
        const getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.findCommodityByPage + sql,
              JSON.stringify({}),
              pageInfo,
              true,
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
        const getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.findCommodityCount + sql,
              JSON.stringify({}),
              true,
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
        $util.commonCommit(res, [getList, getCount], connection);
      });
    });
  }
  getSelectCommodityList(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) return;
      const pageInfo = JSON.parse(req.query.pageInfo);
      const findInfo = JSON.parse(req.query.propsModel);
      connection.beginTransaction((err) => {
        let sql = '';
        if (findInfo.categoryId !== '') {
          sql += ` AND c.categoryId=${parseInt(findInfo.categoryId)}`;
        }
        if (findInfo.content !== '') {
          sql += ` AND concat(c.name, c.barcode,c.commodityId, g.name, u.name) like %${findInfo.content}%`;
        }
        const getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.getSelectCommodityListByPage + sql,
              JSON.stringify({}),
              pageInfo,
              true,
            ),
            (err, result) => {
              console.log(1);
              console.log(err);
              if (err) {
                callback(err, null);
              } else callback(null, result);
            },
          );
        };
        const getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.findCommodityCount + sql + '  AND s.factStoreNum !=0',
              JSON.stringify({}),
              true,
            ),
            (err, result) => {
              console.log(2);
              console.log(err);
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
  }
  //更新指定id的商品类型
  updateSortById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) throw Error;
      const param = req.body;
      connection.query(
        $sql.updateSortById,
        [param.name, param.categoryId],
        (err, result) => {
          if (result) {
            result = {
              code: true,
              msg: '更新商品类型信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
  //更新指定id的商品单位信息
  updateUnitById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) throw Error;
      const param = req.body;
      connection.query(
        $sql.updateUnitById,
        [param.name, param.unitId],
        (err, result) => {
          if (result) {
            result = {
              code: true,
              msg: '更新商品单位信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
  //更新商品信息
  updateCommodityById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      const param = req.body;
      connection.query(
        $sql.updateCommodityById,
        [
          param.categoryId,
          param.barcode,
          param.name,
          param.format,
          param.unitId,
          param.discountRate,
          param.costPrice,
          param.quantityUpperLimit,
          param.quantityLowerLimit,
          param.provideId,
          param.Status,
          param.remark,
          param.commodityId,
        ],
        (err, result) => {
          if (result) {
            result = {
              code: true,
              msg: '更新商品资料信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
  //更新指定商品资料的状态
  updateCommodityStatusById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      const param = req.body;
      connection.query(
        $sql.updateCommodityStatusById,
        [param.Status === 1 ? -1 : 1, param.commodityId],
        (err, result) => {
          if (result) {
            result = {
              code: true,
              msg: '更新商品状态信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
  //删除指定商品类型
  deleteSortById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) throw err;
      const param = req.params;
      connection.query($sql.deleteSortById, param.categoryId, (err, result) => {
        if (result) {
          result = {
            code: true,
            msg: '删除商品类型成功',
          };
        }
        $util.closeConnection(res, result, connection);
      });
    });
  }
  //删除指定商品单位
  deleteUnitById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) throw err;
      const param = req.params;
      connection.query($sql.deleteUnitById, param.unitId, (err, result) => {
        if (result) {
          result = {
            code: true,
            msg: '删除商品单位成功',
          };
        }
        $util.closeConnection(res, result, connection);
      });
    });
  }
  //删除指定id的商品信息
  deleteCommodityById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) throw err;
      const param = req.body;
      //设置状态为-2，不真正删除，为后续计算盈亏做准备
      connection.query(
        $sql.updateCommodityStatusById,
        [-2, param.commodityId],
        (err, result) => {
          if (result) {
            result = {
              code: true,
              msg: '删除商品资料信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
  //模糊查询商品
  findLikeCommodity(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) throw err;
      const param = req.query;
      connection.query(
        $sql.findLikeCommodity,
        param.commodityKey,
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
}
