# RATE\_CACHER Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5845552)

2.2. [Most recently active contributors(1) to this module](#idp5922640)

**List of Examples**

1.1. [Setting the `vendors_db_url` parameter](#idp246688)

1.2. [Setting the `vendors_db_table` parameter](#idp163824)

1.3. [Setting the `vendors_hash_size` parameter](#idp169232)

1.4. [Setting the `clients_db_url` parameter](#idp5562576)

1.5. [Setting the `clients_db_table` parameter](#idp5567504)

1.6. [Setting the `vendors_hash_size` parameter](#idp5572512)

1.7. [Setting the `rates_db_url` parameter](#idp5577328)

1.8. [Setting the `rates_db_table` parameter](#idp5582336)

1.9. [`get_client_price` usage](#idp5597280)

1.10. [`get_vendor_price` usage](#idp5610272)

1.11. [`cost_based_filtering` usage](#idp5623664)

1.12. [`cost_based_ordering` usage](#idp5637200)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The _rate\_cacher_ module provides a means of caching and real-time querying of the ratesheets assigned to your clients and / or vendors. It also allows for real-time cost-based routing and cost-based filtering.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules._.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`vendors_db_url` (str)

The DB URL for querying the Vendors used by the module

_Default value is “NULL”._

**Example�1.1.�Setting the `vendors_db_url` parameter**

...
modparam("rate\_cacher", "vendors\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
...

  

### 1.3.2.�`vendors_db_table` (str)

The DB Table for querying the Vendors used by the module

_Default value is “rc\_vendors”._

**Example�1.2.�Setting the `vendors_db_table` parameter**

...
modparam("rate\_cacher", "vendors\_db\_table", "my\_vendors\_view")
...

  

### 1.3.3.�`vendors_hash_size` (int)

The size of the hash table internally used to keep the vendors. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

_Default value is “256”._

**Example�1.3.�Setting the `vendors_hash_size` parameter**

...
modparam("rate\_cacher", "vendors\_hash\_size", 1024)
...

  

### 1.3.4.�`clients_db_url` (str)

The DB URL for querying the Clients used by the module

_Default value is “NULL”._

**Example�1.4.�Setting the `clients_db_url` parameter**

...
modparam("rate\_cacher", "clients\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
...

  

### 1.3.5.�`clients_db_table` (str)

The DB Table for querying the Clients used by the module

_Default value is “rc\_clients”._

**Example�1.5.�Setting the `clients_db_table` parameter**

...
modparam("rate\_cacher", "clients\_db\_table", "my\_clients\_view")
...

  

### 1.3.6.�`clients_hash_size` (int)

The size of the hash table internally used to keep the clients. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

_Default value is “256”._

**Example�1.6.�Setting the `vendors_hash_size` parameter**

...
modparam("rate\_cacher", "clients\_hash\_size", 1024)
...

  

### 1.3.7.�`rates_db_url` (str)

The DB URL for querying the Ratesheets used by the module

_Default value is “NULL”._

**Example�1.7.�Setting the `rates_db_url` parameter**

...
modparam("rate\_cacher", "rates\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
...

  

### 1.3.8.�`rates_db_table` (str)

The DB Table for querying the Ratesheets used by the module

_Default value is “rc\_ratesheets”._

**Example�1.8.�Setting the `rates_db_table` parameter**

...
modparam("rate\_cacher", "rates\_db\_table", "my\_clients\_view")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `get_client_price(client_id,is_wholesale,dialled_no,prefix_pvar,destination_pvar,price_pvar,minimum_pvar,increment_pvar)`

For a call originating from the provided Client ID, on a wholesale or retail quality, going to dialled\_no, the function will matched the dialled number against the client's ratesheet and return the matched prefix, destination, price, minimum and increment.

The _client\_id_ pseudo-var will hold the client\_id originating this call

The _is\_wholesale_ pseudo-var will contain either a 1 or a 0, depending on whether the call is wholesale or retail ( see client ratesheet provisioning ).

The _dialled\_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +

The _prefix_ pseudo-var will contain the matched prefix from the client's ratesheet

The _destination_ pseudo-var will contain the matched destination from the client's ratesheet

The _price_ pseudo-var will contain the matched price from the client's ratesheet

The _minimum_ pseudo-var will contain the matched minimum from the client's ratesheet

The _increment_ pseudo-var will contain the matched increment from the client's ratesheet

Possible parameter types

*   _ALL Parameters_ - String/Integer or pseudo-variables
    

This function can be used from any route.

**Example�1.9.�`get_client_price` usage**

...
if (get\_client\_price("my\_client",1,"4072794242",$var(prefix),$var(dest),$var(price),$var(min),$var(inc))) {
                        xlog("We matched $var(prefix) , $var(dest) , $var(price) , $var(min) , $var(inc) for the client's ratesheet\\n");
                }

...

  

### 1.4.2.� `get_vendor_price(vendor_id,dialled_no,prefix_pvar,destination_pvar,price_pvar,minimum_pvar,increment_pvar)`

For a call originating going to the provided vendor ID, going to dialled\_no, the function will matched the dialled number against the vendor's ratesheet and return the matched prefix, destination, price, minimum and increment.

The _vendor\_id_ pseudo-var will hold the vendor\_id

The _dialled\_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +

The _prefix_ pseudo-var will contain the matched prefix from the vendor's ratesheet

The _destination_ pseudo-var will contain the matched destination from the vendor's ratesheet

The _price_ pseudo-var will contain the matched price from the vendor's ratesheet

The _minimum_ pseudo-var will contain the matched minimum from the vendor's ratesheet

The _increment_ pseudo-var will contain the matched increment from the vendor's ratesheet

Possible parameter types

*   _ALL Parameters_ - String/Integer or pseudo-variables
    

This function can be used from any route.

**Example�1.10.�`get_vendor_price` usage**

...
if (get\_vendor\_price("my\_vendor","4072794242",$var(prefix),$var(dest),$var(price),$var(min),$var(inc))) {
                        xlog("We matched $var(prefix) , $var(dest) , $var(price) , $var(min) , $var(inc) for the vendor's ratesheet\\n");
                }

...

  

### 1.4.3.� `cost_based_filtering(client_id,is_wholesale,vendors_csv,dialled_no,desired_margin,out_vendor_csv)`

For a call originating from the provided Client ID, on a wholesale or retail quality, going to dialled\_no, the function removes the Vendors ( from the vendor\_csv list ) which do not pass the desired\_margin condition, and sets the out\_vendor\_csv variable to the list of Vendor that meet the margin condition, while maintaining the initial order provided in the vendor\_csv variable.

The _client\_id_ pseudo-var will hold the client\_id originating this call

The _is\_wholesale_ pseudo-var will contain either a 1 or a 0, depending on whether the call is wholesale or retail ( see client ratesheet provisioning ).

The _vendors\_csv_ pseudo-var contains a list of Vendors that need to be filtered based on the desired margin ( keep just those that match your desired percentage margin for this call )

The _dialled\_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +

The _desired\_margin_ pseudo-var contains the minimum Integer margin that the script writer wants to achieve, based on the Client sell and Vendor buy prices. The formula used is : vendor\_margin=(client\_price - results\[i\])\*100/client\_price) . If the vendor\_margin is higher than the desired\_margin, then the Vendor is ok to use. The desired margin can be positive ( call will be profitable ) or negative ( the call will cause a loss ).

The _out\_vendors\_csv_ pseudo-var is an output parameter, and the pvar will get populated with the CSV list of Vendors that meet the desired margin condition

Possible parameter types

*   _ALL Parameters_ - String/Integer or pseudo-variables
    

This function can be used from a REQUEST or FAILURE route.

**Example�1.11.�`cost_based_filtering` usage**

...


# If we get a call from testClient on it's wholesale quality,
# going to number 40720018124, and we have to pick from the list 
# of vendors 'testVendor,testVendor2' based on a a profit margin 
# of 0 ( we do not want to lose money on this call ),
# then $avp(out\_vendor\_csv) will have the vendors that we need 
# to use based on the above call characteristics, the order of the
# vendors that was provided in $avp(carrierlist) and the desired margin
$avp(client\_id)="testClient";
$avp(is\_ws)=1;  
$avp(carrierlist)="testVendor,testVendor2";
$avp(dnis)="40720018124";
$avp(profit\_margin)=0;

if (cost\_based\_filtering("$avp(client\_id)","$avp(is\_ws)","$avp(carrierlist)","$avp(dnis)","$avp(profit\_margin)","$avp(out\_vendor\_result)")) {
	xlog("XXX - Out of the $avp(carrierlist) carriers, we should only use $avp(out\_vendor\_result) \\n");
...

  

### 1.4.4.� `cost_based_ordering(client_id,is_wholesale,vendors_csv,dialled_no,desired_margin,out_vendor_csv)`

For a call originating from the provided Client ID, on a wholesale or retail quality, going to dialled\_no, the function removes the Vendors ( from the vendor\_csv list ) which do not pass the desired\_margin condition, and sets th out\_vendor\_csv variable to the list of Vendor that meet the margin condition, in descending order of their margin ( from most profitable Vendor to least profitable Vendor that still meets the margin condition )

The _client\_id_ pseudo-var will hold the client\_id originating this call

The _is\_wholesale_ pseudo-var will contain either a 1 or a 0, depending on whether the call is wholesale or retail ( see client ratesheet provisioning ).

The _vendors\_csv_ pseudo-var contains a list of Vendors that need to be filtered based on the desired margin ( keep just those that match your desired percentage margin for this call )

The _dialled\_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +

The _desired\_margin_ pseudo-var contains the minimum Integer margin that the script writer wants to achieve, based on the Client sell and Vendor buy prices. The formula used is : vendor\_margin=(client\_price - results\[i\])\*100/client\_price) . If the vendor\_margin is higher than the desired\_margin, then the Vendor is ok to use. The desired margin can be positive ( call will be profitable ) or negative ( the call will cause a loss ).

The _out\_vendors\_csv_ pseudo-var is an output parameter, and the pvar will get populated with the CSV list of Vendors that meet the desired margin condition

Possible parameter types

*   _ALL Parameters_ - String/Integer or pseudo-variables
    

This function can be used from any route.

**Example�1.12.�`cost_based_ordering` usage**

...
# If we get a call from testClient on it's wholesale quality,
# going to number 40720018124, and we have to pick from the list 
# of vendors 'testVendor,testVendor2' based on a a profit margin 
# of 0 ( we do not want to lose money on this call ),
# then $avp(out\_vendor\_csv) will have the vendors that we need 
# to use based on the above call characteristics, and the desired margin
# The order in $avp(carrierlist) does not matter, the vendors will be
# ordered from most profitable to least profitable
$avp(client\_id)="testClient";
$avp(is\_ws)=1;  
$avp(carrierlist)="testVendor,testVendor2";
$avp(dnis)="40720018124";
$avp(profit\_margin)=0;

if (cost\_based\_ordering("$avp(client\_id)","$avp(is\_ws)","$avp(carrierlist)","$avp(dnis)","$avp(profit\_margin)","$avp(out\_vendor\_result)")) {
	xlog("XXX - Out of the $avp(carrierlist) carriers, we should only use $avp(out\_vendor\_result) , in the provided order\\n");

...

  

## 1.5.�Exported MI Functions

### 1.5.1.� `rc_addVendor`

Adds a new Vendor, without assigning any ratesheet to it.

Name: _rc\_addVendor_

Parameters :

*   _vendorName_ - name of the Vendor to be added
    

MI FIFO Command Format:

\## Add a new Vendor
# opensips-cli -x mi rc\_addVendor myNewVendor
		

### 1.5.2.� `rc_deleteVendor`

Removes a vendor from memory, along with the ratesheet asigned with it ( if any )

Name: _rc\_deleteVendor_

Parameters :

*   _vendorName_ - name of the Vendor to be deleted
    

MI FIFO Command Format:

\## Delete a Vendor
# opensipss-cli -x mi rc\_deleteVendor myNewVendor
		

### 1.5.3.� `rc_reloadVendorRate`

Reloads the provided ratesheet and assigns it to the Vendor

Name: _rc\_reloadVendorRate_

Parameters :

*   _vendorName_ - name of the Vendor
    
*   _ratesheet\_id_ - ID of the ratesheet to be reloaded and assigned
    

MI FIFO Command Format:

\## Reloads a Vendor Ratesheet
# opensips-cli -x mi rc\_reloadVendorRate myVendor 3
		

### 1.5.4.� `rc_deleteVendorRate`

Deletes the assigned ratesheet from the Vendor

Name: _rc\_deleteVendorRate_

Parameters :

*   _vendorName_ - name of the Vendor
    

MI FIFO Command Format:

\## Reloads a Vendor Ratesheet
# opensips-cli -x mi rc\_deleteVendorRate myVendor
		

### 1.5.5.� `rc_getVendorPrice`

Fetches all the ratesheet information ( destination name, price, minimum, increment ) for the provided Vendor and dialled number

Name: _rc\_getVendorPrice_

Parameters :

*   _vendorName_ - name of the Vendor
    
*   _dialledNumber_ - number to match in the above Vendor's ratesheet
    

MI FIFO Command Format:

\## Query for the price of myVendor for the 4072731825 number
#/usr/local/bin/opensips-cli -x mi rc\_getVendorPrice myVendor 4072731825
{
    "prefix": "40727",
    "destination": "ROMANIA MOBILE VODAFONE",
    "price": 0.05,
    "minimum": 1,
    "increment": 1,
    "currency": "USD"
}
		

### 1.5.6.� `rc_addClient`

Adds a new Client, without assigning any ratesheet to it.

Name: _rc\_addClient_

Parameters :

*   _clientName_ - name of the Client to be added
    

MI FIFO Command Format:

\## Add a new Client
# opensips-cli -x mi fifo rc\_addClient myNewClient
		

### 1.5.7.� `rc_deleteClient`

Removes a Client from memory, along with the ratesheet asigned with it ( if any )

Name: _rc\_deleteClient_

Parameters :

*   _clientName_ - name of the Client to be deleted
    

MI FIFO Command Format:

\## Delete a Client
# opensips-cli -x mi rc\_deleteClient myClient
		

### 1.5.8.� `rc_reloadClientRate`

Reloads the provided ratesheet and assigns it to the Client

Name: _rc\_reloadClientRate_

Parameters :

*   _clientName_ - name of the Cient
    
*   _isWholesale_ - is the ratesheet assigned on the wholesale or retail quality
    
*   _ratesheet\_id_ - ID of the ratesheet to be reloaded and assigned
    

MI FIFO Command Format:

\## Reloads the Client's wholesale Ratesheet, assigning it rate id 3
# opensips-cli -x mi rc\_reloadClientRate myClient 1 3
		

### 1.5.9.� `rc_deleteClientRate`

Deletes the assigned ratesheet from the Client

Name: _rc\_deleteClientRate_

Parameters :

*   _ClientName_ - name of the Client
    
*   _isWholesale_ - delete the wholesale or retail ratesheet
    

MI FIFO Command Format:

\## Reloads a Vendor Ratesheet
# opensips-cli -x mi rc\_deleteVendorRate myVendor
		

### 1.5.10.� `rc_getClientPrice`

Fetches all the ratesheet information ( destination name, price, minimum, increment ) for the provided Client, on the specified quality ( wholesale vs retail ) and dialled number

Name: _rc\_getClientPrice_

Parameters :

*   _ClientName_ - name of the Client
    
*   _isWholesale_ - wholesale = 1, retail = 0
    
*   _dialledNumber_ - number to match in the above Client's ratesheet
    

MI FIFO Command Format:

\## Query for the price of myClient, on the retail quality, for the 4072731825 number
#/usr/local/bin/opensips-cli -x mi rc\_getClientPrice myClient 0 4072731825
{
    "prefix": "40727",
    "destination": "ROMANIA MOBILE VODAFONE",
    "price": 0.03,
    "minimum": 1,
    "increment": 1,
    "currency": "USD"
}

		

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

31

3

3167

1

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

18

19

3.

Callum

4

2

3

3

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

3

1

6

4

5.

Artiom Druz

2

1

1

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Feb 2023

2.

Callum

Nov 2022 - Nov 2022

3.

Artiom Druz

Jul 2021 - Jul 2021

4.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Mar 2020 - Jul 2020

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jul 2020 - Jul 2020

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Callum, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).