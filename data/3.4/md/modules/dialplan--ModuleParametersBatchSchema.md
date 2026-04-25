## 1.6.�Exported Parameters

### 1.6.1.�`partition` (string)

Specify a new dialplan partition (data source). This parameter may be set multiple times. Each partition may have a specific "db\_url" and "table\_name". If not specified, these values will be inherited from [db\_url](#param_db_url "1.6.2.�db_url (string)"), db\_default\_url or [table\_name](#param_table_name "1.6.3.�table_name (string)"), respectively. The name of the default partition is 'default'.

Note: OpenSIPS will validate each partition, so make sure to add any required entries in the "version" table of each database defined through the 'db\_url' property.

**Example�1.1.� Defining the `'pstn'` partition**

...
modparam("dialplan", "partition", "
	pstn:
		table\_name = dialplan;
		db\_url = mysql://opensips:opensipsrw@127.0.0.1/opensips")
...
		

  

**Example�1.2.� Define the 'pstn' partition and make it the 'default' partition, so we avoid loading the 'dialplan' table**

...
db\_default\_url = "mysql://opensips:opensipsrw@localhost/opensips"

loadmodule "dialplan.so"
modparam("dialplan", "partition", "
	pstn:
		table\_name = dialplan\_pstn")
modparam("dialplan", "partition", "default: pstn")
...
		

  

### 1.6.2.�`db_url` (string)

The default DB connection of the module, overriding the global 'db\_default\_url' setting. Once specified, partitions which are missing the 'db\_url' property will inherit their URL from this value.

_Default value is NULL (not set)._

**Example�1.3.�Set `db_url` parameter**

...
modparam("dialplan", "db\_url", "mysql://user:passwd@localhost/db")
...
		

  

### 1.6.3.�`table_name` (string)

The default name of the table from which to load translation rules. Partitions which are missing the 'table\_name' property will inherit their table name from this value.

_Default value is “dialplan”._

**Example�1.4.�Set `table_name` parameter**

...
modparam("dialplan", "table\_name", "my\_table")
...
		

  

### 1.6.4.�`dpid_col` (string)

The column name to store the dialplan ID group.

_Default value is “dpid”._

**Example�1.5.�Set `dpid_col` parameter**

...
modparam("dialplan", "dpid\_col", "column\_name")
...
		

  

### 1.6.5.�`pr_col` (string)

The column name to store the priority of the corresponding rule from the table row. Smaller priority values have higher precedence.

_Default value is “pr”._

**Example�1.6.�Set `pr_col` parameter**

...
modparam("dialplan", "pr\_col", "column\_name")
...
		

  

### 1.6.6.�`match_op_col` (string)

The column name to store the type of matching of the rule.

_Default value is “match\_op”._

**Example�1.7.�Set `match_op_col` parameter**

...
modparam("dialplan", "match\_op\_col", "column\_name")
...
		

  

### 1.6.7.�`match_exp_col` (string)

The column name to store the rule match expression.

_Default value is “match\_exp”._

**Example�1.8.�Set `match_exp_col` parameter**

...
modparam("dialplan", "match\_exp\_col", "column\_name")
...
		

  

### 1.6.8.�`match_flags_col` (string)

The column name to store various matching flags. Currently 0 - case sensitive matching, 1 - case insensitive matching.

_Default value is “match\_flags”._

**Example�1.9.�Set `match_flags_col` parameter**

...
modparam("dialplan", "match\_flags\_col", "column\_name")
...
		

  

### 1.6.9.�`subst_exp_col` (string)

The column name to store the rule's substitution expression.

_Default value is “subst\_exp”._

**Example�1.10.�Set `subs_exp_col` parameter**

...
modparam("dialplan", "subst\_exp\_col", "column\_name")
...
		

  

### 1.6.10.�`repl_exp_col` (string)

The column name to store the rule's replacement expression.

_Default value is “repl\_exp”._

**Example�1.11.�Set `repl_exp_col` parameter**

...
modparam("dialplan", "repl\_exp\_col", "column\_name")
...
		

  

### 1.6.11.�`timerec_col` (integer)

The column name that indicates an additional time recurrence check within the rule (column values are RFC 2445-compatible strings). The value format is identical to the input of the [check\_time\_rec()](cfgutils#func_check_time_rec) function of the _cfgutils_ module, including the optional use of logical operators linking multiple such strings into a larger expression.

_Default value is “timerec”._

**Example�1.12.�Set `timerec_col` parameter**

...
modparam("dialplan", "timerec\_col", "month\_match")
...
		

  

### 1.6.12.�`disabled_col` (integer)

The column name that indicates if the dialplan rule is disabled.

_Default value is “disabled”._

**Example�1.13.�Set `disabled_col` parameter**

...
modparam("dialplan", "disabled\_col", "disabled\_column")
...
		

  

### 1.6.13.�`attrs_col` (string)

The column name to store rule-specific attributes.

_Default value is “attrs”._

**Example�1.14.�Set `attrs_col` parameter**

...
modparam("dialplan", "attrs\_col", "column\_name")
...