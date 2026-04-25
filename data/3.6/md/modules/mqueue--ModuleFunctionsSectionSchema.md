## 1.4.�Exported Functions

### 1.4.1.� `mq_add(queue, key, value)`

Add a new item (key, value) in the queue. If max size of queue is exceeded, the oldest one is removed.

**Example�1.3.�`mq_add` usage**

...
mq\_add("myq", "$rU", "call from $fU");
...

  

### 1.4.2.� `mq_fetch(queue)`

Take oldest item from queue and fill $mqk(queue) and $mqv(queue) pseudo variables.

Return: true on success (1); false on failure (-1) or no item fetched (-2).

**Example�1.4.�`mq_fetch` usage**

...
while(mq\_fetch("myq"))
{
	xlog("$mqk(myq) - $mqv(myq)\\n");
}
...

  

### 1.4.3.� `mq_pv_free(queue)`

Free the item fetched in pseudo-variables. It is optional, a new fetch frees the previous values.

**Example�1.5.�`mq_pv_free` usage**

...
mq\_pv\_free("myq");
...

  

### 1.4.4.� `mq_size(queue)`

Returns the current number of elements in the mqueue.

If the mqueue is empty, the function returns -1. If the mqueue is not found, the function returns -2.

**Example�1.6.�`mq_size` usage**

...
$var(q\_size) = mq\_size("queue");
xlog("L\_INFO", "Size of queue is: $var(q\_size)\\n");
...