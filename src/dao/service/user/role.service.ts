import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import * as $util from '../../../util/util';
import { $conf } from '../../../conf/db';
import * as $cipher from '../../../util/cipher.js';

import { userSqlMap as $sql } from '../../map/userMap';
import { ProvideSerivce } from '../provide.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entities/role.entity';
import { Repository } from 'typeorm';

let pak = function (code, msg) {
  return {
    code: code,
    msg: msg,
  };
};
@Injectable()
export class RoleService {
  private readonly pool: mysql.Pool;
  constructor(
    @InjectRepository(Role) private readonly $role: Repository<Role>,
  ) {}
  saveRole(req, res, next) {
    const role = req.body.role;
    this.$role
      .save(role)
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }
  //获取指定页数的角色信息
  findRoleByPage(req, res, next) {
    let findInfo = req.body.findInfo;
    findInfo = { where: findInfo };
    this.$role
      .find(findInfo)
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }
  //删除指定角色信息
  deleteRoleById(req, res, next) {
    const roleId = req.query.roleId;
    this.$role
      .delete({ roleId: roleId })
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }
}
