## 1.3.�Exported Parameters

### 1.3.1.�`trie_table`(str)

The name of the db table storing prefix rules.

_Default value is “trie\_table”._

**Example�1.1.�Set `trie_table` parameter**

...
modparam("trie", "trie\_table", "my\_prefix\_table")
...

  

### 1.3.2.�`no_concurrent_reload` (int)

If enabled, the module will not allow do run multiple trie\_reload MI commands in parallel (with overlapping) Any new reload will be rejected (and discarded) while an existing reload is in progress.

If you have a large routing set (millions of rules/prefixes), you should consider disabling concurrent reload as they will exhaust the shared memory (by reloading into memory, in the same time, multiple instances of routing data).

_Default value is “0 (disabled)”._

**Example�1.2.�Set `no_concurrent_reload` parameter**

...
# do not allow parallel reload operations
modparam("trie", "no\_concurrent\_reload", 1)
...

  

### 1.3.3.�`use_partitions` (int)

Flag to configure whether to use partitions for tries. If this flag is set then the `db_partitions_url` and `db_partitions_table` variables become mandatory.

_Default value is “0”._

**Example�1.3.�Set `use_partitions` parameter**

...
modparam("trie", "use\_partitions", 1)
...

  

### 1.3.4.�`db_partitions_url` (str)

The url to the database containing partition-specific information.The `use_partitions` parameter must be set to 1.

_Default value is “"NULL"”._

**Example�1.4.�Set `db_partitions_url` parameter**

...
modparam("trie", "db\_partitions\_url", "mysql://user:password@localhost/opensips\_partitions")
...

  

### 1.3.5.�`db_partitions_table` (str)

The name of the table containing partition definitions. To be used with `use_partitions` and `db_partitions_url`.

_Default value is “trie\_partitions”._

**Example�1.5.�Set `db_partitions_table` parameter**

...
modparam("trie", "db\_partitions\_table", "trie\_partition\_defs")
...

  

### 1.3.6.�`extra_prefix_chars` (str)

List of ASCII (0-127) characters to be additionally accepted in the prefixes. By default only '0' - '9' chars (digits) are accepted.

_Default value is “NULL”._

**Example�1.6.�Set `extra_prefix_chars` parameter**

...
modparam("trie", "extra\_prefix\_chars", "#-%")
...