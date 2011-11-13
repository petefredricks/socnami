var make = function(data, type) {
	
	var output = {}
	
	switch (type) {
		case 'error':
			output.status = 0;
			break;
		default: 
			output.status = 1;
			
	}
	
	output.data = data || '';
	
	return output;
}

exports.make = make;