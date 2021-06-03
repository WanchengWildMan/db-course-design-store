import { Injectable, Req } from '@nestjs/common';
import * as mysql from 'mysql';
import * as $util from '../../../util/util';
import * as $cipher from '../../../util/cipher';

import { $conf } from '../../../conf/db';
import { userSqlMap as $sql } from '../../map/userMap';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from '../../../entities/employee.entity';
import { getManager, Repository } from 'typeorm';
import { parallel } from 'async';
import { page } from '../../../util/util';
import { exception } from 'console';
import { validate } from 'class-validator';

let pak = (ok: boolean, item: string, opr: string) => {
  return { code: ok, msg: item + opr + (ok ? '成功' : '失败') };
};
const ADD = '添加';
const DEL = '删除';
const UPD = '更新';
const FIND = '查找';
const SAVE = '保存';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly $employee: Repository<Employee>,
  ) {}

  //员工登录
  async login(req, res, next) {
    const querys = req.query;
    const username = querys.username ? querys.username : '';
    const password = querys.password;
    try {
      const password_encrypt = $cipher.encrypt(password);
      let employees = await getManager().find(Employee, {
        where: `(name='${username}' OR employeeId='${username}') AND password = '${password_encrypt}'`,
      });
      if (employees.length > 0) {
        if (employees[0].Status == 0)
          res.json({ errors: ['登录失败!该用户不可用！'], result: [] });
        else {
          //保存用户登录信息
          req.session.user = {
            employeeId: employees[0].employeeId,
            name: employees[0].name,
            roleId: employees[0].roleId,
            password: employees[0].password,
          };
          req.session._expires = Date.now() + 100000;
          res.json({ errors: [], result: '登录成功' });
        }
      } else res.json({ code: false, msg: '登录失败!用户名或密码错误！' });
    } catch (err) {
      console.log(err);
      res.json({ errors: err });
    }
  }

  //保存或更新一个员工信息
  async saveEmployee(req, res, next) {
    let employee = req.body.employee;
    if (employee.password)
      employee.password = $cipher.encrypt(employee.password);
    let errors = await validate(employee as Employee);
    console.log(errors);
    this.$employee
      .save(employee)
      .then((result) => {
        console.log(result);
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }

  // //更新员工使用状态
  // updateEmployeeStatusById(req, res, next) {
  //
  //   this.pool.getConnection((err, connection) => {
  //     //获取参数
  //     const param = req.body;
  //     //建立连接，保存值
  //     connection.query(
  //       $sql.employee.updateEmployeeStatusById,
  //       [param.Status === 1 ? -1 : 1, param.employeeId],
  //       (err, result) => {
  //         if (result) {
  //           result = {
  //             code: 200,
  //             msg: '更新员工使用状态成功',
  //           };
  //         }
  //         $util.closeConnection(res, result, connection);
  //       },
  //     );
  //   });
  // }

  //获取指定页数的员工信息
  findEmployeeByPage(req, res, next) {
    let pageInfo = req.body.pageInfo;
    let findInfo = req.body.findInfo;
    this.$employee
      .find(findInfo)
      .then((result) => {
        result = pageInfo
          ? $util.page(result, pageInfo.page, pageInfo.currentPage)
          : result;
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }
  findEmployeeById(req, res, next) {
    const employeeId = req.query.employeeId;

    this.$employee
      .find({ employeeId: employeeId })
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }

  //删除指定id的员工信息,状态置为-1
  deleteEmployeeById(req, res, next) {
    const employeeId = req.query.employeeId;
    this.$employee
      .save({ employeeId: employeeId, Status: -1 })
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }
}
