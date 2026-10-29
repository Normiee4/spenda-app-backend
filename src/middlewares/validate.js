import ApiError from '../utils/ApiError.js';

const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }

  Object.defineProperty(req, source, {
    value: result.data,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  return next();
};

export default validate;
