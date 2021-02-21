
var _global_offerComponents_savecallback = undefined;

function Project(initData) {
	var self = this;
	self.version = '1.0';
    self.createdby = '';
    self.lastmodifiedby = '';
	self.projectName = (typeof initData == 'undefined' ? undefined : initData.projectName);
   
	self.customerDetails = {
		//Account
		companyName : ko.observable(initData !== undefined ? initData.customerDetails.companyName : ''),
        companyLogo : ko.observable(initData !== undefined ? initData.customerDetails.companyLogo : ''),
		//Contact
		contactPerson : ko.observable(initData !== undefined ? initData.customerDetails.contactPerson: ''),
		gender : ko.observable(initData !== undefined ? initData.customerDetails.gender : ''),
		//Address
		fullAddress : ko.observable(initData !== undefined ? initData.customerDetails.fullAddress : ''),
		city : ko.observable(initData !== undefined ? initData.customerDetails.city : ''),
		postalCode : ko.observable(initData !== undefined ? initData.customerDetails.postalCode : ''),
		poBox : ko.observable(initData !== undefined ? initData.customerDetails.poBox : ''),
		state : ko.observable(initData !== undefined ? initData.customerDetails.state : ''),
		country : ko.observable(initData !== undefined ? initData.customerDetails.country : ''),
		//Additional
		telNo : ko.observable(initData !== undefined ? initData.customerDetails.telNo : ''),
		email : ko.observable(initData !== undefined ? initData.customerDetails.email : ''),
		website : ko.observable(initData !== undefined ? initData.customerDetails.website : ''),
	};
	
	self.machine = {
		machineType: ko.observable(initData !== undefined ? initData.machine.machineType : ''),
		machineRange: ko.observable(initData !== undefined ? initData.machine.machineRange : ''),
		machineName: ko.observable(initData !== undefined ? initData.machine.machineName : ''),
		machineOptions: (initData !== undefined ? initData.machine.machineOptions: ''),
		initialPrice: (initData !== undefined ? initData.machine.initialPrice: ''),
		image: (initData !== undefined ? initData.machine.image: ''),
		frontPage: (initData !== undefined ? initData.machine.frontPage: ''),
		introduction: (initData !== undefined ? initData.machine.introduction: ''),		
		machineDefault: (initData !== undefined ? initData.machine.machineDefault : ''),
		summary: (initData !== undefined ? initData.machine.summary: ''),
		technicalData: (initData !== undefined ? initData.machine.technicalData: ''),
        machineLayout: (initData !== undefined ? initData.machine.machineLayout: ''),
        referenceList: (initData !== undefined ? initData.machine.referenceList: ''),
        warrantyTermsAndConditions: (initData !== undefined ? initData.machine.warrantyTermsAndConditions: ''),
        serviceSupportTermsAndConditions: (initData !== undefined ? initData.machine.serviceSupportTermsAndConditions: ''),
        id: (initData !== undefined ? initData.machine.id: ''),
        rev: (initData !== undefined ? initData.machine.rev: '')
	};
	self.machineOptions = {
		standard : [],
		optional : [],
	};
	
	self.newComponents = {
		standard: (initData !== undefined ? initData.newComponents.standard : {}),
		optional: (initData !== undefined ? initData.newComponents.optional : {}),
	};
    self.complementaryGoods = {
        standard: (initData !== undefined ? initData.complementaryGoods.standard : ko.observableArray()), 
        optional: (initData !== undefined ? initData.complementaryGoods.optional : ko.observableArray())
    };
	self.price = {
		standard_commission: ko.observable(initData !== undefined ? initData.price.standard_commission : ''),
		standard_negotiation: ko.observable(initData !== undefined ? initData.price.standard_negotiation : ''),
		standard_discount_type: ko.observable(initData !== undefined ? initData.price.standard_discount_type : ''),
		standard_discount: ko.observable(initData !== undefined ? initData.price.standard_discount : ''),
		optional_commission: ko.observable(initData !== undefined ? initData.price.optional_commission : ''),
		optional_negotiation: ko.observable(initData !== undefined ? initData.price.optional_negotiation : ''),
		offer_price: ko.observable(initData !== undefined ? initData.price.offer_price: ''),
		offer_settings: {
            date: ko.observable(initData !== undefined ? initData.price.offer_settings.date : prooffer_data.getCurrentDate()),
			currency: ko.observable(initData !== undefined ? initData.price.offer_settings.currency : ''),
			exchange_rate: ko.observable(initData !== undefined ? initData.price.offer_settings.exchange_rate : ''),
            number_format: ko.observable(initData !== undefined ? initData.price.offer_settings.number_format : '.'),
		}
	};
	
	ko.computed(function() {
		if(self.price.optional_commission() == '') self.price.optional_commission(self.price.standard_commission());
		if(self.price.optional_negotiation() == '') self.price.optional_negotiation(self.price.standard_negotiation());
	}, self);
	
	self.showItemPrice = ko.observable(initData !== undefined ? initData.showItemPrice : false);
    self.showDiscount = ko.observable(initData !== undefined ? initData.showDiscount : false);
	self.introductionTemplate = ko.observable(initData !== undefined ? initData.introductionTemplate : 'General');
    self.introductionText = ko.observable(initData !== undefined ? initData.introductionText : '');
    self.salesEngineer = ko.observable(initData !== undefined ? initData.salesEngineer : '<span style="background: red; width: 100px;">Type Name Here</span>');
	self.addressTemplate = ko.observable(initData !== undefined ? initData.addressTemplate : 'default');
	self.termsAndConditionsTemplate = ko.observable(initData !== undefined ? initData.termsAndConditionsTemplate : 'default');
    self.termsAndConditionsText = ko.observable(initData !== undefined ? initData.termsAndConditionsText : '');
	self.signature = ko.observable(initData !== undefined ? initData.signature : 'Igor Gieltjes');
    self.include = {
		frontCover : ko.observable(initData !== undefined ? initData.include.frontCover : true),
		introduction : ko.observable(initData !== undefined ? initData.include.introduction: true),
		quotation : ko.observable(initData !== undefined ? initData.include.quotation: true),
		termsAndConditions : ko.observable(initData !== undefined ? initData.include.termsAndConditions: true),
		productDescriptionIntro : ko.observable(initData !== undefined ? initData.include.productDescriptionIntro: true),
		productDescription : ko.observable(initData !== undefined ? initData.include.productDescription: true),
		technicalData : ko.observable(initData !== undefined ? initData.include.technicalData: true),
		machineLayout : ko.observable(initData !== undefined ? initData.include.machineLayout: true),
		productivityCalculation : ko.observable(initData !== undefined ? initData.include.productivityCalculation: true),
		referenceList : ko.observable(initData !== undefined ? initData.include.referenceList: true),
		warrantyTC : ko.observable(initData !== undefined ? initData.include.warrantyTC: true),
		orgalime : ko.observable(initData !== undefined ? initData.include.orgalime: true)
		//importPDF : ko.observable(initData !== undefined ? initData.include.importPDF: true)
	};
    self.visibilityOptions = ko.observableArray((initData !== undefined) ? initData.visibilityOptions.slice() : []);
	
	self.updateFlag = ko.observable(false);
	self.update = function() {
		self.updateFlag(!self.updateFlag());
	};
	
	ko.computed(function() {
		self.updateFlag();
		if(self.projectName != undefined) {
			ko.toJSON(self); // dummy statement so this function will be called when any of the observable elements of 'self' changes
			//localStorage.setItem(self.projectName, ko.toJSON(self));
			//console.log("saving...");
			// console.log(ko.toJSON(self));
			prooffer_data.saveProject(self.projectName, ko.toJSON(self), _global_offerComponents_savecallback);
		}
	}, self).extend({throttle: 1000});
	
};

function setProject(project, initData) {
	project.version = '1.0';
    project.createdby = '';
    project.lastmodifiedby = '';
	project.projectName = initData.projectName;
   
	project.customerDetails.companyName(initData.customerDetails.companyName);
    project.customerDetails.companyLogo(initData.customerDetails.companyLogo);
		//Contact
	project.customerDetails.contactPerson(initData.customerDetails.contactPerson);
	project.customerDetails.gender(initData.customerDetails.gender);
		//Address
	project.customerDetails.fullAddress(initData.customerDetails.fullAddress);
	project.customerDetails.city(initData.customerDetails.city);
	project.customerDetails.postalCode(initData.customerDetails.postalCode);
	project.customerDetails.poBox(initData.customerDetails.poBox);
	project.customerDetails.state(initData.customerDetails.state);
	project.customerDetails.country(initData.customerDetails.country);
		//Additional
	project.customerDetails.telNo(initData.customerDetails.telNo);
	project.customerDetails.email(initData.customerDetails.email);
	project.customerDetails.website(initData.customerDetails.website);
	
	project.machine.machineType(initData.machine.machineType);
	project.machine.machineRange(initData.machine.machineRange);
	project.machine.machineName(initData.machine.machineName);
	project.machine.machineOptions = initData.machine.machineOptions;
	project.machine.initialPrice = initData.machine.initialPrice;
	project.machine.image = initData.machine.image;
	project.machine.frontPage = initData.machine.frontPage;
	project.machine.introduction = initData.machine.introduction;		
	project.machine.machineDefault = initData.machine.machineDefault;
	project.machine.summary = initData.machine.summary;
	project.machine.technicalData = initData.machine.technicalData;
    project.machine.machineLayout = initData.machine.machineLayout;
    project.machine.referenceList = initData.machine.referenceList;
    project.machine.warrantyTermsAndConditions = initData.machine.warrantyTermsAndConditions;
    project.machine.serviceSupportTermsAndConditions = initData.machine.serviceSupportTermsAndConditions;
    project.machine.id = initData.machine.id;
    project.machine.rev = initData.machine.rev;
	
	project.machineOptions.standard=[];
	project.machineOptions.optional=[];
	
	project.newComponents.standard = initData.newComponents.standard;
	project.newComponents.optional = initData.newComponents.optional;
	
	// console.log(project.newComponents.standard);
	
    project.complementaryGoods.standard(initData.complementaryGoods.standard); 
    project.complementaryGoods.optional(initData.complementaryGoods.optional);
    
	
	// console.log( initData.price.offer_settings.exchange_rate);
	if(project.machine.id == "machine_0c2462317d009170a487ba5519006abb" || project.machine.id == "machine_3cac13dec1b04d5db8e2ef9c1ed2eea5"){
		if(initData.price.offer_settings.exchange_rate == undefined || initData.price.offer_settings.exchange_rate == ''){
			// console.log("")
			showExchangeRatePrompt();
			if(proOffer.promptExchangeRate() !== ''){
				initData.price.offer_settings.exchange_rate = proOffer.promptExchangeRate();
			}else{
				initData.price.offer_settings.exchange_rate = '';
			}
		}
	}
	
	proOffer.promptExchangeRate('');
	
	project.price.standard_commission(initData.price.standard_commission);
	project.price.standard_negotiation(initData.price.standard_negotiation);
	project.price.standard_discount_type(initData.price.standard_discount_type);
	project.price.standard_discount(initData.price.standard_discount);
	project.price.optional_commission(initData.price.optional_commission);
	project.price.optional_negotiation(initData.price.optional_negotiation);
	project.price.offer_price(initData.price.offer_price);
    project.price.offer_settings.date(initData.price.offer_settings.date);
	project.price.offer_settings.currency(initData.price.offer_settings.currency);
	project.price.offer_settings.exchange_rate(initData.price.offer_settings.exchange_rate);
    project.price.offer_settings.number_format(initData.price.offer_settings.number_format);
		
	project.showItemPrice(initData.showItemPrice);
    project.showDiscount(initData.showDiscount);
	project.introductionTemplate(initData.introductionTemplate);
    project.introductionText(initData.introductionText);
    project.salesEngineer(initData.salesEngineer);
	project.addressTemplate(initData.addressTemplate);
	project.termsAndConditionsTemplate(initData.termsAndConditionsTemplate);
    project.termsAndConditionsText(initData.termsAndConditionsText);
	project.signature(initData.signature);
    project.include.frontCover(initData.include.frontCover);
	project.include.introduction(initData.include.introduction);
	project.include.quotation(initData.include.quotation);
	project.include.termsAndConditions(initData.include.termsAndConditions);
	project.include.productDescriptionIntro(initData.include.productDescriptionIntro);
	project.include.productDescription(initData.include.productDescription);
	project.include.technicalData(initData.include.technicalData);
	project.include.machineLayout(initData.include.machineLayout);
	project.include.productivityCalculation(initData.include.productivityCalculation);
	project.include.referenceList(initData.include.referenceList);
	project.include.warrantyTC(initData.include.warrantyTC);
	project.include.orgalime(initData.include.orgalime)

    project.visibilityOptions(initData.visibilityOptions.slice());
};

function StartOptions(parent) {
    var self = this;
    self.parent = parent;
    
    self.isCopyQuote = ko.observable(false);
    self.selectedQuote = ko.observable('');
    self.openQuotesDialog = ko.observable(false);
    self.projectList = ko.observableArray();
	
	self.isProjectListDirty = false;	
	
	self.isProjectExisting = function(projectName) {
		for(var i = 0; i < self.projectList().length; i++) {
			if(self.projectList()[i].projectName == projectName) return true;
		}
		return false;
	}
	
    self.clearQuotesList = function() {
        self.projectList.removeAll();
        self.resetFilters();
    }
    self.openExistingQuotes = function(openType) { //to delete ???
        self.isCopyQuote((openType === "copy")? true: false);
        self.clearQuotesList();
		prooffer_data.getProjectList(self.projectList, self.parent.user);
        self.openQuotesDialog(true);
    }
        
    self.selectExistingQuote = function(quote) {
        self.selectedQuote(quote.projectName);
    }
    
    self.initializeProjectList = function() {
        self.clearQuotesList();
		prooffer_data.getProjectList(self.projectList, self.parent.user);
		self.isProjectListDirty = false;
    }
    
    self.closeDialog = function(){
        self.openQuotesDialog(false);
    }
        
    self.createNewQuote = function() {
        self.parent.hasStarted(true);
		self.parent.clear();
		self.parent.project = new Project();
		self.parent.project.projectName = self.parent.currentRef();
        self.parent.project.createdby = self.parent.user.code;
        self.parent.project.lastmodifiedby = self.parent.user.code;
		self.parent.project.update();
		self.parent.user.sequence = self.parent.sequence();
		self.parent.sequence(self.parent.sequence() + 1);
		prooffer_data.setUserData(JSON.stringify(self.parent.user));
        self.parent.customerDetails.reset();
		self.parent.machine.initMachineData('');
        self.parent.projectNumber(self.parent.project.projectName);
        self.parent.machineName('');
        self.parent.complementaryGoods.clearTable();
        self.parent.offer.initializeTemplates();
        self.parent.offer.initializeVOptions(prooffer_data.getVisibilityOptions());
        self.parent.gotoStage('Customer Details');
        self.parent.industry('Standard');
		self.isProjectListDirty = true;
    };
	
	self.initProject = function(projectName, callback) {
		prooffer_data.getProject(projectName, function(initData) {
		console.log(initData);
		initData.projectName = undefined; // set to undefined so autosave will not be invoked
		self.parent.project.projectName = undefined;
		setProject(self.parent.project, initData);
		
		self.parent.machine.initMachineData(initData.machine.machineType, initData.machine.machineRange, initData.machine.machineName);
		options = prooffer_data.getMachineOptions(initData.machine.machineOptions, initData.machine.machineDefault, true)[0];
		console.log(options);
		self.parent.machineOptions.options_standard = options.options;
        self.parent.machineOptions.goToStandard();
		self.parent.industryDefaults = options.defaults;
       
		self.parent.machineOptions.options_optional = prooffer_data.getMachineOptions(initData.machine.machineOptions, 'NONE', false);
		self.parent.machine.initOptions(self.parent.machineOptions.options_standard, function(selector) { selector.selection = self.parent.project.machineOptions.standard; selector.project = self.parent.project; selector.price = self.parent.price;}, initData.machineOptions.standard);
		self.parent.machine.initOptions(self.parent.machineOptions.options_optional, function(selector) { selector.selection = self.parent.project.machineOptions.optional; selector.project = self.parent.project; selector.price = self.parent.price;}, initData.machineOptions.optional);
		self.parent.newComponents.initialize(options.options, initData);
        console.log(self.parent.newComponents.standardNC());
		self.parent.complementaryGoods.initialize(prooffer_data.getMachineOptions('Complementary goods', 'NONE', false), initData);
        console.log(self.parent.complementaryGoods.standardCG());
        self.parent.machineName(self.parent.project.machine.machineName());
		callback();
		self.parent.offer.initializeTemplates();
        self.parent.offer.initializeVOptions(initData.visibilityOptions);
		self.parent.price.initCurrency();
		
		});
	};
    
    self.openSelectedQuote = function(data) {

		var projectName = data.projectName;
		if(projectName != '') {
			self.openQuotesDialog(false);
			self.parent.hasStarted(true);
            
			self.initProject(projectName, function() {

				self.parent.project.projectName = projectName;
                self.parent.projectNumber(projectName);
                self.parent.project.createdby = data.createdby;
                self.parent.project.update();
                self.parent.price.update();
                self.parent.offer.update();
                self.parent.update();
				self.parent.customerDetails.reset();
                self.parent.gotoStage('Customer Details');
                var logo = self.parent.project.customerDetails.companyLogo();
                if( logo != '') {
                    prooffer_data.getImageAttachment(self.parent.project.projectName, logo, function(data) {
						//self.parent.customerDetails.logoFileName(logo);
                        self.parent.customerLogo(data);                       
                    });                    
                }
			});
		}
    };
    
    self.reviseSelectedQuote = function(data) {
		var projectName = data.projectName;
		if(projectName != '') {
			self.openQuotesDialog(false);
			self.parent.hasStarted(true);
            
			self.initProject(projectName, function() {			
                var projectNameArray = projectName.split('.');
                var vIndex = projectNameArray.length - 1;
                var version = projectNameArray[vIndex];
                projectNameArray[vIndex] = nextChar(version);
                var newName = projectNameArray.join('.');
				while(self.isProjectExisting(newName)) {
					version = nextChar(version);
					projectNameArray[vIndex] = version;
					newName = projectNameArray.join('.');
				} 
                self.parent.project.projectName = newName;

                self.parent.projectNumber(self.parent.project.projectName);  
                self.parent.project.createdby = data.createdby;
                self.parent.project.lastmodifiedby = self.parent.user.code;
                self.parent.project.update();
                self.parent.price.update();
                self.parent.offer.update();
                self.parent.update();
                self.parent.gotoStage('Customer Details');
                var logo = self.parent.project.customerDetails.companyLogo();
				
                if( logo != '') {
					prooffer_data.saveProject( self.parent.project.projectName, ko.toJSON(self.parent.project), function() {
						prooffer_data.copyAttachment(projectName, self.parent.project.projectName, logo, function() {
							prooffer_data.getImageAttachment(self.parent.project.projectName, logo, function(data) {
								self.parent.customerLogo(data);
								for(i in self.parent.project.visibilityOptions()){
									if(self.parent.project.visibilityOptions()[i].pdf != ''){
										prooffer_data.copyAttachment(projectName, self.parent.project.projectName, self.parent.project.visibilityOptions()[i].pdf, function() {});
									}
								}
							});                    
						});
					});
                }
				
				
				
				self.isProjectListDirty = true;
			});
		}
    };
    
    self.copySelectedQuote = function(data) {
        var projectName = data.projectName;
		if(projectName != '') {
			self.openQuotesDialog(false);
			self.parent.hasStarted(true);
			
			self.initProject(projectName, function() {		
			
				self.parent.project.projectName = self.parent.currentRef();
				self.parent.user.sequence = self.parent.sequence();
				self.parent.sequence(self.parent.sequence() + 1);
				prooffer_data.setUserData(JSON.stringify(self.parent.user));
				
				self.parent.projectNumber(self.parent.project.projectName);
				//Clear Customer Details
				for (key in self.parent.project.customerDetails){
					self.parent.project.customerDetails[key]('');
				}
				self.parent.customerDetails.reset();
				self.parent.project.createdby = self.parent.user.code;
				self.parent.project.lastmodifiedby = self.parent.user.code;
				self.parent.project.update();
				self.parent.price.update();
				self.parent.offer.update();
				self.parent.update();
				self.parent.gotoStage('Customer Details');
				self.isProjectListDirty = true;
			
			});
		}
    };
    
    self.removeProject = function(data) {
        var answer = confirm('Are you sure you want to delete quote ' + data.projectName + '?');
        
        if (answer) {
            self.projectList.remove(data);
            prooffer_data.removeProject(data.projectName);
        }
    }
    
    self.countries = ko.computed(function(){
        var countries = [];
        ko.utils.arrayForEach(self.projectList(), function(project){
            if (project.country)
                countries.push(project.country);
        });
        
        return ko.utils.arrayGetDistinctValues(countries).sort();
    }, self);
    
    self.companyNames = ko.computed(function(){
        var companyNames = [];
        ko.utils.arrayForEach(self.projectList(), function(project){
            if (project.companyName)
                companyNames.push(project.companyName);
        });
        
        return ko.utils.arrayGetDistinctValues(companyNames).sort();
    }, self);
    
    self.contactPersons = ko.computed(function(){
        var contactPersons = [];
        ko.utils.arrayForEach(self.projectList(), function(project){
            if (project.contactPerson)
                contactPersons.push(project.contactPerson);
        });
        
        return ko.utils.arrayGetDistinctValues(contactPersons).sort();
    }, self);
    
    self.machineNames = ko.computed(function(){
        var machineNames = [];
        ko.utils.arrayForEach(self.projectList(), function(project){
            if (project.machineName)
                machineNames.push(project.machineName);
        });
        
        return ko.utils.arrayGetDistinctValues(machineNames).sort();
    });
    
    self.creators = ko.computed(function(){
        var creators = [];
		var userCode = self.parent.user.code;
        ko.utils.arrayForEach(self.projectList(), function(project){
            if (project.createdby) {
				if(project.createdby != userCode)
					creators.push(project.createdby);
			}
        });

        
        creators = ko.utils.arrayGetDistinctValues(creators).sort();

		// console.log(creators);
		creators.push(userCode);
		return creators;		
    });
    
    self.countryFilter = ko.observable();
    self.companyNameFilter = ko.observable();
    self.contactPersonFilter = ko.observable();
    self.machineNameFilter = ko.observable();
    self.creatorFilter = ko.observable();
       
    self.resetFilters = function() {
        self.countryFilter('');
        self.companyNameFilter('');
        self.contactPersonFilter('');
        self.machineNameFilter('');
        self.creatorFilter(self.parent.user.code);
    }
    
    self.filterMatched = function(item) {
        var filters = [];
        filters.push({name: 'country', text: self.countryFilter()});
        filters.push({name: 'companyName', text: self.companyNameFilter()});
        filters.push({name: 'contactPerson', text: self.contactPersonFilter()});
        filters.push({name: 'machineName', text: self.machineNameFilter()});
        filters.push({name: 'createdby', text: self.creatorFilter()});
        
        var availableFilters = ko.utils.arrayFilter(filters, function(filter) {
            return (filter.text) ? true : false;
        });
        
        var filterLength = availableFilters.length;
        var count = 0;
        ko.utils.arrayForEach(availableFilters, function(aFilter) {
            if (aFilter.text == item[aFilter.name]) 
                count += 1;            
        });
        
        return (filterLength == count) ? true : false; 
    }
    
    self.projects = ko.computed(function(){
        if (self.countryFilter() || self.companyNameFilter() || self.contactPersonFilter() || self.machineNameFilter() || self.creatorFilter()) {
            return ko.utils.arrayFilter(self.projectList(), function(item){
                return self.filterMatched(item);
            });
        }
        else {
            return self.projectList();
        }
    });
}

function CustomerDetails(parent) {
    var self = this;
	self.parent = parent;

    self.genderOptions = prooffer_data.getGenderOptions();
    self.countryOptions = prooffer_data.getCountryOptions();
    
	function receiver(event) {
		var data = {};
		var str = event.data;
		str.replace(/(\b[^:]+):'([^']+)'/g, function ($0, param, value) {
			data[param] = value;
		});
		self.parent.project.customerDetails.companyName(data['companyname']);
		self.parent.project.customerDetails.contactPerson(data['contactperson']);
		self.parent.project.customerDetails.fullAddress(data['mailingstreet']);
		self.parent.project.customerDetails.city(data['mailingcity']);
		self.parent.project.customerDetails.state(data['mailingstate']);
		self.parent.project.customerDetails.country(data['mailingcountry']);
		self.parent.project.customerDetails.telNo(data['phone']);
		self.parent.project.customerDetails.email(data['email']);
	}
	window.addEventListener('message', receiver, false);
	
    //import dialog
    self.showCRMDialog = function() {
		//var win = window.open("http://localhost:8888/index.php?module=Contacts&action=Popup&html=Popup_picker&popuptype=specific&form=EditView&sendmessageto=" + window.location,'popUpWindow','height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes');
		var win = window.open("http://fiber.hgg.nl:8080/hggcrm/index.php?module=Contacts&action=Popup&html=Popup_picker&popuptype=specific&form=EditView&sendmessageto=" + window.location,'popUpWindow','height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes');
    };
	
    self.logoFileName = ko.observable();
    self.reader = new FileReader();
    self.showImage = function(data, event) {
        var files = event.target.files;
        var logo = files[0];
        if (logo != undefined) {
            if (logo.name.match(/\.(jpeg|jpg|gif|png|bmp|tif)$/) != null) {
                var formData = new FormData();
                formData.append('content', logo);
                formData.append('id', self.parent.project.projectName);
                
                var xhr = new XMLHttpRequest();                
                xhr.onload = function() {                     
                    prooffer_data.getImageAttachment(self.parent.project.projectName, logo.name, function(data) {
                        self.parent.customerLogo(data);
                    });
                    self.parent.project.customerDetails.companyLogo(logo.name);
                    self.logoFileName(logo.name);

                };          
				
                xhr.open('POST', 'uploadUserDataFile/', true);  
				// xhr.setRequestHeader("Content-Type", "multipart/form-data");
                xhr.send(formData);
            }
            else {
                alert('Unsupported image format.');
                $('#file-browser').val('');
            }
        }
        else {
			self.logoFileName('');
			self.parent.customerLogo('');
            //self.parent.project.customerDetails.companyLogo('/static/logo/blank_logo.png');
        }
    };
    
    self.removeLogo = function() {
		prooffer_data.deleteAttachment(self.parent.project.projectName, self.parent.project.customerDetails.companyLogo(), function(data) {
			self.logoFileName('');
			self.parent.customerLogo('');
			self.parent.project.customerDetails.companyLogo('');
		});
        //self.parent.project.customerDetails.companyLogo('/static/logo/blank_logo.png');
    }
   
    self.reset = function() {
        self.logoFileName('');
		self.parent.customerLogo('');
    }
};

function Machine(parent) {
    var self = this;
    self.parent = parent;
    self.machineData = prooffer_data.getMachineData();
	self.machineQuotationTypes = prooffer_data.getMachineQuotationTypes();
    
    self.machineRange = ko.observable();
	self.machines = ko.observable();
    self.setMachineRange = function(data) {
        if(data.typeName != self.parent.project.machine.machineType()) {
			self.clearRange();
            self.machineRange(data.ranges);
            self.parent.project.machine.machineType(data.typeName);
        }
    };
    self.setMachines = function(data) {
        console.log(data)
		self.clearMachine();
        self.machines(data.machines);
		self.parent.project.machine.machineRange(data.rangeName);
	};
	
	self.setMachineName = function(data) {
		console.log(data);
		self.parent.project.machine.machineName(data.machineName);
        self.parent.machineName(data.machineName);
		self.currentMachineOptions = data.options;
		self.currentInitialPrice = data.initprice;
		self.currentDefaultCurrency = data.defaultCurrency;
		self.currentImage = data.image;
		self.currentFrontPage = data.frontPage;
		self.currentIntroduction = data.introduction;
		self.currentDefaultSelection = data.defaultSelection;
		self.currentSummary = data.summary;
		self.currentTechnicalData = data.technicalData;
        self.currentMachineLayout = data.machineLayout;
        self.currentReferenceList = data.referenceList;
        self.currentWarrantyTermsAndConditions = data.warrantyTermsAndConditions;
        self.currentServiceSupportTermsAndConditions = data.serviceSupportTermsAndConditions;
        self.id = data.id;
        self.rev = data.rev;
	}
	
	self.clearMachine = function() {
		self.parent.project.machine.machineName('');
		self.machines(undefined);
	}
	self.clearRange = function() {
		self.parent.project.machine.machineRange('');
		self.machineRange(undefined);
		self.clearMachine();
	}
	self.clearType = function () { 
		self.parent.project.machine.machineType('');
		self.clearRange();
	}
	
	self.initMachineData = function(typename, rangename, machinename) {
		if(typename != '') {
			for(var i = 0; i < self.machineData.length; i++) {
				type = self.machineData[i];
				if(typename == type.typeName) {
					self.parent.project.machine.machineType(typename);
					self.machineRange(type.ranges);
					if(rangename != '') {
						for(var j = 0; j < type.ranges.length; j++) {
							range = type.ranges[j];
							if(rangename == range.rangeName) {
								self.parent.project.machine.machineRange(rangename);
								self.machines(range.machines);
								if(machinename != '') {
									for(var k = 0; k < range.machines.length; k++) {
										machine = range.machines[k];
										if(machinename == machine.machineName) {
											self.parent.project.machine.machineName(machinename);
                                            self.parent.project.machine.id = machine.id;
                                            self.parent.project.machine.rev = machine.rev;
											self.parent.machine.setMachineName(machine);
											// console.log(machine);
											return;
										}
									}
								} else {
									self.clearMachine();
									self.machines(range.machines);
								}
							}
						}
					} else {
						self.clearRange();
						self.machineRange(type.ranges);
					}
				}
			}
		} else self.clearType();
		
		
	}
	
	self.initOptions = function(options, setSelector, selections) {
		
        console.log(options);
        console.log(selections);
		//add code to auto-add removed "required" options. should demonstrate onclick behavior found on data.js
		for(var iSubject = 0; iSubject < options.length; iSubject++) {

			for(var iChapter = 0; iChapter < options[iSubject].chapters.length; iChapter++) {
				var chapter = options[iSubject].chapters[iChapter];
				setSelector(chapter.selector);
				if(selections == undefined) {
					for(var iOption = 0; iOption < chapter.options.length; iOption++) {
						if(chapter.options[iOption].isDefault || chapter.options[iOption].isRequired) chapter.selector.select(chapter.options[iOption]);
					}
				} else {
					for(var iOption = 0; iOption < chapter.options.length; iOption++) {
						if(chapter.options[iOption].isRequired) chapter.selector.select(chapter.options[iOption]);
					}

                    for(var j = 0; j < chapter.options.length; j++) {
                        for(var iSelOption = 0; iSelOption < selections.length; iSelOption++) {
                            if(selections[iSelOption].id == chapter.options[j].id) {
                                chapter.selector.select(chapter.options[j]);
                                chapter.options[j].quantity(selections[iSelOption].quantity);
                                
                            }
                        }
                    }
				}
			};
		};
		console.log("2222222222222222");
	};
    
	self.setQuotationType = function(data) {
		if(self.parent.project.machine.machineName() != '') {
            console.log('self.currentMachineOptions');
            console.log(self.currentMachineOptions);
            console.log(self.currentDefaultSelection);
            options = prooffer_data.getMachineOptions(self.currentMachineOptions, self.currentDefaultSelection, true)[0]; 
            console.log(options);
			self.parent.machineOptions.options_standard = options.options;
			self.parent.industryDefaults = options.defaults;
			self.parent.machineOptions.options_optional = prooffer_data.getMachineOptions(self.currentMachineOptions, 'NONE', false);
			self.parent.machineOptions.goToStandard();
            self.initOptions(self.parent.machineOptions.options_standard, function(selector) { selector.selection = self.parent.project.machineOptions.standard; selector.project = self.parent.project; selector.price = self.parent.price;});
			self.initOptions(self.parent.machineOptions.options_optional, function(selector) { selector.selection = self.parent.project.machineOptions.optional; selector.project = self.parent.project; selector.price = self.parent.price;});
			
			self.parent.project.machine.machineOptions = self.currentMachineOptions;
			self.parent.project.machine.initialPrice = self.currentInitialPrice;
			self.parent.project.machine.image = self.currentImage;
			self.parent.project.machine.frontPage = self.currentFrontPage;
			self.parent.project.machine.introduction = self.currentIntroduction;		
			self.parent.project.machine.machineDefault = self.currentDefaultSelection;
			self.parent.project.machine.summary = self.currentSummary;
			self.parent.project.machine.technicalData = self.currentTechnicalData;
            self.parent.project.machine.machineLayout = self.currentMachineLayout;
            self.parent.project.machine.referenceList = self.currentReferenceList;
            self.parent.project.machine.warrantyTermsAndConditions = self.currentWarrantyTermsAndConditions;
            self.parent.project.machine.serviceSupportTermsAndConditions = self.currentServiceSupportTermsAndConditions;
            self.parent.project.machine.id = self.id;
            self.parent.project.machine.rev = self.rev;
			
			console.log(self.parent.project.machine.machineName());
			// self.parent.machine.setMachineName(self.parent.project.machine);
			
			self.parent.newComponents.initialize(options.options);
            self.parent.complementaryGoods.initialize(prooffer_data.getMachineOptions('Complementary goods', 'NONE', false));
            self.parent.price.initialize();
            self.parent.price.update();
			self.parent.project.update();
			if(data == 'Budget') {
				self.parent.gotoStage('Price');
			}
			else if(data == 'New') {
				self.parent.gotoStage('Machine Options');
			}
		}
		else alert('A Machine Type, Machine Range, and a Machine Name must be selected first');
	};
};

function MachineOptions(parent) {
	var self = this;
	self.parent = parent;
	
	self.options_standard;
	self.options_optional;
	self.inStandardMode = ko.observable(true);
	self.goToStandard = function() {
		self.inStandardMode(true);
	};
	self.goToOptional = function() {
		self.inStandardMode(false);
	};
	self.hasSelection = function(options, subjectName) {
		for(var i = 0; i < options.length; i++) {
			subject = options[i];
			if(subject.subject == subjectName) {
				for(var j = 0; j < subject.chapters.length; j++) {
					chapter = subject.chapters[j];
					if(chapter.selector.hasSelection()) return true;
				}
			}
		}
		
		return false;
	};
	
	self.clear = function() {
		self.options_standard = undefined;
		self.options_optional = undefined;
	};	
};

function NewComponents(parent) {
    var self = this;
	self.parent = parent;
    
    self.editMode = ko.observable(false);
    self.componentName = ko.observable('');
    self.document = ko.observable('');
    self.price = ko.observable('0.00');
    self.description = ko.observable('');
	self.quantity = ko.observable(1);
	self.optional = ko.observable(false);
	self.subjects = ko.observableArray();
	self.selectedSubject = ko.observable();
	self.chapters = ko.observableArray();
	self.selectedChapter = ko.observable();
	self.chapterMap = {};
	self.standardNC = ko.observableArray();
	self.optionalNC = ko.observableArray();
	
	self.setChapters = function(subjectName) {
		if(subjectName != undefined) {
			if(self.chapters().length > 0) self.chapters.removeAll();
			chapters = self.chapterMap[subjectName];
			if (chapters == undefined) return;
			for(var i = 0; i < chapters.length; i++) {
				self.chapters.push(chapters[i]);
			}
		}
	};

	self.currentSubject = '';
	self.onSubjectChange = function() {
        self.currentSubject = self.selectedSubject();
        self.setChapters(self.currentSubject);
	};
	
	self.initialize = function(options, initdata) {
		
		console.log(initdata);
		
		if(options != undefined) { 
			if(self.standardNC().length > 0) self.standardNC.removeAll();
			if(self.optionalNC().length > 0) self.optionalNC.removeAll();
			if(initdata == undefined) {
				self.parent.project.newComponents.standard = {};
				self.parent.project.newComponents.optional = {};
			}
			if(self.subjects().length > 0) self.subjects.removeAll();
			if(self.chapters().length > 0) self.chapters.removeAll();
			for(var i = 0; i < options.length; i++) {
				var subject = options[i];
                if (subject.subject != "Complementary Goods") {
                    self.chapterMap[subject.subject] = [];
                    if(initdata == undefined) {
                        self.parent.project.newComponents.standard[subject.subject] = {};
                        self.parent.project.newComponents.optional[subject.subject] = {};
                    }
                    for(var j = 0; j < subject.chapters.length; j++) {
                        var chapter = subject.chapters[j];
                        self.chapterMap[subject.subject].push(chapter.chapterName);
                        if(initdata == undefined) {
                            self.parent.project.newComponents.standard[subject.subject][chapter.chapterName] = ko.observableArray();
                            self.parent.project.newComponents.optional[subject.subject][chapter.chapterName] = ko.observableArray();
                        }
                    }
                    self.subjects.push(subject.subject);
                }
			}
			if(self.subjects().length > 0) {
				self.selectedSubject(self.subjects()[0]);
				self.onSubjectChange();
			}
			if(initdata != undefined) {
				
				var schematree_standard = {};
				var schematree_optional = {};
				
				for(var i = 0; i < options.length; i++) {
					var subject = options[i];
					if (subject.subject != "Complementary Goods") {
						
						schematree_standard[subject.subject] = {};
						schematree_optional[subject.subject] = {};
						
						for(var j = 0; j < subject.chapters.length; j++) {
							var chapter = subject.chapters[j];
							schematree_standard[subject.subject][chapter.chapterName] = ko.observableArray();
							schematree_optional[subject.subject][chapter.chapterName] = ko.observableArray();
						}
					}
				}
				
				console.log(schematree_standard);
				
				var initializer = function(newComponents, container, schemaTree) {
					for(var subject in newComponents) {
						var chapters = newComponents[subject];
						for(var chapter in chapters) {
							var components = newComponents[subject][chapter];
							for(var i = 0; i < components.length; i++) {
								
								if(self.subjects().indexOf(subject) == -1 || self.chapterMap[subject].indexOf(chapter) == -1){
									components[i].subject = self.subjects()[0];
									components[i].chapter = self.chapterMap[self.subjects()[0]][0];
									 
									schemaTree[components[i].subject][components[i].chapter].push(components[i]);
									components[i].uncategorized = true;
								}else{
									schemaTree[subject][chapter].push(components[i]);
								}
								
								container.push(components[i]);
							}
						}
					}
					
					if(newComponents == initdata.newComponents.standard){
						self.parent.project.newComponents.standard = schemaTree;
					}
								
					if(newComponents == initdata.newComponents.optional){
						self.parent.project.newComponents.optional = schemaTree;
					}
				}
				
				initializer(initdata.newComponents.standard, self.standardNC, schematree_standard);
				initializer(initdata.newComponents.optional, self.optionalNC, schematree_optional);
			}
            self.clearForm();
		}
	}
    
    self.addNewComponent = function() {
		if(self.componentName() != '') {
			var newComponent = {
				subject: self.selectedSubject(),
				chapter: self.selectedChapter(),
				name: self.componentName(),
				document: self.document(),
				price: self.price(),
				description: self.description(),
				quantity: self.quantity(),
                type: self.optional(),
			};
			if(!self.optional()) {
				self.parent.project.newComponents.standard[newComponent.subject][newComponent.chapter].push(newComponent);
                self.parent.project.update();
				self.standardNC.push(newComponent);
			}
			else {
				self.parent.project.newComponents.optional[newComponent.subject][newComponent.chapter].push(newComponent);	
				self.parent.project.update();
				self.optionalNC.push(newComponent);
			}
            self.clearForm();
		}
    };
    self.selectedStandardItemIndex = ko.observable();
    self.selectedOptionalItemIndex = ko.observable();
    self.editItem = function(item) {
        self.currentItem = item;
        
        if (item.type) {
            self.selectedOptionalItemIndex(self.optionalNC.indexOf(item));
        }
        else {
            self.selectedStandardItemIndex(self.standardNC.indexOf(item));
        }
		
		if(item.uncategorized){
			delete item.uncategorized;
		}
        
        self.componentName(item.name);
        self.document(item.document);
        self.price(item.price);
        self.description(item.description);
        self.quantity(item.quantity);
        self.optional(false);
        self.selectedSubject(item.subject);
        self.onSubjectChange();
        self.selectedChapter(item.chapter);
        self.optional(item.type);
        self.editMode(true);
    }
    
    self.formTitle = ko.computed(function() {
        return (self.editMode()) ? 'Edit Component': 'Add New Component';
    });
    
    self.updateItem = function() {
        var item = self.currentItem;
        var index;
        var projectIndex;
        var updatedItem = {
                subject : self.selectedSubject(),
                chapter : self.selectedChapter(),
                name : self.componentName(),
                document : self.document(),
                price : self.price(),
                description : self.description(),
                quantity : self.quantity(),
                type : self.optional()
            };
            
        if (item.type) {
            projectIndex = self.parent.project.newComponents.optional[item.subject][item.chapter].indexOf(item);
            index = self.optionalNC.indexOf(item);
            if (self.optional() == item.type) {
                self.parent.project.newComponents.optional[item.subject][item.chapter].splice(projectIndex, 1);
                self.parent.project.newComponents.optional[updatedItem.subject][updatedItem.chapter].push(updatedItem);
                self.parent.project.update();
                self.optionalNC.splice(index, 1, updatedItem);
            }
            else {
                self.parent.project.newComponents.optional[item.subject][item.chapter].splice(projectIndex, 1);
                self.parent.project.newComponents.standard[updatedItem.subject][updatedItem.chapter].push(updatedItem);
                self.parent.project.update();
                self.optionalNC.splice(index, 1);
                self.standardNC.push(updatedItem);
            }
        }
        else {
            projectIndex = self.parent.project.newComponents.standard[item.subject][item.chapter].indexOf(item);
            index = self.standardNC.indexOf(item);
            if (self.optional() == item.type) {
                self.parent.project.newComponents.standard[item.subject][item.chapter].splice(projectIndex, 1);
                self.parent.project.newComponents.standard[updatedItem.subject][updatedItem.chapter].push(updatedItem);
                self.parent.project.update();
                self.standardNC.splice(index, 1, updatedItem);
            }
            else {
                self.parent.project.newComponents.standard[item.subject][item.chapter].splice(projectIndex, 1);
                self.parent.project.newComponents.optional[updatedItem.subject][updatedItem.chapter].push(updatedItem);
                self.parent.project.update();
                self.standardNC.splice(index, 1);
                self.optionalNC.push(updatedItem);
            }
        }
        self.editMode(false);
        self.selectedStandardItemIndex(2000);
        self.selectedOptionalItemIndex(2000);
        self.clearForm();
    }
    
    self.removeStandardNewComponent = function(item) {
        var index = self.parent.project.newComponents.standard[item.subject][item.chapter].indexOf(item);
        self.parent.project.newComponents.standard[item.subject][item.chapter].splice(index, 1);
		self.parent.project.update();
		self.standardNC.remove(item);
    }
	self.removeOptionalNewComponent = function(item) {
        var index = self.parent.project.newComponents.standard[item.subject][item.chapter].indexOf(item);
        self.parent.project.newComponents.optional[item.subject][item.chapter].splice(index, 1);
		self.parent.project.update();
		self.optionalNC.remove(item);
    }
    
	self.hasNewComponent = function(options, subject, chapter) {
		for(var i = 0; i < options().length; i++) {
			if(options()[i].subject == subject) {
				if(chapter == undefined) return true;
				else if(options()[i].chapter == chapter) return true;
			}
		}
		return false;
	}
    
    self.clearForm = function() {
        self.componentName('');
        self.document('');
        self.price('0.00');
        self.description('');
        self.quantity(1);
        self.optional(false);
        self.selectedSubject(self.subjects()[0]);
        self.onSubjectChange();
        self.onSubjectChange();
    }
    
    self.currentPdfDoc = '';
    self.uploadPdf = function(data, event) {
        var files = event.target.files;
        var pdfDoc = files[0];
        if (pdfDoc != undefined) {
            if (pdfDoc.name.match(/\.(pdf)$/) != null) {
                var formData = new FormData();
                
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'uploadUserDataFile/', true);
                xhr.onload = function(e) { 
                    self.document(pdfDoc.name);
					formData.append('content', pdfDoc);
					formData.append('id', self.parent.project.projectName);
					xhr.send(formData);
                };



            }
            else {
                $('#file-browser-new').val('');
                alert('Unsupported format.');
            }
        }
    };
    
    self.viewPdf = function() {
        window.open('/static/customPdf/' + self.document());
    }
    
    self.viewPdfActive = ko.computed(function() {
        return (self.document()) ? false : 'disabled';
    });
    
    self.browseFile = function() {
        $('#file-browser-new').click();
    };
	
	self.newComponentListRevised = [];
}

function ComplementaryGoods(parent) {
    var self = this;
    self.parent = parent;
    
    self.editMode = ko.observable(false);
    self.componentName = ko.observable('');
    self.document = ko.observable('');
    self.price = ko.observable('0.00');
    self.description = ko.observable('');
	self.quantity = ko.observable(1);
	self.optional = ko.observable(false);
    self.selectedChapter = ko.observable();
    self.standardCG = ko.observableArray();
    self.optionalCG = ko.observableArray();
    self.cgOptions = ko.observableArray();
    
    self.chapters = ko.computed(function() {
        var chapters = [];
        ko.utils.arrayForEach(self.cgOptions(), function(option){
            chapters.push(option.chapter);
        });
        return chapters;
    }, self);
    
    self.selectedPartName = ko.observable();
    self.partNames = ko.computed(function(){
        var partNames = [];
        ko.utils.arrayForEach(self.cgOptions(), function(option){
            if (option.chapter == self.selectedChapter()) { 
                for (var i = 0; i < option.parts.length; i++) {
                    partNames.push(option.parts[i].name);
                }
            }
        });
        return partNames;
    }, self);
    
    self.onPartNameChange = function() {
        ko.utils.arrayForEach(self.cgOptions(), function(option) {
            if (option.chapter == self.selectedChapter()) {
                for (var i = 0; i < option.parts.length; i++) {
                    if (option.parts[i].name == self.selectedPartName()) {
                        self.componentName(option.parts[i].name);
                        self.document(option.parts[i].document);
                        self.price(option.parts[i].price);
                        self.description(option.parts[i].description());
                        break;
                    }
                }
            }
        });
    };
    
    self.initialize = function (machineOptions, initData) {

        console.log(initData);
        self.machineOptionsCG = machineOptions;
        self.cgOptions.removeAll();
        for (var i = 0; i < machineOptions.length; i++) {
            var subject = machineOptions[i];
            
            if (subject.subject === "Complementary Goods") {
                for (var j = 0; j < subject.chapters.length; j++) {
                    var chapter = subject.chapters[j];
                    self.cgOptions.push({chapter: chapter.chapterName, parts: chapter.options});
                }
                self.selectedChapter(subject.chapters[0].chapterName);
            }
        }
        
        if (initData != undefined) {
            self.standardCG.removeAll();
            self.optionalCG.removeAll();
            
            self.standardCG = ko.observableArray(initData.complementaryGoods.standard.slice());
            self.optionalCG = ko.observableArray(initData.complementaryGoods.optional.slice());
            self.parent.project.complementaryGoods.standard = ko.observableArray(self.standardCG.slice());
            self.parent.project.complementaryGoods.optional = ko.observableArray(self.optionalCG.slice());
        }
    }
    
    self.addComplementaryGood = function() {
		if(self.componentName() != '') {
			var newCG = {
                subject: 'Complementary Goods',
				chapter: self.selectedChapter(),
				name: self.componentName(),
				document: self.document(),
				price: (parseFloat(self.price())) ? self.price() : '0',
				description: self.description(),
				quantity: self.quantity(),
                type: self.optional()
			};
			if(!self.optional()) {
				self.parent.project.complementaryGoods.standard.push(newCG);
                self.standardCG.push(newCG);
			}
			else {
				self.parent.project.complementaryGoods.optional.push(newCG);	
                self.optionalCG.push(newCG);
			}
            self.parent.project.update();
            self.clearForm();
		}
    };
    
    self.selectedStandardItemIndex = ko.observable();
    self.selectedOptionalItemIndex = ko.observable();
    self.editItem = function(item) {
        self.currentItem = item;
        
        if (item.type) {
            self.selectedOptionalItemIndex(self.optionalCG.indexOf(item));
        }
        else {
            self.selectedStandardItemIndex(self.standardCG.indexOf(item));
        }
        
        self.selectedChapter(item.chapter);
        self.price(item.price);
        self.description(item.description);
        self.quantity(item.quantity);
        self.componentName(item.name);
        self.optional(item.type);
        self.document(item.document);
        self.editMode(true);
    }
    
    self.formTitle = ko.computed(function() {
        return (self.editMode()) ? 'Edit Component': 'Add New Component';
    });
    
    self.updateItem = function() {
        var item = self.currentItem;
        var index;
        var projectIndex;
        var updatedItem = {
                subject : 'Complementary Goods',
                chapter : self.selectedChapter(),
                name : self.componentName(),
                document : self.document(),
                price : self.price(),
                description : self.description(),
                quantity : self.quantity(),
                type : self.optional()
            };
            
        if (item.type) {
            projectIndex = self.parent.project.complementaryGoods.optional.indexOf(item);
            index = self.optionalCG.indexOf(item);
            if (self.optional() == item.type) {
                self.parent.project.complementaryGoods.optional.splice(projectIndex, 1, updatedItem);
                self.parent.project.update();
                self.optionalCG.splice(index, 1, updatedItem);
            }
            else {
                self.parent.project.complementaryGoods.optional.splice(projectIndex, 1);
                self.parent.project.complementaryGoods.standard.push(updatedItem);
                self.parent.project.update();
                self.optionalCG.splice(index, 1);
                self.standardCG.push(updatedItem);
            }
        }
        else {
            projectIndex = self.parent.project.complementaryGoods.standard.indexOf(item);
            index = self.standardCG.indexOf(item);
            if (self.optional() == item.type) {
                self.parent.project.complementaryGoods.standard.splice(projectIndex, 1, updatedItem);
                self.parent.project.update();
                self.standardCG.splice(index, 1, updatedItem);
            }
            else {
                self.parent.project.complementaryGoods.standard.splice(projectIndex, 1);
                self.parent.project.complementaryGoods.optional.push(updatedItem);
                self.parent.project.update();
                self.standardCG.splice(index, 1);
                self.optionalCG.push(updatedItem);
            }
        }
        self.editMode(false);
        self.selectedStandardItemIndex(2000);
        self.selectedOptionalItemIndex(2000);
        self.clearForm();
    }
    
    self.currentPdfDoc = '';
    self.uploadPdf = function(data, event) {
        var files = event.target.files;
        var pdfDoc = files[0];
        if (pdfDoc != undefined) {
            if (pdfDoc.name.match(/\.(pdf)$/) != null) {
                var formData = new FormData();
                
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'uploadUserDataFile/', true);
                xhr.onload = function(e) { 
                    self.document(pdfDoc.name);
                };
                formData.append('content', pdfDoc);
                formData.append('id', self.parent.project.projectName);
                xhr.send(formData);
            }
            else {
                $('#file-browser-cg').val('');
                alert('Unsupported format.');
            }
        }
    };
    
    self.viewPdf = function() {
        window.open('/static/customPdf/' + self.document());
    }
    
    self.browseFile = function() {
        $('#file-browser-cg').click();
    };
    
    self.removeComplementaryGood = function(item) {
        if (!item.type) {
            self.parent.project.complementaryGoods.standard.remove(item);
            self.standardCG.remove(item);
        }
        else {
            self.parent.project.complementaryGoods.optional.remove(item);
            self.optionalCG.remove(item);
        }
        self.parent.project.update();
    }
    
    self.clearTable = function() {
        self.standardCG.removeAll();
        self.optionalCG.removeAll();
    }
    
    self.clearForm = function() {
        self.selectedChapter('Transport');
        self.document('');
        self.optional(false);
    }
       
    self.hasComplementaryGoods = function(category) {
        if (category === 'standard') {
            return (self.parent.project.complementaryGoods.standard().length) ? true : false;
        }
        else {
            return (self.parent.project.complementaryGoods.optional().length) ? true : false;
        } 
    }
}

function Price(parent) {
    var self = this;
	self.parent = parent;
    
    self.currencyTypes = prooffer_data.getCurrencyTypes();
    self.discountTypes = ko.observableArray();
    
    self.onCurrencyChange = function(){
		self.parent.project.price.offer_settings.exchange_rate(1.0/self.parent.project.price.offer_settings.exchange_rate());
        self.initCurrency();
    }
	
	self.initCurrency = function(){
        var currentDiscountType = self.parent.project.price.standard_discount_type();
        self.discountTypes.removeAll();
        ko.utils.arrayForEach(prooffer_data.getDiscountTypes(), function(type){
            if (type == 'Absolute')
                type += (' (' + self.parent.project.price.offer_settings.currency() + ')');
            self.discountTypes.push(type);
        });
        self.parent.project.price.standard_discount_type((currentDiscountType == 'Percentage' || currentDiscountType == undefined) ? self.discountTypes()[0] : self.discountTypes()[1]);
    }
    
	self.totalMSP = ko.observable(0);
	self.totalCN = ko.observable(0);
    self.discount = ko.observable(0);
	self.totalDiscounted = ko.observable(0);
	self.total = 0;
    
    self.initialize = function() {
		if(self.parent.privilege.isAgent) {
			self.parent.project.price.standard_commission(self.parent.privilege.commission + '');
			self.parent.project.price.standard_negotiation(self.parent.privilege.negotiation + '');
		} else {
			self.parent.project.price.standard_commission('');
			self.parent.project.price.standard_negotiation('');
		}
        self.parent.project.price.standard_discount_type('Percentage');
        self.parent.project.price.standard_discount('');
        self.parent.project.price.optional_commission('');
        self.parent.project.price.optional_negotiation('');
        self.parent.project.price.offer_settings.date(prooffer_data.getCurrentDate());
		// console.log(self.parent.project.machine);
		// if(self.parent.project.machine.machineName() == "PC600" || self.parent.project.machine.machineName() == "PC600c" ){
			// self.parent.project.price.offer_settings.currency(self.currencyTypes[1]);
			// console.log(self.currencyTypes[1]);
		// }
		// else self.parent.project.price.offer_settings.currency(self.currencyTypes[0]);
		
		
		
		if(self.parent.machine.currentDefaultCurrency == 'USD'){
			self.parent.project.price.offer_settings.currency(self.currencyTypes[1]);
			self.onCurrencyChange();
		}else{
			self.parent.project.price.offer_settings.currency(self.currencyTypes[0]);
			 self.initCurrency();
		}
		
		console.log("initialized:     " + self.parent.project.price.offer_settings.currency());
		
		if(self.parent.promptExchangeRate() !== ''){
			self.parent.project.price.offer_settings.exchange_rate(self.parent.promptExchangeRate());
		}else{
			self.parent.project.price.offer_settings.exchange_rate('');
		}
		self.parent.promptExchangeRate('');
       
    }
    
	self.addToTotal = function(price, quantity, exchangeRate, isUSD) {
		
        exchangeRate = (typeof exchangeRate === "undefined" || exchangeRate === "") ? 1 : parseFloat(exchangeRate);
		if(isUSD !== undefined){
			if((self.parent.project.price.offer_settings.currency() === "USD") == (isUSD == "True")){
				exchangeRate = 1;
			}
		}else{
			exchangeRate = 1;
		}
		console.log(("added" + price * quantity * exchangeRate));
		self.total = self.total + (price * quantity * exchangeRate);
		return true;
	};
	
	self.setTotalMSP = function() {
		self.totalMSP(parseFloat(self.parent.project.machine.initialPrice) + self.total);
	};

    self.computeMSP = function(price, quantity, exchangeRate, isUSD) {
        var aPrice = parseFloat(price);
        var aQuantity = parseFloat(quantity);
        exchangeRate = (typeof exchangeRate === "undefined" || exchangeRate === "") ? 1 : parseFloat(exchangeRate);
		// console.log("Currency: " + self.parent.project.price.offer_settings.currency() + " isUSD: " + isUSD + " = ");
		
		console.log(isUSD);
		if(isUSD !== undefined ){
			if((self.parent.project.price.offer_settings.currency() === "USD") == (isUSD == "True")){
				exchangeRate = 1;
			}
		}else{
			exchangeRate = 1;
		}
		
		
		return (aPrice * aQuantity * exchangeRate).toFixed();
        
    };
	
	self.computeCN = function(price, commission, negotiation, quantity, exchangeRate, isUSD) { 
		commission = parseFloat(commission);
		negotiation = parseFloat(negotiation);
        exchangeRate = (typeof exchangeRate === "undefined" || exchangeRate === "") ? 1 : parseFloat(exchangeRate);
		
		if(isUSD !== undefined ){
			if((self.parent.project.price.offer_settings.currency() === "USD") == (isUSD == "True")){
				exchangeRate = 1;
			}
		}else{
			exchangeRate = 1;
		}
		
		// console.log(typeof quantity);
		
		if(isNaN(commission)) commission = 0.00;
		if(isNaN(negotiation)) negotiation = 0.00;
		var cn = 0;
		cnrate =  1 / ((100 - (commission + negotiation))/100);
		//if computing totalCN
		cn = price * cnrate * exchangeRate
        if (typeof quantity !== "undefined") cn = price * parseFloat(quantity) * cnrate * exchangeRate;
        return cn.toFixed();
	};
	
	self.computeDiscounted = function(cn, discount, type) {
        var res;
        discount = parseFloat(discount);
		if(isNaN(discount)) discount = 0.00;
		if(type == 'Percentage') {
            self.discount((cn * discount/100).toFixed());
			res = cn - (cn * discount/100);
        }
		else {
            self.discount(discount.toFixed());
            res = cn - discount;
        }
        if(isNaN(res)) res = 0.00;
        return res.toFixed();
	};
    
    self.updateFlag = ko.observable(false);
	self.update = function() {
		self.updateFlag(!self.updateFlag());
	};
    
	ko.computed(function() {
        self.updateFlag();
		//try {
            var standard = self.parent.machineOptions.options_standard;
            if (standard !== undefined) {
                self.total = 0;
                for(var isubject = 0; isubject < standard.length; isubject++) {
                    var subject = standard[isubject];
                    var subjectContainer = { name: subject.subject, chapters: []};
                    for(var ichapter = 0; ichapter < subject.chapters.length; ichapter++) {
                        var chapter = subject.chapters[ichapter];
						
                        if(chapter.selector.hasSelection() || self.parent.newComponents.hasNewComponent(self.parent.newComponents.standardNC,subject.subject,chapter.chapterName)) {
                            var chapterContainer = { name: chapter.chapterName, options: []};
                            var chapterName = chapter.chapterName;
							
                            for(var ioption = 0; ioption < chapter.options.length; ioption++) {
                                var option = chapter.options[ioption];
                                if(option.isSelected()) {
                                    self.addToTotal(option.price, option.quantity(), self.parent.project.price.offer_settings.exchange_rate(), option.isUSD());
                                }
                            }
                            // console.log(subject.subject + " " + chapter.chapterName);
                            if (subject.subject !== "Complementary Goods") {
								try{
								// console.log("complementary goods" + subject.subject + " " + chapter.chapterName);
								if(self.parent.project.newComponents.standard[subject.subject][chapter.chapterName] == undefined) {//Uncaught TypeError: Cannot read property 'Standard set macros' of undefined
									self.parent.project.newComponents.standard[subject.subject][chapter.chapterName] = ko.observableArray();
								}
                                var newComponents = self.parent.project.newComponents.standard[subject.subject][chapter.chapterName].slice();
                                for(var ioption = 0; ioption < newComponents.length; ioption++) {
                                    self.addToTotal(newComponents[ioption].price, newComponents[ioption].quantity, self.parent.project.price.offer_settings.exchange_rate());                       
                                }
								}catch(e){return;}
                            }
                        }
                    }
                }
                var additionalComplementaryGoods = self.parent.project.complementaryGoods.standard.slice();
                for (var iCg = 0; iCg < additionalComplementaryGoods.length; iCg++) {
                    self.addToTotal(additionalComplementaryGoods[iCg].price, additionalComplementaryGoods[iCg].quantity, self.parent.project.price.offer_settings.exchange_rate());
                }
            }
            self.setTotalMSP();
			// console.log(self.computeCN(self.totalMSP(), self.parent.project.price.standard_commission(), self.parent.project.price.standard_negotiation()));
			self.totalCN(self.computeCN(self.totalMSP(), self.parent.project.price.standard_commission(), self.parent.project.price.standard_negotiation()));
			self.totalDiscounted(self.computeDiscounted(self.totalCN(), self.parent.project.price.standard_discount(), self.parent.project.price.standard_discount_type()));
		//} catch(err){ console.log(err);}
	}, self).extend({throttle: 500});
	
	self.resetTotal = function() {
		self.total = 0;
	};
	
	self.formatPrice = function(price) {
		var p = parseFloat(price);
		if(isNaN(p)) p = 0;
        return p.toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, self.parent.project.price.offer_settings.number_format());
	};
	
	self.clear = function() {
		self.totalMSP(0);
		self.totalCN(0);
		self.totalDiscounted(0);
		self.total = 0;
	};
    
    self.chapterDisplay = '';
    self.currentChapterName = '';
	self.setCurrentChapterName = function(name) { self.currentChapterName = name;}
	//self.parent.project.price.offer_price = ko.observable(self.formatPrice(self.totalDiscounted));
	////console.log(self.parent.project.price.offer_price());
	
};

function Offer(parent) {
	var self = this;
	self.parent = parent;
	
    self.arrow = ko.observable('<<');
    self.showSideBar = ko.observable(true);
    self.showOptionList = ko.observable(false);
    
    self.toggleSideBar = function() {
        self.showSideBar(!(self.showSideBar()));
        self.arrow((self.showSideBar() == true)? '<<' : '>>');
    };
    
    self.updateFlag = ko.observable(false); 
    self.update = function() {
		self.updateFlag(!self.updateFlag());
	};
	self.allowUpdate = ko.observable(false);
	self.introductionTemplates = ko.observableArray(prooffer_data.getIntroductionTemplates());
	self.introductionTemplate = ko.observable();
	self.termsAndConditionsTemplates = ko.observableArray(prooffer_data.getTermsAndConditionsTemplates());
	self.termsAndConditionsTemplate = ko.observable('default');
    self.initializeTemplates = function() {
		//Initialize Introduction Templates
        self.introductionTemplates.removeAll();       
        ko.utils.arrayForEach(prooffer_data.getIntroductionTemplates(), function(item){
            self.introductionTemplates.push(item);
        });
        
        self.introductionTemplates.push('custom');
        self.introductionTemplate(self.parent.project.introductionTemplate());
        
        //Initialize Terms and Conditions Template
        self.termsAndConditionsTemplates.removeAll();
        ko.utils.arrayForEach(prooffer_data.getTermsAndConditionsTemplates(), function(item){
            self.termsAndConditionsTemplates.push(item);
        });

        self.termsAndConditionsTemplates.push('custom');
        self.termsAndConditionsTemplate(self.parent.project.termsAndConditionsTemplate());
    };
	
    self.setIntroDetails = function(intro) {
        intro.find('.txt-date').text(prooffer_data.getCurrentDate());
        intro.find('.txt-reference').text(self.parent.project.projectName);
        intro.find('.txt-title').text(self.parent.project.customerDetails.gender() == 'Male' ? 'Mr' : 'Ms');
        intro.find('.txt-name').text(self.parent.project.customerDetails.contactPerson());
        intro.find('.txt-machine').text(self.parent.project.machine.machineName());
        
        return intro;
    };
	
    self.hasIntroChanged = function(currentIntro, templateIntro) {
        currentIntro.find('.txt-sales-engineer').html('');
        var template = self.setIntroDetails(templateIntro);
        template.find('.txt-sales-engineer').html('');
        return (template.html() != currentIntro.html());
    };
	
    self.saveIntroContent = function(content) {
        var container = $('<div class="reset"></div>');
        container.append('<div id="content-wrapper"></div>').find('#content-wrapper').append(content);
        
        self.parent.project.introductionText(container.html());
        
        return container;
    };
	
	self.introduction = ko.computed({
        read: function() {
            var intro;
			self.parent.project.introductionTemplate(self.introductionTemplate());
			
			if (self.introductionTemplate() != 'custom') {
				intro = $(prooffer_data.getIntroductionTemplate(self.introductionTemplate()));
				intro = self.saveIntroContent(intro);
				intro = self.setIntroDetails(intro);
				if (CKEDITOR.instances['introRichText'] != undefined)
					CKEDITOR.instances['introRichText'].setData(intro.html())
					
				return intro.html();
			}
			else {
				intro = $(self.parent.project.introductionText());
				intro = self.setIntroDetails(intro);
				return intro.html();
			}
        },
        write: function(content) {
			self.saveIntroContent(content);
			self.introductionTemplate('custom');
        }
    });    

	self.addressTemplates = ko.observableArray(prooffer_data.getAddressTemplates());
	self.addressTemplate = ko.observable('default');
	self.address = ko.observable('');
	self.getAddressTemplate = function(templateName) {
		self.address(prooffer_data.getAddressTemplate(templateName));
	};
	
    ko.computed(function() {
        self.updateFlag();
		if(self.allowUpdate()) {
			self.getAddressTemplate(self.addressTemplate());
			self.parent.project.addressTemplate(self.addressTemplate());
		}
	}, self);
	
	
	self.signature = ko.observable(prooffer_data.getSignatures());
    self.signatures = ko.computed(function() {
        return ['Igor Gieltjes'];
    });
	
	self.termsAndConditions = ko.computed({
        read: function(){
			if (self.termsAndConditionsTemplate() == 'default') return '';
			self.parent.project.termsAndConditionsTemplate(self.termsAndConditionsTemplate());
			if (self.termsAndConditionsTemplate() != 'custom') {
				var sig = $(prooffer_data.getTermsAndConditionsTemplate(self.termsAndConditionsTemplate()));
				sig.find('.signature').attr('src', self.signature());
				if (CKEDITOR.instances['termsRichText'] != undefined)
					CKEDITOR.instances['termsRichText'].setData(sig.html())
				self.parent.project.termsAndConditionsText(sig.html());
				return sig.html();
			}
			else {
				return self.parent.project.termsAndConditionsText();
			}
        },
        write: function(text) {
            //var template = $(prooffer_data.getTermsAndConditionsTemplate(self.termsAndConditionsTemplate()));
            //template.find('.signature').attr('src', self.signature());
            //if (text != template.html()) {
				CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
                self.parent.project.termsAndConditionsText(text);
                self.termsAndConditionsTemplate('custom');
            //}
        }
    });

    self.visibilityOptions = ko.observableArray();
    self.initializeVOptions = function(vOptions) {
        self.visibilityOptions.removeAll();
        self.parent.project.visibilityOptions.removeAll();
        ko.utils.arrayForEach(vOptions.slice(), function(item){
            self.visibilityOptions.push(item);
            self.parent.project.visibilityOptions.push(item);
        });
        self.parent.project.update();
    };
     
    self.addOption = function() {
        self.visibilityOptions.push({ include: false, title: '', pdf: '', type: 'custom'});
        self.parent.project.visibilityOptions.push({ include: false, title: '', pdf: '', type: 'custom'});
        self.parent.project.update();
    };
    
    self.includeChanged = function(option) {
        var newOption = {include: option.include, title: option.title, pdf: option.pdf, type: option.type};
        var index = self.visibilityOptions.indexOf(option);
        self.visibilityOptions.splice(index, 1, newOption);
        self.parent.project.visibilityOptions.splice(index, 1, newOption);
        self.parent.project.update();
    };
    
    self.titleChanged = function(option) {
        var newOption = {include: option.include, title: option.title, pdf: option.pdf, type: 'custom'};
        var index = self.visibilityOptions.indexOf(option);
        self.visibilityOptions.splice(index, 1, newOption);
        self.parent.project.visibilityOptions.splice(index, 1, newOption);
        self.parent.project.update();
    };
    
    self.optionUp = function(option) {
        var index = self.visibilityOptions.indexOf(option);
        if (index != 0) {
            var tempOption = self.visibilityOptions()[index - 1];
            self.visibilityOptions.splice(index - 1, 1, option);
            self.visibilityOptions.splice(index, 1, tempOption);
            
            self.parent.project.visibilityOptions.splice(index - 1, 1, option);
            self.parent.project.visibilityOptions.splice(index, 1, tempOption);
            self.parent.project.update();
        }
    };
    
    self.optionDown = function(option) {
        var index = self.visibilityOptions.indexOf(option);
        if (index < (self.visibilityOptions().length - 1)) {
            var tempOption = self.visibilityOptions()[index + 1];
            self.visibilityOptions.splice(index + 1, 1, option);
            self.visibilityOptions.splice(index, 1, tempOption);
            
            self.parent.project.visibilityOptions.splice(index + 1, 1, option);
            self.parent.project.visibilityOptions.splice(index, 1, tempOption);
            self.parent.project.update();
        }
    };
    
    self.showArrowUp = function(option) {
        var index = self.visibilityOptions.indexOf(option);
        return ((index == 0) ? "/static/img/up_arrow_disabled.png" : "/static/img/up_arrow.png");
    };
    
    self.showArrowDown = function(option) {
        var index = self.visibilityOptions.indexOf(option);
        return (index < (self.visibilityOptions().length - 1)) ? "/static/img/down_arrow.png" : "/static/img/down_arrow_disabled.png";
    };
    
    self.showActiveIcon = function(option) {
        var index = self.visibilityOptions.indexOf(option);
        return (option.pdf) ? "/static/img/attachment_icon_active.png" : "/static/img/attachment_icon_inactive.png";
    };
    
    self.currentCustomOptionIndex = ko.observable();
    self.browsePdf = function(option) {
        var index = self.visibilityOptions.indexOf(option);
        self.currentCustomOptionIndex(index);
        $('#add-option-browse').click();
    };
    
    self.uploadPdf = function(data, event) {
        var files = event.target.files;
        var pdfDoc = files[0];
        if (pdfDoc != undefined) {
            if (pdfDoc.name.match(/\.(pdf)$/) != null) {
			
                var formData = new FormData();
				
                var xhr = new XMLHttpRequest();
				
                xhr.open('POST', 'uploadUserDataFile/', true);
				
                xhr.onload = function(e) { 
                    var index = self.currentCustomOptionIndex();
					var option = self.visibilityOptions()[index];
                    var newOption = {include: option.include, title: option.title, pdf: pdfDoc.name, type: 'custom'};
					self.visibilityOptions.splice(index, 1, newOption);
                    self.parent.project.visibilityOptions.splice(index, 1, newOption);
                    self.parent.project.update();
                };
                formData.append('content', pdfDoc);
                formData.append('id', self.parent.project.projectName);
                xhr.send(formData);
            }
            else {
                $('#add-option-browse').val('');
                alert('Unsupported format.');
            }
        }
    };
    
	self.generateOffer = function(draft) {
        var offer = {};
		offer.draft = draft;
		offer.image = self.parent.project.machine.image;
		offer.reference = self.parent.project.projectName;
        offer.customerDetails = self.parent.project.customerDetails;
        offer.machineName = self.parent.project.machine.machineName();
		offer.pdFrontPage = self.parent.project.machine.frontPage;
		offer.pdIntroduction = self.parent.project.machine.introduction;
		var machineType = self.parent.project.machine.machineType();
		var title = 'Profiling Machine';
		if(machineType.indexOf('PPM') != -1) title = 'Pipe Profiling Machine';
		else if(machineType.indexOf('RPM') != -1) title = 'Robotic Profiling Machine';
		offer.scopeTitle = title;
		offer.scopeSummary = self.parent.project.machine.summary;
		offer.technicalData = self.parent.project.machine.technicalData;
        offer.machineLayout = self.parent.project.machine.machineLayout;
        offer.referenceList = self.parent.project.machine.referenceList;
        offer.warrantyTermsAndConditions = self.parent.project.machine.warrantyTermsAndConditions;
        offer.serviceSupportTermsAndConditions = self.parent.project.machine.serviceSupportTermsAndConditions;
        offer.machineId = self.parent.project.machine.id;
        offer.machineRev = self.parent.project.machine.rev;
        offer.introduction = self.introduction();
		offer.address = self.address();
		offer.showItemPrice = self.parent.project.showItemPrice;
        offer.currency = self.parent.project.price.offer_settings.currency();
        offer.scopeOfSupply = [];
        var standard = self.parent.machineOptions.options_standard;
		if(standard != undefined) {
			for(var isubject = 0; isubject < standard.length; isubject++) {
				var subject = standard[isubject];
				var subjectContainer = { name: subject.subject, chapters: []};
				for(var ichapter = 0; ichapter < subject.chapters.length; ichapter++) {
					var chapter = subject.chapters[ichapter];
					if(chapter.selector.hasSelection() || self.parent.newComponents.hasNewComponent(self.parent.newComponents.standardNC,subject.subject,chapter.chapterName)) {
						var chapterContainer = { name: chapter.chapterName, options: []};
						var chapterName = chapter.chapterName;
						for(var ioption = 0; ioption < chapter.options.length; ioption++) {
							var option = chapter.options[ioption];
							if(option.isSelected()) {
								var qty = option.quantity();
								var amount = 0;
								if(self.parent.project.showItemPrice) amount = self.parent.price.formatPrice(self.parent.price.computeCN(option.price, self.parent.project.price.standard_commission(), self.parent.project.price.standard_negotiation(), qty, self.parent.project.price.offer_settings.exchange_rate(),option.isUSD()));
								chapterContainer.options.push({name: option.name, description: option.description, quantity: qty, pdf: option.pdf, price: amount, id: option.id});
								chapterName = '';
							}
						}
						
						if (subject.subject !== "Complementary Goods") {
						    if(self.parent.project.newComponents.standard[subject.subject][chapter.chapterName] == undefined) {
								self.parent.project.newComponents.standard[subject.subject][chapter.chapterName] = ko.observableArray();
							}
							var newComponents = self.parent.project.newComponents.standard[subject.subject][chapter.chapterName].slice();
							for(var ioption = 0; ioption < newComponents.length; ioption++) {
								var option = newComponents[ioption];
								var qty = option.quantity;
								var amount = 0;
                                var pdfDoc = (option.document) ? 'customPdf/' + option.document : '';
                                
								if(self.parent.project.showItemPrice) amount = self.parent.price.formatPrice(self.parent.price.computeCN(option.price, self.parent.project.price.standard_commission(), self.parent.project.price.standard_negotiation(), qty, self.parent.project.price.offer_settings.exchange_rate()));
								chapterContainer.options.push({name: option.name, description: option.description, quantity: qty, pdf: pdfDoc, price: amount, id: option.id});                       
							}
						}
						
						subjectContainer.chapters.push(chapterContainer);
                    }
                }
                if(subjectContainer.chapters.length > 0) offer.scopeOfSupply.push(subjectContainer);
            }
            if (self.parent.complementaryGoods.hasComplementaryGoods('standard')) {
                cgOptions = self.parent.complementaryGoods.machineOptionsCG;
                for (var i = 0; i < cgOptions.length; i++) {
                    var subject = cgOptions[i];
                    var subjectContainer = { name: (subject.subject == 'Complementary Goods' ? 'Additional goods' : subject.subject) , chapters: []};
                    for (j = 0; j < subject.chapters.length; j++) {
                        var chapter = subject.chapters[j];
                        var chapterContainer = { name: chapter.chapterName, options: []};
                        var additionalComplementaryGoods = self.parent.project.complementaryGoods.standard.slice();
                        for (var iCg = 0; iCg < additionalComplementaryGoods.length; iCg++) {
                            if (chapter.chapterName == additionalComplementaryGoods[iCg].chapter) {
                                var amount = (self.parent.project.showItemPrice) ? self.parent.price.formatPrice(self.parent.price.computeCN(additionalComplementaryGoods[iCg].price, self.parent.project.price.standard_commission(), self.parent.project.price.standard_negotiation(), additionalComplementaryGoods[iCg].quantity, self.parent.project.price.offer_settings.exchange_rate())) : 0;
                                var pdfDoc = (additionalComplementaryGoods[iCg].document) ? 'customPdf/' + additionalComplementaryGoods[iCg].document : '';
                                chapterContainer.options.push({ name: additionalComplementaryGoods[iCg].name, 
                                                                description: additionalComplementaryGoods[iCg].description, 
                                                                quantity: additionalComplementaryGoods[iCg].quantity, 
                                                                pdf: pdfDoc, 
                                                                price: amount, 
                                                                id: option.id });
                            }
                        }
                        subjectContainer.chapters.push(chapterContainer);
                    }
                }
                if(subjectContainer.chapters.length > 0) offer.scopeOfSupply.push(subjectContainer);
            }
            
		} 
        else {
			if(!confirm("No machine was selected, do you wish to continue?")) return;
		}

		offer.showDiscount = self.parent.project.showDiscount;
        offer.originalPrice = self.parent.price.formatPrice(self.parent.price.totalCN());
        offer.discount = self.parent.price.formatPrice(self.parent.price.discount());
        offer.scopeOfSupplyAmount = self.parent.price.formatPrice(self.parent.price.totalDiscounted());
		        
        offer.optionList = [];
        var optional = self.parent.machineOptions.options_optional;
		if(optional != undefined) {
			for(var isubject = 0; isubject < optional.length; isubject++) {
				var subject = optional[isubject];
				var subjectContainer = {name: subject.subject, chapters: []};
				for(var ichapter = 0; ichapter < subject.chapters.length; ichapter++) {
					var chapter = subject.chapters[ichapter];
					if(chapter.selector.hasSelection() || self.parent.newComponents.hasNewComponent(self.parent.newComponents.optionalNC,subject.subject,chapter.chapterName)) {
						var chapterContainer = { name: chapter.chapterName, options: []};
						var chapterName = chapter.chapterName;
						for(var ioption = 0; ioption < chapter.options.length; ioption++) {
							var option = chapter.options[ioption];
							if(option.isSelected()) {
								var amount = self.parent.price.formatPrice(self.parent.price.computeCN(option.price, self.parent.project.price.optional_commission(), self.parent.project.price.optional_negotiation(), option.quantity(), self.parent.project.price.offer_settings.exchange_rate(),option.isUSD()));
								chapterContainer.options.push({name: option.name, description: option.description, quantity: option.quantity, pdf:'', price: amount, id: option.id});
								chapterName = '';
							}
						}
						
						if (subject.subject !== "Complementary Goods") {
							if(self.parent.project.newComponents.optional[subject.subject][chapter.chapterName] == undefined) {
								self.parent.project.newComponents.optional[subject.subject][chapter.chapterName] = ko.observableArray();
							}
							var newComponents = self.parent.project.newComponents.optional[subject.subject][chapter.chapterName].slice();
							for(var ioption = 0; ioption < newComponents.length; ioption++) {
								var option = newComponents[ioption];
								var pdfDoc = (option.document) ? 'customPdf/' + option.document : '';
								var qty = option.quantity;
								var amount = 0;
								amount = self.parent.price.formatPrice(self.parent.price.computeCN(option.price, self.parent.project.price.optional_commission(), self.parent.project.price.optional_negotiation(), qty, self.parent.project.price.offer_settings.exchange_rate()));
								chapterContainer.options.push({name: option.name, description: option.description, quantity: qty, pdf: pdfDoc, price: amount, id: option.id});   
							}
						}
                        
						subjectContainer.chapters.push(chapterContainer);
					}
				}
				if(subjectContainer.chapters.length > 0) offer.optionList.push(subjectContainer);
			}
            if (self.parent.complementaryGoods.hasComplementaryGoods('optional')) {
                cgOptions = self.parent.complementaryGoods.machineOptionsCG;
                for (var i = 0; i < cgOptions.length; i++) {
                    var subject = cgOptions[i];
                    var subjectContainer = { name: (subject.subject == 'Complementary Goods' ? 'Additional goods' : subject.subject), chapters: []};
                    for (j = 0; j < subject.chapters.length; j++) {
                        var chapter = subject.chapters[j];
                        var chapterContainer = { name: chapter.chapterName, options: []};
                        var additionalComplementaryGoods = self.parent.project.complementaryGoods.optional.slice();
                        for (var iCg = 0; iCg < additionalComplementaryGoods.length; iCg++) {
                            if (chapter.chapterName == additionalComplementaryGoods[iCg].chapter) {
                                var qty = additionalComplementaryGoods[iCg].quantity;
                                var amount = self.parent.price.formatPrice(self.parent.price.computeCN(additionalComplementaryGoods[iCg].price, self.parent.project.price.optional_commission(), self.parent.project.price.optional_negotiation(), qty, self.parent.project.price.offer_settings.exchange_rate()));
                                var pdfDoc = (additionalComplementaryGoods[iCg].document) ? 'customPdf/' + additionalComplementaryGoods[iCg].document : '';
                                chapterContainer.options.push({ name: additionalComplementaryGoods[iCg].name, 
                                                                description: additionalComplementaryGoods[iCg].description, 
                                                                quantity: additionalComplementaryGoods[iCg].quantity, 
                                                                pdf: pdfDoc, 
                                                                price: amount, 
                                                                id: option.id });
                            }
                        }
                        subjectContainer.chapters.push(chapterContainer);
                    }
                }
                if(subjectContainer.chapters.length > 0) offer.optionList.push(subjectContainer);
            }
		}
		
		offer.termsAndConditions = self.termsAndConditions();
        offer.signature = self.parent.project.signature;
		offer.include = self.parent.project.visibilityOptions.slice();
        offer.productDescriptionIntro = false;
        for (var i = 0; i < offer.include.length; i++) {
            if (offer.include[i]['include']) {
                if (offer.include[i]['title'] == 'Product Description Introduction') {
                    offer.productDescriptionIntro = true;
                }
            }
        }

		prooffer_data.generateOffer(ko.toJSON(offer));
	};
	
	self.createOffer = function() {
		errorsFound = false;
		
		for(i = 0;i < self.parent.newComponents.standardNC().length; i++){
			if(self.parent.newComponents.standardNC()[i].uncategorized){
				alert("New Standard Component " + self.parent.newComponents.standardNC()[i].name + " is uncategorized. Please edit item.");
				errorsFound = true;
			}
		}
		
		for(i = 0;i < self.parent.newComponents.optionalNC().length; i++){
			if(self.parent.newComponents.optionalNC()[i].uncategorized){
				alert("New Optional Component " + self.parent.newComponents.optionalNC()[i].name + " is uncategorized. Please edit item.");
				errorsFound = true;
			}
		}
		
		if(self.termsAndConditions().length = 0) {
			alert("Terms and Conditions are not yet set!");
			errorsFound = true;
		} 
		
		if(!errorsFound) {
			//console.log(self.termsAndConditions());
			self.generateOffer(false);



		}
	}
	
	self.createDraft = function() { self.generateOffer(true);};
	
	self.currentChapterName = '';
	self.setCurrentChapterName = function(name) { self.currentChapterName = name;};
    
    self.hasOptionList = function() {
        var optional = self.parent.machineOptions.options_optional;
        if (optional != undefined) {
            for(var i = 0; i < optional.length; i++) {
                var subject = optional[i];

                if (self.parent.machineOptions.hasSelection(self.parent.machineOptions.options_optional, subject.subject) 
                    || self.parent.newComponents.hasNewComponent(self.parent.newComponents.optionalNC, subject.subject) 
                    || self.parent.complementaryGoods.hasComplementaryGoods('optional')) {
                
                    self.showOptionList(true);
                    break;
                }
                else {
                    self.showOptionList(false);
                }
            }
        }
    };
};


