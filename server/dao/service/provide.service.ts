import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import * as $util from '../../util/util';
import { $conf } from '../../conf/db';
import { userSqlMap as $sql } from '../map/userMap';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Provide } from '../../entities/provide.entity';
import { validate } from 'class-validator';
const PORVIDE_EXAMPLE = {
  provideId: '',
  name: '',
  contactAddress: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  Status: 1,
  remark: '',
};
@Injectable()
export class ProvideSerivce {
  constructor(
    @InjectRepository(Provide) private readonly $provide: Repository<Provide>,
  ) {}

  //保存一个供应商信息
  async saveProvide(req, res, next) {
    const provide: Provide = req.body.provide;
    try {
      const errors = await validate(provide);
      if (errors.length > 0) res.json({ errors: errors, result: [] });
    } catch (e) {
      res.json({ errors: '请求格式错误' });
    }

    this.$provide
      .save(provide)
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }

  //获取指定id的供应商详情
  getProvideById(req, res, next) {
    const provideId = req.query.provideId;

    this.$provide
      .find({ provideId: provideId })
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }

  //指定页数的供应商数据
  findProvideByPage(req, res, next) {
    let pageInfo = $util.getQueryInfo(req, 'pageInfo', res);
    let findInfo = $util.getQueryInfo(req, 'findInfo', res);
    const all = req.query.all;
    if (findInfo && findInfo.key != undefined) {
      Object.assign(findInfo, {
        where: `concat(${Object.keys(PORVIDE_EXAMPLE)}) LIKE '%${
          findInfo.key
        }%'`,
      });
    } else findInfo = { where: findInfo };
    console.log(findInfo);
    this.$provide
      .find(findInfo)
      .then((result) => {
        result = pageInfo
          ? $util.page(result, pageInfo.page, pageInfo.currentPage)
          : result;
        // result.filter((el) => {
        //   !findInfo ||
        //     !findInfo.contactAddress ||
        //     el.contactAddress == findInfo.contactAddress;
        // });
        if (!all) result = result.filter((e) => e.Status != -1);
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }
  deleteProvideById(req, res, next) {
    // TODO
    const findInfo = $util.getQueryInfo(req, 'findInfo', res);
    this.$provide
      .save({ provideId: findInfo.provideId, Status: -1 })
      .then((result) => {
        res.json({ errors: [], result: result });
      })
      .catch((err) => {
        console.log(err);
        res.json({ errors: err, result: [] });
      });
  }

  //获取供应商信息，用于下拉选择选项
  // getProvideBySelect(req, res, next) {
  //
  //   this.pool.getConnection((err, connection) => {
  //     connection.query($sql.provide.getProvideBySelect, (err, result) => {
  //       if (err) console.error(err);
  //       let r = {};
  //       if (result) {
  //         r = {
  //           code: true,
  //           result: result,
  //         };
  //       }
  //       $util.closeConnection(res, r, connection);
  //     });
  //   });
  // }
  //
  // //更新指定供应商信息
  // updateProvideById(req, res, next) {
  //   this.pool.getConnection((err, connection) => {
  //     const param = req.body;
  //     connection.query(
  //       $sql.provide.updateProvideById,
  //       [
  //         param.name,
  //         param.contactPerson,
  //         param.contactPhone,
  //         param.contactAddress,
  //         param.contactEmail,
  //         param.categoryId,
  //         param.Status,
  //         param.remark,
  //         param.provideId,
  //       ],
  //       (err, result) => {
  //         if (err) console.error(err);
  //         console.log(err);
  //         if (result) {
  //           result = {
  //             code: true,
  //             msg: '更新供应商信息成功',
  //           };
  //         }
  //         $util.closeConnection(res, result, connection);
  //       },
  //     );
  //   });
  // }
  //
  // //更新指定供应商信息的状态
  // updateProvideStatusById(req, res, next) {
  //   this.pool.getConnection((err, connection) => {
  //     const param = req.body;
  //     connection.query(
  //       $sql.provide.updateProvideStatusById,
  //       [param.Status === 1 ? -1 : 1, param.provideId],
  //       (err, result) => {
  //         if (err) console.error(err);
  //         if (result) {
  //           result = {
  //             code: true,
  //             msg: '更新供应商状态成功',
  //           };
  //         }
  //         $util.closeConnection(res, result, connection);
  //       },
  //     );
  //   });
  // }
  //
  // //删除指定供应商信息
  // deleteProvideById(req, res, next) {
  //   this.pool.getConnection((err, connection) => {
  //     if (err) throw err;
  //     const param = req.params;
  //     connection.query(
  //       $sql.provide.deleteProvideById,
  //       param.provideId,
  //       (err, result) => {
  //         if (err) console.error(err);
  //         if (result) {
  //           result = {
  //             code: true,
  //             msg: '删除供应商信息成功',
  //           };
  //         }
  //         $util.closeConnection(res, result, connection);
  //       },
  //     );
  //   });
  // }
}
