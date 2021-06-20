import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { Provide } from '../../entities/provide.entity';
import * as $util from '../../util/util';

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
    console.log(findInfo, 'findInfo');
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
}
