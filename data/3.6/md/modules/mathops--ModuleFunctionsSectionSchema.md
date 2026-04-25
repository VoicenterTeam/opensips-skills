## 1.4.�Exported Functions

### 1.4.1.� `math_eval(expression, result_var)`

The function evaluates a given expression and writes the result in the output pseudo-variable. Evaluation uses tinyexpr (see https://github.com/codeplea/tinyexpr).

Currently allowed syntax for specifying an expression:

*   Nested parentheses
    
*   addition (+), subtraction/negation (-), multiplication (\*), division (/), exponentiation (^) and modulus (%) with the normal operator precedence (the one exception being that exponentiation is evaluated left-to-right)
    
*   C math functions: abs (calls to fabs), acos, asin, atan, ceil, cos, cosh, exp, floor, ln (calls to log), log (calls to log10), sin, sinh, sqrt, tan, tanh
    

Meaning of the parameters is as follows:

*   _expression_ (string) - a mathematical expression.
    
*   _result\_var_ (var) - variable which will hold the result of the evaluation.
    

This function can be used from any route.

**Example�1.2.�`math_eval` usage**

...
# Compute some random math expression

$avp(1) = "3.141592";
$avp(2) = "2.71828";
$avp(3) = "123.45678";

if (math\_eval("$avp(1) \* ($avp(3) - ($avp(1) - $avp(2))) / $avp(3)", $avp(result))) {
	xlog("Result of expression: $avp(result)\\n");
} else {
	xlog("Math eval failed!\\n");
}

...

  

### 1.4.2.� `math_rpn(expression, result_var)`

The function evaluates a given RPN expression and writes the result in the output variable.

The expression is specified in Reverse Polish Notation. Values are pushed onto a stack, while operations are executed on that stack. The following operations are supported:

*   binary operators: + - / \* mod pow
    
*   unary functions: neg exp ln log10 abs sqrt cbrt floor ceil round nearbyint trunc
    
    neg will change the sign of the top of the stack
    
    ln is natural logarithm; abs is absolute value; other functions are standard C functions
    
*   constants: e pi
    
*   stack manipulations commands: drop dup swap
    

Meaning of the parameters is as follows:

*   _expression_ (string) - a RPN expression.
    
*   _result\_var_ (var) - variable which will hold the result of the evaluation.
    

This function can be used from any route.

**Example�1.3.�`math_rpn` usage**

$avp(1) = "3";

if (math\_rpn("1 $avp(1) swap swap dup drop / exp ln 1 swap /", $avp(result))) {
	xlog("Result of expression: $avp(result)\\n");
} else {
	xlog("RPN eval failed!\\n");
}

/\* This example RPN script will push 1 then 3 onto the stack, then do a couple no-ops
(exchange the two values twice, duplicate one of them then drop the duplicate),
compute the division of 1 by 3, then do another no-op (exponentiation then logarithm), and
finally compute 1 divided by the result, giving 3 as the result. \*/

  

### 1.4.3.� `math_trunc(number, result_var)`

Truncation of a number towards zero. This means that trunc(3.7) = 3.0 and trunc(-2.9) = -2.0.

Meaning of the parameters is as follows:

*   _number_ (string) - Number to be truncated.
    
*   _result\_var_ (var) - variable which will hold the result of the evaluation.
    

This function can be used from any route.

**Example�1.4.�`math_trunc` usage**

...
# Truncate a random number

$avp(1) = "3.141492";

if (math\_trunc($avp(1), $avp(result))) {
	xlog("Truncate result: $avp(result)\\n");
} else {
	xlog("Truncate failed!\\n");
}
...

  

### 1.4.4.� `math_floor(number, result_var)`

Truncates a number, always towards -infinity. This means that floor(3.7) = 3.0 and floor(-2.9) = -3.0

Meaning of the parameters is as follows:

*   _number_ (string) - Number to be truncated.
    
*   _result\_var_ (var) - variable which will hold the result of the evaluation.
    

This function can be used from any route.

**Example�1.5.�`math_floor` usage**

...
# Truncate a random number

$avp(1) = "3.141492";

if (math\_floor($avp(1), $avp(result))) {
	xlog("Floor result: $avp(result)\\n");
} else {
	xlog("Floor operation failed!\\n");
}
...

  

### 1.4.5.� `math_ceil(number, result_var)`

Truncates a number, always towards +infinity. This means that ceil(3.2) = 4.0 and ceil(-2.9) = -2.0

Meaning of the parameters is as follows:

*   _number_ (string) - Number to be truncated.
    
*   _result\_var_ (var) - variable which will hold the result of the evaluation.
    

This function can be used from any route.

**Example�1.6.�`math_ceil` usage**

...
# Truncate a random number

$avp(1) = "3.141492";

if (math\_ceil($avp(1), $avp(result))) {
	xlog("Ceil result: $avp(result)\\n");
} else {
	xlog("Ceil operation failed!\\n");
}
...

  

### 1.4.6.� `math_round(number, result_var[, decimals])`

The round function returns the nearest integer, and tie-breaking is done away from zero. Examples: round(1.2) = 1.0, round(0.5) = 1.0, round(-0.5) = -1.0

By default, the function returns an integer. An additional parameter controls the number of decimal digits of the initial number which will be kept. The rounding will then be done using the remaining decimal digits, and the result will be a float value, represented as a string.

Meaning of the parameters is as follows:

*   _number_ (string) - Number to be rounded.
    
*   _result\_var_ - variable which will hold the result of the evaluation.
    
*   _decimals_ (int, optional) - further improves the precision of the rounding.
    

This function can be used from any route.

**Example�1.7.�`math_round` usage**

...
# Rounding PI

$avp(1) = "3.141492";

if (math\_round($avp(1), $avp(result))) {

	# result should be: 3
	xlog("Round result: $avp(result)\\n");
} else {
	xlog("Round operation failed!\\n");
}

...

if (math\_round($avp(1), $avp(result), 4)) {

	# result should be: "3.1415"
	xlog("Round result: $avp(result)\\n");
} else {
	xlog("Round operation failed!\\n");
}
...

  

### 1.4.7.� `math_round_sf(number, result_var, figures)`

To give a simple explanation, rounding to N significant figures is done by first obtaining the number resulted from keeping N significant figures (0 padded if necessary), then adjusting it if the N+1'th digit is greater or equal to 5.

Some examples:

*   round\_sf(17892.987, 1) = 20000
    
    round\_sf(17892.987, 2) = 18000
    
    round\_sf(17892.987, 3) = 17900
    
    round\_sf(17892.987, 4) = 17890
    
    round\_sf(17892.987, 5) = 17893
    
    round\_sf(17892.987, 6) = 17893.0
    
    round\_sf(17892.987, 7) = 17892.99
    

Meaning of the parameters is as follows:

*   _number_ (string) - Number to be rounded.
    
*   _result\_var_ (var) - variable which will hold the result of the evaluation.
    
*   _figures_ - further improves the precision of the rounding.
    

This function can be used from any route.

**Example�1.8.�`math_round_sf` usage**

...
# Rounding PI

$avp(1) = "3.141492";

if (math\_round\_sf($avp(1), $avp(result), 4)) {

	# result should be: "3.141"
	xlog("Round result: $avp(result)\\n");
} else {
	xlog("Round operation failed!\\n");
}

...

  

### 1.4.8.� `math_compare(exp1, exp2, result_var)`

Compare exp1 with exp2 and returns the comparison result in the result\_var. Standard comparison return codes used : If exp1 > exp2, result\_var = 1. Else if exp2 > exp1, result\_var = -1, else (in case they are equal), 0 is populated in the result\_var

Meaning of the parameters is as follows:

*   _exp1_ (string) - First expression to be evaluated and used for comparison.
    
*   _exp2_ (string) - Second expression to be evaluated and used for comparison.
    
*   _result\_var_ (var) - variable which will hold the result of the comparison.
    

This function can be used from any route.

**Example�1.9.�`math_compare` usage**

...
# Rounding PI

$var(exp1) = "1 + 8";
$var(exp2) = "7/2";

if (math\_compare($var(exp1), $var(exp2), $var(result))) {

	# $var(result) will be 1, since 9 > 3.5
}

...