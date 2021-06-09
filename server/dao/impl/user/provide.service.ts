import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import * as $util from '../../../util/util';
import { $conf } from '../../../conf/db';
import { userSqlMap as $sql } from '../../map/userMap';

import async from 'async';
import Connection from 'mysql/lib/Connection';
@Injectable()
export class ProvideSerivce {
  private readonly pool: mysql.Pool;
  constructor() {
    this.pool = mysql.createPool($util.extend({}, $conf.mysql));
  }
  //添加一个供应商信息
  saveProvide(req, res, next) {
    this.pool.getConnection((err, connection) => {
      //获取参数
      const param = req.body;
      //建立连接，保存值
      connection.query(
        $sql.provide.saveProvide,
        [
          $util.uuid(24, 16),
          param.name,
          param.contactPerson,
          param.contactPhone,
          param.contactAddress,
          param.contactEmail,
          param.categoryId,
          param.Status,
          param.remark,
        ],
        (err, result) => {
          if (err) console.error(err);
          if (result) {
            result = {
              code: 200,
              msg: '添加供应商信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
  //获取指定id的供应商详情
  getProvideById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      const param = req.params;
      connection.query(
        $sql.provide.getProvideById,
        [param.provideId],
        (err, result) => {
          if (err) console.error(err);
          let r = {};
          if (result) {
            r = {
              code: true,
              result: result,
            };
          }
          $util.closeConnection(res, r, connection);
        },
      );
    });
  }
  //指定页数的供应商数据
  getProvideByPage(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) return;
      let findInfo = req.query.findInfo;
      let pageInfo = $util.getQueryInfo(req, 'pageInfo', res);
      let sql = '';
      let judge =
        parseInt(JSON.parse(findInfo)['p.categoryId']) === 0 ? true : false;
      if (judge) {
        findInfo = JSON.stringify({});
      }
      sql = $util.commonMergerSql(
        $sql.provide.getProvideByPageAndCategoryId,
        findInfo,
        pageInfo,
        false,
      );
      connection.beginTransaction((err) => {
        let getList = (callback) => {
          connection.query(sql, (err, result) => {
            if (err) console.error(err);
            if (err) {
              callback(err, null);
              return;
            }
            callback(null, result);
          });
        };
        let getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.provide.findProvideCount,
              findInfo,
              false,
            ),
            (err, result) => {
              if (err) console.error(err);
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
  //获取供应商信息，用于下拉选择选项
  getProvideBySelect(req, res, next) {
    this.pool.getConnection((err, connection) => {
      connection.query($sql.provide.getProvideBySelect, (err, result) => {
        if (err) console.error(err);
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
  //更新指定供应商信息
  updateProvideById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      const param = req.body;
      connection.query(
        $sql.provide.updateProvideById,
        [
          param.name,
          param.contactPerson,
          param.contactPhone,
          param.contactAddress,
          param.contactEmail,
          param.categoryId,
          param.Status,
          param.remark,
          param.provideId,
        ],
        (err, result) => {
          if (err) console.error(err);
          console.log(err);
          if (result) {
            result = {
              code: true,
              msg: '更新供应商信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
  //更新指定供应商信息的状态
  updateProvideStatusById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      const param = req.body;
      connection.query(
        $sql.provide.updateProvideStatusById,
        [param.Status === 1 ? -1 : 1, param.provideId],
        (err, result) => {
          if (err) console.error(err);
          if (result) {
            result = {
              code: true,
              msg: '更新供应商状态成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
  //删除指定供应商信息
  deleteProvideById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) throw err;
      const param = req.params;
      connection.query(
        $sql.provide.deleteProvideById,
        param.provideId,
        (err, result) => {
          if (err) console.error(err);
          if (result) {
            result = {
              code: true,
              msg: '删除供应商信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
}
