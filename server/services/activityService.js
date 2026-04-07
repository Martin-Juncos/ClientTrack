import { Interaction } from "../models/Interaction.js";
import { Task } from "../models/Task.js";

export async function getRecentActivity() {
  const [interactions, tasks] = await Promise.all([
    Interaction.find()
      .populate("createdBy", "name")
      .populate("opportunityId", "status solutionType")
      .sort({ occurredAt: -1 })
      .limit(12)
      .lean(),
    Task.find()
      .populate("institutionId", "name")
      .populate("responsibleId", "name")
      .sort({ updatedAt: -1 })
      .limit(12)
      .lean()
  ]);

  const feed = [
    ...interactions.map((item) => ({
      id: item._id.toString(),
      type: "interaction",
      title: item.summary,
      timestamp: item.occurredAt,
      detail: item.result,
      createdBy: item.createdBy?.name ?? "Sin usuario"
    })),
    ...tasks.map((item) => ({
      id: item._id.toString(),
      type: "task",
      title: item.title,
      timestamp: item.updatedAt,
      detail: item.status,
      createdBy: item.responsibleId?.name ?? "Sin responsable"
    }))
  ]
    .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))
    .slice(0, 20);

  return { feed };
}
