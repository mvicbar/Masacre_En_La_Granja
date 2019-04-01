-- 
-- SQL script that will be used to initialize the database
-- Note that the syntax is very picky. A reference is available at
--   http://www.hsqldb.org/doc/guide/sqlgeneral-chapt.html
-- 
-- When writing INSERT statements, the order must be exactly as found in
-- the server logs (search for "create table user"), or as 
-- specified within (creation-compatible) parenthesis:
--     INSERT INTO user(id,enabled,login,password,roles) values (...)
-- vs
--     INSERT INTO user VALUES (...)
-- You can find the expected order by inspecting the output of Hibernate
-- in your server logs (assuming you use Spring + JPA)
--

-- On passwords:
--
-- valid bcrypt-iterated, salted-and-hashed passwords can be generated via
-- https://www.dailycred.com/article/bcrypt-calculator
-- (or any other implementation) and prepending the text '{bcrypt}'
--

--a user with password 'a'
INSERT INTO user(id, name, password, role) VALUES(1, 'mac', '{bcrypt}$2a$04$2ao4NQnJbq3Z6UeGGv24a.wRRX0FGq2l5gcy2Pjd/83ps7YaBXk9C', 'USER');

--a user with password 'p'
INSERT INTO user(id, name, password, role) VALUES(1, 'tor', '{bcrypt}$2a$04$5v02dQ.kxt7B5tJIA4gh3u/JFQlxmoCadSnk76PnvoN35Oz.ge3GK', 'USER');

--a user with password 'q'
INSERT INTO user(id, name, password, role) VALUES(1, 'bet', '{bcrypt}$2a$04$9rrSETFYL/gqiBxBCy3DMOIZ6qmLigzjqnOGbsNji/bt65q.YBfjK', 'USER');

--another user with password 'a'
INSERT INTO user(id, name, password, role) VALUES(1, 'sir', '{bcrypt}$2a$04$2ao4NQnJbq3Z6UeGGv24a.wRRX0FGq2l5gcy2Pjd/83ps7YaBXk9C', 'USER');

--another user with password 'p'
INSERT INTO user(id, name, password, role) VALUES(1, 'cat', '{bcrypt}$2a$04$5v02dQ.kxt7B5tJIA4gh3u/JFQlxmoCadSnk76PnvoN35Oz.ge3GK', 'USER');

--another user with password 'q'
INSERT INTO user(id, name, password, role) VALUES(1, 'scar', '{bcrypt}$2a$04$9rrSETFYL/gqiBxBCy3DMOIZ6qmLigzjqnOGbsNji/bt65q.YBfjK', 'USER');

--a last user with password 'a'
INSERT INTO user(id, name, password, role) VALUES(1, 'chiu', '{bcrypt}$2a$04$2ao4NQnJbq3Z6UeGGv24a.wRRX0FGq2l5gcy2Pjd/83ps7YaBXk9C', 'USER');

