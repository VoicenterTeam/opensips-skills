## 1.6.�Exported Pseudo-Variables

### 1.6.1.�`$sql_cached_value(id{sep}col{sep}key)`

The cached data is available through this read-only PV.The format is the following:

*   _sep_ : separator configured by [pvar\_delimiter](#param_pvar_delimiter "1.3.3.�pvar_delimiter (string)")
    
*   _id_ : cache entry id
    
*   _col_ : name of the required column
    
*   _key_ : value of the “key” column
    

**Example�1.11.�`sql_cached_value(id{sep}col{sep}key) pseudo-variable` usage**

...
$avp(a) = $sql\_cached\_value(caching\_name:column\_name\_1:key1);
...