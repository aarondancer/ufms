/* eslint-disable max-len */
import { MigrationInterface, QueryRunner } from "typeorm";

export class Flatten1700444355898 implements MigrationInterface {
    name = 'Flatten1700444355898';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "first_name" character varying, "last_name" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "email" character varying, "password" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."feedbacks_status_enum" AS ENUM('UNREVIEWED', 'REVIEWED')`);
        await queryRunner.query(`CREATE TYPE "public"."feedbacks_source_enum" AS ENUM('ONLINE_FORM', 'EXTERNAL')`);
        await queryRunner.query(`CREATE TABLE "feedbacks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "status" "public"."feedbacks_status_enum" NOT NULL DEFAULT 'UNREVIEWED', "source" "public"."feedbacks_source_enum" NOT NULL DEFAULT 'ONLINE_FORM', "ip" character varying NOT NULL, "text" text NOT NULL, "sentiment_score" numeric NOT NULL DEFAULT '0', CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."feature_updates_type_enum" AS ENUM('STATUS', 'COMMENT')`);
        await queryRunner.query(`CREATE TABLE "feature_updates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."feature_updates_type_enum" NOT NULL, "text" character varying NOT NULL, "feature_request_id" uuid NOT NULL, "created_by" uuid NOT NULL, CONSTRAINT "PK_5e7250786fc6497b54723181140" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."feature_requests_status_enum" AS ENUM('UNSCHEDULED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "feature_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "status" "public"."feature_requests_status_enum" NOT NULL DEFAULT 'UNSCHEDULED', "description" text NOT NULL, "created_by" uuid NOT NULL, CONSTRAINT "PK_f5741ccd82f3784d78f94fb57e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feature_request_feedbacks" ("feedback_id" uuid NOT NULL, "feature_request_id" uuid NOT NULL, "created_by_id" uuid NOT NULL, CONSTRAINT "PK_45ce17f0124896288f994af3894" PRIMARY KEY ("feedback_id", "feature_request_id"))`);
        await queryRunner.query(`ALTER TABLE "feature_request_feedbacks" DROP COLUMN "created_by_id"`);
        await queryRunner.query(`ALTER TABLE "feature_request_feedbacks" ADD "created_by_id" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_784e6bcc07b180fce8449f2730" ON "feature_request_feedbacks" ("feedback_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_fdb4e3f1fba962dc490d2f7df3" ON "feature_request_feedbacks" ("feature_request_id") `);
        await queryRunner.query(`ALTER TABLE "feature_updates" ADD CONSTRAINT "FK_504ae48653a4beaf8157c9679b7" FOREIGN KEY ("feature_request_id") REFERENCES "feature_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature_updates" ADD CONSTRAINT "FK_3516fbda02a6b67cbcd767dabf7" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature_requests" ADD CONSTRAINT "FK_c6d1652b9d3af5a99e8c44dbd10" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature_request_feedbacks" ADD CONSTRAINT "FK_784e6bcc07b180fce8449f27301" FOREIGN KEY ("feedback_id") REFERENCES "feedbacks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature_request_feedbacks" ADD CONSTRAINT "FK_fdb4e3f1fba962dc490d2f7df3d" FOREIGN KEY ("feature_request_id") REFERENCES "feature_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature_request_feedbacks" ADD CONSTRAINT "FK_40dc2bfb5e9f0cc8b55f71cdf92" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feature_request_feedbacks" DROP CONSTRAINT "FK_40dc2bfb5e9f0cc8b55f71cdf92"`);
        await queryRunner.query(`ALTER TABLE "feature_request_feedbacks" DROP CONSTRAINT "FK_fdb4e3f1fba962dc490d2f7df3d"`);
        await queryRunner.query(`ALTER TABLE "feature_request_feedbacks" DROP CONSTRAINT "FK_784e6bcc07b180fce8449f27301"`);
        await queryRunner.query(`ALTER TABLE "feature_requests" DROP CONSTRAINT "FK_c6d1652b9d3af5a99e8c44dbd10"`);
        await queryRunner.query(`ALTER TABLE "feature_updates" DROP CONSTRAINT "FK_3516fbda02a6b67cbcd767dabf7"`);
        await queryRunner.query(`ALTER TABLE "feature_updates" DROP CONSTRAINT "FK_504ae48653a4beaf8157c9679b7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fdb4e3f1fba962dc490d2f7df3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_784e6bcc07b180fce8449f2730"`);
        await queryRunner.query(`ALTER TABLE "feature_request_feedbacks" DROP COLUMN "created_by_id"`);
        await queryRunner.query(`ALTER TABLE "feature_request_feedbacks" ADD "created_by_id" uuid NOT NULL`);
        await queryRunner.query(`DROP TABLE "feature_request_feedbacks"`);
        await queryRunner.query(`DROP TABLE "feature_requests"`);
        await queryRunner.query(`DROP TYPE "public"."feature_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "feature_updates"`);
        await queryRunner.query(`DROP TYPE "public"."feature_updates_type_enum"`);
        await queryRunner.query(`DROP TABLE "feedbacks"`);
        await queryRunner.query(`DROP TYPE "public"."feedbacks_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."feedbacks_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
