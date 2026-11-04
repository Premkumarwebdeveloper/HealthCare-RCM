// Validates req[source] with a zod schema and replaces it with the parsed value.
module.exports =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    req[source] = result.data;
    return next();
  };
