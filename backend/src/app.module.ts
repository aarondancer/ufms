import "./boilerplate.polyfill";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { addTransactionalDataSource } from "typeorm-transactional";

import { AuthModule } from "./modules/auth/auth.module";
import { FeatureRequestModule } from "./modules/featureRequest/featureRequest.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { UserModule } from "./modules/user/user.module";
import { ApiConfigService } from "./shared/services/api-config.service";
import { SharedModule } from "./shared/shared.module";

@Module({
  imports: [
    AuthModule,
    UserModule,
    FeedbackModule,
    FeatureRequestModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.postgresConfig,
      inject: [ApiConfigService],
      dataSourceFactory: (options) => {
        if (!options) {
          throw new Error("Invalid options passed");
        }

        return Promise.resolve(
          addTransactionalDataSource(new DataSource(options)),
        );
      },
    }),
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
