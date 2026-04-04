import { catalogs } from "../../shared/catalogs.js";
import { User } from "../models/User.js";

export async function getMetaOptions() {
  const users = await User.find({ active: true }).select("_id name email").sort({ name: 1 }).lean();

  return {
    users: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email
    })),
    catalogs
  };
}
