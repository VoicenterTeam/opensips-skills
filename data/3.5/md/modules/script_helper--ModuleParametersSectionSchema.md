## 1.4.�Exported Parameters

### 1.4.1.�`use_dialog` (integer)

Enables dialog support. Note that the dialog module must be loaded before this module when setting this parameter.

Default value is 0 (disabled)

**Example�1.1.�Setting `use_dialog`**

...
modparam("script\_helper", "use\_dialog", 1)
...

  

### 1.4.2.�`create_dialog_flags` (string)

Flags used when creating dialogs. For details on these flags, please refer to the _create\_dialog()_ function of the dialog module.

Default value is "" (no flags are set)

**Example�1.2.�Setting `create_dialog_flags`**

...
modparam("script\_helper", "create\_dialog\_flags", "PpB")
...

  

### 1.4.3.�`sequential_route` (string)

Optional route to be run just before sequential requests are relayed. If the _exit_ script statement is used inside this route, the module assumes that the relaying logic has been handled.

By default, this parameter is not set

**Example�1.3.�Setting `sequential_route`**

...
modparam("script\_helper", "sequential\_route", "sequential\_handling")
...
route \[sequential\_handling\]
{
...
}
...