# rate_cacher Module Reference
<!-- generated-from: data/3.5/modules/rate_cacher.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 rate_cacher module. Read this file when configuring or debugging the rate_cacher module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The _rate\_cacher_ module provides a means of caching and real-time querying of the ratesheets assigned to your clients and / or vendors. It also allows for real-time cost-based routing and cost-based filtering.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `clients_db_table` (string)

The DB Table for querying the Clients used by the module

*Default value is rc_clients.*

**Example.** my_clients_view.

```opensips
modparam("rate\_cacher", "clients\_db\_table", "my\_clients\_view")
```
### `clients_db_url` (string)

The DB URL for querying the Clients used by the module

*Default value is NULL.*

**Example.** mysql://opensips:opensipsrw@localhost/opensips.

```opensips
modparam("rate\_cacher", "clients\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
```
### `clients_hash_size` (integer)

The size of the hash table internally used to keep the clients. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

*Default value is 256.*

**Notes:** The hash size must be a power of 2 number.

**Example.** 1024.

```opensips
modparam("rate\_cacher", "clients\_hash\_size", 1024)
```
### `rates_db_table` (string)

The DB Table for querying the Ratesheets used by the module

*Default value is rc_ratesheets.*

**Example.** my_clients_view.

```opensips
modparam("rate\_cacher", "rates\_db\_table", "my\_clients\_view")
```
### `rates_db_url` (string)

The DB URL for querying the Ratesheets used by the module

*Default value is NULL.*

**Example.** mysql://opensips:opensipsrw@localhost/opensips.

```opensips
modparam("rate\_cacher", "rates\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
```
### `vendors_db_table` (string)

The DB Table for querying the Vendors used by the module

*Default value is rc_vendors.*

**Example.** my_vendors_view.

```opensips
modparam("rate\_cacher", "vendors\_db\_table", "my\_vendors\_view")
```
### `vendors_db_url` (string)

The DB URL for querying the Vendors used by the module

*Default value is NULL.*

**Example.** mysql://opensips:opensipsrw@localhost/opensips.

```opensips
modparam("rate\_cacher", "vendors\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
```
### `vendors_hash_size` (integer)

The size of the hash table internally used to keep the vendors. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

*Default value is 256.*

**Notes:** The hash size must be a power of 2 number.

**Example.** 1024.

```opensips
modparam("rate\_cacher", "vendors\_hash\_size", 1024)
```

## Exported Functions

### `cost_based_filtering(client_id,is_wholesale,vendors_csv,dialled_no,desired_margin,out_vendor_csv)`

For a call originating from the provided Client ID, on a wholesale or retail quality, going to dialled_no, the function removes the Vendors ( from the vendor_csv list ) which do not pass the desired_margin condition, and sets the out_vendor_csv variable to the list of Vendor that meet the margin condition, while maintaining the initial order provided in the vendor_csv variable.

**Parameters:**

- `client_id` *(string/integer/pvar, required)* — The _client_id_ pseudo-var will hold the client_id originating this call
- `desired_margin` *(string/integer/pvar, required)* — The _desired_margin_ pseudo-var contains the minimum Integer margin that the script writer wants to achieve, based on the Client sell and Vendor buy prices. The formula used is : vendor_margin=(client_price - results[i])*100/client_price) . If the vendor_margin is higher than the desired_margin, then the Vendor is ok to use. The desired margin can be positive ( call will be profitable ) or negative ( the call will cause a loss ).
- `dialled_no` *(string/integer/pvar, required)* — The _dialled_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +
- `is_wholesale` *(string/integer/pvar, required)* — The _is_wholesale_ pseudo-var will contain either a 1 or a 0, depending on whether the call is wholesale or retail ( see client ratesheet provisioning ).
  - `1`
  - `0`
- `out_vendor_csv` *(pvar, required)* — The _out_vendors_csv_ pseudo-var is an output parameter, and the pvar will get populated with the CSV list of Vendors that meet the desired margin condition
- `vendors_csv` *(string/integer/pvar, required)* — The _vendors_csv_ pseudo-var contains a list of Vendors that need to be filtered based on the desired margin ( keep just those that match your desired percentage margin for this call )

**Return codes:**

- `true` — on success
- `false` — on failure

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** cost_based_filtering usage.

```opensips
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
```

### `cost_based_ordering(client_id,is_wholesale,vendors_csv,dialled_no,desired_margin,out_vendor_csv)`

For a call originating from the provided Client ID, on a wholesale or retail quality, going to dialled_no, the function removes the Vendors ( from the vendor_csv list ) which do not pass the desired_margin condition, and sets th out_vendor_csv variable to the list of Vendor that meet the margin condition, in descending order of their margin ( from most profitable Vendor to least profitable Vendor that still meets the margin condition )

**Parameters:**

- `client_id` *(string/integer/pvar, required)* — The _client_id_ pseudo-var will hold the client_id originating this call
- `desired_margin` *(string/integer/pvar, required)* — The _desired_margin_ pseudo-var contains the minimum Integer margin that the script writer wants to achieve, based on the Client sell and Vendor buy prices. The formula used is : vendor_margin=(client_price - results[i])*100/client_price) . If the vendor_margin is higher than the desired_margin, then the Vendor is ok to use. The desired margin can be positive ( call will be profitable ) or negative ( the call will cause a loss ).
- `dialled_no` *(string/integer/pvar, required)* — The _dialled_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +
- `is_wholesale` *(string/integer/pvar, required)* — The _is_wholesale_ pseudo-var will contain either a 1 or a 0, depending on whether the call is wholesale or retail ( see client ratesheet provisioning ).
  - `1`
  - `0`
- `out_vendor_csv` *(pvar, required)* — The _out_vendors_csv_ pseudo-var is an output parameter, and the pvar will get populated with the CSV list of Vendors that meet the desired margin condition
- `vendors_csv` *(string/integer/pvar, required)* — The _vendors_csv_ pseudo-var contains a list of Vendors that need to be filtered based on the desired margin ( keep just those that match your desired percentage margin for this call )

**Return codes:**

- `true` — on success
- `false` — on failure

**Usable from:** ANY_ROUTE

**Example.** cost_based_ordering usage.

```opensips
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
```

### `get_client_price(client_id,is_wholesale,dialled_no,prefix_pvar,destination_pvar,price_pvar,minimum_pvar,increment_pvar)`

For a call originating from the provided Client ID, on a wholesale or retail quality, going to dialled_no, the function will matched the dialled number against the client's ratesheet and return the matched prefix, destination, price, minimum and increment.

**Parameters:**

- `client_id` *(string/integer/pvar, required)* — The _client_id_ pseudo-var will hold the client_id originating this call
- `destination_pvar` *(pvar, required)* — The _destination_ pseudo-var will contain the matched destination from the client's ratesheet
- `dialled_no` *(string/integer/pvar, required)* — The _dialled_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +
- `increment_pvar` *(pvar, required)* — The _increment_ pseudo-var will contain the matched increment from the client's ratesheet
- `is_wholesale` *(string/integer/pvar, required)* — The _is_wholesale_ pseudo-var will contain either a 1 or a 0, depending on whether the call is wholesale or retail ( see client ratesheet provisioning ).
  - `1`
  - `0`
- `minimum_pvar` *(pvar, required)* — The _minimum_ pseudo-var will contain the matched minimum from the client's ratesheet
- `prefix_pvar` *(pvar, required)* — The _prefix_ pseudo-var will contain the matched prefix from the client's ratesheet
- `price_pvar` *(pvar, required)* — The _price_ pseudo-var will contain the matched price from the client's ratesheet

**Return codes:**

- `true` — on success
- `false` — on failure

**Usable from:** ANY_ROUTE

**Example.** get_client_price usage.

```opensips
...
if (get\_client\_price("my\_client",1,"4072794242",$var(prefix),$var(dest),$var(price),$var(min),$var(inc))) {
                        xlog("We matched $var(prefix) , $var(dest) , $var(price) , $var(min) , $var(inc) for the client's ratesheet\\n");
                }

...
```

### `get_vendor_price(vendor_id,dialled_no,prefix_pvar,destination_pvar,price_pvar,minimum_pvar,increment_pvar)`

For a call originating going to the provided vendor ID, going to dialled_no, the function will matched the dialled number against the vendor's ratesheet and return the matched prefix, destination, price, minimum and increment.

**Parameters:**

- `destination_pvar` *(pvar, required)* — The _destination_ pseudo-var will contain the matched destination from the vendor's ratesheet
- `dialled_no` *(string/integer/pvar, required)* — The _dialled_no_ pseudo-var contains the DNIS - the dialled number for the current call. It needs to be in E164 format, without the leading +
- `increment_pvar` *(pvar, required)* — The _increment_ pseudo-var will contain the matched increment from the vendor's ratesheet
- `minimum_pvar` *(pvar, required)* — The _minimum_ pseudo-var will contain the matched minimum from the vendor's ratesheet
- `prefix_pvar` *(pvar, required)* — The _prefix_ pseudo-var will contain the matched prefix from the vendor's ratesheet
- `price_pvar` *(pvar, required)* — The _price_ pseudo-var will contain the matched price from the vendor's ratesheet
- `vendor_id` *(string/integer/pvar, required)* — The _vendor_id_ pseudo-var will hold the vendor_id

**Return codes:**

- `true` — on success
- `false` — on failure

**Usable from:** ANY_ROUTE

**Example.** get_vendor_price usage.

```opensips
...
if (get\_vendor\_price("my\_vendor","4072794242",$var(prefix),$var(dest),$var(price),$var(min),$var(inc))) {
                        xlog("We matched $var(prefix) , $var(dest) , $var(price) , $var(min) , $var(inc) for the vendor's ratesheet\\n");
                }

...
```

## Exported MI Functions

### `rc_addClient`

Adds a new Client, without assigning any ratesheet to it.

**Parameters:**

- `clientName` *(string, required)* — name of the Client to be added

**Example.** Add a new Client

```opensips-cli
# opensips-cli -x mi fifo rc_addClient myNewClient
```

### `rc_addVendor`

Adds a new Vendor, without assigning any ratesheet to it.

**Parameters:**

- `vendorName` *(string, required)* — name of the Vendor to be added

**Example.** Add a new Vendor

```opensips-cli
# opensips-cli -x mi rc_addVendor myNewVendor
```

### `rc_deleteClient`

Removes a Client from memory, along with the ratesheet asigned with it ( if any )

**Parameters:**

- `clientName` *(string, required)* — name of the Client to be deleted

**Example.** Delete a Client

```opensips-cli
# opensips-cli -x mi rc_deleteClient myClient
```

### `rc_deleteClientRate`

Deletes the assigned ratesheet from the Client

**Parameters:**

- `ClientName` *(string, required)* — name of the Client
- `isWholesale` *(integer, required)* — delete the wholesale or retail ratesheet

**Example.** Reloads a Vendor Ratesheet

```opensips-cli
# opensips-cli -x mi rc_deleteVendorRate myVendor
```

### `rc_deleteVendor`

Removes a vendor from memory, along with the ratesheet asigned with it ( if any )

**Parameters:**

- `vendorName` *(string, required)* — name of the Vendor to be deleted

**Example.** Delete a Vendor

```opensips-cli
# opensipss-cli -x mi rc_deleteVendor myNewVendor
```

### `rc_deleteVendorRate`

Deletes the assigned ratesheet from the Vendor

**Parameters:**

- `vendorName` *(string, required)* — name of the Vendor

**Example.** Reloads a Vendor Ratesheet

```opensips-cli
# opensips-cli -x mi rc_deleteVendorRate myVendor
```

### `rc_getClientPrice`

Fetches all the ratesheet information ( destination name, price, minimum, increment ) for the provided Client, on the specified quality ( wholesale vs retail ) and dialled number

**Parameters:**

- `ClientName` *(string, required)* — name of the Client
- `dialledNumber` *(string, required)* — number to match in the above Client's ratesheet
- `isWholesale` *(integer, required)* — wholesale = 1, retail = 0

**Returns:** Ratesheet information ( destination name, price, minimum, increment ) (structured response — see schema)

**Example.** Query for the price of myClient, on the retail quality, for the 4072731825 number

```opensips-cli
#/usr/local/bin/opensips-cli -x mi rc_getClientPrice myClient 0 4072731825
{
    "prefix": "40727",
    "destination": "ROMANIA MOBILE VODAFONE",
    "price": 0.03,
    "minimum": 1,
    "increment": 1,
    "currency": "USD"
}
```

### `rc_getVendorPrice`

Fetches all the ratesheet information ( destination name, price, minimum, increment ) for the provided Vendor and dialled number

**Parameters:**

- `dialledNumber` *(string, required)* — number to match in the above Vendor's ratesheet
- `vendorName` *(string, required)* — name of the Vendor

**Returns:** Ratesheet information ( destination name, price, minimum, increment ) (structured response — see schema)

**Example.** Query for the price of myVendor for the 4072731825 number

```opensips-cli
#/usr/local/bin/opensips-cli -x mi rc_getVendorPrice myVendor 4072731825
{
    "prefix": "40727",
    "destination": "ROMANIA MOBILE VODAFONE",
    "price": 0.05,
    "minimum": 1,
    "increment": 1,
    "currency": "USD"
}
```

### `rc_reloadClientRate`

Reloads the provided ratesheet and assigns it to the Client

**Parameters:**

- `clientName` *(string, required)* — name of the Cient
- `isWholesale` *(integer, required)* — is the ratesheet assigned on the wholesale or retail quality
- `ratesheet_id` *(integer, required)* — ID of the ratesheet to be reloaded and assigned

**Example.** Reloads the Client's wholesale Ratesheet, assigning it rate id 3

```opensips-cli
# opensips-cli -x mi rc_reloadClientRate myClient 1 3
```

### `rc_reloadVendorRate`

Reloads the provided ratesheet and assigns it to the Vendor

**Parameters:**

- `ratesheet_id` *(integer, required)* — ID of the ratesheet to be reloaded and assigned
- `vendorName` *(string, required)* — name of the Vendor

**Example.** Reloads a Vendor Ratesheet

```opensips-cli
# opensips-cli -x mi rc_reloadVendorRate myVendor 3
```

## Configuration Examples

### Setting the `vendors_db_url` parameter

```opensips
...
modparam("rate\_cacher", "vendors\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
...
```
### Setting the `vendors_db_table` parameter

```opensips
...
modparam("rate\_cacher", "vendors\_db\_table", "my\_vendors\_view")
...
```
### Setting the `vendors_hash_size` parameter

```opensips
...
modparam("rate\_cacher", "vendors\_hash\_size", 1024)
...
```
### Setting the `clients_db_url` parameter

```opensips
...
modparam("rate\_cacher", "clients\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
...
```
### Setting the `clients_db_table` parameter

```opensips
...
modparam("rate\_cacher", "clients\_db\_table", "my\_clients\_view")
...
```
### Setting the `vendors_hash_size` parameter

```opensips
...
modparam("rate\_cacher", "clients\_hash\_size", 1024)
...
```
### Setting the `rates_db_url` parameter

```opensips
...
modparam("rate\_cacher", "rates\_db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
...
```
### Setting the `rates_db_table` parameter

```opensips
...
modparam("rate\_cacher", "rates\_db\_table", "my\_clients\_view")
...
```
### `get_client_price` usage

```opensips
...
if (get\_client\_price("my\_client",1,"4072794242",$var(prefix),$var(dest),$var(price),$var(min),$var(inc))) {
                        xlog("We matched $var(prefix) , $var(dest) , $var(price) , $var(min) , $var(inc) for the client's ratesheet\\n");
                }

...
```
### `get_vendor_price` usage

```opensips
...
if (get\_vendor\_price("my\_vendor","4072794242",$var(prefix),$var(dest),$var(price),$var(min),$var(inc))) {
                        xlog("We matched $var(prefix) , $var(dest) , $var(price) , $var(min) , $var(inc) for the vendor's ratesheet\\n");
                }

...
```
### `cost_based_filtering` usage

```opensips
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
```
### `cost_based_ordering` usage

```opensips
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
```
