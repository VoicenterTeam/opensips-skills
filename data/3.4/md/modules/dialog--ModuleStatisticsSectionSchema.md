## 1.8.�Exported Statistics

### 1.8.1.�`active_dialogs`

Returns the number of current active dialogs (may be confirmed or not).

### 1.8.2.�`early_dialogs`

Returns the number of early dialogs.

### 1.8.3.�`processed_dialogs`

Returns the total number of processed dialogs (terminated, expired or active) from the startup.

### 1.8.4.�`expired_dialogs`

Returns the total number of expired dialogs from the startup.

### 1.8.5.�`failed_dialogs`

Returns the number of failed dialogs ( dialogs were never established due to whatever reasons - internal error, negative reply, cancelled, etc )

### 1.8.6.�`create_sent`

Returns the number of replicated dialog **create** requests send to other OpenSIPS instances.

### 1.8.7.�`update_sent`

Returns the number of replicated dialog **update** requests send to other OpenSIPS instances.

### 1.8.8.�`delete_sent`

Returns the number of replicated dialog **delete** requests send to other OpenSIPS instances.

### 1.8.9.�`create_recv`

Returns the number of dialog **create** events received from other OpenSIPS instances.

### 1.8.10.�`update_recv`

Returns the number of dialog **update** events received from other OpenSIPS instances.

### 1.8.11.�`delete_recv`

Returns the number of dialog **delete** events received from other OpenSIPS instances.