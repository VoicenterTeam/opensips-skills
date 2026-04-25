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