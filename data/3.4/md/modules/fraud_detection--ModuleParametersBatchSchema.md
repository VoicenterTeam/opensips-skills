## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

Database where to load the rules from.

_Default value is “NULL”. At least one db\_url should be defined for the fraud\_detection module to work._

**Example�1.1.�Set the “db\_url” parameter**

...
modparam("fraud\_detection", "db\_url", "mysql://user:passwb@localhost/database")
...

  

### 1.3.2.�`use_utc_time` (integer)

Set this parameter to non-zero in order to enable UTC-based interval matching and statistics resets, rather than local time-based.

_The default value is “0” (use local time)._

**Example�1.2.�Set the “use\_utc\_time” parameter**

...
modparam("fraud\_detection", "use\_utc\_time", 1)
...

  

### 1.3.3.�`table_name` (string)

If you want to load the rules from the database you must set this parameter as the database name.

_The default value is “fraud\_detection”._

**Example�1.3.�Set the “table\_name” parameter**

...
modparam("fraud\_detection", "table\_name", "my\_fraud")
...

  

### 1.3.4.�`rid_col` (string)

The column's name in the database storing the fraud rule's id.

_Default value is “ruleid”._

**Example�1.4.�Set “rid\_col” parameter**

...
modparam("fraud\_detection", "rid\_col", "theruleid")
...

  

### 1.3.5.�`pid_col` (string)

The column's name in the database storing the fraud profile's id.

Please keep in mind that a profile is merely a set of rules.

_Default value is “profileid”._

**Example�1.5.�Set “pid\_col” parameter**

...
modparam("fraud\_detection", "pid\_col", "profile")
...

  

### 1.3.6.�`prefix_col` (string)

The column's name in the database storing the prefix for which the fraud rule will match.

_Default value is “prefix”._

**Example�1.6.�Set “prefix\_col” parameter**

...
modparam("fraud\_detection", "prefix\_col", "myprefix")
...

  

### 1.3.7.�`start_h` (string)

The column's name in the database storing the the start time of the interval in which the rule will match.

The time needs to be specified as string using the format: “HH:MM”

_Default value is “start\_hour”._

**Example�1.7.�Set “start\_h” parameter**

...
modparam("fraud\_detection", "start\_h", "the\_start\_time")
...

  

### 1.3.8.�`end_h` (string)

The column's name in the database storing the the end time of the interval in which the rule will match.

The time needs to be specified as string using the format: “HH:MM”

_Default value is “end\_hour”._

**Example�1.8.�Set “end\_h” parameter**

...
modparam("fraud\_detection", "end\_h", "the\_end\_time")
...

  

### 1.3.9.�`days_col` (string)

The column's name in the database storing the week days in which the fraud rule's interval is available.

The daysoftheweek needs to be specified as a string containing a list of days or intervals. Each day must be specified using the first three letters of its name. A valid string would be: "Fri-Mon, Wed, Thu"

_Default value is “daysoftheweek”._

**Example�1.9.�Set “days\_col” parameter**

...
modparam("fraud\_detection", "days\_col", "days")
...

  

### 1.3.10.�`cpm_thresh_warn_col` (string)

The column's name in the database storing the warning threshold value for calls per minute.

_Default value is “cpm\_warning”._

**Example�1.10.�Set “cpm\_thresh\_warn\_col” parameter**

...
modparam("fraud\_detection", "cpm\_thresh\_warn\_col", "cpm\_warn\_thresh")
...

  

### 1.3.11.�`cpm_thresh_crit_col` (string)

The column's name in the database storing the critical threshold value for calls per minute.

_Default value is “cpm\_critical”._

**Example�1.11.�Set “cpm\_thresh\_crit\_col” parameter**

...
modparam("fraud\_detection", "cpm\_thresh\_crit\_col", "cpm\_crit\_thresh")
...

  

### 1.3.12.�`calldur_thresh_warn_col` (string)

The column's name in the database storing the warning threshold value for call duration.

_Default value is “call\_duration\_warning”._

**Example�1.12.�Set “calldur\_thresh\_warn\_col” parameter**

...
modparam("fraud\_detection", "calldur\_thresh\_warn\_col", "calldur\_warn\_thresh")
...

  

### 1.3.13.�`calldur_thresh_crit_col` (string)

The column's name in the database storing the critical threshold value for call duration.

_Default value is “call\_duration\_critical”._

**Example�1.13.�Set “calldur\_thresh\_crit\_col” parameter**

...
modparam("fraud\_detection", "calldur\_thresh\_crit\_col", "calldur\_crit\_thresh")
...

  

### 1.3.14.�`totalc_thresh_warn_col` (string)

The column's name in the database storing the warning threshold value for the number of total calls.

_Default value is “total\_calls\_warning”._

**Example�1.14.�Set “totalc\_thresh\_warn\_col” parameter**

...
modparam("fraud\_detection", "totalc\_thresh\_warn\_col", "totalc\_warn\_thresh")
...

  

### 1.3.15.�`totalc_thresh_crit_col` (string)

The column's name in the database storing the critical threshold value for the number of total calls.

_Default value is “total\_calls\_critical”._

**Example�1.15.�Set “totalc\_thresh\_crit\_col” parameter**

...
modparam("fraud\_detection", "totalc\_thresh\_crit\_col", "totalc\_crit\_thresh")
...

  

### 1.3.16.�`concalls_thresh_warn_col` (string)

The column's name in the database storing the warning threshold value for the number of concurrent calls.

_Default value is “concurrent\_calls\_warning”._

**Example�1.16.�Set “concalls\_thresh\_warn\_col” parameter**

...
modparam("fraud\_detection", "concalls\_thresh\_warn\_col", "concalls\_warn\_thresh")
...

  

### 1.3.17.�`concalls_thresh_crit_col` (string)

The column's name in the database storing the critical threshold value for the number of concurrent calls.

_Default value is “concurrent\_calls\_critical”._

**Example�1.17.�Set “concalls\_thresh\_crit\_col” parameter**

...
modparam("fraud\_detection", "concalls\_thresh\_crit\_col", "concalls\_crit\_thresh")
...

  

### 1.3.18.�`seqcalls_thresh_warn_col` (string)

The column's name in the database storing the warning threshold value for the number of sequential calls.

_Default value is “sequential\_calls\_warning”._

**Example�1.18.�Set “seqcalls\_thresh\_warn\_col” parameter**

...
modparam("fraud\_detection", "seqcalls\_thresh\_warn\_col", "seqcalls\_warn\_thresh")
...

  

### 1.3.19.�`seqcalls_thresh_crit_col` (string)

The column's name in the database storing the critical threshold value for the number of sequential calls.

_Default value is “sequential\_calls\_critical”._

**Example�1.19.�Set “seqcalls\_thresh\_crit\_col” parameter**

...
modparam("fraud\_detection", "seqcalls\_thresh\_crit\_col", "seqcalls\_crit\_thresh")
...