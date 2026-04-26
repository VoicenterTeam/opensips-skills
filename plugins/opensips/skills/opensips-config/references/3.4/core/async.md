# Async Statements Reference
<!-- generated-from: data/3.4/core/async.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: async_statement -->

Reference for OpenSIPs 3.4 asynchronous statements. Read this file when designing non-blocking route logic that resumes via async, async_launch, or related continuation primitives.

## Contents

- [`async`](#async)
- [`launch`](#launch)

## `async`

The async() statement of the OpenSIPS script can be used in situations where the script writer both needs to perform blocking I/O and also depends on the result of this operation. The script is immediately halted when calling it, and execution resumes in the specified route.

**Syntax:**

```
async(blocking_function(...), resume_route [,timeout]);
```

**Parameters:**

- `blocking_function(...)` *(function_call, required)* — The blocking function to be executed asynchronously.
- `resume_route` *(string, required)* — The route to be executed after the async operation completes. Must be a simple route.
- `timeout` *(integer, optional)* — Optional timeout (in seconds) to control how long the script waits for the blocking function to complete.

**Usable from:** request_route, branch_route, onreply_route, local_route

**Example.** Example of using async() to query a database and resume processing in a specific route..

```opensips_script
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

## `launch`

The launch() statement can be used to perform blocking I/O without depending on the result to continue the current SIP routing decision flow. It is asynchronous and parallel with the script execution.

**Syntax:**

```
launch(blocking_function(...));
launch(blocking_function(...), report_route);
launch(blocking_function(...), report_route, "string");
```

**Parameters:**

- `blocking_function(...)` *(function_call, required)* — The blocking function to be executed asynchronously.
- `report_route` *(string, optional)* — Optional route to be triggered upon completion. Must be a simple route.
- `string` *(string, optional)* — Optional string parameter to be passed to the report route.

**Usable from:** any_route

**Example.** Example of using launch() to send a push notification in parallel without blocking the main script flow..

```opensips_script
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
