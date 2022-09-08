import { Handler } from "express";
import counterService from "../service/counter.service";

class CounterController {
  createCounter: Handler = async (req, res, next) => {
    try {
      const counter = await counterService.createCounter(req.body);
      return res.status(201).json(counter);
    } catch (e) {
      next(e);
    }
  };

  updateCounter: { (counterIdParamKey: string): Handler } =
    (counterIdParamKey) => async (req, res, next) => {
      try {
        const counter = await counterService.updateCounter(
          Number(req.params[counterIdParamKey]),
          req.body
        );
        res.status(200).json(counter);
      } catch (e) {
        next(e);
      }
    };

  getCounter: { (counterIdParamKey: string): Handler } =
    (counterIdParamKey) => async (req, res, next) => {
      try {
        const counter = await counterService.getCounter(
          Number(req.params[counterIdParamKey])
        );
        res.status(200).json(counter);
      } catch (e) {
        next(e);
      }
    };

  deleteCounter: { (counterIdParamKey: string): Handler } =
    (counterIdParamKey) => async (req, res, next) => {
      try {
        await counterService.deleteCounter(
          Number(req.params[counterIdParamKey])
        );
        res.status(200).send();
      } catch (e) {
        next(e);
      }
    };
}

export default new CounterController();
