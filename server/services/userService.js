import { ApiError } from "../http/apiError.js";
import { User } from "../models/User.js";

export async function assertActiveResponsibleUser(responsibleId) {
  const responsible = await User.findOne({
    _id: responsibleId,
    active: true
  })
    .select("_id")
    .lean();

  if (!responsible) {
    throw new ApiError(
      404,
      "El responsable seleccionado no existe o esta inactivo.",
      "responsible_not_available"
    );
  }

  return responsibleId;
}
