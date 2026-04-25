## 1.7.�Exported Pseudo-Variables

### 1.7.1.�`$stat`

Allows "get" or "reset" operations on the given statistics.

The name of a statistic may be optionally prefixed with a searching group, along with a colon separator.

If a searching group is not provided, the statistic is first searched for in the core groups. If not found, search continues with the "dynamic" group which, by default, holds all non-explicitly grouped statistics which are not exported by the OpenSIPS core.

**Example�1.9.�`$stat` usage**

...
xlog("SHM used size = $stat(used\_size), no\_invites = $stat(method:invite)\\n");
...
$stat(err\_requests) = 0;
...