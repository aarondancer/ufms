/* eslint-disable no-console */
import "reflect-metadata";

import { dataSource } from "./ormconfig";
import { UserEntity } from "../modules/user/user.entity";
import { userSeeds } from "./seeds/users";
import { FeedbackEntity } from "../modules/feedback/feedback.entity";
import { feedbackSeeds } from "./seeds/feedback.seeds";
import { featureRequestSeeds } from "./seeds/feature-requests.seeds";
import { FeatureRequestEntity } from "../modules/featureRequest/featureRequest.entity";
import { FeatureUpdateEntity } from "../modules/featureRequest/featureUpdate.entity";
import { FeatureRequestFeedbackEntity } from "../modules/featureRequest/featureRequestFeedback.entity";

dataSource
  .initialize()
  .then(async (ds) => {
    await ds.query(
      `DO $$
        DECLARE
            table_name text;
        BEGIN
            FOR table_name IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'migrations')
            LOOP
                EXECUTE 'TRUNCATE TABLE public.' || table_name || ' RESTART IDENTITY CASCADE';
            END LOOP;
        END $$;`,
    );

    const userRepo = ds.getRepository(UserEntity);
    await userRepo.save(userSeeds.map((u) => userRepo.create(u)));

    const feedbackRepo = ds.getRepository(FeedbackEntity);
    const feedbackIdMap = new Map<string, FeedbackEntity>();
    const feedbackSeedEntities = feedbackSeeds.map((f) => {
      const entity = feedbackRepo.create(f);
      feedbackIdMap.set(f.id, entity);
      return entity;
    });
    await feedbackRepo.save(feedbackSeedEntities);

    const frUpdates = [] as FeatureUpdateEntity[];
    const frFeedbacks = [] as FeatureRequestFeedbackEntity[];
    const featureRequestRepo = ds.getRepository(FeatureRequestEntity);
    const featureUpdateRepository = ds.getRepository(FeatureUpdateEntity);
    const featureReqeustFeedbackRepo = ds.getRepository(
      FeatureRequestFeedbackEntity,
    );
    await featureRequestRepo.save(
      featureRequestSeeds.map(({ updates, feedbacks, ...fr }) => {
        const entity = featureRequestRepo.create(fr);
        entity.createdById = userSeeds[0].id;
        frUpdates.push(
          ...updates.map((u: Partial<FeatureUpdateEntity>) => {
            return featureUpdateRepository.create({
              ...u,
              featureRequestId: fr.id,
              createdById: userSeeds[0].id,
            });
          }),
        );
        frFeedbacks.push(
          ...feedbacks.map((f: string) => {
            return featureReqeustFeedbackRepo.create({
              feedbackId: f,
              featureRequestId: fr.id,
              createdById: userSeeds[0].id,
            });
          }),
        );
        return entity;
      }),
    );
    await featureUpdateRepository.save(frUpdates);
    await featureReqeustFeedbackRepo.save(frFeedbacks);

    await ds.destroy();
  })
  .catch((err) => {
    console.log(err);
  });
