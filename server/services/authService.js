import bcrypt from "bcryptjs";
import { adminSeedUsers } from "../config/env.js";
import { ApiError } from "../http/apiError.js";
import { User } from "../models/User.js";

let seedPromise = null;

export function serializeUser(user) {
  return {
    id: user._id?.toString?.() ?? user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function seedAdminUsers() {
  if (!seedPromise) {
    seedPromise = Promise.all(
      adminSeedUsers.map(async (admin) => {
        const passwordHash = await bcrypt.hash(admin.password, 10);

        await User.findOneAndUpdate(
          { email: admin.email },
          {
            name: admin.name,
            email: admin.email,
            passwordHash,
            role: "admin",
            active: true
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        );
      })
    ).catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  await seedPromise;
}

export async function loginUser({ email, password }) {
  await seedAdminUsers();

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !user.active) {
    throw new ApiError(401, "Credenciales invalidas.", "invalid_credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Credenciales invalidas.", "invalid_credentials");
  }

  user.lastLoginAt = new Date();
  await user.save();

  return serializeUser(user);
}
