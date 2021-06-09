import { Injectable, Req } from '@nestjs/common';
import * as mysql from 'mysql';
import * as $util from '../../../util/util';
import * as $cipher from '../../../util/cipher';

import { $conf } from '../../../conf/db';
import { userSqlMap as $sql } from '../../map/userMap';

@Injectable()
export class EmployeeService {
  private readonly pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool($util.extend({}, $conf.mysql));
  }

  //员工登录
  login(req, res, next) {
    this.pool.getConnection((err, connection) => {
      const param = req.query;

      connection.query(
        $sql.employee.login,
        [param.username, $cipher.encrypt(param.password)],
        (err, result) => {
          if (result.length !== 0) {
            if (result[0].Status === -2) {
              result = {
                code: false,
                msg: '登录失败，该用户已被禁止使用本系统',
              };
            } else {

              //保存用户登录信息
              req.session.user = {
                id: result[0].employeeId,
                name: result[0].name,
                roleId: result[0].roleId,
              };
              req.session.userPass = {
                password: $cipher.encrypt(param.password),
              };
              result = {
                code: true,
                msg: '登录成功',
              };
            }
          } else {

            result = {
              code: false,
              msg: '用户名或密码错误',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }

  //保存一个员工信息
  saveEmployee(req, res, next) {
    this.pool.getConnection((err, connection) => {
      const param = req.body;
      connection.query(
        $sql.employee.saveEmployee,
        [
          $util.uuid(5, 10),
          param.name,
          param.roleId,
          param.position,
          param.contactPhone,
          param.contactAddress,
          param.IdCard,
          param.entryTime,
          param.sex,
          param.Status,
          //初始密码
          $cipher.encrypt('123456'),
        ],
        (err, result) => {
          if (result) {
            result = {
              code: true,
              msg: '添加新员工信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }

  //更新指定员工信息
  updateEmployeeById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      //获取参数
      const param = req.body;
      //建立连接，保存值
      connection.query(
        $sql.employee.updateEmployeeById,
        [
          param.name,
          param.roleId,
          param.position,
          param.contactPhone,
          param.contactAddress,
          param.IdCard,
          param.entryTime,
          param.sex,
          param.Status,
          param.employeeId,
        ],
        (err, result) => {
          if (result) {
            result = {
              code: 200,
              msg: '更新员工信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }

  //更新员工使用状态
  updateEmployeeStatusById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      //获取参数
      const param = req.body;
      //建立连接，保存值
      connection.query(
        $sql.employee.updateEmployeeStatusById,
        [param.Status === 1 ? -1 : 1, param.employeeId],
        (err, result) => {
          if (result) {
            result = {
              code: 200,
              msg: '更新员工使用状态成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }

  //获取指定页数的员工信息
  getEmployeeByPage(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) return;
      let pageInfo = $util.getQueryInfo(req, 'pageInfo', res);
      let propsModel = JSON.parse(req.query.propsModel);
      connection.beginTransaction((err) => {
        let sql = '';
        let queryParam = [];
        if (parseInt(propsModel.roleId) === 0) {
          //0默认查询所有角色/部门
          if (propsModel.content === '') {
            sql = '';
          } else {
            //模糊查询——所有字段连接后即可
            sql =
              'concat(e.employeeId, e.name, r.name, e.position, e.contactPhone, e.contactAddress, e.IdCard, e.sex, e.Status) like "%' +
              propsModel.content +
              '%"';
          }
        } else {
          sql = 'e.roleId=' + parseInt(propsModel.roleId);
          if (propsModel.content !== '') {
            sql +=
              ' AND concat(e.employeeId, e.name, r.name, e.position, e.contactPhone, e.contactAddress, e.IdCard, e.sex, e.Status) like "%' +
              propsModel.content +
              '%"';
          }
        }
        if (sql !== '') {
          sql = ' AND  ' + sql;
        }
        let getList = (callback) => {
          connection.query(
            $util.commonMergerSql(
              $sql.employee.getEmployeeByPage + sql,
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
          console.log(sql);
          connection.query(
            $util.commonMergerCountSql(
              $sql.employee.findEmployeeCount + sql,
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
    /* this.pool.getConnection((err, connection) => {
        const param = req.query;
        let sql = '';
        let queryParam = [];
        if(parseInt(param.roleId) === 0){
          if(param.content === '') {
            sql = $sql.employee.getEmployeeByPage;
          }else{
            sql = $sql.employee.fuzzyQueryByPage;
            queryParam.push(param.content);
          }
        }else{
          queryParam.push(parseInt(param.roleId));
          if(param.content === '') {
            sql = $sql.employee.getEmployeeByPageAndRoleId;
          }else{
            sql = $sql.employee.fuzzyQueryByPageAndRoleId;
            queryParam.push(param.content);
          }
        }
        connection.query(sql, queryParam, (err, result) => {
          let r = {};
          if(result) {
            r = {
              code : true,
              result : result
            }
          }
          $util.closeConnection(res, r,connection);
        });
      });*/
  }

  //获取指定员工号的指定的员工信息
  getEmployeeById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) throw err;
      const param = req.query;
      connection.query(
        $sql.employee.getEmployeeById,
        param.employeeId,
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

  //删除指定id的员工信息
  deleteEmployeeById(req, res, next) {
    this.pool.getConnection((err, connection) => {
      if (err) throw err;
      const param = req.params;
      connection.query(
        $sql.employee.updateEmployeeStatusById,
        [-2, param.employeeId],
        (err, result) => {
          if (result) {
            result = {
              code: true,
              msg: '删除员工信息成功',
            };
          }
          $util.closeConnection(res, result, connection);
        },
      );
    });
  }
}
