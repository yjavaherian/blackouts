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
	`bill_id` text NOT NULL,
	`user_id` integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` integer PRIMARY KEY,
	`mobile` text NOT NULL,
	`auth_token` text,
	`created_at` text NOT NULL,
	`last_login` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sessions` (
	`id` text PRIMARY KEY,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);