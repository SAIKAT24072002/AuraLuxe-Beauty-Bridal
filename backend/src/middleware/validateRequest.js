import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";

export function validateRequest(schema) {
  return async (req, _res, next) => {
    try {
      req.validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ApiError(
            400,
            "Validation failed.",
            error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            }))
          )
        );
        return;
      }
      next(error);
    }
  };
}

