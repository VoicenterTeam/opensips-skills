# Operators Reference
<!-- generated-from: data/4.0/core/operators.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: operator -->

Reference for OpenSIPs 4.0 script operators. Read this file when writing expressions and need to confirm operand types, precedence, or associativity for arithmetic, comparison, logical, or string operators.

## Contents

- [`%` (Modulo)](#modulo)
- [`&` (Bitwise AND)](#bitwise-and)
- [`*` (Multiply)](#multiply)
- [`+` (Concatenation)](#concatenation)
- [`+` (Plus)](#plus)
- [`-` (Minus)](#minus)
- [`/` (Divide)](#divide)
- [`:=` (AVP Assignment)](#avp-assignment)
- [`<<` (Bitwise Left Shift)](#bitwise-left-shift)
- [`=` (Assignment)](#assignment)
- [`>>` (Bitwise Right Shift)](#bitwise-right-shift)
- [`[ ... ]` (Test Operator)](#test-operator)
- [`^` (Bitwise XOR)](#bitwise-xor)
- [`|` (Bitwise OR)](#bitwise-or)
- [`~` (Bitwise NOT)](#bitwise-not)

## `%` (Modulo)

Modulo

- **Operand type:** binary
- **Applicable to:** Numbers
- **Precedence:** 3
- **Associativity:** left
## `&` (Bitwise AND)

Bitwise AND

- **Operand type:** binary
- **Applicable to:** Numbers
- **Precedence:** 8
- **Associativity:** left

**Example.** Bitwise AND operation used inside a test operator..

```opensips
if( [ $var(a) & 4 ] )
    log("var a has third bit set\n");
```
## `*` (Multiply)

Multiply

- **Operand type:** binary
- **Applicable to:** Numbers
- **Precedence:** 3
- **Associativity:** left
## `+` (Concatenation)

For strings, '+' is available to concatenate.

- **Operand type:** binary
- **Applicable to:** Strings
- **Precedence:** 4
- **Associativity:** left

**Example.** Concatenates string parts and variables..

```opensips
$var(b) = "sip:" + $var(a) + "@" + $fd;
```
## `+` (Plus)

Plus

- **Operand type:** binary
- **Applicable to:** Numbers
- **Precedence:** 4
- **Associativity:** left

**Example.** Arithmetic addition within a complex expression..

```opensips
$var(a) = 4 + ( 7 & ( ~2 ) );
```
## `-` (Minus)

Minus

- **Operand type:** binary
- **Applicable to:** Numbers
- **Precedence:** 4
- **Associativity:** left
## `/` (Divide)

Divide

- **Operand type:** binary
- **Applicable to:** Numbers
- **Precedence:** 3
- **Associativity:** left
## `:=` (AVP Assignment)

Special assign operator that can be used with AVPs. If the right value is null, all AVPs with that name are deleted. If different, the new value will overwrite any existing values for the AVPs with than name.

- **Operand type:** binary
- **Applicable to:** AVPs
- **Precedence:** 14
- **Associativity:** right

**Example.** Assigns value to AVP, overwriting existing ones..

```opensips
$avp(val) := 123;
```
## `<<` (Bitwise Left Shift)

Bitwise left shift

- **Operand type:** binary
- **Applicable to:** Numbers
- **Precedence:** 5
- **Associativity:** left
## `=` (Assignment)

Assignments can be done like in C, via '=' (equal) operator. Not that not all variables (from script) can be written, some are read-only.

- **Operand type:** binary
- **Applicable to:** Variables, Pseudo-variables
- **Precedence:** 14
- **Associativity:** right

**Example.** Assigns integer value to script variable..

```opensips
$var(a) = 123;
```

**Example.** Assigns string value to Request URI..

```opensips
$ru = "sip:user@domain";
```
## `>>` (Bitwise Right Shift)

Bitwise right shift

- **Operand type:** binary
- **Applicable to:** Numbers
- **Precedence:** 5
- **Associativity:** left
## `[ ... ]` (Test Operator)

Arithmetic expressions can be used in condition expressions via test operator.

- **Operand type:** unary
- **Applicable to:** Arithmetic expressions
- **Precedence:** 1
- **Associativity:** left

**Example.** Using the test operator to evaluate an arithmetic expression in a condition..

```opensips
if( [ $var(a) & 4 ] )
    log("var a has third bit set\n");
```
## `^` (Bitwise XOR)

Bitwise XOR

- **Operand type:** binary
- **Applicable to:** Numbers
- **Precedence:** 9
- **Associativity:** left
## `|` (Bitwise OR)

Bitwise OR

- **Operand type:** binary
- **Applicable to:** Numbers
- **Precedence:** 10
- **Associativity:** left
## `~` (Bitwise NOT)

Bitwise NOT

- **Operand type:** unary
- **Applicable to:** Numbers
- **Precedence:** 1
- **Associativity:** right

**Example.** Bitwise NOT used in an arithmetic expression..

```opensips
$var(a) = 4 + ( 7 & ( ~2 ) );
```
