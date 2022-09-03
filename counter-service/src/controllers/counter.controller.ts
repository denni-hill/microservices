import { Handler } from "express";
import NotFoundError from "../errors/not-found.error";
import logger from "../logger";
import counterService from "../service/counter.service";

class CounterController {
  createCounter: Handler = async (req, res, next) => {
    try {
      const counter = await counterService.createCounter(req.body);
      logger.info("Counter created", { counter });
      return res.status(201).json(counter);
    } catch (e) {
      next(e);
    }
  };

  updateCounter: Handler = async (req, res, next) => {
    try {
      const counter = await counterService.updateCounter(
        Number(req.params.counterId),
        req.body
      );
      logger.info("Counter updated", { counter });
      res.status(200).json(counter);
    } catch (e) {
      next(e);
    }
  };

  getCounter: Handler = async (req, res, next) => {
    try {
      const counter = await counterService.getCounter(
        Number(req.params.counterId)
      );
      res.status(200).json(counter);
    } catch (e) {
      next(e);
    }
  };

  deleteCounter: Handler = async (req, res, next) => {
    try {
      if (
        (await counterService.deleteCounter(Number(req.params.counterId))) > 0
      ) {
        logger.info("Counter deleted", {
          counterId: Number(req.params.counterId)
        });
        res.status(200).send();
      } else
        throw new NotFoundError({ counterId: Number(req.params.counterId) });
    } catch (e) {
      next(e);
    }
  };
}

export default new CounterController();
