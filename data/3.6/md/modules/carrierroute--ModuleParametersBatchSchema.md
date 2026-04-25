## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

Url to the database containing the routing data.

_Default value is “mysql://opensipsro:opensipsro@localhost/opensips”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("carrierroute", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
		

  

### 1.3.2.�`db_table` (string)

Name of the table where the routing data is stored.

_Default value is “carrierroute”._

**Example�1.2.�Set `db_table` parameter**

...
modparam("carrierroute", "db\_table", "carrierroute")
...
		    

  

### 1.3.3.�`id_column` (string)

Name of the column containing the id identifier.

_Default value is “id”._

**Example�1.3.�Set `id_column` parameter**

...
modparam("carrierroute", "id\_column", "id")
...
		    

  

### 1.3.4.�`carrier_column` (string)

Name of the column containing the carrier id.

_Default value is “carrier”._

**Example�1.4.�Set `carrier_column` parameter**

...
modparam("carrierroute", "carrier\_column", "carrier")
...
		    

  

### 1.3.5.�`scan_prefix_column` (string)

Name of column containing the scan prefixes. Scan prefixes define the matching portion of a phone number, e.g. when we have the scan prefixes 49721 and 49, the called number is 49721913740, it matches 49721, because the longest match is taken. If no prefix matches, the number is not routed. To prevent this, an empty prefix value of “” could be added.

_Default value is “scan\_prefix”._

**Example�1.5.�Set `scan_prefix_column` parameter**

...
modparam("carrierroute", "scan\_prefix\_column", "scan\_prefix")
...
		    

  

### 1.3.6.�`domain_column` (string)

Name of column containing the rule domain. You can define several routing domains to have different routing rules. Maybe you use domain 0 for normal routing and domain 1 if domain 0 failed.

_Default value is “domain”._

**Example�1.6.�Set `domain_column` parameter**

...
modparam("carrierroute", "domain\_column", "domain")
...
		    

  

### 1.3.7.�`flags_column` (string)

Name of the column containing the flags.

_Default value is “flags”._

**Example�1.7.�Set `flags_column` parameter**

...
modparam("carrierroute", "flags\_column", "flags")
...
		    

  

### 1.3.8.�`mask_column` (string)

Name of the column containing the flags mask.

_Default value is “mask”._

**Example�1.8.�Set `mask_column` parameter**

...
modparam("carrierroute", "mask\_column", "mask")
...
		    

  

### 1.3.9.�`prob_column` (string)

Name of column containing probability. The probability value is used to distribute the traffic between several gateways. Let's say 70 % of the traffic shall be routed to gateway A, the other 30 % shall be routed to gateway B, we define a rule for gateway A with a prob value of 0.7 and a rule for gateway B with a prob value of 0.3.

If all probabilities for a given prefix, tree and domain don't add to 100%, the prefix values will be adjusted according the given prob values. E.g. if three hosts with prob values of 0.5, 0.5 and 0.4 are defined, the resulting probabilities are 35.714, 35.714 and 28.571%. But its better to choose meaningful values in the first place because of clarity.

_Default value is “prob”._

**Example�1.9.�Set `prob_column` parameter**

...
modparam("carrierroute", "prob\_column", "prob")
...
		    

  

### 1.3.10.�`rewrite_host_column` (string)

Name of column containing rewrite host value. An empty field represents a blacklist entry, anything else is put as domain part into the Request URI of the SIP message.

_Default value is “rewrite\_host”._

**Example�1.10.�Set `rewrite_host_column` parameter**

...
modparam("carrierroute", "rewrite\_host\_column", "rewrite\_host")
...
		    

  

### 1.3.11.�`strip_column` (string)

Name of the column containing the number of digits to be stripped of the userpart of an URI before prepending rewrite\_prefix.

_Default value is “strip”._

**Example�1.11.�Set `strip_column` parameter**

...
modparam("carrierroute", "strip\_column", "strip")
...
		    

  

### 1.3.12.�`comment_column` (string)

Name of the column containing an optional comment (useful in large routing tables) The comment is also displayed by the fifo cmd "cr\_dump\_routes".

_Default value is “description”._

**Example�1.12.�Set `comment_column` parameter**

...
modparam("carrierroute", "comment\_column", "description")
...
		    

  

### 1.3.13.�`carrier_table` (string)

The name of the table containing the existing carriers, consisting of the ids and corresponding names.

_Default value is “route\_tree”._

**Example�1.13.�Set `carrier_table` parameter**

...
modparam("carrierroute", "carrier\_table", "route\_tree")
...
		    

  

### 1.3.14.�`rewrite_prefix_column` (string)

Name of column containing rewrite prefixes. Here you can define a rewrite prefix for the localpart of the SIP URI.

_Default value is “rewrite\_prefix”._

**Example�1.14.�Set `rewrite_prefix_column` parameter**

...
modparam("carrierroute", "rewrite\_prefix\_column", "rewrite\_prefix")
...
		    

  

### 1.3.15.�`rewrite_suffix_column` (string)

Name of column containing rewrite suffixes. Here you can define a rewrite suffix for the localpart of the SIP URI.

_Default value is “rewrite\_suffix”._

**Example�1.15.�Set `rewrite_suffix_column` parameter**

			    ...
modparam("carrierroute", "rewrite\_suffix\_column", "rewrite\_suffix")
			    ...
		    

  

### 1.3.16.�`carrier_id_col` (string)

The name of the column in the carrier table containing the carrier id.

_Default value is “id”._

**Example�1.16.�Set `id_col` parameter**

...
modparam("carrierroute", "carrier\_id\_col", "id")
...
		    

  

### 1.3.17.�`carrier_name_col` (string)

The name of the column in the carrier table containing the carrier name.

_Default value is “carrier”._

**Example�1.17.�Set `carrier_name_col` parameter**

...
modparam("carrierroute", "carrier\_name\_col", "carrier")
...
		    

  

### 1.3.18.�`subscriber_table` (string)

The name of the table containing the subscribers

_Default value is “subscriber”._

**Example�1.18.�Set `subscriber_table` parameter**

...
modparam("carrierroute", "subscriber\_table", "subscriber")
...
		    

  

### 1.3.19.�`subscriber_user_col` (string)

The name of the column in the subscriber table containing the usernames.

_Default value is “username”._

**Example�1.19.�Set `subscriber_user_col` parameter**

...
modparam("carrierroute", "subscriber\_user\_col", "username")
...
		    

  

### 1.3.20.�`subscriber_domain_col` (string)

The name of the column in the subscriber table containing the domain of the subscriber.

_Default value is “domain”._

**Example�1.20.�Set `subscriber_domain_col` parameter**

...
modparam("carrierroute", "subscriber\_domain\_col", "domain")
...
		    

  

### 1.3.21.�`subscriber_carrier_col` (string)

The name of the column in the subscriber table containing the carrier id of the subscriber.

_Default value is “cr\_preferred\_carrier”._

**Example�1.21.�Set `subscriber_carrier_col` parameter**

...
modparam("carrierroute", "subscriber\_carrier\_col", "cr\_preferred\_carrier")
...
		    

  

### 1.3.22.�`config_source` (string)

Specifies whether the module loads its config data from a file or from a database. Possible values are file or db.

_Default value is “file”._

**Example�1.22.�Set `config_source` parameter**

...
modparam("carrierroute", "config\_source", "file")
...
		    

  

### 1.3.23.�`config_file` (string)

Specifies the path to the config file.

_Default value is “/etc/opensips/carrierroute.conf”._

**Example�1.23.�Set `config_file` parameter**

...
modparam("carrierroute", "config\_file", "/etc/opensips/carrierroute.conf")
...
		    

  

### 1.3.24.�`default_tree` (string)

The name of the carrier tree used per default (if the current subscriber has no preferred tree)

_Default value is “default”._

**Example�1.24.�Set `default_tree` parameter**

...
modparam("carrierroute", "default\_tree", "default")
...
		    

  

### 1.3.25.�`use_domain` (int)

When using tree lookup per user, this parameter specifies whether to use the domain part for user matching or not.

_Default value is “0”._

**Example�1.25.�Set `use_domain` parameter**

...
modparam("carrierroute", "use\_domain", 0)
...
		    

  

### 1.3.26.�`fallback_default` (int)

This parameter defines the behaviour when using user-based tree lookup. If the user has a non-existing tree set and fallback\_default is set to 1, the default tree is used. Otherwise, cr\_user\_rewrite\_uri returns an error.

_Default value is “1”._

**Example�1.26.�Set `fallback_default` parameter**

...
modparam("carrierroute", "fallback\_default", 1)
...
		    

  

### 1.3.27.�`db_failure_table` (string)

Name of the table where the failure routing data is stored.

_Default value is “carrierfailureroute”._

**Example�1.27.�Set `db_failure_table` parameter**

...
modparam("carrierroute", "db\_failure\_table", "carrierfailureroute")
...
		    

  

### 1.3.28.�`failure_id_column` (string)

Name of the column containing the id identifier.

_Default value is “id”._

**Example�1.28.�Set `failure_id_column` parameter**

...
modparam("carrierroute", "failure\_id\_column", "id")
...
		    

  

### 1.3.29.�`failure_carrier_column` (string)

Name of the column containing the carrier id.

_Default value is “carrier”._

**Example�1.29.�Set `failure_carrier_column` parameter**

...
modparam("carrierroute", "failure\_carrier\_column", "carrier")
...
		    

  

### 1.3.30.�`failure_scan_prefix_column` (string)

Name of column containing the scan prefixes. Scan prexies define the matching portion of a phone number, e.g. we have the scan prefixes 49721 and 49, the called number is 49721913740, it matches 49721, because the longest match is taken. If no prefix matches, the number is not failure routed. To prevent this, an empty prefix value of “” could be added.

_Default value is “scan\_prefix”._

**Example�1.30.�Set `failure_scan_prefix_column` parameter**

...
modparam("carrierroute", "failure\_scan\_prefix\_column", "scan\_prefix")
...
		    

  

### 1.3.31.�`failure_domain_column` (string)

Name of column containing the rule domain. You can define several routing domains to have different routing rules. Maybe you use domain 0 for normal routing and domain 1 if domain 0 failed.

_Default value is “domain”._

**Example�1.31.�Set `failure_domain_column` parameter**

...
modparam("carrierroute", "failure\_domain\_column", "domain")
...
		    

  

### 1.3.32.�`failure_host_name_column` (string)

Name of the column containing the host name of the last routing destination.

_Default value is “host\_name”._

**Example�1.32.�Set `failure_host_name_column` parameter**

...
modparam("carrierroute", "failure\_host\_name\_column", "host\_name")
...
		    

  

### 1.3.33.�`failure_reply_code_column` (string)

Name of the column containing the reply code.

_Default value is “reply\_code”._

**Example�1.33.�Set `failure_reply_code_column` parameter**

...
modparam("carrierroute", "failure\_reply\_code\_column", "reply\_code")
...
		    

  

### 1.3.34.�`failure_flags_column` (string)

Name of the column containing the flags.

_Default value is “flags”._

**Example�1.34.�Set `failure_flags_column` parameter**

...
modparam("carrierroute", "failure\_flags\_column", "flags")
...
		    

  

### 1.3.35.�`failure_mask_column` (string)

Name of the column containing the flags mask.

_Default value is “mask”._

**Example�1.35.�Set `failure_mask_column` parameter**

...
modparam("carrierroute", "failure\_mask\_column", "mask")
...
		    

  

### 1.3.36.�`failure_next_domain_column` (string)

Name of the column containing the next routing domain.

_Default value is “next\_domain”._

**Example�1.36.�Set `failure_next_domain_column` parameter**

...
modparam("carrierroute", "failure\_next\_domain\_column", "next\_domain")
...
		    

  

### 1.3.37.�`failure_comment_column` (string)

Name of the column containing an optional comment.

_Default value is “description”._

**Example�1.37.�Set `failure_comment_column` parameter**

...
modparam("carrierroute", "failure\_comment\_column", "description")
...