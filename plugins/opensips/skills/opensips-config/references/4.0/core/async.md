# Async Statements Reference
<!-- generated-from: data/4.0/core/async.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: async_statement -->

Reference for OpenSIPs 4.0 asynchronous statements. Read this file when designing non-blocking route logic that resumes via async, async_launch, or related continuation primitives.

## Contents

- [`async`](#async)
- [`launch`](#launch)

## `async`

The async() statement is used when the script needs to perform blocking I/O and depends on the result. It halts script execution immediately and resumes in a specific route when the operation completes. It depends on the transaction module (tm).

**Syntax:**

```
async(blocking_function(...), resume_route [,timeout]);
```

**Parameters:**

- `blocking_function` *(function_call, required)* — The blocking function to be executed asynchronously.
- `resume_route` *(string, required)* — The route to be executed when the async operation finishes. Must be a simple route.
- `timeout` *(integer, optional)* — Optional timeout (in seconds) to control how long the script waits for the blocking function to complete.

**Usable from:** request_route

**Example.** Fetching credit from a database asynchronously..

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

The launch() statement is used to perform blocking I/O without depending on the result to continue the current SIP routing flow. It runs in parallel with the script execution. It has no additional module dependencies.

**Syntax:**

```
launch(blocking_function(...));
launch(blocking_function(...), report_route);
launch(blocking_function(...), report_route, "param");
```

**Parameters:**

- `blocking_function` *(function_call, required)* — The blocking function to be executed asynchronously.
- `parameter` *(string, optional)* — Optional string parameter to be passed to the report route.
- `report_route` *(string, optional)* — Optional route to be executed when the operation finishes. Must be a simple route.

**Usable from:** any_route

**Example.** Sending a push notification asynchronously in parallel..

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
