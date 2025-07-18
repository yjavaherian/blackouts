CREATE TABLE IF NOT EXISTS `blackouts` (
	`id` integer PRIMARY KEY NOT NULL,
	`location_id` integer NOT NULL,
	`outage_date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`reason` text,
	`address` text,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `locations` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`bill_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `locations_bill_id_unique` ON `locations` (`bill_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
