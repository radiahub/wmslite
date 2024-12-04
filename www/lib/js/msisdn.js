var msisdn = {

	format : function(phone_no)
	{
		var phonecode = ST_PHONE_CTRY_CODE;

		if ((phone_no.indexOf("*") >= 0) ||
				(phone_no.indexOf("#") >= 0) ||
				(phone_no.length < 6)) {
			return phone_no;
		}

		phone_no = str_replace(" ", "", phone_no);
		phone_no = str_replace("-", "", phone_no);
		phone_no = str_replace("(", "", phone_no);
		phone_no = str_replace(")", "", phone_no);
		/*
		if (phone_no.slice (0, phonecode.length) === phonecode) {
			return phone_no;
		}
		*/
		if (phone_no.slice (0, 1) === "+") {
			return phone_no;
		}

		var c = phone_no.slice(0, 1);
		switch (c) {
			case "0" : {
				phone_no = phonecode + phone_no.slice(1);
				break;
			}
			default : {
				phone_no = phonecode + phone_no;
				break;
			}
		}

		return phone_no;
	}
	
};


// End of file: msisdn.js