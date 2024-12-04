// ============================================================================
// Module      : vcard.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : VCard as text string handling library
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 11-Feb-23 00:00 WIT   Denis  Deployment V. 2023 "LEO MALET"
//
// ============================================================================

function is_vcard(vcf_text)
{
	var result = false;
	if ((objType(vcf_text) === "string") && (strlen(vcf_text) > 0)) {
		vcf_text = trim(vcf_text);
		if (strlen(vcf_text) > 0) {
			if (str_match(vcf_text,"BEGIN:VCARD")) {
				result = true;
			}
		}
	}
	return result;
}


function vcardParseVariable (vcf_text, vcf_variable)
{
	//console.log(vcf_text);
	//console.log(vcf_variable);
	if (is_vcard(vcf_text)) {
		var lines = breakApart(vcf_text,"\n");
		for (var i = 0; i < lines.length; i++) {

			if (strmatch(lines[i],vcf_variable)) {
				var st = lines[i];
				var result = st.slice(st.indexOf(":") + 1);
				//console.log("result='" + result + "'");
				return result;
			}

		}
	}
	return null;
}


function vcardParse (vcf_text)
{
	//console.log(vcf_text);
	var result = [];
	if (is_vcard(vcf_text)) {
		var lines = breakApart(vcf_text,"\n");
		for (var i = 0; i < lines.length; i++) {
			
			var st    = lines[i];
			var key   = st.slice(0, st.indexOf(":"));
			var value = st.slice(st.indexOf(":") + 1);

			//console.log(key);
			//console.log(value);


			if ( ! ((str_match(key,"BEGIN")) || (str_match(key,"END")) || (str_match(key,"VERSION"))) ) {

				var shortkey = key, type = "", typestr = "";

				var p = key.indexOf(";");
				if (p > 0) {
					shortkey = key.slice(0, p);
					typestr  = key.slice(p + 1);
					type = (str_match(typestr, "TYPE=")) ? str_replace("TYPE=", "", typestr): typestr;
				}
				else {
					type = "OTHER";
				}

				result.push({ key:key, shortkey:shortkey, typestr:typestr, type:type, value:value });
			}

		}
	}
	return result;
}


function vcardToHtml (vcf_text)
{
	var rec = vcardParse (vcf_text);
	if (rec.length > 0) {

		var div = '<div class="tablewrap">'
						+ '  <table class="table" style="width:auto;">'
						+ '    <tbody>'
						+ '    [rows]'
						+ '    </tbody>'
						+ '  </table>'
						+ '</div>';

		var tr  = '<tr>'
						+ '  <td>[key]&nbsp;[type]&nbsp;</td>'
						+ '  <td>&nbsp;:&nbsp;</td>'
						+ '  <td>&nbsp;[value]</td>'
						+ '</tr>';

		var rows = "";

		for (var i = 0; i < rec.length; i++) {
			
			var html = tr; 
			html = str_replace("[key]",   rec[i]["key"],   html);
			html = str_replace("[type]",  rec[i]["type"],  html);
			html = str_replace("[value]", rec[i]["value"], html);

			if (rows.length > 0) { rows += "\n"; }
			rows += html;
		}

		div = str_replace("[rows]", rows, div);
		return div;
	}

	return "";
}


// Save a vcard string to device contacts
//
function vcardSave (vcf_text)
{
	return new Promise(
		(resolve, reject) => {

			//console.info("IN vcardSave()");

			//console.log(navigator.contacts);
			//console.log(JSON.stringify(navigator.contacts));
			
			//console.log(vcf_text);

			if (typeof navigator.contacts !== "undefined") {

				var displayName = vcardParseVariable(vcf_text, "FN");
				//console.log(displayName);
				if (strlen(displayName) > 0) {

					var contact = navigator.contacts.create();
					contact.displayName = displayName;

					var organizationName = vcardParseVariable(vcf_text, "ORG");
					//console.log(organizationName);
					if (strlen(organizationName) > 0) {
						var organizations = [];
						var org = new ContactOrganization();
						org.name  = organizationName;
						org.title = vcardParseVariable(vcf_text, "TITLE");;
						organizations.push(org);
						contact.organizations = organizations;
					}

					var phoneNumbers = null, emailAddresses = null, urls = null, addresses = null;

					var rec = vcardParse (vcf_text);
					//console.log(JSON.stringify(rec));

					for (var i = 0; i < rec.length; i++) {

						var shortkey = rec[i]["shortkey"];
						switch(shortkey.toUpperCase()) {

							case "TEL": {
								var phone_no = rec[i]["value"];
								if (strlen(phone_no) > 0) {
									if (phoneNumbers === null) { phoneNumbers = []; }
									var type  = String(rec[i]["type"]); type = type.toUpperCase();
									phoneNumbers.push(new ContactField(type, phone_no, false));
								}
								break;
							}
							case "EMAIL": {
								var email = rec[i]["value"];
								if (strlen(email) > 0) {
									if (emailAddresses === null) { emailAddresses = []; }
									var type = String(rec[i]["type"]); type = type.toUpperCase();
									emailAddresses.push(new ContactField(type, email, false));
								}
								break;
							}
							case "URL": {
								var website = rec[i]["value"];
								if (strlen(website) > 0) {
									if (urls === null) { urls = []; }
									urls.push(new ContactField("other", website, false));
								}
								break;
							}
							case "ADR": {
								var address = rec[i]["value"];
								if (strlen(address) > 0) {
									if (addresses === null) { addresses = []; }
									address = str_replace(";", "\n", String(address));
									address = trim(address);
									address = str_replace("\n", ", ", address);
									var addr = new ContactAddress();
									addr.formatted = address;
									addresses.push(addr);
								}
								break;
							}
						}

					}

					if (phoneNumbers !== null) { contact.phoneNumbers = phoneNumbers; }
					if (emailAddresses !== null) { contact.emails = emailAddresses; }
					if (urls !== null) { contact.urls = urls; }
					if (addresses !== null) { contact.addresses = addresses; }

					//console.log(JSON.stringify(contact));

					contact.save(
						function() { 
							//console.log("Resolved by contact.save()");
							delay(1000).then(()=>{ resolve(); }).catch(()=>{});
							//resolve(); 
						},
						function() { 
							console.error("Rejected by contact.save()");
							delay(1000).then(()=>{ reject(); }).catch(()=>{});
							//reject (); 
						}
					);


				}
				else {
					console.error("VCard parse FN error");
					reject();
				}

			}
			else {
				reject();
			}

		}
	);

}


function vcardShare (vcf_text)
{
	return new Promise(
		(resolve, reject) => {
			//console.log("IN vcardShare()");
			//console.log(vcf_text);
			if (typeof window.plugins.socialsharing !== "undefined") {
				var name = vcardParseVariable(vcf_text, "FN");
				if (strlen(name) === 0) {
					name = vcardParseVariable(vcf_text, "N");
					name = str_replace(";", " ", name);
				}
				var src = "data:text/vcard;base64," + btoa(vcf_text);
				var options = (strlen(name) > 0) ? { subject:name, files:[src] } : { files:[src] };
				var onSuccess = function(result) {
					//console.log("IN vcardShare()->onSuccess()");
					//console.log(JSON.stringify(result));
					resolve();
				};
				var onError = function(msg) {
					//console.error("IN vcardShare()->onError()");
					//console.error(msg);
					reject();
				};
				window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
			}
			else {
				console.error("Plugin not installed");
				reject();
			}
		}
	);

}



// End of file: vcard.js
// ============================================================================