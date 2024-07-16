DROP ROLE IF EXISTS app_user;
CREATE ROLE app_user;

-- auto-generated definition
create type activity as enum ('login', 'logout', 'create', 'update', 'delete');

alter type activity owner to app_user;

-- auto-generated definition
create type role as enum ('user', 'superuser');

alter type role owner to app_user;


create table users
(
    id              varchar(50)  not null,
    first_name      varchar(100),
    last_name       varchar(100),
    email           varchar(100) not null
        unique,
    password        varchar(100),
    phone_number    varchar(100) not null unique,
    role            role      default 'user'::role,
    created_at      timestamp default CURRENT_TIMESTAMP,
    profile_picture bytea,
    primary key (email, id)
);

grant insert, select, update on users to app_user;

-- Create admin (Winner@00@!@)
INSERT INTO users VALUES ('admin-123312','admin','admin','admin@bpi.com','$2b$10$Ow.zY1am7ACanZ6xyhdWVeTESdIpWSL2deoG224vqzPg5ITkC2lqy','09176108252','superuser',NOW(),NULL);













