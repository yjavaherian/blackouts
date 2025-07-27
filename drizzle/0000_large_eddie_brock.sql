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
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`bill_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS  `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`mobile` text NOT NULL,
	`auth_token` text,
	`created_at` text NOT NULL,
	`last_login` text,
	`last_refresh` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_mobile_unique` ON `users` (`mobile`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS  `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);