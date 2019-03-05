CREATE TABLE `user` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`name` varchar(100) NOT NULL,
	`password` varchar(100),
	`role` varchar(100) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `game` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`creation_time` DATETIME NOT NULL,
	`status` varchar(100000) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `user_game` (
	`id_user` INT(11) NOT NULL,
	`id_game` INT(11) NOT NULL
);

CREATE TABLE `user_stat` (
	`id_user` INT(11) NOT NULL,
	`id_stat` INT(11) NOT NULL,
	`status` INT(11) NOT NULL
);

CREATE TABLE `stat` (
	`id` INT(11) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(280) NOT NULL,
	`code` varchar(100000) NOT NULL,
	`code` varchar(100000) NOT NULL,
	PRIMARY KEY (`id`)
);

ALTER TABLE `user_game` ADD CONSTRAINT `user_game_fk0` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`);

ALTER TABLE `user_game` ADD CONSTRAINT `user_game_fk1` FOREIGN KEY (`id_game`) REFERENCES `game`(`id`);

ALTER TABLE `user_stat` ADD CONSTRAINT `user_stat_fk0` FOREIGN KEY (`id_user`) REFERENCES `user`(`id`);

ALTER TABLE `user_stat` ADD CONSTRAINT `user_stat_fk1` FOREIGN KEY (`id_stat`) REFERENCES `stat`(`id`);

