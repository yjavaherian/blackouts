import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey(),
	mobile: text('mobile').notNull().unique(),
	authToken: text('auth_token'), // Bargheman API token
	createdAt: text('created_at').notNull(),
	lastLogin: text('last_login'),
	lastRefresh: text('last_refresh') // Store last refresh timestamp directly on user
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at').notNull()
});

export const locations = sqliteTable('locations', {
	id: integer('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	billId: text('bill_id').notNull()
});

export const blackouts = sqliteTable('blackouts', {
	id: integer('id').primaryKey(),
	locationId: integer('location_id')
		.notNull()
		.references(() => locations.id, { onDelete: 'cascade' }),
	outageDate: text('outage_date').notNull(),
	startTime: text('start_time').notNull(),
	endTime: text('end_time').notNull(),
	reason: text('reason'),
	address: text('address')
});

export const usersRelations = relations(users, ({ many, one }) => ({
	locations: many(locations),
	sessions: many(sessions)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const locationsRelations = relations(locations, ({ many, one }) => ({
	blackouts: many(blackouts),
	user: one(users, {
		fields: [locations.userId],
		references: [users.id]
	})
}));

export const blackoutsRelations = relations(blackouts, ({ one }) => ({
	location: one(locations, {
		fields: [blackouts.locationId],
		references: [locations.id]
	})
}));
