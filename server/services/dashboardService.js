import { activeOpportunityStateValues, opportunityStates } from "../../shared/catalogs.js";
import { Institution } from "../models/Institution.js";
import { Interaction } from "../models/Interaction.js";
import { Opportunity } from "../models/Opportunity.js";
import { Task } from "../models/Task.js";
import { getDashboardHighlights } from "./opportunityService.js";

function startOfCurrentMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getDashboardSummary() {
  const monthStart = startOfCurrentMonth();
  const now = new Date();

  const [
    institutionsTotal,
    activeOpportunities,
    proposalsSent,
    scheduledInterviews,
    overdueTasks,
    wonThisMonth,
    pipelineCounts,
    upcomingTasks,
    recentInteractions,
    highlights
  ] = await Promise.all([
    Institution.countDocuments(),
    Opportunity.countDocuments({ status: { $in: activeOpportunityStateValues } }),
    Opportunity.countDocuments({ status: "proposal_sent" }),
    Opportunity.countDocuments({ status: "interview_scheduled" }),
    Task.countDocuments({
      status: { $in: ["pending", "in_progress"] },
      dueAt: { $lt: now }
    }),
    Opportunity.countDocuments({
      status: "won",
      closedAt: { $gte: monthStart }
    }),
    Opportunity.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Task.find({
      status: { $in: ["pending", "in_progress"] }
    })
      .populate("institutionId", "name primaryContact")
      .populate("responsibleId", "name email")
      .sort({ dueAt: 1 })
      .limit(6)
      .lean(),
    Interaction.find()
      .populate("createdBy", "name")
      .populate("opportunityId", "status solutionType")
      .sort({ occurredAt: -1 })
      .limit(6)
      .lean(),
    getDashboardHighlights()
  ]);

  const pipeline = opportunityStates.map((state) => ({
    ...state,
    count: pipelineCounts.find((entry) => entry._id === state.value)?.count ?? 0
  }));

  return {
    metrics: {
      institutionsTotal,
      activeOpportunities,
      proposalsSent,
      scheduledInterviews,
      overdueTasks,
      wonThisMonth
    },
    pipeline,
    upcomingTasks,
    recentInteractions,
    hotOpportunities: highlights.hotOpportunities,
    staleOpportunities: highlights.staleOpportunities
  };
}
