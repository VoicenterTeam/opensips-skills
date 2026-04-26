# Statements Reference
<!-- generated-from: data/4.0/core/statements.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: statement -->

Reference for OpenSIPs 4.0 script statements. Read this file when assembling control-flow constructs (if, switch, while, return, etc.) or confirming where a given statement is usable.

## Contents

- [`for each`](#for-each)
- [`if`](#if)
- [`switch`](#switch)
- [`while`](#while)

## `for each`

for each statement - easy iteration over indexed variables or pseudo-variables

**Syntax:**

```
for ($var(it) in $(avp(arr)[*]))
```

**Parameters:**

- `array` *(indexed_variable, required)* — The indexed variable or pseudo-variable to iterate over.
- `iterator` *(variable, required)* — Variable to hold the current element.

**Example.** Example of usage..

```opensips
$avp(arr) = 0;
$avp(arr) = 1;
$avp(arr) = 2;
$avp(arr) = 3;
$avp(arr) = 4;

for ($var(it) in $(avp(arr)\[\*\]))
    xlog("array value: $var(it)\\n");

# iterate through all Contact URIs from each Contact header
for ($var(ct) in $(ct\[\*\]))
    xlog("Contact: $var(ct)\\n");

# iterate through all Via headers of a SIP request
for ($var(via) in $(hdr(Via)\[\*\]))
    xlog("Found \\"Via\\" header: $var(via)\\n");

# iterate through all JSON documents returned by a MongoDB query
cache_raw_query("mongodb:location", "{... find ...}", "$avp(res)");
for ($json(contact) in $(avp(res)\[\*\])) {
    xlog("Found: $json(contact/phone) $json(contact/email)\\n");

    if ($json(contact/phone) =~ "^40") {
        xlog("found a cheap destination to dial\\n");
        break;
    }
}
```

## `if`

IF-ELSE statement. The 'expr' should be a valid logical expression.

**Syntax:**

```
if (expr) {
   actions;
} else {
   actions;
}
```

**Parameters:**

- `expr` *(expression, required)* — A valid logical expression.

**Example.** Example of usage..

```opensips
if ( is_method("INVITE") && $rp==5060 )
{
    log("this sip message is an invite\\n");
} else {
    log("this sip message is not an invite\\n");
}
```

## `switch`

SWITCH statement - it can be used to test the value of a pseudo-variable. IMPORTANT NOTE: 'break' can be used only to mark the end of a 'case' branch (as it is in shell scripts). If you are trying to use 'break' outside a 'case' block the script will return error -- you must use 'return' there.

**Syntax:**

```
switch ($var) {
    case val:
        actions;
        break;
    default:
        actions;
}
```

**Parameters:**

- `$var` *(pseudo-variable, required)* — The pseudo-variable to test.

**Example.** Example of usage..

```opensips
route {
    route(my_logic);
    switch ($retcode) {
    case -1:
        log("process INVITE requests here\\n");
        break;
    case 1:
        log("process REGISTER requests here\\n");
        break;
    case 2:
    case 3:
        log("process SUBSCRIBE and NOTIFY requests here\\n");
        break;
    default:
        log("process other requests here\\n");
   }

    # switch of R-URI username
    switch ($rU) {
    case "101":
        log("destination number is 101\\n");
        break;
    case "102":
        log("destination number is 102\\n"); # continue with 103 and 104
    case "103":
    case "104":
        log("destination number is 103 or 104\\n");
        break;
    default:
        log("unknown destination number\\n");
   }
}

route \[my_logic\] {
    if (is_method("INVITE"))
        return(-1);

    if (is_method("REGISTER"))
        return(1);

    if (is_method("SUBSCRIBE"))
        return(2);

    if (is_method("NOTIFY"))
        return(3);

    return(-2);
}
```

## `while`

while statement

**Syntax:**

```
while (expr) {
    actions;
}
```

**Parameters:**

- `expr` *(expression, required)* — Logical expression to evaluate.

**Example.** Example of usage..

```opensips
$var(i) = 0;
$var(cli) = NULL;
while ($var(i) < 10) {
    if ($(avp(valid_clis\[$var(i)\]) == $fU) {
        xlog("matched the From user!\\n");
        $var(cli) = $fU;
        break;
    }
    $var(i) = $var(i) + 1;
}
```
