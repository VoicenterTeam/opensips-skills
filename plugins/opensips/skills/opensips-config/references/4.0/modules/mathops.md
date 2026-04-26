# mathops Module Reference
<!-- generated-from: data/4.0/modules/mathops.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 mathops module. Read this file when configuring or debugging the mathops module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The mathops module provides a series of functions which enable various floating point operations at OpenSIPS script level.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `decimal_digits` (integer)

The precision of the results returned by all the module functions. The higher the “decimal_digits” value, the more decimal digits the results will have.

*Default value is 6.*

**Example.** 10.

```opensips
modparam("mathops", "decimal_digits", 10)
```

## Exported Functions

### `math_ceil(number, result_var)`

Truncates a number, always towards +infinity. This means that ceil(3.2) = 4.0 and ceil(-2.9) = -2.0

**Parameters:**

- `number` *(string, required)* — Number to be truncated.
- `result_var` *(var, required)* — variable which will hold the result of the evaluation.

**Return codes:**

- `1` — success
- `-1` — failure

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** math_ceil usage.

```opensips
...
# Truncate a random number

$avp(1) = "3.141492";

if (math_ceil($avp(1), $avp(result))) {
	xlog("Ceil result: $avp(result)\n");
} else {
	xlog("Ceil operation failed!\n");
}
...
```

### `math_compare(exp1, exp2, result_var)`

Compare exp1 with exp2 and returns the comparison result in the result_var. Standard comparison return codes used : If exp1 > exp2, result_var = 1. Else if exp2 > exp1, result_var = -1, else (in case they are equal), 0 is populated in the result_var

**Parameters:**

- `exp1` *(string, required)* — First expression to be evaluated and used for comparison.
- `exp2` *(string, required)* — Second expression to be evaluated and used for comparison.
- `result_var` *(var, required)* — variable which will hold the result of the comparison.

**Return codes:**

- `1` — success
- `-1` — failure

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** math_compare usage.

```opensips
...
# Rounding PI

$var(exp1) = "1 + 8";
$var(exp2) = "7/2";

if (math_compare($var(exp1), $var(exp2), $var(result))) {

	# $var(result) will be 1, since 9 > 3.5
}

...
```

### `math_eval(expression, result_var)`

The function evaluates a given expression and writes the result in the output pseudo-variable. Evaluation uses tinyexpr (see https://github.com/codeplea/tinyexpr). Currently allowed syntax for specifying an expression: Nested parentheses, addition (+), subtraction/negation (-), multiplication (*), division (/), exponentiation (^) and modulus (%) with the normal operator precedence (the one exception being that exponentiation is evaluated left-to-right), C math functions: abs (calls to fabs), acos, asin, atan, ceil, cos, cosh, exp, floor, ln (calls to log), log (calls to log10), sin, sinh, sqrt, tan, tanh.

**Parameters:**

- `expression` *(string, required)* — a mathematical expression.
  - `Nested parentheses`
  - `addition (+)`
  - `subtraction/negation (-)`
  - `multiplication (*)`
  - `division (/)`
  - `exponentiation (^)`
  - `modulus (%)`
  - `abs`
  - `acos`
  - `asin`
  - `atan`
  - `ceil`
  - `cos`
  - `cosh`
  - `exp`
  - `floor`
  - `ln`
  - `log`
  - `sin`
  - `sinh`
  - `sqrt`
  - `tan`
  - `tanh`
- `result_var` *(var, required)* — variable which will hold the result of the evaluation.

**Return codes:**

- `1` — success
- `-1` — failure

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** math_eval usage.

```opensips
...
# Compute some random math expression

$avp(1) = "3.141592";
$avp(2) = "2.71828";
$avp(3) = "123.45678";

if (math_eval("$avp(1) * ($avp(3) - ($avp(1) - $avp(2))) / $avp(3)", $avp(result))) {
	xlog("Result of expression: $avp(result)\n");
} else {
	xlog("Math eval failed!\n");
}

...
```

### `math_floor(number, result_var)`

Truncates a number, always towards -infinity. This means that floor(3.7) = 3.0 and floor(-2.9) = -3.0

**Parameters:**

- `number` *(string, required)* — Number to be truncated.
- `result_var` *(var, required)* — variable which will hold the result of the evaluation.

**Return codes:**

- `1` — success
- `-1` — failure

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** math_floor usage.

```opensips
...
# Truncate a random number

$avp(1) = "3.141492";

if (math_floor($avp(1), $avp(result))) {
	xlog("Floor result: $avp(result)\n");
} else {
	xlog("Floor operation failed!\n");
}
...
```

### `math_round(number, result_var[, decimals])`

The round function returns the nearest integer, and tie-breaking is done away from zero. Examples: round(1.2) = 1.0, round(0.5) = 1.0, round(-0.5) = -1.0. By default, the function returns an integer. An additional parameter controls the number of decimal digits of the initial number which will be kept. The rounding will then be done using the remaining decimal digits, and the result will be a float value, represented as a string.

**Parameters:**

- `decimals` *(int, optional)* — further improves the precision of the rounding.
- `number` *(string, required)* — Number to be rounded.
- `result_var` *(var, required)* — variable which will hold the result of the evaluation.

**Return codes:**

- `1` — success
- `-1` — failure

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** math_round usage.

```opensips
...
# Rounding PI

$avp(1) = "3.141492";

if (math_round($avp(1), $avp(result))) {

	# result should be: 3
	xlog("Round result: $avp(result)\n");
} else {
	xlog("Round operation failed!\n");
}

...

if (math_round($avp(1), $avp(result), 4)) {

	# result should be: "3.1415"
	xlog("Round result: $avp(result)\n");
} else {
	xlog("Round operation failed!\n");
}
...
```

### `math_round_sf(number, result_var, figures)`

To give a simple explanation, rounding to N significant figures is done by first obtaining the number resulted from keeping N significant figures (0 padded if necessary), then adjusting it if the N+1'th digit is greater or equal to 5. Some examples: round_sf(17892.987, 1) = 20000, round_sf(17892.987, 2) = 18000, round_sf(17892.987, 3) = 17900, round_sf(17892.987, 4) = 17890, round_sf(17892.987, 5) = 17893, round_sf(17892.987, 6) = 17893.0, round_sf(17892.987, 7) = 17892.99

**Parameters:**

- `figures` *(int, required)* — further improves the precision of the rounding.
- `number` *(string, required)* — Number to be rounded.
- `result_var` *(var, required)* — variable which will hold the result of the evaluation.

**Return codes:**

- `1` — success
- `-1` — failure

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** math_round_sf usage.

```opensips
...
# Rounding PI

$avp(1) = "3.141492";

if (math_round_sf($avp(1), $avp(result), 4)) {

	# result should be: "3.141"
	xlog("Round result: $avp(result)\n");
} else {
	xlog("Round operation failed!\n");
}

...
```

### `math_rpn(expression, result_var)`

The function evaluates a given RPN expression and writes the result in the output variable. The expression is specified in Reverse Polish Notation. Values are pushed onto a stack, while operations are executed on that stack. The following operations are supported: binary operators: + - / * mod pow, unary functions: neg exp ln log10 abs sqrt cbrt floor ceil round nearbyint trunc, constants: e pi, stack manipulations commands: drop dup swap.

**Parameters:**

- `expression` *(string, required)* — a RPN expression.
  - `+`
  - `-`
  - `/`
  - `*`
  - `mod`
  - `pow`
  - `neg`
  - `exp`
  - `ln`
  - `log10`
  - `abs`
  - `sqrt`
  - `cbrt`
  - `floor`
  - `ceil`
  - `round`
  - `nearbyint`
  - `trunc`
  - `e`
  - `pi`
  - `drop`
  - `dup`
  - `swap`
- `result_var` *(var, required)* — variable which will hold the result of the evaluation.

**Return codes:**

- `1` — success
- `-1` — failure

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** math_rpn usage.

```opensips
$avp(1) = "3";

if (math_rpn("1 $avp(1) swap swap dup drop / exp ln 1 swap /", $avp(result))) {
	xlog("Result of expression: $avp(result)\n");
} else {
	xlog("RPN eval failed!\n");
}

/* This example RPN script will push 1 then 3 onto the stack, then do a couple no-ops
(exchange the two values twice, duplicate one of them then drop the duplicate),
compute the division of 1 by 3, then do another no-op (exponentiation then logarithm), and
finally compute 1 divided by the result, giving 3 as the result. */
```

### `math_trunc(number, result_var)`

Truncation of a number towards zero. This means that trunc(3.7) = 3.0 and trunc(-2.9) = -2.0.

**Parameters:**

- `number` *(string, required)* — Number to be truncated.
- `result_var` *(var, required)* — variable which will hold the result of the evaluation.

**Return codes:**

- `1` — success
- `-1` — failure

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** math_trunc usage.

```opensips
...
# Truncate a random number

$avp(1) = "3.141492";

if (math_trunc($avp(1), $avp(result))) {
	xlog("Truncate result: $avp(result)\n");
} else {
	xlog("Truncate failed!\n");
}
...
```

## Configuration Examples

### Setting the decimal_digits module parameter

Sets the decimal_digits module parameter.

```opensips
modparam("mathops", "decimal_digits", 10)
```
### `math_eval` usage

Computes a random math expression.

```opensips
...
# Compute some random math expression

$avp(1) = "3.141592";
$avp(2) = "2.71828";
$avp(3) = "123.45678";

if (math_eval("$avp(1) * ($avp(3) - ($avp(1) - $avp(2))) / $avp(3)", $avp(result))) {
	xlog("Result of expression: $avp(result)\n");
} else {
	xlog("Math eval failed!\n");
}

...
```
### `math_rpn` usage

Evaluates a Reverse Polish Notation (RPN) expression.

```opensips
$avp(1) = "3";

if (math_rpn("1 $avp(1) swap swap dup drop / exp ln 1 swap /", $avp(result))) {
	xlog("Result of expression: $avp(result)\n");
} else {
	xlog("RPN eval failed!\n");
}

/* This example RPN script will push 1 then 3 onto the stack, then do a couple no-ops
(exchange the two values twice, duplicate one of them then drop the duplicate),
compute the division of 1 by 3, then do another no-op (exponentiation then logarithm), and
finally compute 1 divided by the result, giving 3 as the result. */
```
### `math_trunc` usage

Truncates a random number.

```opensips
...
# Truncate a random number

$avp(1) = "3.141492";

if (math_trunc($avp(1), $avp(result))) {
	xlog("Truncate result: $avp(result)\n");
} else {
	xlog("Truncate failed!\n");
}
...
```
### `math_floor` usage

Truncates a random number.

```opensips
...
# Truncate a random number

$avp(1) = "3.141492";

if (math_floor($avp(1), $avp(result))) {
	xlog("Floor result: $avp(result)\n");
} else {
	xlog("Floor operation failed!\n");
}
...
```
### `math_ceil` usage

Truncates a random number.

```opensips
...
# Truncate a random number

$avp(1) = "3.141492";

if (math_ceil($avp(1), $avp(result))) {
	xlog("Ceil result: $avp(result)\n");
} else {
	xlog("Ceil operation failed!\n");
}
...
```
### `math_round` usage

Rounds PI.

```opensips
...
# Rounding PI

$avp(1) = "3.141492";

if (math_round($avp(1), $avp(result))) {

	# result should be: 3
	xlog("Round result: $avp(result)\n");
} else {
	xlog("Round operation failed!\n");
}

...

if (math_round($avp(1), $avp(result), 4)) {

	# result should be: "3.1415"
	xlog("Round result: $avp(result)\n");
} else {
	xlog("Round operation failed!\n");
}
...
```
### `math_round_sf` usage

Rounds PI.

```opensips
...
# Rounding PI

$avp(1) = "3.141492";

if (math_round_sf($avp(1), $avp(result), 4)) {

	# result should be: "3.141"
	xlog("Round result: $avp(result)\n");
} else {
	xlog("Round operation failed!\n");
}

...
```
### `math_compare` usage

Compares two expressions.

```opensips
...
# Rounding PI

$var(exp1) = "1 + 8";
$var(exp2) = "7/2";

if (math_compare($var(exp1), $var(exp2), $var(result))) {

	# $var(result) will be 1, since 9 > 3.5
}

...
```
