# Operators Reference
<!-- generated-from: data/3.6/core/operators.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: operator -->

Reference for OpenSIPs 3.6 script operators. Read this file when writing expressions and need to confirm operand types, precedence, or associativity for arithmetic, comparison, logical, or string operators.

## Contents

- [`%` (Modulo)](#modulo)
- [`&` (Bitwise AND)](#bitwise-and)
- [`*` (Multiply)](#multiply)
- [`+` (String Concatenation)](#string-concatenation)
- [`+` (Plus)](#plus)
- [`-` (Minus)](#minus)
- [`/` (Divide)](#divide)
- [`:=` (AVP Assignment)](#avp-assignment)
- [`<<` (Bitwise left shift)](#bitwise-left-shift)
- [`=` (Assignment)](#assignment)
- [`>>` (Bitwise right shift)](#bitwise-right-shift)
- [`[ ]` (Test operator)](#test-operator)
- [`^` (Bitwise XOR)](#bitwise-xor)
- [`|` (Bitwise OR)](#bitwise-or)
- [`~` (Bitwise NOT)](#bitwise-not)

## `%` (Modulo)

Arithmetic modulo (remainder).

- **Operand type:** binary
- **Applicable to:** integer
- **Precedence:** 3
- **Associativity:** left

**Example.** Calculating the remainder of a division..

```opensips
$var(a) = 10 % 3;
```
## `&` (Bitwise AND)

Performs a bitwise AND operation.

- **Operand type:** binary
- **Applicable to:** integer
- **Precedence:** 8
- **Associativity:** left

**Example.** Bitwise AND of 7 and 4..

```opensips
$var(a) = 7 & 4;
```
## `*` (Multiply)

Arithmetic multiplication.

- **Operand type:** binary
- **Applicable to:** integer
- **Precedence:** 3
- **Associativity:** left

**Example.** Multiplying integers..

```opensips
$var(a) = 2 * 3;
```
## `+` (String Concatenation)

Concatenates two string values.

- **Operand type:** binary
- **Applicable to:** string
- **Precedence:** 4
- **Associativity:** left

**Example.** Building a SIP URI string using concatenation..

```opensips
$var(a) = "test";
$var(b) = "sip:" + $var(a) + "@" + $fd;
```
## `+` (Plus)

Arithmetic addition.

- **Operand type:** binary
- **Applicable to:** integer
- **Precedence:** 4
- **Associativity:** left

**Example.** Adding two integers..

```opensips
$var(a) = 4 + 5;
```
## `-` (Minus)

Arithmetic subtraction.

- **Operand type:** binary
- **Applicable to:** integer
- **Precedence:** 4
- **Associativity:** left

**Example.** Subtracting integers..

```opensips
$var(a) = 10 - 5;
```
## `/` (Divide)

Arithmetic division.

- **Operand type:** binary
- **Applicable to:** integer
- **Precedence:** 3
- **Associativity:** left

**Example.** Dividing integers..

```opensips
$var(a) = 10 / 2;
```
## `:=` (AVP Assignment)

Special assignment for AVPs. If the right value is null, all AVPs with that name are deleted. Otherwise, it overwrites all existing values with the new value.

- **Operand type:** binary
- **Applicable to:** AVP
- **Precedence:** 14
- **Associativity:** right

**Example.** Overwriting existing AVPs named 'val' with the integer 123..

```opensips
$avp(val) := 123;
```
## `<<` (Bitwise left shift)

Shifts bits to the left.

- **Operand type:** binary
- **Applicable to:** integer
- **Precedence:** 5
- **Associativity:** left

**Example.** Shifting 1 left by 2 bits..

```opensips
$var(a) = 1 << 2;
```
## `=` (Assignment)

Standard assignment operator. Not all variables are writable.

- **Operand type:** binary
- **Applicable to:** variable, pseudo-variable
- **Precedence:** 14
- **Associativity:** right

**Example.** Assigning an integer to a script variable and a string to the Request-URI..

```opensips
$var(a) = 123;
$ru = "sip:user@domain";
```
## `>>` (Bitwise right shift)

Shifts bits to the right.

- **Operand type:** binary
- **Applicable to:** integer
- **Precedence:** 5
- **Associativity:** left

**Example.** Shifting 8 right by 2 bits..

```opensips
$var(a) = 8 >> 2;
```
## `[ ]` (Test operator)

Allows arithmetic expressions to be evaluated within condition expressions (like 'if' statements).

- **Operand type:** unary
- **Applicable to:** expression
- **Precedence:** 1
- **Associativity:** left

**Example.** Using the test operator to evaluate a bitwise AND inside an if-condition..

```opensips
if( [ $var(a) & 4 ] )
    log("var a has third bit set\n");
```
## `^` (Bitwise XOR)

Performs a bitwise XOR operation.

- **Operand type:** binary
- **Applicable to:** integer
- **Precedence:** 9
- **Associativity:** left

**Example.** Bitwise XOR of 7 and 2..

```opensips
$var(a) = 7 ^ 2;
```
## `|` (Bitwise OR)

Performs a bitwise OR operation.

- **Operand type:** binary
- **Applicable to:** integer
- **Precedence:** 10
- **Associativity:** left

**Example.** Bitwise OR of 1 and 2..

```opensips
$var(a) = 1 | 2;
```
## `~` (Bitwise NOT)

Performs a bitwise NOT (inversion) operation.

- **Operand type:** unary
- **Applicable to:** integer
- **Precedence:** 2
- **Associativity:** right

**Example.** Bitwise NOT of 2..

```opensips
$var(a) = ~2;
```
