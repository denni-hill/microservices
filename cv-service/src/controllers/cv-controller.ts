import { build, validate } from "chain-validator-js";
import { EntityManager, FindManyOptions } from "typeorm";
import { PayloadedError } from "../app-types";
import {
  CreateController,
  DeleteController,
  ReadController,
  UpdateController
} from "../bootstrap/controllers";
import { defaultDataSource } from "../database";
import { CV } from "../entities/CV";
import { CVActivityPeriod } from "../entities/CV-activity-period";
import { CVContact } from "../entities/CV-contact";

type ValidatedCVData = {
  title: string;
  owner: string;
  contacts: Partial<CVContact>[];
  education: Partial<CVActivityPeriod>[];
  workExperience: Partial<CVActivityPeriod>[];
};

export class CVController
  implements
    CreateController<CV>,
    ReadController<CV>,
    UpdateController<CV>,
    DeleteController<CV>
{
  async create(data: Partial<CV>): Promise<CV> {
    const validatedData = await this.validateCVData(data);
    return await this.saveCV(new CV(), validatedData);
  }

  async get(findOptions?: FindManyOptions<CV>): Promise<CV[]> {
    return await defaultDataSource.manager.find<CV>(CV, findOptions);
  }

  async update(
    findOptions: FindManyOptions<CV>,
    data: Partial<CV>
  ): Promise<CV[]> {
    const validatedData = await this.validateCVData(data);
    const cvs = await defaultDataSource.manager.find<CV>(CV, findOptions);
    if (cvs.length === 0)
      throw new PayloadedError("Not found", {
        status: 404
      });

    const savedCVs: CV[] = [];
    await defaultDataSource.manager.transaction(async (manager) => {
      for (const cv of cvs) {
        savedCVs.push(await this.saveCV(cv, validatedData, manager));
      }
    });

    return savedCVs;
  }

  async delete(findOptions: FindManyOptions<CV>): Promise<void> {
    findOptions.relations = {
      ...findOptions.relations,
      education: true,
      workExperience: true
    };
    const CVs = await defaultDataSource.manager.find<CV>(CV, findOptions);
    if (CVs.length === 0)
      throw new PayloadedError("Not found", { status: 404 });

    let transactionError = undefined;
    await defaultDataSource.transaction(async (manager) => {
      try {
        for (const cv of CVs) {
          await manager.remove(cv.education);
          await manager.remove(cv.workExperience);
          await manager.remove(cv);
        }
      } catch (e) {
        transactionError = e;
      }
    });

    if (transactionError !== undefined) throw transactionError;
  }

  async validateCVData(data: unknown): Promise<ValidatedCVData> {
    const activityPeriodValidationRules = () =>
      build().schema<CVActivityPeriod>({
        title: build().isString().bail().isLength({ min: 1, max: 128 }),
        content: build().isString().bail().isLength({ min: 100 }),
        from: build()
          .isDate()
          .bail()
          .customSanitizer(() => async (d: number) => new Date(d)),
        to: build()
          .isDate()
          .bail()
          .customSanitizer(() => async (d: number) => new Date(d))
      });

    const validationResult = await validate(
      data,
      build().schema<CV>({
        title: build().isString().bail().isLength({ min: 3, max: 256 }),
        owner: build().isString().bail().isLength({ min: 1 }),
        contacts: build().isArray(
          build().schema<CVContact>({
            title: build().isString().bail().isLength({ min: 1, max: 128 }),
            link: build().isString().bail().isLength({ min: 1, max: 256 })
          })
        ),
        education: build().isArray(activityPeriodValidationRules()),
        workExperience: build().isArray(activityPeriodValidationRules())
      })
    );

    if (validationResult.failed)
      throw new PayloadedError("Validation Failed", {
        status: 400,
        payload: validationResult.errors
      });

    return validationResult.validated as ValidatedCVData;
  }

  async saveCV(
    cv: CV,
    validated: ValidatedCVData,
    manager: EntityManager = defaultDataSource.manager
  ): Promise<CV> {
    cv.title = validated.title;
    cv.owner = validated.owner;

    const savedCV = await manager.save<CV>(cv);

    cv.contacts = validated.contacts.map((contactData) =>
      Object.assign(new CVContact(), contactData, { CV: cv })
    );

    cv.education = validated.education.map((eduData) =>
      Object.assign(new CVActivityPeriod(), eduData)
    );

    cv.workExperience = validated.workExperience.map((exp) =>
      Object.assign(new CVActivityPeriod(), exp)
    );

    savedCV.contacts = await manager.save<CVContact>(cv.contacts);
    savedCV.education = await manager.save<CVActivityPeriod>(cv.education);
    savedCV.workExperience = await manager.save<CVActivityPeriod>(
      cv.workExperience
    );

    return await manager.save<CV>(savedCV);
  }
}
