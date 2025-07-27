import { sqliteTable, AnySQLiteColumn, foreignKey, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const blackouts = sqliteTable("blackouts", {
	id: integer().primaryKey().notNull(),
	locationId: integer("location_id").notNull().references(() => locations.id, { onDelete: "cascade" } ),
	outageDate: text("outage_date").notNull(),
	startTime: text("start_time").notNull(),
	endTime: text("end_time").notNull(),
	reason: text(),
	address: text(),
});

export const locations = sqliteTable("locations", {
	id: integer().primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: text().notNull(),
	billId: text("bill_id").notNull(),
});

export const users = sqliteTable("users", {
	id: integer().primaryKey().notNull(),
	mobile: text().notNull(),
	authToken: text("auth_token"),
	createdAt: text("created_at").notNull(),
	lastLogin: text("last_login"),
	lastRefresh: text("last_refresh"),
},
(table) => [
	uniqueIndex("users_mobile_unique").on(table.mobile),
]);

export const sessions = sqliteTable("sessions", {
	id: text().primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	expiresAt: integer("expires_at").notNull(),
});

