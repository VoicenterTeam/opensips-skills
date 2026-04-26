# Operators Reference
<!-- generated-from: data/3.4/core/operators.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: operator -->

Reference for OpenSIPs 3.4 script operators. Read this file when writing expressions and need to confirm operand types, precedence, or associativity for arithmetic, comparison, logical, or string operators.

## Contents

- [`%` (modulo)](#modulo)
- [`&` (bitwise AND)](#bitwise-and)
- [`*` (multiply)](#multiply)
- [`+` (plus (string concatenation))](#plus-string-concatenation)
- [`+` (plus (arithmetic addition))](#plus-arithmetic-addition)
- [`-` (minus)](#minus)
- [`/` (divide)](#divide)
- [`:=` (colon equal (AVP assignment))](#colon-equal-avp-assignment)
- [`<<` (bitwise left shift)](#bitwise-left-shift)
- [`=` (equal (assignment))](#equal-assignment)
- [`>>` (bitwise right shift)](#bitwise-right-shift)
- [`^` (bitwise XOR)](#bitwise-xor)
- [`|` (bitwise OR)](#bitwise-or)
- [`~` (bitwise NOT)](#bitwise-not)

## `%` (modulo)

Arithmetic modulo for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 8
- **Associativity:** left
## `&` (bitwise AND)

Bitwise AND operation.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 5
- **Associativity:** left

**Example.** Arithmetic expression example showing bitwise AND and NOT..

```opensips-script
$var(a) = 4 + ( 7 & ( ~2 ) );
```

**Example.** Using bitwise AND in a condition expression..

```opensips-script
if( [ $var(a) & 4 ] )
    log("var a has third bit set\n");
```
## `*` (multiply)

Arithmetic multiplication for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 8
- **Associativity:** left
## `+` (plus (string concatenation))

Concatenation operator for strings.

- **Operand type:** binary
- **Applicable to:** strings
- **Precedence:** 6
- **Associativity:** left

**Example.** String concatenation example..

```opensips-script
$var(a) = "test";
$var(b) = "sip:" + $var(a) + "@" + $fd;
```
## `+` (plus (arithmetic addition))

Arithmetic addition for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 7
- **Associativity:** left

**Example.** Arithmetic expression example..

```opensips-script
$var(a) = 4 + ( 7 & ( ~2 ) );
```
## `-` (minus)

Arithmetic subtraction for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 7
- **Associativity:** left
## `/` (divide)

Arithmetic division for numbers.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 8
- **Associativity:** left
## `:=` (colon equal (AVP assignment))

Special assign operator for AVPs. If the right value is null, all AVPs with that name are deleted. If different, the new value will overwrite any existing values for the AVPs with than name (delete existing AVPs with same name, add a new one with the right side value).

- **Operand type:** binary
- **Applicable to:** AVPs
- **Precedence:** 1
- **Associativity:** right

**Example.** AVP assignment/overwrite/delete..

```opensips-script
$avp(val) := 123;
```
## `<<` (bitwise left shift)

Bitwise left shift operation.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 6
- **Associativity:** left
## `=` (equal (assignment))

Assignment operator, works like in C.

- **Operand type:** binary
- **Applicable to:** variables
- **Precedence:** 1
- **Associativity:** right

**Example.** Standard variable assignment..

```opensips-script
$var(a) = 123;
$ru = "sip:user@domain";
```
## `>>` (bitwise right shift)

Bitwise right shift operation.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 6
- **Associativity:** left
## `^` (bitwise XOR)

Bitwise XOR operation.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 3
- **Associativity:** left
## `|` (bitwise OR)

Bitwise OR operation.

- **Operand type:** binary
- **Applicable to:** numbers
- **Precedence:** 4
- **Associativity:** left

**Example.** Arithmetic expression example showing bitwise AND and NOT..

```opensips-script
$var(a) = 4 + ( 7 & ( ~2 ) );
```
## `~` (bitwise NOT)

Bitwise NOT operation.

- **Operand type:** unary
- **Applicable to:** numbers
- **Precedence:** 9
- **Associativity:** right

**Example.** Arithmetic expression example showing bitwise AND and NOT..

```opensips-script
$var(a) = 4 + ( 7 & ( ~2 ) );
```
