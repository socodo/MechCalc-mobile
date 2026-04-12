CREATE TABLE `motors_dk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model` text NOT NULL,
	`power_kw` real NOT NULL,
	`speed_rpm` integer NOT NULL,
	`cos_phi` real NOT NULL,
	`starting_torque_ratio` real NOT NULL,
	`max_torque_ratio` real NOT NULL,
	`rotor_inertia_gd2` real NOT NULL,
	`weight_kg` real NOT NULL,
	`poles` integer NOT NULL,
	`sync_speed_rpm` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `motors_4a` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model` text NOT NULL,
	`power_kw` real NOT NULL,
	`speed_rpm` integer NOT NULL,
	`cos_phi` real NOT NULL,
	`efficiency_pct` real NOT NULL,
	`max_torque_ratio` real NOT NULL,
	`starting_torque_ratio` real NOT NULL,
	`poles` integer NOT NULL,
	`sync_speed_rpm` integer NOT NULL
);
