## 1.3.�Exported Parameters

### 1.3.1.�`file` (string)

Text file containing the regular expression groups. It must be set in order to enable the group matching function.

_Default value is “NULL”._

**Example�1.1.�Set `file` parameter**

...
modparam("regex", "file", "/etc/opensips/regex\_groups")
...

  

### 1.3.2.�`max_groups` (int)

Max number of regular expression groups in the text file.

_Default value is “20”._

**Example�1.2.�Set `max_groups` parameter**

...
modparam("regex", "max\_groups", 40)
...

  

### 1.3.3.�`group_max_size` (int)

Max content size of a group in the text file.

_Default value is “8192”._

**Example�1.3.�Set `group_max_size` parameter**

...
modparam("regex", "group\_max\_size", 16384)
...

  

### 1.3.4.�`pcre_caseless` (int)

If this options is set, matching is done caseless. It is equivalent to Perl's /i option, and it can be changed within a pattern by a (?i) or (?-i) option setting.

_Default value is “0”._

**Example�1.4.�Set `pcre_caseless` parameter**

...
modparam("regex", "pcre\_caseless", 1)
...

  

### 1.3.5.�`pcre_multiline` (int)

By default, PCRE treats the subject string as consisting of a single line of characters (even if it actually contains newlines). The "start of line" metacharacter (^) matches only at the start of the string, while the "end of line" metacharacter ($) matches only at the end of the string, or before a terminating newline.

When this option is set, the "start of line" and "end of line" constructs match immediately following or immediately before internal newlines in the subject string, respectively, as well as at the very start and end. This is equivalent to Perl's /m option, and it can be changed within a pattern by a (?m) or (?-m) option setting. If there are no newlines in a subject string, or no occurrences of ^ or $ in a pattern, setting this option has no effect.

_Default value is “0”._

**Example�1.5.�Set `pcre_multiline` parameter**

...
modparam("regex", "pcre\_multiline", 1)
...

  

### 1.3.6.�`pcre_dotall` (int)

If this option is set, a dot metacharater in the pattern matches all characters, including those that indicate newline. Without it, a dot does not match when the current position is at a newline. This option is equivalent to Perl's /s option, and it can be changed within a pattern by a (?s) or (?-s) option setting.

_Default value is “0”._

**Example�1.6.�Set `pcre_dotall` parameter**

...
modparam("regex", "pcre\_dotall", 1)
...

  

### 1.3.7.�`pcre_extended` (int)

If this option is set, whitespace data characters in the pattern are totally ignored except when escaped or inside a character class. Whitespace does not include the VT character (code 11). In addition, characters between an unescaped # outside a character class and the next newline, inclusive, are also ignored. This is equivalent to Perl's /x option, and it can be changed within a pattern by a (?x) or (?-x) option setting.

_Default value is “0”._

**Example�1.7.�Set `pcre_extended` parameter**

...
modparam("regex", "pcre\_extended", 1)
...