// ============================================================================
// Module      : permissions.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : WMS Lite
// Description : Application permissions request
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

jQuery.extend(

	application,
	{
		permissions: {

			request: (list) => {
				//console.log("IN application.permissions.request()");

				if (typeof list === "undefined") {
					list = [
						cordova.plugins.permissions.SEND_SMS,
						cordova.plugins.permissions.RECEIVE_SMS,
						cordova.plugins.permissions.READ_PHONE_STATE,
						cordova.plugins.permissions.READ_CONTACTS,
						cordova.plugins.permissions.WRITE_CONTACTS,
						cordova.plugins.permissions.CAMERA,
						cordova.plugins.permissions.FLASHLIGHT,
						cordova.plugins.permissions.READ_EXTERNAL_STORAGE,
						cordova.plugins.permissions.WRITE_EXTERNAL_STORAGE,
						cordova.plugins.permissions.ACCESS_NETWORK_STATE,
						cordova.plugins.permissions.ACCESS_COARSE_LOCATION,
						cordova.plugins.permissions.ACCESS_FINE_LOCATION,
						cordova.plugins.permissions.ACCESS_MOCK_LOCATION
					];
				};

				return new Promise(
					(resolve, reject) => {
						cordova.plugins.permissions.requestPermissions(
							list,
							(() => { resolve(); }),
							(() => { reject (); })
						);
					}
				);

			}
		}

	}

);


// End of file: permissions.js
// ============================================================================