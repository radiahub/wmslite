// ============================================================================
// Module      : mycontacts.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : Device contacts support
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 31-Mar-2022 00:00 WIT   Denis  Deployment V. 2022 "ALEXANDRE DUMAS"
//
// ============================================================================

// ****************************************************************************
// ****************************************************************************
//
// Utils
// 
// ****************************************************************************
// ****************************************************************************

function formatRawContactObject (contactObj)
{
	var result = [];

	let displayName = contactObj.displayName;

	for(var j = 0; j < contactObj.phoneNumbers.length; j++) {
		let phone = contactObj.phoneNumbers[j];
		let phone_no = phone.value; 
		if (strlen(phone_no) > 6) {
			phone_no = msisdn.format(phone_no);
			result.push({ phone_no: phone_no, displayName: displayName });
		}
	}

	return result;
};

function sortContactList (listOfContacts) 
{
	if (typeof listOfContacts === "undefined") { listOfContacts = []; }
	var compare = (a, b) => { return strcasecmp (a.displayName, b.displayName); };
	listOfContacts.sort(compare);
};


// ****************************************************************************
// ****************************************************************************
//
// contacts implementation
// 
// ****************************************************************************
// ****************************************************************************

var contacts = {

	all : function()
	{
			return new Promise(
				(resolve, reject) => {

					console.info("IN contacts.all()");

					var options = new ContactFindOptions();
					options.multiple = true;
					options.hasPhoneNumber = true;

					navigator.contacts.find(

						[navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.phoneNumbers], 

						function (resolvedContacts) {

							console.log("Resolved by navigator.contacts.find()");

							var result = [];

							var indexOf = function(phone_no) {
								for (var i = 0; i < result.length; i++) {
									if (result[i]["phone_no"] === phone_no) {
										return i;
									}
								}
								return -1;
							};

							console.log('Processing ' + resolvedContacts.length + ' contacts');

							for (var i = 0; i < resolvedContacts.length; i++) {
								var list = formatRawContactObject(resolvedContacts[i]);
								for (var l = 0; l < list.length; l++) {
									var rec = list[l];
									if (indexOf(rec["phone_no"]) < 0) {
										result.push(rec);
									}
								}
							}

							resolve(result);
						},
						
						function (contactError) {
							console.error('Rejected by navigator.contacts.find()');
							console.error(JSON.stringify(contactError));
							reject();
						}, 

						options
					);

				}
			);
	},

	find: function(str)
		{
		return new Promise(
			(resolve, reject) => {

				console.info("IN contacts.find() str='" + str + "'");

				var options = new ContactFindOptions();
				options.filter   = str;
				options.multiple = true;
				options.hasPhoneNumber = true;

				navigator.contacts.find(

					[navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.phoneNumbers], 

					function (resolvedContacts) {

						console.log("Resolved by navigator.contacts.find()");

						var result = [];

						var indexOf = function(phone_no) {
							for (var i = 0; i < result.length; i++) {
								if (result[i]["phone_no"] === phone_no) {
									return i;
								}
							}
							return -1;
						};

						console.log('Retrieving ' + resolvedContacts.length + ' contacts');

						for (var i = 0; i < resolvedContacts.length; i++) {
							var list = formatRawContactObject(resolvedContacts[i]);
							for (var l = 0; l < list.length; l++) {
								var rec = list[l];
								if (indexOf(rec["phone_no"]) < 0) {
									result.push(rec);
								}
							}
						}

						resolve(result);
					},
					
					function (contactError) {
						console.error('Rejected by navigator.contacts.find()');
						console.error(JSON.stringify(contactError));
						reject();
					}, 

					options
				);

			}
		);
	},

	pick : function()
	{
		return new Promise(
			(resolve, reject) => {

				console.info("IN contacts.pick()");

				navigator.contacts.pickContact(
					function(contact){

						console.log(JSON.stringify(contact));

						if (contact.phoneNumbers.length > 0) {

							var phone_no = "";
							
							for (var i = 0; i < contact.phoneNumbers.length; i++) {
								if (contact.phoneNumbers[i]["type"] === "mobile") {
									phone_no = contact.phoneNumbers[i]["value"];
									break;
								}
							}
							
							if (strlen(phone_no) === 0) {
								for (var i = 0; i < contact.phoneNumbers.length; i++) {
									if (contact.phoneNumbers[i]["pref"] === true) {
										phone_no = contact.phoneNumbers[i]["value"];
										break;
									}
								}
							}

							if (strlen(phone_no) === 0) {
								phone_no = contact.phoneNumbers[0]["value"];
							}

							phone_no = msisdn.format(phone_no);

							var res = { displayName: contact.displayName, phone_no: phone_no };
							console.log(JSON.stringify(res));
							resolve(res);								
						}
						else {
							console.warn("navigator.contacts.pickContact() returned phone_no null or emyty");
							resolve(null);
						}
					},
					function(err){
						console.error("Rejected by navigator.contacts.pickContact()");
						console.error('Error: ' + err);
						reject();
					}
				);

			}
		);
	},

	on_radiahub : function(deviceContacts)
	{
		return new Promise(
			(resolve, reject) => {
				console.info("IN contacts.on_radiahub()");

				var getDbContacts = function(listOfContacts) {
					console.info("IN contacts.on_radiahub()->getDbContacts()");
					var url = application.scriptURL("dbcontacts.php", true) + "?r=" + Math.random();
					console.log(url);
					var row = { contactData: payload_encode(listOfContacts) };
					connect.post(row, url)
					.then ((data)=>{
						console.log("Resolved by connect.post(row,url)");
						if (is_json(data)) { data = JSON.parse(data); }
						console.log(JSON.stringify(data));	
						if ((data !== null) && (parseInt("" + data.errno) === 1000)) {
							var result = payload_decode(data.result);
							console.log(JSON.stringify(result));
							resolve(result);
						}
						else {
							console.error("Runtime error on data='" + JSON.stringify(data) + "'");
							reject();
						}
					})
					.catch(()=>{
						console.error("Rejected by C.post(row,url)");
						reject();
					});
				};

				if ((typeof deviceContacts === "undefined") || (deviceContacts === null)) {
					getDbContacts(deviceContacts);
				}
				else {
					contacts.all()
					.then ((deviceContacts)=>{
						console.log("Resolved by contacts.all() length=" + deviceContacts.length);
						getDbContacts(deviceContacts);
					})
					.catch(()=>{
						console.error("Rejected by contacts.all()");
						reject();
					});	
				}

			}
		);
	},

	watch : {

		collection: [], timeout: 5000, timer: null, watching: false, scope: "all",

		execute : function()
		{
			console.info("IN contacts.watch.execute()");
			
			var go_on = function() {
				if (contacts.watch.watching) {
					contacts.watch.timer = delay(timeout, contacts.watch.execute);
				}
			};

			contacts.all()
			.then ((deviceContacts)=>{
				switch(console.watch.scope) {
					case "all": {
						contacts.watch.collection = deviceContacts;
						go_on();
						break;
					}
					case "on_radiahub": {
						contacts.on_radiahub(deviceContacts)
						.then ((radiahubContacts)=>{
							console.log("Resolved by contacts.on_radiahub()");
							contacts.watch.collection = [];
							for (var i = 0; i < radiahubContacts.length; i++) {
								contacts.watch.collection.push({
									phone_no    : radiahubContacts[i]["phone_no"], 
									displayName : radiahubContacts[i]["displayName"] 
								});
							}
							go_on();
						})
						.catch(()=>{
							console.warn("Rejected by contacts.on_radiahub()");
							go_on();
						});
						break;
					}
					default: {
						console.error("Unresolved contacts.watch.scope");
						break;
					}
				}
			})
			.catch(()=>{
				console.warn("Rejected by contacts.all()");
			});
		},

		// scope: one of "all", "on_radiahub" string values
		//
		start : function(scope)
		{
			if (strlen(scope) === 0) { scope = "all"; }
			console.info("IN contacts.watch.start() scope='" + scope + "'");
			console.watch.scope = scope;
			contacts.watch.watching = true;
			contacts.watch.execute();
		},

		stop : function()
		{
			console.info("IN contacts.watch.stop()");
			contacts.watch.watching = false;
			clearTimeout(contacts.watch.timer);
			contacts.watch.timer = null;
		}
	}

};




// End of file: mycontacts.js
// ============================================================================