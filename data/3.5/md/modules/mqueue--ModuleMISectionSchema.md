## 1.5.�Exported MI Functions

### 1.5.1.�mq\_get\_size

Get the size of a memory queue.

Parameters:

*   _name_ - the name of memory queue

**Example�1.7.�`mq_get_size` usage**

...
opensips-cli -x mq\_get\_size xyz
...

  

### 1.5.2.�mq\_fetch

Fetch a key-value pair from a memory queue.

Parameters:

*   _name_ - the name of memory queue

**Example�1.8.�`mq_fetch` usage**

...
opensips-cli -x mq\_fetch xyz
...

  

### 1.5.3.�mq\_get\_sizes

Get the size for all memory queues.

Parameters: none

**Example�1.9.�`mq_get_sizes` usage**

...
opensips-cli -x mq\_get\_sizes
...