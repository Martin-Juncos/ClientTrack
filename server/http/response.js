export function sendOk(res, data, meta) {
  return res.status(200).json({
    success: true,
    data,
    meta: meta ?? undefined
  });
}

export function sendCreated(res, data) {
  return res.status(201).json({
    success: true,
    data
  });
}
