## 1.3.�Exported Parameters

### 1.3.1.�`flush` (integer)

Enable or disable flushing after each write.

_Default value is 1._

**Example�1.1.�Set “flush” parameter**

...
modparam("db\_flatstore", "flush", 0)
...

  

### 1.3.2.�`delimiter` (char)

Delimiter used to separate the values.

_Default value is '|'._

**Example�1.2.�Set “delimiter” parameter**

...
modparam("db\_flatstore", "delimiter", ";")
...

  

### 1.3.3.�`suffix` (string)

The suffix appended to the table name. Can be a pseudo variable.

_Default value is ".log"._

**Example�1.3.�Set “suffix” parameter**

...
modparam("db\_flatstore", "suffix", "$time(%H)")
...

  

### 1.3.4.�`prefix` (string)

The table name prefix. Can be a pseudo variable.

_Defaul value is none._

**Example�1.4.�Set “prefix” parameter**

...
modparam("db\_flatstore", "prefix", "$time(%H)")
...

  

### 1.3.5.�`single_file` (integer)

Specifies if all the processes should dump the data into a single file.

_Default value is 0._

**Example�1.5.�Set “single\_file” parameter**

...
modparam("db\_flatstore", "single\_file", 1)
...