# Async Statements Reference
<!-- generated-from: data/3.6/core/async.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: async_statement -->

Reference for OpenSIPs 3.6 asynchronous statements. Read this file when designing non-blocking route logic that resumes via async, async_launch, or related continuation primitives.

## Contents

- [`async`](#async)
- [`launch`](#launch)

## `async`

Serial asynchronous operation. Used when the script writer both needs to perform blocking I/O and also depends on the result of this operation. The script is immediately halted when calling it, and execution resumes in the specified route when the operation completes.

**Syntax:**

```
async(blocking_function(...), resume_route [,timeout]);
```

**Parameters:**

- `blocking_function` *(function, required)* — The blocking function to execute. It must support asynchronous mode.
- `resume_route` *(string, required)* — The route to jump to when the operation completes. Must be a simple route.
- `timeout` *(integer, optional)* — Optional timeout (in seconds) to control how long the script should wait for the blocking function to complete.

**Usable from:** request_route, branch_route, onreply_route, local_route

**Example.** Example of async usage with avp_db_query to fetch user credit..

```opensips_script
route
{
    /* preparation code */
    ...
    async(avp_db_query("SELECT credit FROM users WHERE uid='$avp(uid)'", "$avp(credit)"), resume_credit);
    /* script execution is paused right away! */
}

route \[resume_credit\]
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

## `launch`

Parallel asynchronous operation. Used when the script writer needs to perform blocking I/O, but does not depend on the result of this operation in order to continue the current SIP routing decision flow. The script continues immediately.

**Syntax:**

```
launch(blocking_function(...)); or launch(blocking_function(...), report_route); or launch(blocking_function(...), report_route, "string param");
```

**Parameters:**

- `blocking_function` *(function, required)* — The blocking function to execute. It must support asynchronous mode.
- `param` *(string, optional)* — Optional string parameter to pass to the report route.
- `report_route` *(string, optional)* — Optional route to jump to for reporting status. Must be a simple route.

**Usable from:** any route

**Example.** Example of launch usage with exec to send a push notification..

```opensips_script
route
{
    /* preparation code */
    ...

    # send a push notification asynchronously, in parallel
    launch(exec("/usr/local/bin/send-google-pn.py"), pn_counter);
    t_relay();
}

route \[pn_counter\]
{
    if ($rc < 0) {
        xlog("error $rc in pn script!\n");
        update_stat("pn-failure", "1");
        exit;
    }

    update_stat("pn-success", "1");
}
```
