## 1.4.�Exported Parameters

### 1.4.1.�`hash_size` (int)

The size of the hash table used for storing Subscribe and Publish information. This parameter will be used as the power of 2 when computing table size.

_Default value is “9”._

**Example�1.1.�Set `hash_size` parameter**

...
modparam("pua", "hash\_size", 11)
...

  

### 1.4.2.�`db_url` (str)

Database url.

_Default value is “\>mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.2.�Set `db_url` parameter**

...
modparam("pua", "db\_url" "dbdriver://username:password@dbhost/dbname")
...

  

### 1.4.3.�`db_table` (str)

The name of the database table.

_Default value is “pua”._

**Example�1.3.�Set `db_table` parameter**

...
modparam("pua", "db\_table", "pua")
...

  

### 1.4.4.�`min_expires` (int)

The inferior expires limit for both Publish and Subscribe.

_Default value is “300”._

**Example�1.4.�Set `min_expires` parameter**

...
modparam("pua", "min\_expires", 0)
...

  

### 1.4.5.�`default_expires` (int)

The default expires value used in case this information is not provisioned.

_Default value is “3600”._

**Example�1.5.�Set `default_expires` parameter**

...
modparam("pua", "default\_expires", 3600)
...

  

### 1.4.6.�`update_period` (int)

The interval at which the information in database and hash table should be updated. In the case of the hash table updating is deleting expired messages.

_Default value is “30”._

IMPORTANT - if you use clustering support for this module, set a low value here, like 2-5, see the clustering chapter above.

**Example�1.6.�Set `update_period` parameter**

...
modparam("pua", "update\_period", 100)
...

  

### 1.4.7.�`cluster_id` (int)

The cluster ID where the PUA data should be replicated/shared. This parameter is to be used only if clustering mode is needed. In order to understand the concept of a cluster ID, please see the _clusterer_ module.

For more on PUA clustering see the [Section�1.2, “PUA clustering”](#pua_clustering "1.2.�PUA clustering") chapter.

_Default value is “None”._

**Example�1.7.�Set `cluster_id` parameter**

...
modparam("pua", "cluster\_id", 10)
...

  

### 1.4.8.�`cluster_sharing_tag` (int)

The clustering share-tag to be used by the PUA module when creating any new presentity record. The tag will by used to decide which OpenSIPS instance (owning the tag as active) will be responsible for expiring this presentity. This parameter is to be used only if clustering mode is needed. In order to understand the concept of sharing TAG, please see the _clusterer_ module.

For more on PUA clustering see the [Section�1.2, “PUA clustering”](#pua_clustering "1.2.�PUA clustering") chapter.

_Default value is “NULL”._

**Example�1.8.�Set `cluster_sharing_tag` parameter**

...
modparam("pua", "cluster\_sharing\_tag", "vip")
...