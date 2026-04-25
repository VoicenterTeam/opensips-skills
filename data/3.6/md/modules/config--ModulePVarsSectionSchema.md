## 1.4.�Exported Pseudo-Variables

### 1.4.1.�`$config(name)`

Returns the value of the given config variable by name. Can also be used for temporarily changing the value.

**Example�1.8.�Usage of `$config(...)`**

			...
			xlog("Config value: $config(debug\_mode)\\n"); # reading the value
			$config(debug\_mode) = 1; # temporarily changing the value
			...
			

  

### 1.4.2.�`$config.description(name)`

Returns the description of a config variable if available.

This variable is read-only.

**Example�1.9.�Usage of `$config.description(name)`**

			...
			xlog("Description: $config.description(debug\_mode)\\n");
			...