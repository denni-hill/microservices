import { Handler } from "express";
import counterScoreService from "../service/counter-score.service";

class CounterScoreController {
  createScore: Handler = async (req, res, next) => {
    try {
      const counterScore = await counterScoreService.createScore(req.body);
      return res.status(201).json(counterScore);
    } catch (e) {
      next(e);
    }
  };

  updateScore: { (counterScoreIdParamKey: string): Handler } =
    (counterScoreIdParamKey) => async (req, res, next) => {
      try {
        const counterScore = await counterScoreService.updateScoreNote(
          Number(req.params[counterScoreIdParamKey]),
          req.body
        );
        return res.status(200).json(counterScore);
      } catch (e) {
        next(e);
      }
    };

  deleteScore: { (counterScoreIdParamKey: string): Handler } =
    (counterScoreIdParamKey) => async (req, res, next) => {
      try {
        await counterScoreService.deleteScore(
          Number(req.params[counterScoreIdParamKey])
        );
        return res.status(200).send();
      } catch (e) {
        next(e);
      }
    };
}

export default new CounterScoreController();
