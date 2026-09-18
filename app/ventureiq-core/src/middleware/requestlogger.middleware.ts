import {pinoHttp} from "pino-http";
import logger from "../config/logger.js";

export const requestLogger = pinoHttp({
  logger,

  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";

    return "info";
  },

  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} — ${res.statusCode}`,

  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} — ${res.statusCode} — ${err.message}`,

  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
    }),

    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});