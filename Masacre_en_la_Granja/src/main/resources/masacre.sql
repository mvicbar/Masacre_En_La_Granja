-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-02-2019 a las 14:06:31
-- Versión del servidor: 10.1.36-MariaDB
-- Versión de PHP: 7.2.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `masacre`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `deaths`
--

CREATE TABLE `deaths` (
  `id_killer` int(11) UNSIGNED NOT NULL,
  `id_murdered` int(11) UNSIGNED NOT NULL,
  `num_deaths` int(11) UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `game`
--

CREATE TABLE `game` (
  `id` int(11) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `status`
--

CREATE TABLE `status` (
  `id_game` int(11) UNSIGNED NOT NULL,
  `id_status` int(11) UNSIGNED NOT NULL,
  `order` varchar(500) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `data` varchar(1000) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `password` varchar(100) CHARACTER SET latin1 COLLATE latin1_spanish_ci NOT NULL,
  `won_games` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `lost_games` int(11) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_achievements`
--

CREATE TABLE `user_achievements` (
  `id_user` int(11) UNSIGNED NOT NULL,
  `first_game` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `devoured` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `survive` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `10_games` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `100_games` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `draw` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `win_as_vampire` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `win_as_human` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `majors_murder` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `loved` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `boring_night` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `fool_discovered` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `kill_the_old_man` tinyint(1) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_game`
--

CREATE TABLE `user_game` (
  `id_user` int(11) UNSIGNED NOT NULL,
  `id_game` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_roles`
--

CREATE TABLE `user_roles` (
  `id_user` int(11) UNSIGNED NOT NULL,
  `vampiro` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `conde` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `humano` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `adivina` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `cazavampiros` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `alquimista` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `picaro` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `niña` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `alcalde` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `dama_noche` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `borracho` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `tonto` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `anciano` int(11) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `deaths`
--
ALTER TABLE `deaths`
  ADD UNIQUE KEY `unique_user_murder` (`id_killer`,`id_murdered`),
  ADD KEY `id_killer` (`id_killer`),
  ADD KEY `id_murdered` (`id_murdered`);

--
-- Indices de la tabla `game`
--
ALTER TABLE `game`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `status`
--
ALTER TABLE `status`
  ADD UNIQUE KEY `unique_status_game` (`id_game`,`id_status`),
  ADD KEY `id_game` (`id_game`),
  ADD KEY `id_status` (`id_status`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD PRIMARY KEY (`id_user`);

--
-- Indices de la tabla `user_game`
--
ALTER TABLE `user_game`
  ADD UNIQUE KEY `unique_user_game` (`id_user`,`id_game`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_game` (`id_game`);

--
-- Indices de la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `game`
--
ALTER TABLE `game`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `status`
--
ALTER TABLE `status`
  MODIFY `id_status` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `deaths`
--
ALTER TABLE `deaths`
  ADD CONSTRAINT `id_killer_fk` FOREIGN KEY (`id_killer`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `id_murdered_fk` FOREIGN KEY (`id_murdered`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `status`
--
ALTER TABLE `status`
  ADD CONSTRAINT `id_game_fk` FOREIGN KEY (`id_game`) REFERENCES `game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_achievements`
--
ALTER TABLE `user_achievements`
  ADD CONSTRAINT `id_user_achievements_fk` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_game`
--
ALTER TABLE `user_game`
  ADD CONSTRAINT `id_game_fk_user_game` FOREIGN KEY (`id_game`) REFERENCES `game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `id_user_fk_user_game` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `id_user_fk` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
