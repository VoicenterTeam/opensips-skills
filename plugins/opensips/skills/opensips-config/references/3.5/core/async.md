# Async Statements Reference
<!-- generated-from: data/3.5/core/async.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: async_statement -->

Reference for OpenSIPs 3.5 asynchronous statements. Read this file when designing non-blocking route logic that resumes via async, async_launch, or related continuation primitives.

## Contents

- [`async`](#async)
- [`launch`](#launch)

## `async`

Serial asynchronous operation. Halts script execution to perform blocking I/O, resuming in a specified route when data is available. Depends on the transaction module (tm).

**Syntax:**

```
async(blocking_function(...), resume_route [,timeout]);
```

**Parameters:**

- `blocking_function` *(function, required)* — A blocking function that supports asynchronous mode (e.g., avp_db_query, rest_get, exec).
- `resume_route` *(string, required)* — A simple route where script execution will resume after the blocking operation completes.
- `timeout` *(integer, optional)* — Optional parameter to control for how long the script should wait for the blocking function to complete.

**Usable from:** request_route

**Example.** Fetching SIP authentication data from a database asynchronously..

```opensips
route
{
    /* preparation code */
    ...
    async(avp_db_query("SELECT credit FROM users WHERE uid='$avp(uid)'", "$avp(credit)"), resume_credit);
    /* script execution is paused right away! */
}

route [resume_credit]
{
    if ($rc < 0) {
        xlog("error $rc in avp_db_query()\n");
        exit;
    }

    xlog("Credit of user $avp(uid) is $avp(credit)\n");
    ...
    t_relay();
}
```

**Example.** Forking an external process to perform a blocking operation asynchronously to mitigate TCP connect issues..

```opensips
async(exec("curl my_host", $var(response_body)), resume_route);
```

**Example.** Forking an external process to perform a blocking MySQL query asynchronously..

```opensips
async(exec("mysql-query 'SELECT * FROM subscriber...'", $var(result_row)), resume_route);
```

## `launch`

Parallel asynchronous operation. Performs blocking I/O in the background without halting the current SIP routing decision flow. Does not depend on the result of the operation to continue.

**Syntax:**

```
launch(blocking_function(...));
launch(blocking_function(...), report_route);
launch(blocking_function(...), report_route, "Something with $var(xx) to be passed to report route");
```

**Parameters:**

- `blocking_function` *(function, required)* — A blocking function that supports asynchronous mode.
- `report_parameter` *(string, optional)* — An optional string passed to the report route, accessible via $param(1).
- `report_route` *(string, optional)* — A simple route triggered when the async operation completes.

**Usable from:** any route

**Example.** Executing an external push notification trigger asynchronously in parallel..

```opensips
route
{
    /* preparation code */
    ...

    # send a push notification asynchronously, in parallel
    launch(exec("/usr/local/bin/send-google-pn.py"), pn_counter);
    t_relay();
}

route [pn_counter]
{
    if ($rc < 0) {
        xlog("error $rc in pn script!\n");
        update_stat("pn-failure", "1");
        exit;
    }

    update_stat("pn-success", "1");
}
```
