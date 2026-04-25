## 1.6.�Exported Parameters

### 1.6.1.�`early_media` (integer)

Should be early media (any provisional reply with body) accounted too ?

Default value is 0 (no).

**Example�1.1.�early\_media example**

modparam("acc", "early\_media", 1)

  

### 1.6.2.�`report_cancels` (integer)

By default, CANCEL reporting is disabled -- most accounting applications wants to see INVITE's cancellation status. Turn on if you explicitly want to account CANCEL transactions.

Default value is 0 (no).

**Example�1.2.�report\_cancels example**

modparam("acc", "report\_cancels", 1)

  

### 1.6.3.�`detect_direction` (integer)

Controls the direction detection for sequential requests. If enabled (non zero value), for sequential requests with upstream direction (from callee to caller), the FROM and TO will be swapped (the direction will be preserved as in the original request).

It affects all values related to TO and FROM headers (body, URI, username, domain, TAG).

Default value is 0 (disabled).

**Example�1.3.�detect\_direction example**

modparam("acc", "detect\_direction", 1)

  

### 1.6.4.�`extra_fields` (string)

Defines the tag-log\_value set to be used in extra fields accounting. See [Section�1.2, “Extra accounting”](#ACC-extra-id "1.2.�Extra accounting") for a detailed description of the Extra accounting.

If empty, extra accounting support will be disabled.

Default value is 0 (disabled).

**Example�1.4.�Setting _extra\_fields_ example:**

\# for syslog-based accounting, use any text you want to be printed
# if setting $acc\_extra(a) you will see "My\_a\_Field=<value> in logs
# if setting $acc\_extra(b) you will see "b=<value> in logs
modparam("acc", "extra\_fields", "log: a->My\_a\_Field; b")
# for mysql-based accounting, use the names of the columns
# $acc\_extra(a) = <value>  results in setting col\_a with <value> in db
modparam("acc", "extra\_fields", "db: a->col\_a; col\_b")
# for AAA-based accounting, use the names of the AAA AVPs
modparam("acc", "extra\_fields","aaa:a->AAA\_SRC;b->AAA\_DST")
# evi definition example
modparam("acc", "extra\_fields","a->2345;b->2346")

  

### 1.6.5.�`leg_fields` (string)

Defines the tag-log\_value set to be used in multi-leg accounting. See [Section�1.3, “Multi Call-Legs accounting”](#multi-call-legs "1.3.�Multi Call-Legs accounting") for a detailed description of the Multi Call-Legs accounting.

If empty, multi-leg accounting support will be disabled.

Default value is 0 (disabled).

**Example�1.5.�Setting _leg\_fields_ example:**

\# for syslog-based accounting, use any text you want to be printed
# if setting $(acc\_leg(a)\[0\]) you will see "My\_a\_Field=<value> in logs
# if setting $(acc\_leg(b)\[0\]) you will see "b=<value> in logs
modparam("acc", "leg\_fields", "log: a->My\_a\_Field; b")
# for mysql-based accounting, use the names of the columns
# $acc\_leg(a) = <value>  results in setting col\_a with <value> in db
modparam("acc", "leg\_fields", "db: a->col\_a; col\_b")
# for AAA-based accounting, use the names of the AAA AVPs
modparam("acc", "leg\_fields","aaa:a->AAA\_LEG\_SRC;b->AAA\_LEG\_DST")
# evi definition example
modparam("acc", "leg\_fields","a->2345;b->2346")

  

### 1.6.6.�`log_level` (integer)

Log level at which accounting messages are issued to syslog.

Default value is L\_NOTICE.

**Example�1.6.�log\_level example**

modparam("acc", "log\_level", 2)   # Set log\_level to 2

  

### 1.6.7.�`log_facility` (string)

Log facility to which accounting messages are issued to syslog. This allows to easily seperate the accounting specific logging from the other log messages.

Default value is LOG\_DAEMON.

**Example�1.7.�log\_facility example**

modparam("acc", "log\_facility", "LOG\_DAEMON")

  

### 1.6.8.�`aaa_url` (string)

This is the url representing the AAA protocol used and the location of the configuration file of this protocol.

If the parameter is set to empty string, the AAA accounting support will be disabled.

Default value is “NULL”.

**Example�1.8.�Set `aaa_url` parameter**

...
modparam("acc", "aaa\_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
...

  

### 1.6.9.�`service_type` (integer)

AAA service type used for accounting.

Default value is not-set.

**Example�1.9.�service\_type example**

\# Default value of service type for SIP is 15
modparam("acc", "service\_type", 15)

  

### 1.6.10.�`db_table_acc` (string)

Table name of accounting successful calls -- database specific.

Default value is “acc”

**Example�1.10.�db\_table\_acc example**

modparam("acc", "db\_table\_acc", "myacc\_table")

  

### 1.6.11.�`db_table_missed_calls` (string)

Table name for accounting missed calls -- database specific.

Default value is “missed\_calls”

**Example�1.11.�db\_table\_missed\_calls example**

modparam("acc", "db\_table\_missed\_calls", "myMC\_table")

  

### 1.6.12.�`db_url` (string)

SQL address -- database specific. If is set to NULL or empty string, the SQL support is disabled.

Default value is “NULL” (SQL disabled).

**Example�1.12.�db\_url example**

modparam("acc", "db\_url", "mysql://user:password@localhost/opensips")

  

### 1.6.13.�`acc_method_column` (string)

Column name in accounting table to store the request's method name as string.

Default value is “method”.

**Example�1.13.�acc\_method\_column example**

modparam("acc", "acc\_method\_column", "method")

  

### 1.6.14.�`acc_from_tag_column` (string)

Column name in accounting table to store the From header TAG parameter.

Default value is “from\_tag”.

**Example�1.14.�acc\_from\_tag\_column example**

modparam("acc", "acc\_from\_tag\_column", "from\_tag")

  

### 1.6.15.�`acc_to_tag_column` (string)

Column name in accounting table to store the To header TAG parameter.

Default value is “to\_tag”.

**Example�1.15.�acc\_to\_tag\_column example**

modparam("acc", "acc\_to\_tag\_column", "to\_tag")

  

### 1.6.16.�`acc_callid_column` (string)

Column name in accounting table to store the request's Callid value.

Default value is “callid”.

**Example�1.16.�acc\_callid\_column example**

modparam("acc", "acc\_callid\_column", "callid")

  

### 1.6.17.�`acc_sip_code_column` (string)

Column name in accounting table to store the final reply's numeric code value in string format.

Default value is “sip\_code”.

**Example�1.17.�acc\_sip\_code\_column example**

modparam("acc", "acc\_sip\_code\_column", "sip\_code")

  

### 1.6.18.�`acc_sip_reason_column` (string)

Column name in accounting table to store the final reply's reason phrase value.

Default value is “sip\_reason”.

**Example�1.18.�acc\_sip\_reason\_column example**

modparam("acc", "acc\_sip\_reason\_column", "sip\_reason")

  

### 1.6.19.�`acc_time_column` (string)

Column name in accounting table to store the time stamp of the transaction completion in date-time format.

Default value is “time”.

**Example�1.19.�acc\_time\_column example**

modparam("acc", "acc\_time\_column", "time")