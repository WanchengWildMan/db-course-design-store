import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import * as $util from '../../../util/util';
import { $conf } from '../../../conf/db';
import * as $cipher from '../../../util/cipher.js';

import { userSqlMap as $sql } from '../../map/userMap';
import { ProvideSerivce } from './provide.service';

let pak = function (code, msg) {
  return {
    code: code,
    msg: msg,
  };
};
@Injectable()
export class RoleService {
  private readonly pool: mysql.Pool;
  constructor() {
    this.pool = mysql.createPool($util.extend({}, $conf.mysql));
  }
  saveRole(req, res, next) {
    this.pool.getConnection((err, connection) => {
      //获取参数
      const param = req.body;
      //建立连接，保存值
      connection.query($sql.role.saveRole, [param.name], (err, result) => {
        if (result) {
          result = {
            code: 200,
            msg: '添加新部门成功',
          };
        }
        $util.closeConnection(res, result, connection);
      });
    });
  } //更新指定角色信息
  updateRoleById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      //获取参数
      const param = req.body;
      //建立连接，保存值
      connection.query(
        $sql.role.updateRoleById,
        [param.name, param.roleId],
        (err, result) => {
          if (result) {
            result = {
              code: 200,
              msg: '更新部门信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  } //获取指定页数的角色信息
  getAllRoleByPage(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) return;
      let pageInfo = $util.getQueryInfo(req, 'pageInfo', res);
      connection.beginTransaction((err) => {
        let getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.role.getAllRoleByPage,
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
        let getCount = (callback) => {
          connection.query(
            $util.commonMergerCountSql(
              $sql.role.findRoleCount,
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
  } //获取所有角色信息，用于下拉选择
  getRoleBySelect(req, res, next) {
    this.pool.getConnection((err, connection) => {
      connection.query($sql.role.getRoleBySelect, (err, result) => {
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
  } //删除指定角色信息
  deleteRoleId(req, res, next) {
    this.pool.getConnection((err, connection) => {
      const param = req.params;
      connection.query($sql.role.deleteRoleId, param.roleId, (err, result) => {
        if (result) {
          result = {
            code: true,
            msg: '删除部门信息成功',
          };
        }
        $util.closeConnection(res, result, connection);
      });
    });
  }
}
