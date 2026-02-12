+++
title = "Become poweruser with psql"
date = 2026-02-12

[taxonomies]
tags = ["Databases", "Programming", "Postgresql"]
+++

I think we all love Postgres. It's fast, it's efficient and it's free to use. Nowadays when I am thinking of creating SQL like database, I am choosing Postgres as my primary target.
For local development it is pretty much always deployed by me in a docker container, but the question is - how do you access it? Some people use built into IDEs database management interfaces, some use dedicated tools (such as pgAdmin or DBeaver) but me personally, for my basic development needs, I get away with using `psql` (and it's in terminal!).
In this article I will show you what are the common useful things one can do with it. 

**Prerequisites**:
- Basic **SQL** understanding
- Terminal

<!-- more -->
--- 


{% alert(type="info", title="AI Notice") %}
AI was **not** used in writing this article. 

AI was however used in generating a script for a mock database.
You can see the script on [Github](https://gist.github.com/RevinderDev/ed01a4b876dffd7c5854c0f8d8013d6c)
{% end %}


## Setup

Imagine we deploy our Postgres in docker using docker compose, perhaps you will do it roughly like so:

```yaml
  my-db:
    image: postgres:17.5
    container_name: my-db
    environment:
      - POSTGRES_USER=${POSTGRES__DB_USER}
      - POSTGRES_PASSWORD=${POSTGRES__DB_PASSWORD}
      - POSTGRES_DB=${POSTGRES__DB}
    ports:
      - "5435:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: [ "CMD-SHELL", "pg_isready -d ${POSTGRES__DB} -U ${POSTGRES__DB_USER}" ]
      interval: 1s
      timeout: 5s
      retries: 10
```

I like to include the `healthcheck` key because it can be leveraged in `depends_on` clause for my web service.
Naturally, I am going to be particularly original about naming and I am going to name my variables like so:

{% alert(type="warning", title="Warning!") %}
This `healthcheck` checks if the database server accepts connections **only**. It does not check if the database exists. For purposes of a web server, this is fine, but perhaps you might want to avoid it and make it see if the database exists in the first place!
{% end %}

```env
POSTGRES__DB_USER=postgres
POSTGRES__DB_PASSWORD=postgres
POSTGRES__DB=mydb
```

We up it with `$ docker compose up` and voilà! Our database is alive:

```sh
$ docker ps
CONTAINER ID   IMAGE           COMMAND                  CREATED          STATUS                    PORTS                                         NAMES
10b2f0530af0   postgres:17.5   "docker-entrypoint.s…"   20 seconds ago   Up 19 seconds (healthy)   0.0.0.0:5435->5432/tcp, [::]:5434->5432/tcp   my-db
```


{% alert(type="warning", title="Warning!") %}
The database `mydb` will only be created if the directory for data (that is `pgdata:/var/lib/postgresql/data`) is **empty**. In other words, during the first run and not afterwards!
{% end %}


So now, in order to get our psql running, we can connect to the docker like so:

```sh
$ docker exec -it my-db psql -U postgres -d mydb
psql (17.5 (Debian 17.5-1.pgdg130+1))
Type "help" for help.

mydb=#
```

And we are in!

## psql and what can we do with it

So what is [psql](https://www.postgresql.org/docs/current/app-psql.html)? As docs define it, it is a frontend terminal based application for Postgres. It enables you to query database but also has a shell like behaviour you would expect from a normal shell. It does have some meta commands on top of it, some of which I will showcase today!

Let's list available databases for us by running:

```psql
mydb=# \l+
                                                                                      List of databa
ses
   Name    |  Owner   | Encoding | Locale Provider |  Collate   |   Ctype    | Locale | ICU Rules |
  Access privileges   |  Size   | Tablespace |                Description
-----------+----------+----------+-----------------+------------+------------+--------+-----------+-
----------------------+---------+------------+--------------------------------------------
 postgres  | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
                      | 7507 kB | pg_default | default administrative connection database
 template0 | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
=c/postgres          +| 7353 kB | pg_default | unmodifiable empty database
           |          |          |                 |            |            |        |           |
postgres=CTc/postgres |         |            |
 template1 | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
=c/postgres          +| 7579 kB | pg_default | default template for new databases
           |          |          |                 |            |            |        |           |
postgres=CTc/postgres |         |            |
 mydb   | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
                      | 7795 kB | pg_default |
(4 rows)

(END)
```

{% character(name="Monk", position="right") %}
Hey!! That looks terrible! the characters are everywhere and lines don't match. It's unreadable!!
{% end %}

{% character(name="CoolPizza", position="left") %}
That's because your terminal is too small to show the entire table! You can use `\x auto` for *Expanded auto mode* which switches intelligently between horizontal and vertical showing of table, such that it fits in a given terminal.
{% end %}

Let's do just that!

```psql
mydb=# \x auto
Expanded display is used automatically.
mydb=# \l+
List of databases
-[ RECORD 1 ]-----+-------------------------------------------
Name              | postgres
Owner             | postgres
Encoding          | UTF8
Locale Provider   | libc
Collate           | en_US.utf8
Ctype             | en_US.utf8
Locale            |
ICU Rules         |
Access privileges |
Size              | 7507 kB
Tablespace        | pg_default
Description       | default administrative connection database
-[ RECORD 2 ]-----+-------------------------------------------
Name              | template0
Owner             | postgres
Encoding          | UTF8
Locale Provider   | libc
Collate           | en_US.utf8
Ctype             | en_US.utf8
Locale            |
ICU Rules         |
Access privileges | =c/postgres                               +
                  | postgres=CTc/postgres
Size              | 7353 kB
Tablespace        | pg_default
Description       | unmodifiable empty database
-[ RECORD 3 ]-----+-------------------------------------------
Name              | template1
Owner             | postgres
Encoding          | UTF8
Locale Provider   | libc
Collate           | en_US.utf8
Ctype             | en_US.utf8
Locale            |
ICU Rules         |
Access privileges | =c/postgres                               +
                  | postgres=CTc/postgres
Size              | 7579 kB
Tablespace        | pg_default
Description       | default template for new databases
-[ RECORD 4 ]-----+-------------------------------------------
Name              | mydb
Owner             | postgres
Encoding          | UTF8
Locale Provider   | libc
Collate           | en_US.utf8
Ctype             | en_US.utf8
Locale            |
ICU Rules         |
Access privileges |
Size              | 7795 kB
Tablespace        | pg_default
Description       |
```

Nice! It fits! And we've learned here two meta commands:

- `\x [ on | off | auto ]` - (or `\pset expanded`) which outputs stuff in expanded mode. You can also have it be supplied automatically when invoking `psql` itself by adding `-x` to it.
- `\l` or `\list` `[ pattern ]` - lists you database or a specific database that matches `[ pattern ]`. e.g. `\l postgres`

But what is that `+` I have added to `\l` before? It allows to display extra information about database objects. You can think of it as verbose flag. For the `\l` it adds `Size`, `Tablespace` and `Description` columns. More often than not, I am surprised how little space my databases are taking thanks to the `Size` column ;).

With that, let's keep going!

* `\c` or `\connect [ -reuse-previous=on|off ] [ dbname [ username ] [ host ] [ port ] | conninfo ]` - allows you to connect to a different database. As you  can see based on arguments, you can specify different username and host as well, though I have never used it this way. I only use it to simply swap to another db listed from `\l` by doing `\c postgres`. 

## Describe

Describe or display is a meta command `\d` which helps you, well, display database objects on the screen.
And this is pretty comprehensive, as it allows to display *everything*. Sequences, indexes, tables, views - you name it! 
The docs themselves are [pretty readable](https://www.postgresql.org/docs/current/app-psql.html#APP-PSQL-META-COMMAND-D), though they do not give clear examples, but this is where this article will help you out.

On our mock database, let's see what's in here:

```psql
mydb=# \d
                      List of relations
 Schema |             Name             |   Type   |  Owner
--------+------------------------------+----------+----------
 public | posts                        | table    | postgres
 public | posts_post_id_seq            | sequence | postgres
 public | user_profiles                | table    | postgres
 public | user_profiles_profile_id_seq | sequence | postgres
 public | users                        | table    | postgres
 public | users_user_id_seq            | sequence | postgres
```

What about list of just tables?

```psql
mydb=# \dt+
List of relations
-[ RECORD 1 ]-+--------------
Schema        | public
Name          | posts
Type          | table
Owner         | postgres
Persistence   | permanent
Access method | heap
Size          | 16 kB
Description   |
-[ RECORD 2 ]-+--------------
Schema        | public
Name          | user_profiles
Type          | table
Owner         | postgres
Persistence   | permanent
Access method | heap
Size          | 16 kB
Description   |
-[ RECORD 3 ]-+--------------
Schema        | public
Name          | users
Type          | table
Owner         | postgres
Persistence   | permanent
Access method | heap
Size          | 16 kB
Description   |
```

So we have 3 tables, each of which has `16 kB` and is stored on heap. Do we have any custom data types?

```psql
mydb=# \dT
           List of data types
 Schema |      Name       | Description
--------+-----------------+-------------
 public | membership_tier |
(1 row)
```


{% character(name="Monk", position="right") %}
That... is not that useful.. Just the name of the data type?
{% end %}

{% character(name="CoolPizza", position="left") %}
You forgot the `+` for detailed information!
{% end %}

```psql
mydb=# \dT+
List of data types
-[ RECORD 1 ]-----+----------------
Schema            | public
Name              | membership_tier
Internal name     | membership_tier
Size              | 4
Elements          | Basic          +
                  | Premium        +
                  | Elite
Owner             | postgres
Access privileges |
Description       |
```

So we have an Enum with 3 elements. But what about the tables themselves? What's on them?
Let's examine `users` table.

```psql
mydb=# \d users
                                         Table "public.users"
   Column   |           Type           | Collation | Nullable |                Default
------------+--------------------------+-----------+----------+----------------------------------------
 user_id    | integer                  |           | not null | nextval('users_user_id_seq'::regclass)
 username   | text                     |           | not null |
 email      | text                     |           | not null |
 tier       | membership_tier          |           |          | 'Basic'::membership_tier
 created_at | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "users_pkey" PRIMARY KEY, btree (user_id)
    "users_username_key" UNIQUE CONSTRAINT, btree (username)
Referenced by:
    TABLE "posts" CONSTRAINT "posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(user_id)
    TABLE "user_profiles" CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
```

O, nice! We actually learned quite a bit. Our table has 5 columns. It's using 2 indexes, one of which has to be unique. It's referenced by two tables `posts` and `user_profiles`. Feel free to experiment yourself with `+` here ;).

Let's summarise what we've used:
- `\d` lets us see all entities within db - sequences, views, tables, materialised views and so on.
- `\dt` lists all the *tables* only.
- `\dT` lists all the *data types*. For me, this has been extremely handy for ENUMs.
- `\d [table_name]` allows me get detailed description of a specified entity. For tables, this is columns, indexes and references. Try yourself for sequences and views!
- `\df` lists all the functions. (And a corresponding `\sf [function_name]` for code of a view)
- `\ds` lists all the sequences.
- `\dv` lists all the views. (And a corresponding `\sv [view]` for code of a view)

{% alert(type="info", title="Entity Relationship Diagram") %}
One would kinda see that with multiple references and multiple tables, reading the output here will be much more harder than seeing the Entity Relationship diagram. That is unfortunately a limit of `psql` utility, as I was not able to find a way to create one. For that, your best bet is to use something like `pgAdmin` or `DBeaver` to see the entire diagram. Fortunately, this is rarely needed for my own workflow.
{% end %}

## But what exactly is meta command?

Okay, we've seen some pretty cool examples. But what are those? Programs? Scripts? And why bother using them myself if I can always query it directly using postgres native functions such as `pg_database_size(oid)`?

Those are good questions and an indication of a curiosity. Valuable trait for an engineer!
You can run the `psql` with `-E` flag, which let's you do *internal query peeking*. From that point onwards, if you run a meta command, you will see corresponding executed SQL query to get the data - thus answering all your questions from above:

```psql
mydb=# \dt
/******** QUERY *********/
SELECT n.nspname as "Schema",
  c.relname as "Name",
  CASE c.relkind WHEN 'r' THEN 'table' WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view' WHEN 'i' THEN 'index' WHEN 'S' THEN 'sequence' WHEN 't' THEN 'TOAST table' WHEN 'f' THEN 'foreign table' WHEN 'p' THEN 'partitioned table' WHEN 'I' THEN 'partitioned index' END as "Type",
  pg_catalog.pg_get_userbyid(c.relowner) as "Owner"
FROM pg_catalog.pg_class c
     LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     LEFT JOIN pg_catalog.pg_am am ON am.oid = c.relam
WHERE c.relkind IN ('r','p','')
      AND n.nspname <> 'pg_catalog'
      AND n.nspname !~ '^pg_toast'
      AND n.nspname <> 'information_schema'
  AND pg_catalog.pg_table_is_visible(c.oid)
ORDER BY 1,2;
/************************/

             List of relations
 Schema |     Name      | Type  |  Owner
--------+---------------+-------+----------
 public | posts         | table | postgres
 public | user_profiles | table | postgres
 public | users         | table | postgres
(3 rows)
```

It is pretty verbose though, so you might wanna skip it. Nevertheless, extremely valuable to learn how internals are working.

## Becoming a psql power user

By now, you are hopefully hooked on psql. But let me showcase more of a cool stuff:

```psql
mydb=# SELECT * FROM users;
mydb=# \watch 2
                     Thu 12 Feb 2026 01:29:25 PM UTC (every 2s)

 user_id |  username  |       email       |  tier   |          created_at
---------+------------+-------------------+---------+-------------------------------
       1 | tech_guru  | guru@example.com  | Elite   | 2026-02-12 12:50:53.850788+00
       2 | sql_newbie | start@example.com | Basic   | 2026-02-12 12:50:53.850788+00
       3 | data_viz   | chart@example.com | Premium | 2026-02-12 12:50:53.850788+00
(4 rows)

                     Thu 12 Feb 2026 01:29:27 PM UTC (every 2s)
...
```

`\watch` let's you rerun your previous query every specified interval - in this case 2 seconds.

```psql
mydb=# \timing
Timing is on.
mydb=# select * from users;
...
(3 rows)

Time: 0.296 ms
```

`\timinig` let's you quickly see the time of an execution by a query. Please do not substitute it for proper query plan analysis, just add it as another tool. See [EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)

`\! [command]` lets you run shell command without leaving psql.

```psql
mydb=# \! ls
bin   dev                         etc   lib    media  opt   root  sbin  sys  usr
boot  docker-entrypoint-initdb.d  home  lib64  mnt    proc  run   srv   tmp  var
```

`\p` prints the current query buffer. Essentially "where am i?". If it's empty though, this will show last executed query.

```psql
mydb=# is this my buffer?
mydb-# hello?
mydb-# ah i haven't finished with ';' yet
mydb-# \p
is this my buffer?
hello?
ah i haven't finished with ';' yet
mydb-# ;
ERROR:  syntax error at or near "is"
LINE 1: is this my buffer?
        ^
Time: 0.261 ms
mydb=#
```


Arguably, when in doubt, consult the docs.. or stay in terminal and consult them in another way!
- `\help` gives you rough summary of docs for given SQL syntax. Try it with `\help EXPLAIN`!
- `\?` gives you the information about psql itself and all the meta command it supports.

Now onto the hidden gem of psql. The cherry on top itself. Coup de grâce of meta commands - `\gdesc`!
Imagine long complex query, my example wont be like that, but just use your imagination dammit! 

```sql
SELECT
    u.username,
    u.tier,
    p.title,
    (u.created_at::date) AS member_since,
    (p.view_count > 1000) AS is_popular
FROM users u
LEFT JOIN posts p ON u.user_id = p.author_id;
```

What will be the result of that? What data type is in each column? What if your query is 1000s line long, does regex filtering, switch case filtering and is partially building HTML through multiple window functions, joins and unholy shit stain of a table structure and all you needed from it is a simple god damn foreign key id? What then?


{% character(name="Monk", position="right") %}
This is unfortunately a real story...
{% end %}

`\gdesc` to the rescue! It will tell you the data types of output of the query, *without* executing it. Including aliases!

```psql
\gdesc
    Column    |      Type
--------------+-----------------
 username     | text
 tier         | membership_tier
 title        | text
 member_since | date
 is_popular   | boolean
```


### Styling

And just because I like when my terminal looks nice. You can also style your psql. As with everything, there are many options. Here are just some of it:


`\pset border [x]` - changes the style of a border around tables:

```psql
mydb=# \pset border 2
Border style is 2.
mydb=# select * from users;
+---------+------------+-------------------+---------+-------------------------------+
| user_id |  username  |       email       |  tier   |          created_at           |
+---------+------------+-------------------+---------+-------------------------------+
|       1 | tech_guru  | guru@example.com  | Elite   | 2026-02-12 12:50:53.850788+00 |
|       2 | sql_newbie | start@example.com | Basic   | 2026-02-12 12:50:53.850788+00 |
|       3 | data_viz   | chart@example.com | Premium | 2026-02-12 12:50:53.850788+00 |
|       4 | tech_guru1 | guru1@example.com | Elite   | 2026-02-12 13:28:51.802194+00 |
+---------+------------+-------------------+---------+-------------------------------+
```


By default, psql uses ASCII characters in it's output, but you can also instruct it to use unicode characters too:

`\pset linestyle unicode`


And now:

```psql
mydb=# \pset linestyle unicode
Line style is unicode.
mydb=# select * from users;
┌─────────┬────────────┬───────────────────┬─────────┬───────────────────────────────┐
│ user_id │  username  │       email       │  tier   │          created_at           │
├─────────┼────────────┼───────────────────┼─────────┼───────────────────────────────┤
│       1 │ tech_guru  │ guru@example.com  │ Elite   │ 2026-02-12 12:50:53.850788+00 │
│       2 │ sql_newbie │ start@example.com │ Basic   │ 2026-02-12 12:50:53.850788+00 │
│       3 │ data_viz   │ chart@example.com │ Premium │ 2026-02-12 12:50:53.850788+00 │
│       4 │ tech_guru1 │ guru1@example.com │ Elite   │ 2026-02-12 13:28:51.802194+00 │
└─────────┴────────────┴───────────────────┴─────────┴───────────────────────────────┘
(4 rows)
```

You can even change the prompt itself by using `\set PROMPT1`. In this case, lets set this to:

```psql
mydb=# \set PROMPT1 '(%n@%M:%>) %`date +%H:%M:%S` [%/] \n%x%# '
(postgres@[local]:5432) 13:57:28 [mydb]
#
```

This specific prompt shows time, user, database and host information. Pretty neat. 
At this point you are thinking to yourself - 'Okay, that's a bit too much for terminal based utility'.
Oh my sweet summer child, I have not even began to be close to the best of us.
Here is a code that makes your shell colored: https://github.com/rin-nas/postgresql-patterns-library/blob/master/psqlrc/psqlrc - enjoy!

### `.psqlrc` 

By now, I've shown a lot of commands. Some of which are sane defaults for every psql invocation (such as `\x` or `\timing`). But writing them every time you open psql will be tedious at best, unproductive at worst. So what can you do about it?

Introducing `.psqlrc` file. Just like `.zshrc` and `.bashrc` this let's you specify your configuration beforehand to be loaded. There are several ways of creating and storing it, so I wont go over all of them, but you can create one in `$HOME/.psqlrc` location. Alternatively you can specify `PSQLRC` environmental variable with a path to a config file.


So far however, we've been running our psql inside the docker, and for that you have two options. Both of these require you to have your `.psqlrc` reachable from within your project folder.

1. You can extend baseline Dockerfile for postgres and copy the file there. Personally I hate that.
2. You can mount the file through docker compose: `volumes: ./.psqlrc:/var/lib/postgresql/.psqlrc`.

In either case, this is what sample `.psqlrc` file could look like:

```psql
\pset border 2
\pset linestyle unicode
\timing on
\x auto
\set PROMPT1 '%n@%m %~%# '
```

### Storing Queries

Some of you may notice that writing queries in a shell is not exactly ideal. And that is true. That's why I usually have my `.git/info/exclude` file with additional line `database/` which stores all queries that I am writing for a given project. It acts like a scratch pad for me - if I need to run a query that's more complex than just fetching all the columns, I will add it there with small note on what it does and move on. That way if I need it ever again, I can always come back to it.
It's pretty handy and it allows me to use my own editor for writing the queries thus sidestepping the issue of a shell storing and writing queries.

### Restoring DB from dump

This isn't exactly postgres nor psql specific, but I like to always have a quick way to restore my database from a given `*.sql` database dump. I have a separate script for that and it looks more or less like so:

```sh
#!/usr/bin/sh

DUMP_FILE=$1
docker exec -i my-db psql -U ${POSTGRES__DB_USER} -c "CREATE DATABASE ${POSTGRES__DB};"
# NOTE: This is where you would create additional roles if they were needed.
cat "$DUMP_FILE" | docker exec -i my-db psql -U ${POSTGRES__DB_USER} -d ${POSTGRES__DB}
```

This is being run when all the given `.envs` are already exported so all I need to do is:

```sh
# Just make sure it's executable first
$ chmod +x restore.sh
$ ./restore.sh ./01-12-1887db.sql
```

## Conclusion

It goes without saying that this is just a fraction of what's available for psql. For more details (and fun!) look no further than https://postgresql.org docs. It is a fantastic resource and is a crown jewel in a beauty that is postgres itself.
In my experience, psql is not picked up by developers in favour of built in database tools inside their IDEs or heavy dedicated tools such as DBeaver. They are good. They do the job. But they are also heavier.
Are they always needed? I found that I rarely have to bring the big guns and I am more than capable of just
writing a few simple commands by hand. Especially when meta commands are shortcuts to most of what I need.
Hopefully I've convinced you at least to try them at some point.
