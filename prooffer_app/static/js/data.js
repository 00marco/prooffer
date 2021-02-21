function Data() {
	var self = this;
	
	self.pouchdbResponseHandler = function(err, response) { 
					if(err) console.log(err);
	};
	
	self.getStages = function() {
		return ['Start', 'Customer Details', 'Machine', 'Machine Options', 'New Components', 'Complementary Goods','Price', 'Offer'];
	};
	
	self.getGenderOptions = function() {
		return ['Male', 'Female'];
	};
	
	self.getCountryOptions = function() {
		return countries;
	};

	self.checkConnectivity = function() {
		response = $.ajax({
			type: "GET",
			url: "machineData",
			timeout: 10000,
			async: false,
			error: function() {
				console.log("failed to connect");		
			},
			success: function() {
				console.log("connection ok");			
			}
		});

	};

    self.getCRMCustomerDetails = function() {
        return [
                {
                    account: {name: 'The Imagine Firm'}, 
                    contact: {contactPerson: 'Mr. Sven Buka', gender: 'Male'}, 
                    address: {street: '75th Philippine Road', city: 'Davao', postalCode: '8042', poBox: '777', state: '', country: 'Philippines'}, 
                    additional: {telNum: '123-4567', email: 'sven@theimaginefirm.com', website: 'www.imaginefirm.com'}
                }, 
                {
                    account: {name: 'Haewon'}, 
                    contact: {contactPerson: 'Darim', gender: 'Male'}, 
                    address: {street: '', city: '', postalCode: '', poBox: '', state: '', country: 'Korea'}, 
                    additional: {telNum: '123-4567', email: 'darimt@unitel.co.kr', website: 'www.unitel.co.kr'}
                },
                {
                    account: {name: 'Fong Engineering & Iron Works'}, 
                    contact: {contactPerson: 'The Agent', gender: ''}, 
                    address: {street: '', city: '', postalCode: '', poBox: '', state: '', country: 'Singapore'}, 
                    additional: {telNum: '123-4567', email: 'sven@theimaginefirm.com', website: ''}
                },
                {
                    account: {name: 'All Fit Engineering'}, 
                    contact: {contactPerson: 'Mr. Manager', gender: 'Male'}, 
                    address: {street: '18A Young Ya Industrial Building', city: '', postalCode: '', poBox: '', state: '', country: 'Dubai'}, 
                    additional: {telNum: '123-4567', email: 'info@allfitwelding.com', website: ''}
                }                
               ];
    };
    
    self.getVisibilityOptions = function() {
        return [
                { include: true, title: 'Cover Page', pdf: '', type: 'standard'},
                { include: true, title: 'Introduction', pdf: '', type: 'standard'},
                { include: true, title: 'Quotation', pdf: '', type: 'standard'},
                { include: true, title: 'General Terms and Conditions', pdf: '', type: 'standard'},
                { include: true, title: 'Product Description Introduction', pdf: '', type: 'standard'},
                { include: true, title: 'Product Description', pdf: '', type: 'standard'},
                { include: true, title: 'Technical Data', pdf: '', type: 'standard'},
                { include: true, title: 'Machine Layout', pdf: '', type: 'standard'},
                { include: true, title: 'Reference List', pdf: '', type: 'standard'},
                { include: true, title: 'Warranty Terms and Conditions', pdf: '', type: 'standard'},
                { include: true, title: 'Service Support Terms and Conditions', pdf: '', type: 'standard'},
                { include: false, title: '', pdf: '', type: 'custom'}
        ];
    };
               
	self.onFail = function(response) {
		$('#dialog-overlay').hide();
        $('#throbber').hide();
		window.open().document.write(response.responseText);
		//console.log(response.responeText);
		//alert(response.responseText);
	}
	
	self.getMachineData = function() {
		response = $.ajax({
			type: "GET",
			url: "machineData",
			dataType: "text",
			async: false
		})
		.fail(self.onFail);
		//console.log(response.responseText);
		machineData = eval(response.responseText);
		return machineData;
	};
	
	self.getMachineQuotationTypes = function() {
		return ['Budget','New'];
	};
	
	function Option(name, chapter, price, isUSD, description, pdf, isDefault, isRequired, isDisabled, type, quantity) {

		var self = this;
        info = name.split(';');
		self.name = info[0];
        self.id = info[1];
        self.rev = info[2];
		self.chapter = chapter;
		self.price = price;
		self.isUSD = ko.observable(isUSD);
		self.description = ko.observable(description);
		self.pdf = pdf;
		self.isDefault = isDefault;
		self.isRequired = isRequired;
		self.isDisabled = isDisabled;
		//self.priceUS = price;
		self.type = type;
		self.quantity = ko.observable(quantity !== undefined ? parseInt(quantity) : 1);
		
		self.isSelected = ko.observable(false);
		self._isSelected = false;
		ko.computed(function() {
			self._isSelected = self.isSelected();
		});
		
		self.quoteDescription = function() {
			if(self.description.length > 0) return self.description;
			var description = [];
			description.push(self.name);
			return description;
		}
	};
	
	function ORSelector(name) {
		var self = this;
		self.type = 'OR';
		
		self.price;
		self.project;
		self.selection;	
		self.selectedOption;
		
		self.deselect = function(option) {
			option.isSelected(false);
			if(self.selection != undefined) self.selection.splice(self.selection.indexOf(option),1);
			self.selectedOption = undefined;
		};
		self.select = function(option) {
			if(self.selectedOption != undefined) self.deselect(self.selectedOption);
			option.isSelected(true); 
			self.selectedOption = option;
			if(self.selection != undefined) self.selection.push(option);
		};
		self.hasSelection = function() {
			return self.selectedOption != undefined;
		};
		self.onClick = function(option) {
			if(option.isDisabled || option.isRequired) return;
			if(option.isSelected()) self.deselect(option);
			else self.select(option);
			if(self.project != undefined) self.project.update();
			if(self.price != undefined) self.price.update();
		};
	};
	
	function ANDSelector(name) {
		var self = this;
		self.type = 'AND';
		
		self.price;
		self.project;
		self.selection;
		self.selectionCount = 0;
		
		self.select = function(option) {
			option.isSelected(true); 
			if(self.selection != undefined) self.selection.push(option);
			self.selectionCount++;
		};
		self.deselect = function(option) {
			option.isSelected(false);
			if(self.selection != undefined) self.selection.splice(self.selection.indexOf(option),1);
			self.selectionCount--;
		};
		self.hasSelection = function() {
			return self.selectionCount > 0;
		};
		self.onClick = function(data) { 
			if(data.isDisabled || data.isRequired) return;
			if(data.isSelected()) self.deselect(data);
			else self.select(data);
			if(self.project != undefined) self.project.update();
			if(self.price != undefined) self.price.update();
		};
	};
	
	self.getMachineOptions = function(machineOptions, defaultSelection, industryDefaults) {
		
		console.log({ options: machineOptions, defaultOptions: defaultSelection, includeIndustryDefaults:industryDefaults });
		
		response = $.ajax(
		{
			type: "GET",
			url: "machineOptions",
			dataType: "text",
			data: { data: ko.toJSON({ options: machineOptions, defaultOptions: defaultSelection, includeIndustryDefaults:industryDefaults })},
			async: false,
			 
			/* success: function(data){
				 console.log(ko.toJSON(data));
			   } */
		})
		.fail(self.onFail)
		.error(self.onFail);
		
		console.log(response);

		machineOptions = eval(response.responseText);
		console.log(machineOptions);
		return machineOptions;
	};
	
	self.schema = undefined;
    
	self.getSchema = function() {
		
		response = $.ajax(
		{
			type: "GET",
			url: "getSchema",
			dataType: "text",
			data: {},
			async: false,
		})
		.fail(self.onFail);
		
		self.schema = JSON.parse(response.responseText);
		
		return self.schema;
	}
   
    self.getDiscountTypes= function() {
        return ['Percentage', 'Absolute'];
    }
	
	self.getCurrencyTypes = function() {
		return ['EUR', 'USD'];
	}
	
	self.getTemplates = function(templateType, list) {		     
        var map = 'function(doc) {\
                     if(doc.datatype) {\
                       if(doc.datatype == "template") {\
                         if(doc.templatetype == "' + templateType + '") emit(doc.name,null);\
                       }\
                     }\
                   }';
        response = $.ajax({
			type: "GET",
			url: "templateList",
			dataType: "text",
			data: {map_fun: map},
            async: false
		})
        .done(function(data) {   
            data = JSON.parse(data)
            var len = data.length;
            for(var i=len - 1; i >= 0; i--) {                
                list.push(data[i]);
            }
        })
		.fail(self.onFail)         
	}
	
	self.getIntroductionTemplates = function() {
        var list  = new Array();
		self.getTemplates("introduction", list);
        return list;
	}
	
	self.getAddressTemplates = function() {
        list  = new Array();
		self.getTemplates("address", list);
        return list;
	}
	
	self.getTermsAndConditionsTemplates = function() {
        list  = new Array();
		self.getTemplates("terms", list);        
        return list;
	}
	
	self.getTemplate = function(templateType, templateName) {
        if(templateName === undefined) return 'undefined';
        response = $.ajax({
			type: "GET",
			url: "template",
			dataType: "text",
			data: {templateType: templateType, templateName: templateName},
            async: false
		})
        .fail(self.onFail) 
        return response.responseText; //.replace(/u'/g,"'")
	}
	
	
	self.getIntroductionTemplate = function(templateName) {
		return self.getTemplate("introduction", templateName);
	}
	
	self.getTermsAndConditionsTemplate = function(templateName) {
		return self.getTemplate("terms", templateName);
	}
	
	self.getAddressTemplate = function(templateName) {
		return self.getTemplate("address", templateName);
	}
	
	self.getUserData = function() {
		response = $.ajax({
			type: "GET",
			url: "userdata",
			dataType: "text",
			data: {command: "get"},
			async: false
		});
		console.log("get user data");
		console.log(response.responseText);
		return eval(JSON.parse(response.responseText));
	}
	
	self.setUserData = function(userdata) {
		response = $.ajax({
			type: "GET",
			url: "userdata",
			dataType: "text",
			data: {command: "set", data: userdata},
		})
        .fail(self.onFail);
	}
	
	self.generate = function(offer, url, filename) {
        $('<div id="dialog-overlay"></div>').prependTo('body');
        $('#throbber').show();
        
		$.ajax({
			type: "POST",
			url: url,
			data: {data: offer},
		})
		.done(function(response) {
			window.location.assign("getPdf/?fileName=" + filename);
            $('#dialog-overlay').hide();
            $('#throbber').hide();
		})
		.fail(self.onFail);
	}
	
	self.generateOffer = function(offer) {
		self.generate(offer, "generateOffer/", JSON.parse(offer).reference);
	}
	
	self.generateOrder = function(offer) {
		var obj = JSON.parse(offer);
		self.generate(offer, "generateOrder/", obj.label + ' ' + obj.reference);
	}

	self.generateOrderPreview = function(offer) {
		var obj = JSON.parse(offer);
		self.generate(offer, "generateOrderPreview/", 'Preview ' + obj.label + ' ' + obj.reference);
	}
	
	self.generateHandOver = function(offer) {
		var obj = JSON.parse(offer);
		self.generate(offer, "generateHandOver/", 'Hand Over' + ' ' + obj.reference);
	}
	
	// gets the user with the specified code from the list of all users
	self.getUserFromUserList = function(userListRawObject, code) {
		var lastmodifiedbyUserFullDetails = []

		for (var userIndex = 0; userIndex < userListRawObject.length; userIndex++){
			
			var rawArrayString = Object.values(userListRawObject[userIndex])[0];
			var extractedObjectString = rawArrayString.substring(rawArrayString.indexOf("{") + 1, rawArrayString.indexOf("}"));

			// JSON.parse was returning a string and not parsing it correctly so i did this instead
			if (extractedObjectString.includes("sharewith") && extractedObjectString.includes(code)){
				
				// the following line just extracts the name from the array
				var row = extractedObjectString.split(',')[2].split(':')[1].split("'").join('');
				return row;			
			}
					
				
		}
		
		return {};
	}	

	self.getProjectList = function(projectList, userdata) {
        var map = 'function(doc) {\
                    if(doc.projectName) {\
						var sharewith = ' + JSON.stringify(userdata.sharewith) + ';\
						var usercode = ' + JSON.stringify(userdata.code) + ';\
						if(doc.createdby == usercode || sharewith.indexOf(doc.createdby) != -1)\
							emit(doc.projectName, { companyName: doc.customerDetails.companyName,\
                                                                contactPerson: doc.customerDetails.contactPerson,\
                                                                country: doc.customerDetails.country,\
                                                                machineName: doc.machine.machineName,\
                                                                createdby: doc.createdby ? doc.createdby : "???",\
                                                                lastmodified: doc.lastmodified ? doc.lastmodified : "0",\
                                                                lastmodifiedby: doc.lastmodifiedby ? doc.lastmodifiedby : "???",\
								ordcon: doc.ordcon ? 1 : 0,\
								signature: doc.signature ? doc.signature : "???",\
                                                                });\
                   }}';
                   
        response = $.ajax({
			type: "GET",
			url: "projectList",
			dataType: "text",
			data: {map_fun: map},
		})
        .done(function(data) {
            var rows = eval(data.replace(/u'/g,"'"));      
            var len = rows.length;
		console.log("projectList");
            for(var i=len - 1; i >= 0; i--) {
		console.log(rows[i]);
		var userName = self.getUserFromUserList(rows[i].userList, rows[i].value.lastmodifiedby);
                projectList.push({ projectName: rows[i].key, 
                                   companyName: rows[i].value.companyName,
                                   contactPerson: rows[i].value.contactPerson,
                                   country: rows[i].value.country, 
                                   createdby: rows[i].value.createdby,
                                   lastmodified: rows[i].value.lastmodified,
                                   lastmodifiedby: userName,
                                   machineName: rows[i].value.machineName,
								   ordcon: rows[i].value.ordcon,
								   });
            }
        })
		.fail(self.onFail)          
	}
	
	self.getProject = function(projectName, callback) {
        $.ajax({
			type: "GET",
			url: "project",
			dataType: "text",
			data: { command: "check", name: projectName},
		})
        .done(function(response){
            var data = JSON.parse(response);
            var cmd = "get_old";
            if(data['machineOptionsChanged'].length > 0 || data['machineDataChanged'] == 'true') {
				var text = 'Machine: ' + data['machineName'];
				if(data['machineDataChanged'] == 'true') {
					text += '\n- machine data (price, descriptions, pdf descriptions, etc...) was changed.';
				}
				if(data['machineOptionsChanged'].length > 0) {
					text += '\n- machine option(s) were changed.'
					for(var i = 0; i < data['machineOptionsChanged'].length; i++) {
						text += ('\n\t- ' + data['machineOptionsChanged'][i]);
					}
				}
                //if(confirm(text) == true) {
                //    cmd = "get_new";
                //}
				alert(text);
				cmd = "get_new";
            }
            $.ajax({
                type: "GET",
                url: "project",
                dataType: "text",
                data: { command: cmd, name: projectName},
            })
            .done(function(data){
				console.log(JSON.parse(data));
                callback(JSON.parse(data));
            })
            .fail(self.onFail);
        })
		.fail(self.onFail);
	}
	
	self.saveProject = function(projectName, projectData, callback) {
		response = $.ajax({
			type: "POST",
			url: "saveProject/",
			dataType: "text",
			data: {name: projectName, data: projectData},
		})
		.fail(self.onFail)
		.done(function(data) {
			if(callback) callback();
		});
	}
	
    self.removeProject = function(projectName) {
        response = $.ajax({
			type: "GET",
			url: "project",
			dataType: "text",
			data: { command: "remove", name: projectName},
		})
		.fail(self.onFail);
    }
	
	self.saveTemplate = function(templateUrl, templateName, templateData, onDone) {
		$.ajax({
			type: "GET",
			url: templateUrl,
			dataType: "text",
			data: {name: templateName, template: templateData}
		})
		.fail(self.onFail)
		.done(onDone)
	}
    
    self.getSignatures = function() {
        response = $.ajax({
			type: "GET",
			url: "getSignature",
            async: false
		});

        return response.responseText;
    }
    
     self.getImageAttachment = function(id, filename, onDone) {
        response = $.ajax({
			type: "GET",
			url: "getImageAttachment",
            dataType: "text",
            data: {id: id, filename:filename}
		})
        .fail(self.onFail)
        .done(onDone);
    }
	
	self.copyAttachment = function(source, destination, filename, onDone) {
		$.ajax({
			type: "GET",
			url: "copyAttachment",
			dataType: "text",
			data: { source: source, destination: destination, filename: filename}
		})
		.fail(self.onFail)
		.done(onDone);
	}
	
	self.deleteAttachment = function(id, filename, onDone) {
		response = $.ajax({
			type: "GET",
			url: "deleteAttachment",
            dataType: "text",
            data: {id: id, filename:filename}
		})
        .fail(self.onFail)
        .done(onDone);
	}
    
    self.getCurrentDate = function(){
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10) ? '0' + month: month;
        var day = date.getDate();
        day = (day < 10) ? '0' + day : day;

        return year + '-' + month + '-' + day;
    }
	
	self.getUserPrivilegeData = function() {
		response = $.ajax({
			type: "GET",
			url: "getUserPrivilegeData",
			dataType: "text",
			async: false
		});
		return eval(JSON.parse(response.responseText));
	}
};

