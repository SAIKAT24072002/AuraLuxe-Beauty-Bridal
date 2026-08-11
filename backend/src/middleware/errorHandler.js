export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
  });
}

export function errorHandler(error, _req, res, _next) {
  if (error?.name === "MulterError") {
    res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Uploaded image is too large. Maximum size is 5MB."
          : "Image upload failed validation.",
    });
    return;
  }

  if (error?.code === 11000) {
    res.status(409).json({
      success: false,
      message: "Duplicate data conflict.",
      details: error.keyValue,
    });
    return;
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong.",
    details: error.details,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
}
