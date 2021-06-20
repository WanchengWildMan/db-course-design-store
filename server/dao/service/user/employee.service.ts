import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { getManager, Repository } from 'typeorm';
import { Employee } from '../../../entities/employee.entity';
import * as $cipher from '../../../util/cipher';
import * as $util from '../../../util/util';

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
        where: `(name='${username}' OR employeeId='${username}')`, // AND password = '${password_encrypt}'`,
      });
      if (employees.length > 0) {
        if (employees[0].Status == 0)
          res
            .status(403)
            .json({ errors: ['登录失败!该用户不可用！'], result: [] });
        else {
          let realPas = $cipher.decrypt(employees[0].password);
          if (realPas !== password) {
            res.status(403).json({ errors: ['登录失败！密码错误！'] });
          } else {
            //保存用户登录信息
            req.session.user = employees[0];
            req.session._expires = Date.now() + 100000;
            res.json({
              errors: [],
              result: { user: employees[0], msg: '登录成功' },
            });
          }
        }
      } else res.status(403).json({ errors: ['登录失败!用户不存在！'] });
    } catch (err) {
      console.log(err);
      res.json({ errors: err });
    }
  }

  //保存或更新一个员工信息
  async saveEmployee(req, res, next) {
    let employee = req.body.employee;
    let findEmployee = await this.$employee.findOne({
      employeeId: employee ? employee.employeeId : '',
    });
    //加密了，！！！！
    if (employee.password != findEmployee.password)
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

  //获取指定页数的员工信息
  findEmployeeByPage(req, res, next) {
    let pageInfo = $util.getQueryInfo(req, 'pageInfo', res);
    let findInfo = $util.getQueryInfo(req, 'findInfo', res);
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
