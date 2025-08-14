import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ServicesModule } from './services/services.module';
import { NotificationModule } from './notification/notification.module';
import { SuntechModule } from './suntech/suntech.module';
import { Mt2000Module } from './mt2000/mt2000.module';
import { GrcadModule } from './grcad/grcad.module';
import { TeltonikaModule } from './teltonika/teltonika.module';
import { Gv57Module } from './gv57/gv57.module';
import { Gv75Module } from './gv75/gv75.module';
import { St390Module } from './st390/st390.module';
import { Vl01Module } from './vl01/vl01.module';
import { Vl02Module } from './vl02/vl02.module';
import { Vl03Module } from './vl03/vl03.module';
import { J16Module } from './j16/j16.module';
import { St410Module } from './st410/st410.module';
import { ReferencePointModule } from './reference-point/reference-point.module';
import { AnchorModule } from './anchor/anchor.module';
import { TruckModule } from './truck/truck.module';
import { St380Module } from './st380/st380.module';
import { Fmc130Module } from './fmc130/fmc130.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { St8310Module } from './st8310/st8310.module';
import { ScheduleModule } from '@nestjs/schedule';
import { verifyCertification } from './helper/verifyCertification';
import { RestrictAreaModule } from './restrict-area/restrict-area.module';
import { St8300Module } from './st8300/st8300.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get('DB_HOST', '192.168.1.122'), 
        port: Number(configService.get('DB_PORT', 1433)), 
        username: configService.get('DB_USERNAME', 'sa'),
        password: configService.get('DB_PASSWORD', 'BIS@2018'),
        database: configService.get('DB_DATABASE', 'PORTAL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        requestTimeout: 1000000,
        logging: true,
        extra: {
          trustServerCertificate: true,
        },
      }),
    }),
    AuthModule,
    UserModule,
    ServicesModule,
    NotificationModule,
    RestrictAreaModule,
    ReferencePointModule,
    AnchorModule,
    TruckModule,
    SuntechModule,
    Mt2000Module,
    GrcadModule,
    TeltonikaModule,
    Gv57Module,
    Gv75Module,
    St390Module,
    Vl01Module,
    Vl02Module,
    Vl03Module,
    J16Module,
    St410Module,
    St380Module,
    Fmc130Module,
    St8310Module,
    St8300Module,
    GeminiModule,
  ],
  controllers: [],
  providers: [verifyCertification],
})
export class AppModule {}
