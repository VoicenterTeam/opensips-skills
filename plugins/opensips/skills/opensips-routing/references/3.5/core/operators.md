# Operators Reference
<!-- generated-from: data/3.5/core/operators.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: operator -->

Reference for OpenSIPs 3.5 script operators. Read this file when writing expressions and need to confirm operand types, precedence, or associativity for arithmetic, comparison, logical, or string operators.

## Contents

- [`%` (modulo)](#modulo)
- [`&` (bitwise AND)](#bitwise-and)
- [`*` (multiply)](#multiply)
- [`+` (concatenate)](#concatenate)
- [`+` (plus)](#plus)
- [`-` (minus)](#minus)
- [`:=` (colon equal)](#colon-equal)
- [`<<` (bitwise left shift)](#bitwise-left-shift)
- [`==` (equal)](#equal)
- [`>>` (bitwise right shift)](#bitwise-right-shift)
- [`[ ]` (test operator)](#test-operator)
- [`^` (bitwise XOR)](#bitwise-xor)
- [`div` (divide)](#div-divide)
- [`|` (bitwise OR)](#bitwise-or)
- [`~` (bitwise NOT)](#bitwise-not)

## `%` (modulo)

Modulo for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 3
- **Associativity:** left
## `&` (bitwise AND)

Bitwise AND for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 8
- **Associativity:** left

**Example.** Arithmetic and bitwise operations.

```opensips
$var(a) = 4 + ( 7 & ( ~2 ) );
```
## `*` (multiply)

Multiplication for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 3
- **Associativity:** left
## `+` (concatenate)

Concatenates strings.

- **Operand type:** binary
- **Applicable to:** strings
- **Precedence:** 4
- **Associativity:** left

**Example.** String concatenation.

```opensips
$var(a) = "test";
$var(b) = "sip:" + $var(a) + "@" + $fd;
```
## `+` (plus)

Addition for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 4
- **Associativity:** left

**Example.** Arithmetic and bitwise operations.

```opensips
$var(a) = 4 + ( 7 & ( ~2 ) );
```
## `-` (minus)

Subtraction for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 4
- **Associativity:** left
## `:=` (colon equal)

Special assign operator that can be used with AVPs. If the right value is null, all AVPs with that name are deleted. If different, the new value will overwrite any existing values for the AVPs with that name.

- **Operand type:** binary
- **Applicable to:** AVPs
- **Precedence:** 14
- **Associativity:** right

**Example.** AVP assignment and overwrite.

```opensips
$avp(val) := 123;
```
## `<<` (bitwise left shift)

Bitwise left shift for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 5
- **Associativity:** left
## `==` (equal)

Assignments can be done like in C, via '=' (equal) operator. Note that not all variables can be written, some are read-only.

- **Operand type:** binary
- **Applicable to:** variables
- **Precedence:** 14
- **Associativity:** right

**Example.** Basic variable assignment.

```opensips
$var(a) = 123;
$ru = "sip:user@domain";
```
## `>>` (bitwise right shift)

Bitwise right shift for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 5
- **Associativity:** left
## `[ ]` (test operator)

Arithmetic expressions can be used in condition expressions via test operator '[ ... ]'.

- **Operand type:** unary
- **Applicable to:** arithmetic expressions
- **Precedence:** 1
- **Associativity:** left

**Example.** Test operator in condition.

```opensips
if( [ $var(a) & 4 ] )
    log("var a has third bit set\n");
```
## `^` (bitwise XOR)

Bitwise XOR for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 9
- **Associativity:** left
## `div` (divide)

Division for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 3
- **Associativity:** left
## `|` (bitwise OR)

Bitwise OR for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 10
- **Associativity:** left
## `~` (bitwise NOT)

Bitwise NOT for numbers.

- **Operand type:** unary
- **Applicable to:** numbers
- **Precedence:** 2
- **Associativity:** right

**Example.** Arithmetic and bitwise operations.

```opensips
$var(a) = 4 + ( 7 & ( ~2 ) );
```
