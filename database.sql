create type role as enum ('user', 'superuser');

alter type role owner to postgres;

create table users
(
    id           varchar(50) not null
        primary key,
    first_name   varchar(100),
    last_name    varchar(100),
    email        varchar(100),
    password     varchar(100),
    phone_number varchar(100),
    created_at   timestamp default CURRENT_TIMESTAMP,
    role         role      default 'user'::role
);

alter table users
    owner to postgres;

