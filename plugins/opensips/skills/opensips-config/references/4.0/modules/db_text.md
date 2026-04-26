# db_text Module Reference
<!-- generated-from: data/4.0/modules/db_text.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 db_text module. Read this file when configuring or debugging the db_text module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The module implements a simplified database engine based on text files. It can be used by OpenSIPS DB interface instead of other database module (like MySQL). The module is meant for use in demos or small devices that do not support other DB modules. It keeps everything in memory and if you deal with large amount of data you may run quickly out of memory. Also, it has not implemented all standard database facilities (like order by), it includes minimal functionality to work properly with OpenSIPS

NOTE: the timestamp is printed in an integer value from time_t structure. If you use it in a system that cannot do this conversion, it will fail (support for such situation is in to-do list).

NOTE: even when is in non-caching mode, the module does not write back to hard drive after changes. In this mode, the module checks if the corresponding file on disk has changed, and reloads it. The write on disk happens at OpenSIPS shut down.

## How It Works

The db_text database system architecture:

* a database is represented by a directory in the local file system. NOTE: when you use _db_text_ in OpenSIPS, the database URL for modules must be the path to the directory where the table-files are located, prefixed by “text://”, e.g., “text:///var/dbtext/opensips”. If there is no “/” after “text://” then “CFG_DIR/” is inserted at the beginning of the database path. So, either you provide an absolute path to database directory or a relative one to “CFG_DIR” directory.

* a table is represented by a text file inside database directory.

First line is the definition of the columns. Each column must be declared as follows:

* the name of column must not include white spaces.

* the format of a column definition is: _name(type,attr)_.

* between two column definitions must be a white space, e.g., “first_name(str) last_name(str)”.

* the type of a column can be:

    * _int_ - integer numbers.
    * _double_ - real numbers with two decimals.
    * _str_ - strings with maximum size of 4KB.

* a column can have one of the attributes:

    * _auto_ - only for 'int' columns, the maximum value in that column is incremented and stored in this field if it is not provided in queries.
    * _null_ - accept null values in column fields.
    * if no attribute is set, the fields of the column cannot have null value.

* each other line is a row with data. The line ends with “\n”.

* the fields are separated by “:”.

* no value between two ':' (or between ':' and start/end of a row) means “null” value.

* next characters must be escaped in strings: “\n”, “\r”, “\t”, “:”.

* _0_ -- the zero value must be escaped too.

This database interface don't support the data insertion with default values. All such values specified in the database template are ignored. So its advisable to specify all data for a column at insertion operations.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `buffer_size` (integer)

Size of the buffer used to read the text file.

*Default value is 4096.*

**Example.** 8192.

```opensips
modparam("db_text", "buffer_size", 8192)
```
### `db_mode` (integer)

Set caching mode (0) or non-caching mode (1). In caching mode, data is loaded at startup. In non-caching mode, the module check every time a table is requested whether the corresponding file on disk has changed, and if yes, will re-load table from file.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("db_text", "db_mode", 1)
```

## Exported MI Functions

### `db_text:dump`

Replaces obsolete MI command: _dbt_dump_. Write back to hard drive modified tables.

**Example.**

```opensips-cli
opensips-cli -x mi db_text:dump
```

### `db_text:reload`

Replaces obsolete MI command: _dbt_reload_. Causes db_text module to reload cached tables from disk. Depending on parameters it could be a whole cache or a specified database or a single table. If any table cannot be reloaded from disk - the old version preserved and error reported.

**Parameters:**

- `db_name` *(string, optional)* — database name to reload.
- `table_name` *(string, optional)* — specific table to reload.

**Example.**

```opensips-cli
opensips-cli -x mi db_text:reload
```

**Example.**

```opensips-cli
opensips-cli -x mi db_text:reload /path/to/dbtext/database
```

**Example.**

```opensips-cli
opensips-cli -x mi db_text:reload /path/to/dbtext/database table_name
```

## Configuration Examples

### Sample of a db_text table

Demonstrates the internal format of a db_text table including column definitions and data rows.

```opensips
id(int,auto) name(str) flag(double) desc(str,null)
1:nick:0.34:a\tgood\: friend
2:cole:-3.75:colleague
3:bob:2.50:

```
### Minimal OpenSIPS location db_text table definition

Shows the minimal column definition for the location table.

```opensips
username(str) contact(str) expires(int) q(double) callid(str) cseq(int)

```
### Minimal OpenSIPS subscriber db_text table example

Shows the column definition and a sample data row for the subscriber table.

```opensips
username(str) password(str) ha1(str) domain(str) ha1b(str)
suser:supasswd:xxx:alpha.org:xxx

```
### Set `db_mode` parameter

Demonstrates setting the `db_mode` parameter to 1 (non-caching mode).

```opensips
modparam("db_text", "db_mode", 1)

```
### Set `buffer_size` parameter

Demonstrates setting the `buffer_size` parameter to 8192.

```opensips
modparam("db_text", "buffer_size", 8192)

```
### Load the db_text module

Shows how to load the db_text module and configure the database URL.

```opensips
loadmodule "/path/to/opensips/modules/db_text.so"
...
modparam("module_name", "database_URL", "text:///path/to/dbtext/database")

```
### Definition of 'subscriber' table (one line)

Provides the column definition for the subscriber table.

```opensips
username(str) domain(str) password(str) first_name(str) last_name(str) phone(str) email_address(str) datetime_created(int) datetime_modified(int) confirmation(str) flag(str) sendnotification(str) greeting(str) ha1(str) ha1b(str) perms(str) allow_find(str) timezone(str,null) rpid(str,null)

```
### Definition of 'location' and 'aliases' tables (one line)

Provides the column definition for the location and aliases tables.

```opensips
username(str) domain(str,null) contact(str,null) received(str) expires(int,null) q(double,null) callid(str,null) cseq(int,null) last_modified(str) flags(int) user_agent(str) socket(str) 

```
### Definition of 'version' table and sample records

Shows the structure of the version table and sample records.

```opensips
table_name(str) table_version(int)
subscriber:3
location:6
aliases:6

```
### Configuration file

Provides a complete sample OpenSIPS configuration script using db_text.

```opensips
#
# simple quick-start config script with dbtext
#

# ----------- global configuration parameters ------------------------

#debug_mode=yes
udp_workers=4

check_via=no    # (cmd. line: -v)
dns=no          # (cmd. line: -r)
rev_dns=no      # (cmd. line: -R)

socket=udp:10.100.100.1:5060

# ------------------ module loading ----------------------------------

# use dbtext database
loadmodule "modules/dbtext/dbtext.so"

loadmodule "modules/sl/sl.so"
loadmodule "modules/tm/tm.so"
loadmodule "modules/rr/rr.so"
loadmodule "modules/maxfwd/maxfwd.so"
loadmodule "modules/usrloc/usrloc.so"
loadmodule "modules/registrar/registrar.so"
loadmodule "modules/textops/textops.so"
loadmodule "modules/textops/mi_fifo.so"

# modules for digest authentication
loadmodule "modules/auth/auth.so"
loadmodule "modules/auth_db/auth_db.so"

# ----------------- setting module-specific parameters ---------------

# -- mi_fifo params --

modparam("mi_fifo", "fifo_name", "/tmp/opensips_fifo")

# -- usrloc params --

# use dbtext database for persistent storage
modparam("usrloc", "working_mode_preset", "single-instance-sql-write-back")
modparam("usrloc|auth_db", "db_url", "text:///tmp/opensipsdb")

# -- auth params --
#
modparam("auth_db", "calculate_ha1", 1)
modparam("auth_db", "password_column", "password")
modparam("auth_db", "user_column", "username")
modparam("auth_db", "domain_column", "domain")

# -------------------------  request routing logic -------------------

# main routing logic

route{
    # initial sanity checks -- messages with
    # max_forwards==0, or excessively long requests
    if (!mf_process_maxfwd_header("10")) {
        sl_send_reply(483,"Too Many Hops");
        exit;
    };
    if ($ml >=  65535 ) {
        sl_send_reply(513, "Message too big");
        exit;
    };

    # we record-route all messages -- to make sure that
    # subsequent messages will go through our proxy; that's
    # particularly good if upstream and downstream entities
    # use different transport protocol
    if (!$rm=="REGISTER") record_route();

    # subsequent messages withing a dialog should take the
    # path determined by record-routing
    if (loose_route()) {
        # mark routing logic in request
        append_hf("P-hint: rr-enforced\r\n");
        route(1);
        exit;
    };

    if (!is_myself("$rd")) {
        # mark routing logic in request
        append_hf("P-hint: outbound\r\n");
        route(1);
        exit;
    };

    # if the request is for other domain use UsrLoc
    # (in case, it does not work, use the following command
    # with proper names and addresses in it)
    if (is_myself("$rd")) {
        if ($rm=="REGISTER") {
            # digest authentication
            if (!www_authorize("", "subscriber")) {
                www_challenge("", "0");
                exit;
            };

            save("location");
            exit;
        };

        lookup("aliases");
        if (!is_myself("$rd")) {
            append_hf("P-hint: outbound alias\r\n");
            route(1);
            exit;
        };

        # native SIP destinations are handled using our USRLOC DB
        if (!lookup("location")) {
            sl_send_reply(404, "Not Found");
            exit;
        };
    };
    append_hf("P-hint: usrloc applied\r\n");
    route(1);
}

route[1]
{
    # send it out now; use stateful forwarding as it works reliably
    # even for UDP2TCP
    if (!t_relay()) {
        sl_reply_error();
    };
}

```
