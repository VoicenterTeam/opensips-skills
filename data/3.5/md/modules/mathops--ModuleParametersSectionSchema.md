## 1.3.�Exported Parameters

### 1.3.1.�`decimal_digits` (integer)

The precision of the results returned by all the module functions. The higher the “decimal\_digits” value, the more decimal digits the results will have.

Default value is “6”.

**Example�1.1.�Setting the decimal\_digits module parameter**

modparam("mathops", "decimal\_digits", 10)