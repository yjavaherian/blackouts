import { relations } from "drizzle-orm/relations";
import { locations, blackouts, users, sessions } from "./schema";

export const blackoutsRelations = relations(blackouts, ({one}) => ({
	location: one(locations, {
		fields: [blackouts.locationId],
		references: [locations.id]
	}),
}));

export const locationsRelations = relations(locations, ({many}) => ({
	blackouts: many(blackouts),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	sessions: many(sessions),
}));