import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const meta = sqliteTable('meta', {
	key: text('key').primaryKey(),
	value: text('value').notNull()
});

export const locations = sqliteTable('locations', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	billId: text('bill_id').notNull().unique()
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

export const locationsRelations = relations(locations, ({ many }) => ({
	blackouts: many(blackouts)
}));

export const blackoutsRelations = relations(blackouts, ({ one }) => ({
	location: one(locations, {
		fields: [blackouts.locationId],
		references: [locations.id]
	})
}));
