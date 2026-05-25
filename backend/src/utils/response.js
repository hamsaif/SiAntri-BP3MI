// SUCCESS RESPONSE
exports.success = (
  res,
  data = null,
  message = "success",
  metadata = {}
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    metadata,
    errors: null
  });
};

// ERROR RESPONSE
exports.error = (
  res,
  message = "error",
  status = 500,
  errors = null
) => {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    metadata: {},
    errors
  });
};