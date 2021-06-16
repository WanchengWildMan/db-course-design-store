import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'log', 'warn', 'error', 'verbose'],
  });
  app.use(
    Session({
      secret: 'userStore',
      cookie: { maxAge: 60000000 },
      resave: false,
      saveUninitialized: true,
    }),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  // app.use((req, res, next) => {
  //   console.log(req.origin, 'origin');
  //   // res.header('Access-Control-Allow-Origin', req.origin);
  //   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  //   res.header(
  //     'Access-Control-Allow-Headers',
  //     'Content-Type, Accept,Authorization,DNT,Content-Type,Referer,User-Agent',
  //   );
  //   res.header('Access-Control-Allow-Credentials', 'true');

  //   next();
  // });
  const options = new DocumentBuilder()
    .setTitle('商店管理')
    .setDescription('使用nest书写的常用性接口') // 文档介绍
    .setVersion('1.0.0') // 文档版本
    .addTag('商品,进货,售货,供应商,收银台') // 每个tag标签都可以对应着几个@ApiUseTags('用户,安全') 然后被ApiUseTags注释，字符串一致的都会变成同一个标签下的
    .setBasePath('http://localhost:30000')
    .build();
  // 为了创建完整的文档（具有定义的HTTP路由），我们使用类的createDocument()方法SwaggerModule。此方法带有两个参数，分别是应用程序实例和基本Swagger选项。
  const document = SwaggerModule.createDocument(app, options);
  // 最后一步是setup()。它依次接受（1）装入Swagger的路径，（2）应用程序实例, （3）描述Nest应用程序的文档。
  SwaggerModule.setup('/apiDocument', app, document);
  await app.listen(3000);
}

bootstrap();
