## 1.7.�Exported Pseudo-Variables

### 1.7.1.�$acc\_extra(tag\_name)

This variable can addresed with the tag names defined using [extra\_fields](#param_extra_fields "1.6.4.�extra_fields (string)"). If [do\_accounting()](#func_do_accounting "1.8.1.� do_accounting(type, [flags], [table])") isn't called, this variable is visible during the whole processing of one message, enabling calling _acc\_XXX\_request()_. If [do\_accounting()](#func_do_accounting "1.8.1.� do_accounting(type, [flags], [table])") is called, the variable will be visible from the first call of this function until the actual accounting is being made.

### 1.7.2.�$(acc\_leg(tag\_name)\[leg\_index\])

This variable can be addressed with the tag names defined using [leg\_fields](#param_leg_fields "1.6.5.�leg_fields (string)") and a valid leg index (<= [$acc\_current\_leg](#pv_acc_current_leg "1.7.3.�$acc_current_leg (read-only)")). This variable cannot be used unless [do\_accounting()](#func_do_accounting "1.8.1.� do_accounting(type, [flags], [table])") is used. The variable also accepts negative indexes, which start from -1 (the lastly added leg).

\# the "caller" value of the current leg
$acc\_leg(caller)

# the "caller" value of the lastly added leg
$(acc\_leg(caller)\[-1\]) # equivalent to $acc\_leg(caller)
                       # equivalent to $(acc\_leg(caller)\[$acc\_current\_leg\])

# the "caller" value of the next-to-last leg
$(acc\_leg(caller)\[-2\])

### 1.7.3.�$acc\_current\_leg (read-only)

Holds the index of the current leg, starting from 0. Calling [acc\_new\_leg()](#func_acc_new_leg "1.8.7.� acc_new_leg()") will increment this index.