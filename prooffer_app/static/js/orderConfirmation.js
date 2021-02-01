var prooffer_data = new Data();

function Contract() {
	var self = this;
	
	self.external = ko.observable(false);
	
	self.title = ko.observable(''); 
	self.incoterms = ko.observable('EXW');
	self.incoterms_freight = ko.observable();
	
	self.introduction = {
		day: ko.observable(),
		month_year: ko.observable(),
		project_number: ko.observable(),
		customer_reference: ko.observable(),
		fullname: ko.observable(),
		address: ko.observable(),
		contractor: ko.observable(),
		qty: ko.observable(),
		qty_words: ko.observable(),
	};
	
	self.price = {
		amount: ko.observable(),
		amount_words: ko.observable()
	};
	
	self.terms = {
		terms: ko.observable()
	};
	
	self.delivery = {
		weeks: ko.observable(),
		weeks_words: ko.observable(),
		premises: ko.observable(),
		type: ko.observable(0),
		date: ko.observable()
	};
	
	self.gtc_amendments = {
		amendments: ko.observable()
	};
	
	
	self.testing = {
		preferred_material: ko.observable('')
	}
	
	self.installation = {
		days: ko.observable()
	}
	
	self.wtc = {
		year: ko.observable(1),
		year_words: ko.observable('one')
	};
	
	self.wtc_amendments = {
		amendments: ko.observable()
	};
	
	self.settings = {
		gtc_amendments: ko.observable(false),
		wtc_amendments: ko.observable(false),

	};
	
	self.appendixQuote = ko.observable('');
	self.appendixTechnicalData = ko.observable('');
	self.appendixLayout = ko.observable('');
	self.appendixGTC = ko.observable('');
	self.appendixWTC = ko.observable('');
	
	self.pagebreaks = {
		scope: ko.observable(false),
		price: ko.observable(false),
		terms: ko.observable(false),
		delivery:  ko.observable(false),
		gtc: ko.observable(false),
		gtc_amendments: ko.observable(false),
		tests: ko.observable(false),
		installation: ko.observable(false),
		foundation: ko.observable(false),
		cutting: ko.observable(false),
		manual: ko.observable(false),
		wtc: ko.observable(false),
		wtc_amendments: ko.observable(false),
		signatory: ko.observable(false),
		appendices:  ko.observable(false)
	}
	
	self.extratexts = {
		introduction: ko.observable(),
		scope_of_supply: ko.observable(),
		contract_price: ko.observable(),
		terms_of_payment: ko.observable(),
		delivery_time: ko.observable(),
		gtc: ko.observable(),
		test: ko.observable(),
		installation: ko.observable(),
		foundation: ko.observable(),
		cutting_quality: ko.observable(),
		manual: ko.observable(),
		wtc: ko.observable(),
		gtc_amendments: ko.observable(),
		wtc_amendments: ko.observable()
	}
	
};

ko.bindingHandlers.showDialog = {
    init: function(element, valueAccessor) {
        $(element).hide();
    },
    update: function(element, valueAccessor) {
        var maskHeight = $(document).height();
        var maskWidth = $(window).width();
        
        var dialogTop =  (maskHeight/3) - ($(element).height()/2);  
        var dialogLeft = (maskWidth/2) - ($(element).width()/2); 

        var value = valueAccessor();

        if (ko.utils.unwrapObservable(value)) {
            $('<div id="dialog-overlay"></div>').prependTo('body');//$('#dialog-overlay').show();
            $(element).css({top:dialogTop, left:dialogLeft}).fadeIn();
        }
        else {
            $('#dialog-overlay').remove();
            $(element).css({top:dialogTop, left:dialogLeft}).hide();
        }
    }
};



ko.bindingHandlers.richText1 = {
	init: function(element, valueAccessor) {        
            var txtBoxID = $(element).attr("id");
			
			CKEDITOR.replace(txtBoxID);   
			
			
			CKEDITOR.instances[txtBoxID].focusManager.blur = function () {
                var observable = valueAccessor();
				observable(CKEDITOR.instances[txtBoxID].getData());
            };
						
			//handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function (){
     
		if (CKEDITOR.instances[txtBoxID]) { CKEDITOR.remove(CKEDITOR.instances[txtBoxID]); };
            });
            
		},
     update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
		var txtBoxID = $(element).attr("id");
        var val = ko.utils.unwrapObservable(valueAccessor());
		CKEDITOR.instances[txtBoxID].setData(val);
		//$(element).val(val);
    }
}

	
	


ko.bindingHandlers.popOver = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var options = valueAccessor();
		options.placement = 'right';
		options.trigger = 'hover';
        $(element).popover(options);
    }
};

function OrdConStartOptions(parent) {
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
    self.openExistingQuotes = function(openType) {
        self.isCopyQuote((openType === "copy")? true: false);
        self.clearQuotesList();
		prooffer_data.getProjectList(self.projectList);
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
	
	self.initProject = function(projectName, callback) {
		prooffer_data.getProject(projectName, function(initData) {

        initData.projectName = undefined; // set to undefined so autosave will not be invoked
		self.parent.project = new Project(initData);		
		self.parent.machine.initMachineData(initData.machine.machineType, initData.machine.machineRange, initData.machine.machineName);
		var options = prooffer_data.getMachineOptions(initData.machine.machineOptions, initData.machine.machineDefault, true)[0];
		self.parent.machineOptions.options_standard = options.options;
        //self.parent.machineOptions.goToStandard();
		//self.parent.industryDefaults = options.defaults;        
       
		self.parent.machineOptions.options_optional = prooffer_data.getMachineOptions(initData.machine.machineOptions, 'NONE', false);
		self.parent.machine.initOptions(self.parent.machineOptions.options_standard, function(selector) { selector.selection = self.parent.project.machineOptions.standard; selector.project = self.parent.project; selector.price = self.parent.price;}, initData.machineOptions.standard);
		self.parent.machine.initOptions(self.parent.machineOptions.options_optional, function(selector) { selector.selection = self.parent.project.machineOptions.optional; selector.project = self.parent.project; selector.price = self.parent.price;}, initData.machineOptions.optional);
		self.parent.newComponents.initialize(options.options, initData);
        self.parent.complementaryGoods.initialize(prooffer_data.getMachineOptions('Complementary goods', 'NONE', false), initData);
        self.parent.machineName(self.parent.project.machine.machineName());
		if(callback) callback(initData);
		//self.parent.offer.initializeTemplates();
        //self.parent.order.initializeVOptions(initData.visibilityOptions);
		//self.parent.price.onCurrencyChange();
		});
	};  	
    
	self.loadProject = function(data, callback){
		var projectName = data.projectName;
		if(projectName != '') {
			self.parent.hasStarted(true);            
			self.initProject(projectName, function(initData) {
                self.parent.project.projectName = projectName;
                self.parent.projectNumber(projectName);
                self.parent.project.createdby = data.createdby;     
				self.parent.price.update();
				if(callback) callback(initData);
				self.parent.gotoStage('OrderConfirmation');
			});
		}
	};
	
	self.createOrderConfirmation = function(data) {
		self.loadProject(data, function(initData) { 
			self.parent.order.allowDirty = false;
			self.parent.order.isContractDirty(false);
			self.parent.order.appendixN = 0;
			self.parent.order.initContract({});
			self.parent.order.allowDirty = true;
			self.parent.handover.initHandOverAdditionalData({});
		});
	};
	
	self.openOrderConfirmation = function(data) {
		self.loadProject(data, function(initData) { 
			self.parent.order.allowDirty = false;
			self.parent.order.isContractDirty(false);
			self.parent.order.appendixN = 0;
			self.parent.order.initContract(initData.ordcon);
			self.parent.order.allowDirty = true;
			if(initData.handover) self.parent.handover.initHandOverAdditionalData(initData.handover);
			else self.parent.handover.initHandOverAdditionalData({});
		});
	};
       
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

function Order(parent) {
	var self = this;
	self.parent = parent;
	
	self.allowDirty = false;
	self.isContractDirty = ko.observable(false);
	self.markAsDirty = function() { if(self.allowDirty) self.isContractDirty(true);}

	self.contract = new Contract();
	
	self.contract.external.subscribe(self.markAsDirty);
	
	self.contract.title.subscribe(self.markAsDirty);
	
	self.contract.incoterms.subscribe(self.markAsDirty);
	self.contract.incoterms_freight.subscribe(self.markAsDirty);
	
	self.contract.introduction.day.subscribe(self.markAsDirty);
	self.contract.introduction.month_year.subscribe(self.markAsDirty);
	self.contract.introduction.project_number.subscribe(self.markAsDirty);
	self.contract.introduction.customer_reference.subscribe(self.markAsDirty);
	self.contract.introduction.fullname.subscribe(self.markAsDirty);
	self.contract.introduction.address.subscribe(self.markAsDirty);
	self.contract.introduction.contractor.subscribe(self.markAsDirty);
	self.contract.introduction.qty.subscribe(self.markAsDirty);
	self.contract.introduction.qty_words.subscribe(self.markAsDirty);
	
	self.contract.price.amount.subscribe(self.markAsDirty);
	self.contract.price.amount_words.subscribe(self.markAsDirty);
	
	self.contract.terms.terms.subscribe(self.markAsDirty);
	
	self.contract.delivery.weeks.subscribe(self.markAsDirty);
	self.contract.delivery.weeks_words.subscribe(self.markAsDirty);
	self.contract.delivery.premises.subscribe(self.markAsDirty);
	self.contract.delivery.type.subscribe(self.markAsDirty);
	self.contract.delivery.date.subscribe(self.markAsDirty);
	
	self.contract.installation.days.subscribe(self.markAsDirty);
	
	self.contract.wtc.year.subscribe(self.markAsDirty);
	self.contract.wtc.year_words.subscribe(self.markAsDirty);
	
	/* self.contract.wtc_amendments.amendments.subscribe(self.markAsDirty);
	self.contract.gtc_amendments.amendments.subscribe(self.markAsDirty); */
	self.contract.settings.gtc_amendments.subscribe(self.markAsDirty);
	self.contract.settings.wtc_amendments.subscribe(self.markAsDirty);
	
	
	self.contract.appendixQuote.subscribe(self.markAsDirty);
	self.contract.appendixTechnicalData.subscribe(self.markAsDirty);
	self.contract.appendixLayout.subscribe(self.markAsDirty);
	self.contract.appendixGTC.subscribe(self.markAsDirty);
	self.contract.appendixWTC.subscribe(self.markAsDirty);
	
	self.contract.pagebreaks.scope.subscribe(self.markAsDirty);
	self.contract.pagebreaks.price.subscribe(self.markAsDirty);
	self.contract.pagebreaks.terms.subscribe(self.markAsDirty);
	self.contract.pagebreaks.delivery.subscribe(self.markAsDirty);
	self.contract.pagebreaks.gtc.subscribe(self.markAsDirty);
	self.contract.pagebreaks.gtc_amendments.subscribe(self.markAsDirty);	
	self.contract.pagebreaks.tests.subscribe(self.markAsDirty);
	self.contract.pagebreaks.installation.subscribe(self.markAsDirty);
	self.contract.pagebreaks.foundation.subscribe(self.markAsDirty);
	self.contract.pagebreaks.cutting.subscribe(self.markAsDirty);
	self.contract.pagebreaks.manual.subscribe(self.markAsDirty);
	self.contract.pagebreaks.wtc.subscribe(self.markAsDirty);
	self.contract.pagebreaks.wtc_amendments.subscribe(self.markAsDirty);
	self.contract.pagebreaks.signatory.subscribe(self.markAsDirty);
	self.contract.pagebreaks.appendices.subscribe(self.markAsDirty);
	
	self.contract.extratexts.introduction.subscribe(self.markAsDirty);
	self.contract.extratexts.scope_of_supply.subscribe(self.markAsDirty);
	self.contract.extratexts.contract_price.subscribe(self.markAsDirty);
	self.contract.extratexts.gtc.subscribe(self.markAsDirty);
	self.contract.extratexts.test.subscribe(self.markAsDirty);
	self.contract.extratexts.foundation.subscribe(self.markAsDirty);
	self.contract.extratexts.wtc.subscribe(self.markAsDirty);
	self.contract.extratexts.terms_of_payment.subscribe(self.markAsDirty);
	self.contract.extratexts.delivery_time.subscribe(self.markAsDirty);
	self.contract.extratexts.installation.subscribe(self.markAsDirty);
	self.contract.extratexts.cutting_quality.subscribe(self.markAsDirty);
	self.contract.extratexts.manual.subscribe(self.markAsDirty);
    self.contract.extratexts.gtc_amendments.subscribe(self.markAsDirty);
	self.contract.extratexts.wtc_amendments.subscribe(self.markAsDirty);
	
	
	self.arrow = ko.observable('<<');
    self.showSideBar = ko.observable(true);
    self.showOptionList = ko.observable(false);
    
    self.toggleSideBar = function() {
        self.showSideBar(!(self.showSideBar()));
        self.arrow((self.showSideBar() == true)? '<<' : '>>');
    }
    
    self.updateFlag = ko.observable(false); 
    self.update = function() {
		self.updateFlag(!self.updateFlag());
	};
	
	self.orderConfirmationTemplate = ko.observable();
		
	self.termsTemplates = ko.observableArray([{index: 0, label: 'Terms Template A'},
	                                          {index: 1, label: 'Terms Template B'},
											  {index: 2, label: 'Custom'}]);
	self.termsTemplate = ko.observable(0);
	
	self.setContent = function(content) {
        var container = $('<div></div>');
        container.append('<div id="content-wrapper" style="font-size: 12px"></div>').find('#content-wrapper').append(content);  
		return container;
    }
	
	self.terms = ko.computed({
        read: function() {
            var templateIndex = self.termsTemplate();
			var template;			
			if(templateIndex == 2) template = $(self.contract.terms.terms()); 
			else template = $(TermsTemplates[templateIndex]);
			var content = self.setContent(template);
			if (CKEDITOR.instances['termsRichText'] != undefined)
				CKEDITOR.instances['termsRichText'].setData(content.html()); 
			return template.html();
        },
        write: function(content) {
			self.contract.terms.terms(content);
        }
    });
	
	/* self.terms_of_payment_content = '';
	self.terms_of_payment_content_update = ko.observable();
	self.terms_of_payment = ko.computed({
		read:function(){
			self.terms_of_payment_content_update();
			var template = $('<p>' + self.terms_of_payment_content + '</p>');
			var content = self.setContent(template);
			var content = self.setContent(self.terms_of_payment_content);
			if (CKEDITOR.instances['extratexts_terms_of_payment'] != undefined){
				
				
			}
		
			return template.html();
		},
		write:function(content){
			if (CKEDITOR.instances['extratexts_terms_of_payment'] != undefined) {
				self.contract.terms_of_payment.top(content);
				self.terms_of_payment_content = content;
				
			}
			
        }
	})
	
	self.gtc_amendments_content = '';
	self.gtc_amendments_content_update = ko.observable();
	self.gtc_amendments = ko.computed({
        read: function() {
			self.gtc_amendments_content_update();
			var template = $('<p>' + self.gtc_amendments_content + '</p>');
			//does not affect the output in the PDF if you insert style on p
			var content = self.setContent(template);
			var content = self.setContent(self.gtc_amendments_content);
			if (CKEDITOR.instances['gtc_amendmentsRichText'] != undefined){
	
				CKEDITOR.instances['gtc_amendmentsRichText'].setData(self.contract.gtc_amendments.amendments());
			}
			return template.html();
        },
        write: function(content) {
			if (CKEDITOR.instances['gtc_amendmentsRichText'] != undefined) {
				self.contract.gtc_amendments.amendments(content);
				self.gtc_amendments_content = content;
			}
        }
    });
	
	self.wtc_amendments_content = '';
	self.wtc_amendments_content_update = ko.observable();
	self.wtc_amendments = ko.computed({
        read: function() {
			self.wtc_amendments_content_update();
			var template = $('<p>' + self.wtc_amendments_content + '</p>');
			//does not affect the output in the PDF if you insert style on p
			var content = self.setContent(template);
			if (CKEDITOR.instances['wtc_amendmentsRichText'] != undefined){
				
				CKEDITOR.instances['wtc_amendmentsRichText'].setData( self.contract.wtc_amendments.amendments());
				}
			return template.html();
        },
        write: function(content) {
			if (CKEDITOR.instances['wtc_amendmentsRichText'] != undefined) {
				self.contract.wtc_amendments.amendments(content);
				self.wtc_amendments_content = content;
			}
        }
    }); */
    
	self.orderConfirmation = function(isHandOver) {

			var content = $('.offerview').clone();
			
			content.find('#introduction_content').html('<br/><span style="font-size:12px;">This ' + self.contract.title() + ' is made ' //for pdf
						 + '<span id="day"></span> day of <span id="month_year"></span> under HGG reference '
						 + '<span id="project_number"></span> <span id="customer_reference"></span>'
						 + ' between <span id="fullname"></span>, with its registered office at <span id="address"></span>'
						 + ' (here in after referred to as the "Buyer"); and <span id="contractor"></span>, with its '
						 + 'registered office at Zuidrak 2 1771 SW Wieringerwerf the Netherlands (here in after referred to as the "Suplier ");'
						 + '<br/>WHEREAS Buyer is engaged in the purchase of <span id="qty"></span> (<span id="qty_words"></span>'
						 + ') no. CNC cutting machine; ' + self.parent.project.machine.machineName() + ' (here in after referred to as the "Equipment").</span><br/>');
			if(self.contract.extratexts.introduction())
					content.find('#introduction_content').append('<span id="extratexts_introduction" style="font-size:12px;"></span></br>'); 
			else	
					content.find('#introduction_content').append('<br/>');
				
			content.find('#scope_of_supply')
				   .html('<span style="font-size:12px;color:rgb(9,79,163);">Scope of Supply</span>');
			content.find('#scope_of_supply_content')
				   .html('<span style="width: 600pt; font-size: 12px;">Contractor will deliver ' + self.contract.introduction.qty() 
					     + '(' + self.contract.introduction.qty_words() + ') no. CNC cutting machine according to the quote as per appendix ' 
						 + self.contract.appendixQuote() + '<span id="appendixTechnicalData"></span>'
						 +'<span id="appendixLayout"></span>. Scope of Supply is, either or not collectively,'
						 +' called the "Equipment".</span><br/>');
			
			if(self.contract.extratexts.scope_of_supply())
				content.find('#scope_of_supply_content').append('<span id="extratexts_scope_of_supply" style="font-size: 12px;"></span></br>');
			//if i remove the <br> at the end of the code, dikit ra kaayo. if naa pud br, layo ra pd kaayo.
			else 
				content.find('#scope_of_supply_content').append('<br/>');	
			
			
			
			if(self.contract.appendixTechnicalData().length > 0 && self.contract.appendixLayout().length > 0){
				content.find('#appendixTechnicalData').html(', technical data as per appendix ' + self.contract.appendixTechnicalData());
				content.find('#appendixLayout').html(', and machine lay-out as per appendix ' + self.contract.appendixLayout());
			}
			
			else if((self.contract.appendixTechnicalData().length > 0) || (self.contract.appendixLayout().length > 0)){
				if(self.contract.appendixTechnicalData().length > 0){
					content.find('#appendixTechnicalData').html(' and technical data as per appendix ' + self.contract.appendixTechnicalData());
					content.find('#appendixLayout').remove();
				}
				else{
					content.find('#appendixLayout').html(' and machine lay-out as per appendix ' + self.contract.appendixLayout());
					content.find('#appendixTechnicalData').remove();
				}
			}
			
			else{
				content.find('#appendixTechnicalData').remove();
				content.find('#appendixLayout').remove();
			}
			
			
			
			content.find('#contract_price')
				   .html('<span style="font-size:12px;color:rgb(9,79,163);">Contract Price</span>');
			content.find('#contract_price_content')
				   .html('<span style="width: 600pt; font-size: 12px;">The full Contract Price shall be ' 
				         + self.parent.project.price.offer_settings.currency() + ' <span id="amount"></span>'
						 + ', (<span id="amount_words"></span>) <span id="incoterms_content"></span>');
			
			
			if(self.contract.extratexts.contract_price())
				content.find('#contract_price_content').append('<span id="extratexts_contract_price" style="font-size: 12px"></span><br/>');	
			else
				content.find('#contract_price_content').append('<br/>');		
		
			
			
			if(self.contract.incoterms() == "EXW")
				content.find('#incoterms_content').html(', Ex-Works ' + self.contract.incoterms_freight() + ' as per INCOTERMS 2010, excluding all duties, levies and taxes. </span><br/>');
			else if(self.contract.incoterms() == "FCA")
				content.find('#incoterms_content').html(', Free Carrier ' + self.contract.incoterms_freight() + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span><br/> ');
			else if(self.contract.incoterms() == "CPT")
				content.find('#incoterms_content').html(', Carriage Paid To ' + self.contract.incoterms_freight() + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span> <br/>');
			else if(self.contract.incoterms() == "CIP")
				content.find('#incoterms_content').html(', Carriage and Insurance Paid to ' + self.contract.incoterms_freight() + ' as per INCOTERMS 2010, excluding all duties, levies and taxes. </span><br/>');
			else if(self.contract.incoterms() == "DAP")
				content.find('#incoterms_content').html(', Delivered at Place ' + self.contract.incoterms_freight() + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span><br/> ');
			else if(self.contract.incoterms() == "DDP")
				content.find('#incoterms_content').html(', Delivered Duty Paid ' + self.contract.incoterms_freight() + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span><br/> ');
			else if(self.contract.incoterms() == "FOB")
				content.find('#incoterms_content').html(', Free on Board ' + self.contract.incoterms_freight() + ' as per INCOTERMS 2010, excluding all duties, levies and taxes. </span><br/>');
			else if(self.contract.incoterms() == "CFR")
				content.find('#incoterms_content').html(', Cost and Freight ' + self.contract.incoterms_freight() + ' as per INCOTERMS 2010, excluding all duties, levies and taxes. </span><br/>');
			else if(self.contract.incoterms() == "CIF")
				content.find('#incoterms_content').html(', Cost, Insurance and Freight ' + self.contract.incoterms_freight() + ' as per INCOTERMS 2010, excluding all duties, levies and taxes. </span><br/>');
						 
			
			content.find('#terms_of_payment')
			       .html('<span style="font-size:12px;color:rgb(9,79,163);">Terms of Payment</span>');			 
			content.find('#terms_of_payment_content')
			       .html('<span style="font-size: 12px;"><span id="extratexts_terms_of_payment"></span></span><br/>');
			
			content.find('#delivery_time')
			       .html('<span style="font-size:12px;color:rgb(9,79,163);">Delivery Time</span>');
			content.find('#delivery_time_content')
				   .html('<span style="font-size:12px;"><span id="extratexts_delivery_time"></span></span><br/>');
			
			content.find('#gtc')
			       .html('<span style="font-size:12px;color:rgb(9,79,163);">HGG General Terms and Conditions</span>');
			content.find('#gtc_content')
				   .html('<span style="font-size:12px;">The HGG General Terms and Conditions as per appendix <span id="appendixGTC"></span>'
				        + ' apply to this ' + self.contract.title() + ' whereby in case of contradictions the '
						+ self.contract.title() +' prevails.</span><br/>');
			
			if(self.contract.extratexts.gtc()){
				
				content.find('#gtc_content').append('<div id="extratexts_gtc" style="font-size:12px"></div><br/>');
			}
			else{
				content.find('#gtc_content').append('<br/>');
				
			}			
			
			content.find('#tests')
				   .html('<span style="font-size:12px;color:rgb(9,79,163);">Tests before shipment</span>');
		    content.find('#test_content')
				   .html('<span style="font-size:12px;"><span id="extratexts_test"></span></span><br/>');
				   
			content.find('#installation')
			       .html('<span style="font-size:12px;color:rgb(9,79,163);">Installation and training</span>');	
			content.find('#installation_content')
				   .html('<span style="font-size:12px;"><span id="extratexts_installation"></span></span><br/>');
				   
			content.find('#foundation')
			       .html('<span style="font-size:12px;color:rgb(9,79,163);">Foundation</span>');
			content.find('#foundation_content')
				   .html('<span style="font-size:12px;"><span id="extratexts_foundation"></span></span><br/>');
				   
			content.find('#cutting')
				   .html('<span style="font-size:12px;color:rgb(9,79,163);">Cutting quality and cutting tolerances</span>');
			content.find('#cutting_content')
				   .html('<span style="font-size:12px;"><span id="extratexts_cutting_quality" ></span></span><br/>');
				   
			content.find('#manual')
				   .html('<span style="font-size:12px;color:rgb(9,79,163);">Manuals</span>');
			content.find('#manual_content')
				   .html('<span style="font-size:12px"><span id="extratexts_manual"></span></span><br/>');
				   
			content.find('#wtc')
				   .html('<span style="font-size:12px;color:rgb(9,79,163);">Warranty General Terms and Conditions</span>');
			
			content.find('#wtc_content')
				   .html('<span style="font-size:12px;font-family:sans-serif,Arial,Verdana,Trebuchet MS;">A Warranty of <span id="wtc_year"></span> year(s) applies. The HGG Warranty Terms and Conditions as per Appendix <span id="appendixWTC"></span> apply to this ' 
						 + self.contract.title() + ' whereby in case of contradictions the ' 
						 + self.contract.title() + ' prevails.<br/>');
			
			if(self.contract.extratexts.wtc()){
				
				content.find('#wtc_content').append('<div id="extratexts_wtc" style="font-size:12px;"></div></span></br>');
				//if i remove the <br> at the end of the code, dikit ra kaayo. if naa pud br, layo ra pd kaayo.
			}
			else{
				content.find('#wtc_content').append('</span><br/>');
				
			}
			
			if(self.contract.settings.gtc_amendments()) {
				
				if(self.contract.extratexts.gtc_amendments()){
					
				content.find('#gtc_amendments')
				   .html('<span style="font-size:12px;color:rgb(9,79,163);">Amendments General Terms and Conditions</span>');
				content.find('#gtc_amendments_content').html('<span style="font-size:12px">' + self.contract.extratexts.gtc_amendments()+  '</span><br/> ');
				//self.contract.settings.gtc_amendments() means if it is visible or not
				//adjust the size of the GTC amendments text 12px is equivalent to 9 in word. id="from830"
				//use <span/> not <p/> to get desired results
				//does not include the header, only the content
				//to edit the header, you need to edit it in html not here
				}
				else{
					content.find('#gtc_amendments').remove();
					content.find('#gtc_amendments_content').remove();
				}
			} else {
				
				content.find('#gtc_amendments').remove();
				content.find('#gtc_amendments_content').remove();
			}
			
			
	
			
			if(self.contract.settings.wtc_amendments()){
							
				if(self.contract.extratexts.wtc_amendments()){
					
				content.find('#wtc_amendments')
				   .html('<span style="font-size:12px;color:rgb(9,79,163);">Amendments Warranty Terms and Conditions</span>');
				content.find('#wtc_amendments_content').html('<span style="font-size:12px">' + self.contract.extratexts.wtc_amendments()+  '</span><br/> ');
				//self.contract.settings.wtc_amendments() means if it is visible or not
				//adjust the size of the WTC amendments text 12px is equivalent to 9 in word. id="from830"
				//use <span/> not <p/> to get desired results
				//does not include the header, only the content
				//to edit the header, you need to edit it in html not here
				}
				else{
					content.find('#wtc_amendments').remove();
					content.find('#wtc_amendments_content').remove();
				}
				
			} else {
			  
			  content.find('#wtc_amendments').remove();
			  content.find('#wtc_amendments_content').remove();
			}
			
			content.find('#signatory_content')
			       .html('<span style="font-size:12px;">IN WITNESS THEREOF the Parties hereto have duly executed this'
				         + self.contract.title() + ' in two counter parts (each of which shall be deemed original and all of which taken together'
						 + ' shall be deemed to constitute one and the same instrument) on the date first above written.'
						 + '<br/>For and on behalf of;<br/>'
						 + '<table>' 
						 + '<tr><td>Purchaser:</td><td></td><td>&nbsp;</td><td>Contractor:</td><td></td></tr>'
						 + '<tr><td id="fullname"></td><td></td><td>&nbsp;</td><td id="contractor"></td><td></td></tr>'
						 + '<tr><td></td><td></td><td>&nbsp;</td><td></td><td></td></tr>'
						 + '<tr><td style="border-bottom:1pt solid black;"></td><td style="border-bottom:1pt solid black;"></td><td>&nbsp;</td><td style="border-bottom:1pt solid black"></td><td style="border-bottom:1pt solid black"></td></tr></table>'
						 + '<br/><table>'
						 + '<tr><td>By:</td><td>___________________</td><td>&nbsp;</td><td>By:</td><td>___________________</td></tr>'
						 + '<tr><td>Place:</td><td>___________________</td><td>&nbsp;</td><td>Place:</td><td>___________________</td></tr>'
						 + '<tr><td>Date:</td><td>___________________</td><td>&nbsp;</td><td>Date:</td><td>___________________</td></tr>'
						 + '</table></span>');
						 
			content.find('#appendices_placeholder').html($('#appendices').clone());
						 
			content.find('#day').html(self.contract.introduction.day());
			content.find('#month_year').html(self.contract.introduction.month_year());
			content.find('#project_number').html(self.contract.introduction.project_number());
			if(self.contract.introduction.customer_reference().length > 0) {
				content.find('#customer_reference').html('and Customer reference ' + self.contract.introduction.customer_reference());
			} else {
				content.find('#customer_reference').remove();
			}
			content.find('#fullname').html(self.contract.introduction.fullname());
			content.find('#address').html(self.contract.introduction.address());
			content.find('#contractor').html(self.contract.introduction.contractor());
			content.find('#qty').html(self.contract.introduction.qty());
			content.find('#qty_words').html(self.contract.introduction.qty_words());
			
			content.find('#amount').html(self.contract.price.amount());
			content.find('#amount_words').html(self.contract.price.amount_words());
			content.find('#incoterms_freight').html(self.contract.incoterms_freight());
			
			if(self.contract.delivery.type() == 0) {
				content.find('#weeks').html(self.contract.delivery.weeks());
				content.find('#weeks_words').html(self.contract.delivery.weeks_words());
			} else {
				content.find('#weeks').html(self.contract.delivery.date());
			}
			content.find('#premises').html(self.contract.delivery.premises());
			
			content.find('#preferred_material').html(self.contract.testing.preferred_material());
			content.find('#installation_days').html(self.contract.installation.days());
			content.find('#wtc_year').html(self.contract.wtc.year());
			
			
			
			content.find('#EXW')
			       .html('<span>, Ex-Works <span id="incoterms_freight">'
				       + '<input type="text" placeholder="HGG Premises, the Netherlands" size="40" style="text-align:center" '
					   + 'data-bind="value: order.contract.incoterms_freight"></input></span>'
					   + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span>');
			
			content.find('#FCA')
			       .html('<span>, Free Carrier <span id="incoterms_freight">'
				       + '<input type="text" placeholder="Freight handler" size="40" style="text-align:center" '
					   + 'data-bind="value: order.contract.incoterms_freight"></input></span>'
					   + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span>');
					   
			content.find('#CPT')
			       .html('<span>, Carriage Paid To <span id="incoterms_freight">'
				       + '<input type="text" placeholder="Destination" size="40" style="text-align:center" '
					   + 'data-bind="value: order.contract.incoterms_freight"></input></span>'
					   + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span>');
					   
			content.find('#CIP')
			       .html('<span>, Carriage and Insurance Paid to <span id="incoterms_freight">'
				       + '<input type="text" placeholder="Destination" size="40" style="text-align:center" '
					   + 'data-bind="value: order.contract.incoterms_freight"></input></span>'
					   + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span>');
					   
			content.find('#DAP')
			       .html('<span>, Delivered at Place <span id="incoterms_freight">'
				       + '<input type="text" placeholder="Place of destination" size="40" style="text-align:center" '
					   + 'data-bind="value: order.contract.incoterms_freight"></input></span>'
					   + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span>');
					   
			content.find('#DDP')
			       .html('<span>, Delivered Duty Paid <span id="incoterms_freight">'
				       + '<input type="text" placeholder="Destination" size="40" style="text-align:center" '
					   + 'data-bind="value: order.contract.incoterms_freight"></input></span>'
					   + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span>');
					   
			content.find('#FOB')
			       .html('<span>, Free on Board <span id="incoterms_freight">'
				       + '<input type="text" placeholder="On board ship" size="40" style="text-align:center" '
					   + 'data-bind="value: order.contract.incoterms_freight"></input></span>'
					   + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span>');
					   
			content.find('#CFR')
			       .html('<span>, Cost and Freight <span id="incoterms_freight">'
				       + '<input type="text" placeholder="Port of destination" size="40" style="text-align:center" '
					   + 'data-bind="value: order.contract.incoterms_freight"></input></span>'
					   + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span>');
					   
			content.find('#CIF')
			       .html('<span>, Cost, Insurance and Freight <span id="incoterms_freight">'
				       + '<input type="text" placeholder="Port of destination" size="40" style="text-align:center" '
					   + 'data-bind="value: order.contract.incoterms_freight"></input></span>'
					   + ' as per INCOTERMS 2010, excluding all duties, levies and taxes.</span>');
					   
			content.find('#EXW_DT')
				   .html('<span> Ex-Works</span>');
				   
			content.find('FCA_DT')
			       .html('<span> Free Carrier</span>');
				   
			content.find('#CPT_DT')
				   .html('<span> Carriage Paid To</span>');
				   
			content.find('#CIP_DT')
			       .html('<span> Carriage and Insurance Paid to</span>');
				   
			content.find('#DAP_DT')
			       .html('<span> Delivered at Place</span>');
				   
			content.find('#DDP_DT')
			       .html('<span> Delivered Duty Paid</span>');
				   
			content.find('#FOB_DT')
			       .html('<span> Free on Board</span>');
				   
			content.find('#CFR_DT')
			       .html('<span> Cost and Freight</span>');
				   
			content.find('#CIF_DT')
			       .html('<span> Cost, Insurance and Freight</span>');
			
			content.find('#appendixQuote').html(self.contract.appendixQuote());
			content.find('#appendixGTC').html(self.contract.appendixGTC());
			content.find('#appendixWTC').html(self.contract.appendixWTC());
			
			content.find('#introduction').remove();
			content.find('#title').remove();
			content.find('#signatory').remove();
			
			if(self.contract.pagebreaks.scope()) content.find('#scope_of_supply').addClass('breaker');
			if(self.contract.pagebreaks.price()) content.find('#contract_price').addClass('breaker');
			if(self.contract.pagebreaks.terms()) content.find('#terms_of_payment').addClass('breaker');
			if(self.contract.pagebreaks.delivery()) content.find('#delivery_time').addClass('breaker');
			if(self.contract.pagebreaks.gtc()) content.find('#gtc').addClass('breaker');
			if(self.contract.pagebreaks.gtc_amendments()) content.find('#gtc_amendments').addClass('breaker');
			if(self.contract.pagebreaks.tests()) content.find('#tests').addClass('breaker');
			if(self.contract.pagebreaks.installation()) content.find('#installation').addClass('breaker');
			if(self.contract.pagebreaks.foundation()) content.find('#foundation').addClass('breaker');
			if(self.contract.pagebreaks.cutting()) content.find('#cutting').addClass('breaker');
			if(self.contract.pagebreaks.manual()) content.find('#manual').addClass('breaker');
			if(self.contract.pagebreaks.wtc()) content.find('#wtc').addClass('breaker');
			if(self.contract.pagebreaks.wtc_amendments()) content.find('#wtc_amendments').addClass('breaker');
			if(self.contract.pagebreaks.signatory()) content.find('#signatory_container').addClass('breaker');
			if(self.contract.pagebreaks.appendices()) content.find('#appendices_placeholder').addClass('breaker');
			
			
			
			
			if(self.contract.extratexts.introduction()) content.find('#extratexts_introduction').html(self.contract.extratexts.introduction());
			else content.find('#extratexts_introduction').remove();
			if(self.contract.extratexts.scope_of_supply()) content.find('#extratexts_scope_of_supply').html(self.contract.extratexts.scope_of_supply());
			else content.find('#extratexts_scope_of_supply').remove();
			if(self.contract.extratexts.contract_price()) content.find('#extratexts_contract_price').html(self.contract.extratexts.contract_price());
			else content.find('#extratexts_contract_price').remove();
			if(self.contract.extratexts.terms_of_payment()) content.find('#extratexts_terms_of_payment').html(self.contract.extratexts.terms_of_payment());
			else content.find('#extratexts_terms_of_payment').remove();
			if(self.contract.extratexts.delivery_time()) content.find('#extratexts_delivery_time').html(self.contract.extratexts.delivery_time());
			else content.find('#extratexts_delivery_time').remove();
			if(self.contract.extratexts.gtc()) content.find('#extratexts_gtc').html(self.contract.extratexts.gtc());
			else content.find('#extratexts_gtc').remove();
			if(self.contract.extratexts.test()) content.find('#extratexts_test').html(self.contract.extratexts.test());
			else content.find('#extratexts_test').remove();
			if(self.contract.extratexts.installation()) content.find('#extratexts_installation').html(self.contract.extratexts.installation());
			else content.find('#extratexts_installation').remove();
			if(self.contract.extratexts.foundation()) content.find('#extratexts_foundation').html(self.contract.extratexts.foundation());
			else content.find('#extratexts_foundation').remove();
			if(self.contract.extratexts.cutting_quality()) content.find('#extratexts_cutting_quality').html(self.contract.extratexts.cutting_quality());
			else content.find('#extratexts_cutting_quality').remove();
			if(self.contract.extratexts.manual()) content.find('#extratexts_manual').html(self.contract.extratexts.manual());
			else content.find('#extratexts_manual').remove();
			if(self.contract.extratexts.wtc()) content.find('#extratexts_wtc').html(self.contract.extratexts.wtc());
			else content.find('#extratexts_wtc').remove();
			
			if(isHandOver) {
				content.find('#signatory_container').remove();
				content.find('#appendices_placeholder').remove();
			}
		
			//console.log(content.html());
			return content.html();
    };
    
	self.generateOrder = function(draft) {
        var offer = {};
		offer.draft = draft;
		offer.image = self.parent.project.machine.image;
		offer.reference = self.contract.introduction.project_number;
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
		offer.orderconfirmation = self.orderConfirmation(false);
        //offer.introduction = self.introduction();
		offer.address = '';
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
								if(self.parent.project.showItemPrice) amount = self.parent.price.formatPrice(self.parent.price.computeCN(option.price, self.parent.project.price.standard_commission(), self.parent.project.price.standard_negotiation(), qty, self.parent.project.price.offer_settings.exchange_rate()));
								chapterContainer.options.push({name: option.name, description: option.description, quantity: qty, pdf: option.pdf, price: amount, id: option.id});
								chapterName = '';
							}
						}
						
						if (subject.subject !== "Complementary goods") {
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
                    var subjectContainer = { name: subject.subject, chapters: []};
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
								var amount = self.parent.price.formatPrice(self.parent.price.computeCN(option.price, self.parent.project.price.optional_commission(), self.parent.project.price.optional_negotiation(), option.quantity(), self.parent.project.price.offer_settings.exchange_rate()));
								chapterContainer.options.push({name: option.name, description: option.description, quantity: option.quantity, pdf:'', price: amount, id: option.id});
								chapterName = '';
							}
						}
						
						if (subject.subject !== "Complementary goods") {
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
                    var subjectContainer = { name: subject.subject, chapters: []};
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
				
		offer.termsAndConditions = self.parent.project.termsAndConditionsText;
        offer.signature = self.parent.project.signature;
		offer.include = self.parent.project.visibilityOptions.slice();
		//console.log(offer.include);
        offer.productDescriptionIntro = false;
        /*for (var i = 0; i < offer.include.length; i++) {
            if (offer.include[i]['include']) {
                if (offer.include[i]['title'] == 'Product Description Introduction') {
                    offer.productDescriptionIntro = true;
                }
            }
        }*/
					
		offer.settings = self.contract.settings;
		offer.label = self.contract.title();
		offer.customer_ref = self.contract.introduction.customer_reference();
		offer.appendixTech = self.contract.appendixTechnicalData();
		offer.appendixLay = self.contract.appendixLayout();

		prooffer_data.generateOrder(ko.toJSON(offer));
	};
	
	self.generateOrderPreview = function() {
		var offer = {};
		offer.draft = true;
		offer.machineId = self.parent.project.machine.id;
        offer.machineRev = self.parent.project.machine.rev;
		offer.image = self.parent.project.machine.image;
		offer.reference = self.contract.introduction.project_number;
        offer.customerDetails = self.parent.project.customerDetails;
        offer.machineName = self.parent.project.machine.machineName();
		offer.orderconfirmation = self.orderConfirmation(false);
		offer.label = self.contract.title();
		offer.customer_ref = self.contract.introduction.customer_reference();
		offer.appendixTech = self.contract.appendixTechnicalData();
		offer.appendixLay = self.contract.appendixLayout();
		prooffer_data.generateOrderPreview(ko.toJSON(offer));
	}
	
	self.appendixN = 0;
	self.getAppendixN = function() { return self.appendixN = self.appendixN + 1;}
		
	/*
	self.upload = function(key, data, event) {
		var file = event.target.files[0];
		if(file != undefined) {
			if (file.name.match(/\.(pdf)$/) != null) {
				var formData = new FormData();                
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'uploadUserDataFile/', true);
                xhr.onload = function(e) { 
                    data(file.name);
                };
                formData.append('content', file);
                formData.append('id', self.parent.project.projectName);
                xhr.send(formData);				
			}
		}
	}
	self.remove = function(key, data) {
		prooffer_data.deleteAttachment(self.parent.project.projectName,data(), function() {
			data('');
		});		
	}*/
	
	self.saveLabel = ko.observable('Save');
	
	self.save = function() {		
		self.allowDirty = false;
		self.saveLabel('Saving...');
		//self.contract.terms.terms(CKEDITOR.instances['termsRichText'].getData());
		//self.contract.gtc_amendments.amendments(CKEDITOR.instances['gtc_amendmentsRichText'].getData());
		//self.contract.wtc_amendments.amendments(CKEDITOR.instances['wtc_amendmentsRichText'].getData());
		self.parent.project.ordcon = JSON.parse(ko.toJSON(self.contract));
		_global_offerComponents_savecallback = function() { self.isContractDirty(false); self.saveLabel('Save'); _global_offerComponents_savecallback = undefined;}
		self.parent.project.update();		
		self.allowDirty = true;
	};

	self.createOrderConfirmation = function() { 
		self.generateOrder(false);
		self.save();
	}	
	
	self.previewOrderConfirmation = function() {	
		self.generateOrderPreview();
		self.save();
	}	
	
	self.initContract = function(data) {
		if(data.external) {
			self.contract.external(data.external);
		} else {
			self.contract.external(false);
		}
	
		var termsAndConditions;
		if(self.parent.project.termsAndConditionsTemplate() == 'custom') {
			termsAndConditions = $(self.parent.project.termsAndConditionsText());
		} else {
			termsAndConditions = $(prooffer_data.getTermsAndConditionsTemplate(self.parent.project.termsAndConditionsTemplate()));
		}
		var extract = function(id) {
			return termsAndConditions.find(id).html();
		}
		
		if(data.settings) {
			self.contract.settings.gtc_amendments(data.settings.gtc_amendments);
			self.contract.settings.wtc_amendments(data.settings.wtc_amendments);
			//self.contract.settings.terms_of_payment(data.settings.terms_of_payment);
		} else {
			self.contract.settings.gtc_amendments(false);
			self.contract.settings.wtc_amendments(false);
			//self.contract.settings.terms_of_payment(false);
		}
		//ckhere
		if(data.title) self.contract.title(data.title);
		else self.contract.title('Order Confirmation');
		
		if(data.incoterms) self.contract.incoterms(data.incoterms);
		else self.contract.incoterms('EXW');
		
		if(data.incoterms_freight) self.contract.incoterms_freight(data.incoterms_freight);
		else self.contract.incoterms_freight('');
		
		if(data.introduction) {
			self.contract.introduction.day(data.introduction.day);
			self.contract.introduction.month_year(data.introduction.month_year);
			self.contract.introduction.project_number(data.introduction.project_number); // tama ni
			self.contract.introduction.fullname(data.introduction.fullname);
			self.contract.introduction.address(data.introduction.address);
			self.contract.introduction.contractor(data.introduction.contractor);
			self.contract.introduction.qty(data.introduction.qty);
			self.contract.introduction.qty_words(data.introduction.qty_words);
			self.contract.introduction.customer_reference(data.introduction.customer_reference);
		} else {
			self.contract.introduction.day('');
			self.contract.introduction.month_year('');
			self.contract.introduction.project_number( self.parent.project.projectName);
			self.contract.introduction.fullname(self.parent.project.customerDetails.companyName());
			self.contract.introduction.address(self.parent.project.customerDetails.fullAddress() + ', ' + self.parent.project.customerDetails.city() + ', ' + self.parent.project.customerDetails.country());
			self.contract.introduction.contractor('');
			self.contract.introduction.qty('');
			self.contract.introduction.qty_words('');
			self.contract.introduction.customer_reference('');
		}
		
		if(data.appendixTechnicalData){
			self.contract.appendixTechnicalData(data.appendixTechnicalData);
		} else {
			self.contract.appendixTechnicalData('');
		}
		
		if(data.appendixLayout){
			self.contract.appendixLayout(data.appendixLayout);
		} else {
			self.contract.appendixLayout('');
		}
		
		
		if(data.price) {
			self.contract.price.amount(data.price.amount);
			self.contract.price.amount_words(data.price.amount_words);
		} else {
			self.contract.price.amount(self.parent.project.price.offer_price());
			self.contract.price.amount_words('');	
		}
		
		if(data.terms) {
			self.contract.terms.terms(data.terms.terms);
			self.termsTemplate(2);
			//self.terms_of_payment_content_update.valueHasMutated();
		} else {
			self.contract.terms.terms(extract('#terms_of_payment'));
			self.termsTemplate(2);
			//self.terms_of_payment_content_update.valueHasMutated();
		}
		//ckhere
		if(data.delivery) {
			self.contract.delivery.weeks(data.delivery.weeks);
			self.contract.delivery.weeks_words(data.delivery.weeks_words);
			self.contract.delivery.premises(data.delivery.premises);
			self.contract.delivery.type(data.delivery.type);
			self.contract.delivery.date(data.delivery.date);
		} else {
			self.contract.delivery.weeks('');
			self.contract.delivery.weeks_words('');
			self.contract.delivery.premises('');		
			self.contract.delivery.type(0);
			self.contract.delivery.date('');
		}
		
		
		if(data.testing) self.contract.testing.preferred_material(data.testing.preferred_material);
		else self.contract.testing.preferred_material('Preferrably a tube of approximately 50 mm and a tube of approximately 200 mm');
		if(data.installation) self.contract.installation.days(data.installation.days);
		else self.contract.installation.days('');
		
		if(data.wtc) {
			self.contract.wtc.year(data.wtc.year);
		} else {
			self.contract.wtc.year('');
		}
		
		
		
		self.contract.appendixQuote(data.appendixQuote || '');
		self.contract.appendixTechnicalData(data.appendixTechnicalData || '');
		self.contract.appendixLayout(data.appendixLayout || '');
		self.contract.appendixGTC(data.appendixGTC || '');
		self.contract.appendixWTC(data.appendixWTC || '');
		
		if(data.pagebreaks) {
			self.contract.pagebreaks.scope(data.pagebreaks.scope),
			self.contract.pagebreaks.price(data.pagebreaks.price),
			self.contract.pagebreaks.terms(data.pagebreaks.terms),
			self.contract.pagebreaks.delivery(data.pagebreaks.delivery),
			self.contract.pagebreaks.gtc(data.pagebreaks.gtc),
			self.contract.pagebreaks.gtc_amendments(data.pagebreaks.gtc_amendments),
			self.contract.pagebreaks.tests(data.pagebreaks.tests),
			self.contract.pagebreaks.installation(data.pagebreaks.installation),
			self.contract.pagebreaks.foundation(data.pagebreaks.foundation),
			self.contract.pagebreaks.cutting(data.pagebreaks.cutting),
			self.contract.pagebreaks.manual(data.pagebreaks.manual),
			self.contract.pagebreaks.wtc(data.pagebreaks.wtc),
			self.contract.pagebreaks.wtc_amendments(data.pagebreaks.wtc_amendments),
			self.contract.pagebreaks.signatory(data.pagebreaks.signatory),
			self.contract.pagebreaks.appendices(data.pagebreaks.appendices)
		} else {
			self.contract.pagebreaks.scope(false),
			self.contract.pagebreaks.price(false),
			self.contract.pagebreaks.terms(false),
			self.contract.pagebreaks.delivery(false),
			self.contract.pagebreaks.gtc(false),
			self.contract.pagebreaks.gtc_amendments(false),
			self.contract.pagebreaks.tests(false),
			self.contract.pagebreaks.installation(false),
			self.contract.pagebreaks.foundation(false),
			self.contract.pagebreaks.cutting(false),
			self.contract.pagebreaks.manual(false),
			self.contract.pagebreaks.wtc(false),
			self.contract.pagebreaks.wtc_amendments(false),
			self.contract.pagebreaks.signatory(false),
			self.contract.pagebreaks.appendices(false)
		}
		
		
		
		if(data.extratexts && data.extratexts.gtc_amendments) {
			self.contract.extratexts.gtc_amendments(data.extratexts.gtc_amendments);
			self.gtc_amendments_content = data.extratexts.gtc_amendments;
			
			
		} else {
			self.contract.extratexts.gtc_amendments('');		
			self.gtc_amendments_content = 'The following amendments to HGG General Terms and Conditions apply:';
			
		}
		if(data.extratexts && data.extratexts.wtc_amendments) {
			self.contract.extratexts.wtc_amendments(data.extratexts.wtc_amendments);
			self.wtc_amendments_content = data.extratexts.wtc_amendments;
			
			
		} else {
			self.contract.extratexts.wtc_amendments('');
			self.wtc_amendments_content = 'The following amendments to HGG Warranty Terms and Conditions apply:';
			
		}
		
		//here, data is passed from data.extratexts.blahblah to self.contract.extratexts.blahblah
		if(data.extratexts && data.extratexts.introduction) 
			self.contract.extratexts.introduction(data.extratexts.introduction);
		
		
		
		if(data.extratexts && data.extratexts.scope_of_supply) 
			self.contract.extratexts.scope_of_supply(data.extratexts.scope_of_supply);
		
		if(data.extratexts && data.extratexts.contract_price) {
			self.contract.extratexts.contract_price(data.extratexts.contract_price);
			
		}
		
		if(data.extratexts && data.extratexts.terms_of_payment){ 
			self.contract.extratexts.terms_of_payment(data.extratexts.terms_of_payment);
			self.terms_of_payment_content = data.terms_of_payment;
			
			}
		else 
		{
			self.contract.extratexts.terms_of_payment(extract('#terms_of_payment'));
		}
			
		if(data.extratexts && data.extratexts.delivery_time) 
			self.contract.extratexts.delivery_time(data.extratexts.delivery_time);
		else 
			self.contract.extratexts.delivery_time(extract('#delivery_time'));
			
		if(data.extratexts && data.extratexts.gtc) 
			self.contract.extratexts.gtc(data.extratexts.gtc);
			
		if(data.extratexts && data.extratexts.test) 
			self.contract.extratexts.test(data.extratexts.test);
		else 
			self.contract.extratexts.test(extract('#tests'));
		
		if(data.extratexts && data.extratexts.installation) 
			self.contract.extratexts.installation(data.extratexts.installation);
		else 
			self.contract.extratexts.installation(extract('#installation'));
		
		if(data.extratexts && data.extratexts.foundation) 
			self.contract.extratexts.foundation(data.extratexts.foundation);
		else 
			self.contract.extratexts.foundation(extract('#foundation'));
			
		if(data.extratexts && data.extratexts.cutting_quality) 
			self.contract.extratexts.cutting_quality(data.extratexts.cutting_quality);
		else 
			self.contract.extratexts.cutting_quality(extract('#cutting_quality'));
			
		if(data.extratexts && data.extratexts.manual)
			self.contract.extratexts.manual(data.extratexts.manual);
		else
			self.contract.extratexts.manual('All machine manuals will be installed on the Customer Portal. ' +
				'The Customer Portal is a dedicated server location with all relevant information of the machine, ' +
				'such as manuals and back-up of the software. All manuals will be in English and will be supplied ' +
				'together with the machines on USB. The operator manual and the maintainance manual can optionally be ' +
				'translated at relevant surchanges.')
			
		if(data.extratexts && data.extratexts.wtc) 
			self.contract.extratexts.wtc(data.extratexts.wtc);	
		
		
		//CKEDITOR is loaded late, 'valueHasMutated' already been triggered, so we trigger it again 
		CKEDITOR.on('instanceReady', function() { 
			/* self.gtc_amendments_content_update.valueHasMutated();
			self.wtc_amendments_content_update.valueHasMutated();
			self.terms_of_payment_content_update.valueHasMutated(); */
			//ckhere
		});
		
	};
};


function HandOverAdditionalData() {
	var self = this;
	
	self.coverpage = {
		hggProjectNumber: ko.observable(''),
		hggProjectManager: ko.observable(''),
		handOverDate: ko.observable(''),
		salesKeyPerson: ko.observable('')
	};
	
	self.contactDetails = {
		
		rev1Date: ko.observable(''),
		rev1Name: ko.observable(''),
		rev1Change: ko.observable(''),
		
		rev2Date: ko.observable(''),
		rev2Name: ko.observable(''),
		rev2Change: ko.observable(''),
		
		rev3Date: ko.observable(''),
		rev3Name: ko.observable(''),
		rev3Change: ko.observable(''),
		
		rev4Date: ko.observable(''),
		rev4Name: ko.observable(''),
		rev4Change: ko.observable(''),
		
		rev5Date: ko.observable(''),
		rev5Name: ko.observable(''),
		rev5Change: ko.observable(''),
	
		companyAddress: ko.observable(''),
		companyName: ko.observable(''),
		companyTelephone: ko.observable(''),
		companyEmail: ko.observable(''),
		
		financialAddress: ko.observable(''),
		financialName: ko.observable(''),
		financialTelephone: ko.observable(''),
		financialEmail: ko.observable(''),
		
		technicalAddress: ko.observable(''),
		technicalName: ko.observable(''),
		technicalTelephone: ko.observable(''),
		technicalEmail: ko.observable(''),
		
		serviceAddress: ko.observable(''),
		serviceName: ko.observable(''),
		serviceTelephone: ko.observable(''),
		serviceEmail: ko.observable(''),
		
		agencyCompany: ko.observable(''),
		agencyAddress: ko.observable(''),
		agencyName: ko.observable(''),
		agencyTelephone: ko.observable(''),
		agencyEmail: ko.observable(''),
		
		deliveryAddress: ko.observable('')
	};
	
	self.financialScope = {
		hggOfferReference: ko.observable(''),
		poReference: ko.observable(''),
		referenceClient: ko.observable(''),
		vatNumber: ko.observable(''),
		documents: ko.observable(''),
		documentsAdditional: ko.observable(''),
		shipping: ko.observable(''),
		shippingAdditional: ko.observable(''),
		costsPreAcceptance: ko.observable(''),
		costsPreAcceptanceAdditional: ko.observable(''),
		costsInstallation: ko.observable(''),
		costsInstallationAdditional: ko.observable(''),
		commission: ko.observable(''),
		commissionAdditional: ko.observable(''),
		penalty: ko.observable(''),
		penaltyAdditional: ko.observable('')
	};
	
	self.technicalScope = {
		layout: ko.observable(''),
		layoutAdditional: ko.observable(''),
		oxyfuelCuttingGas: ko.observable(''),
		oxyfuelCuttingGasAdditional: ko.observable(''),
		plasmaCuttingGas: ko.observable(''),
		plasmaCuttingGasAdditional: ko.observable(''),
		power: ko.observable(''),
		powerAdditional: ko.observable(''),
		frequency: ko.observable(''),
		frequencyAdditional: ko.observable(''),
		voltage: ko.observable(''),
		voltageAdditional: ko.observable(''),
		proCAD: ko.observable(''),
		proCADAdditional: ko.observable(''),
		fileserverNetwork: ko.observable(''),
		fileserverNetworkAdditional: ko.observable(''),
		connectionType: ko.observable(''),
		connectionTypeAdditional: ko.observable(''),
		dataFileLocation: ko.observable(''),
		dataFileLocationAdditional: ko.observable(''),
		spareParts: ko.observable(''),
		sparePartsAdditional: ko.observable(''),
		consumableParts: ko.observable(''),
		consumablePartsAdditional: ko.observable(''),
		warranty: ko.observable(''),
		warrantyAdditional: ko.observable(''),
		service: ko.observable(''),
		serviceAdditional: ko.observable('')
	};
	
	self.remarks = {
		specials: ko.observable(''),
		specialsAdditional: ko.observable(''),
		remarks: ko.observable(''),
		ETO: ko.observable(''),
		ETOAdditional: ko.observable('')
	};
}

function HandOver(parent) {
	var self = this;
	self.parent = parent;
	
	self.allowDirty = true;
	self.isDirty = ko.observable(false);
	self.markAsDirty = function() { if(self.allowDirty) self.isDirty(true);}

	self.handOverAdditionalData = new HandOverAdditionalData();
	
	self.handOverAdditionalData.coverpage.hggProjectNumber.subscribe(self.markAsDirty);
	self.handOverAdditionalData.coverpage.hggProjectManager.subscribe(self.markAsDirty);
	self.handOverAdditionalData.coverpage.handOverDate.subscribe(self.markAsDirty);
	self.handOverAdditionalData.coverpage.salesKeyPerson.subscribe(self.markAsDirty);

	self.handOverAdditionalData.contactDetails.rev1Date.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.rev1Name.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.rev1Change.subscribe(self.markAsDirty);
	
	self.handOverAdditionalData.contactDetails.rev2Date.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.rev2Name.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.rev2Change.subscribe(self.markAsDirty);
	
	self.handOverAdditionalData.contactDetails.rev3Date.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.rev3Name.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.rev3Change.subscribe(self.markAsDirty);
	
	self.handOverAdditionalData.contactDetails.rev4Date.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.rev4Name.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.rev4Change.subscribe(self.markAsDirty);
	
	self.handOverAdditionalData.contactDetails.rev5Date.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.rev5Name.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.rev5Change.subscribe(self.markAsDirty);
	
	self.handOverAdditionalData.contactDetails.companyAddress.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.companyName.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.companyTelephone.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.companyEmail.subscribe(self.markAsDirty);	
	
	self.handOverAdditionalData.contactDetails.financialAddress.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.financialName.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.financialTelephone.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.financialEmail.subscribe(self.markAsDirty);	
	
	self.handOverAdditionalData.contactDetails.technicalAddress.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.technicalName.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.technicalTelephone.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.technicalEmail.subscribe(self.markAsDirty);	
	
	self.handOverAdditionalData.contactDetails.serviceAddress.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.serviceName.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.serviceTelephone.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.serviceEmail.subscribe(self.markAsDirty);	
	
	self.handOverAdditionalData.contactDetails.agencyCompany.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.agencyAddress.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.agencyName.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.agencyTelephone.subscribe(self.markAsDirty);
	self.handOverAdditionalData.contactDetails.agencyEmail.subscribe(self.markAsDirty);	
	
	self.handOverAdditionalData.contactDetails.deliveryAddress.subscribe(self.markAsDirty);
	
	self.handOverAdditionalData.financialScope.poReference.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.referenceClient.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.vatNumber.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.documents.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.documentsAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.shipping.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.shippingAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.costsPreAcceptance.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.costsPreAcceptanceAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.costsInstallation.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.costsInstallationAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.commission.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.commissionAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.penalty.subscribe(self.markAsDirty);
	self.handOverAdditionalData.financialScope.penaltyAdditional.subscribe(self.markAsDirty);
	
	self.handOverAdditionalData.technicalScope.layout.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.layoutAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.oxyfuelCuttingGas.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.oxyfuelCuttingGasAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.plasmaCuttingGas.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.plasmaCuttingGasAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.power.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.powerAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.frequency.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.frequencyAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.voltage.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.voltageAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.proCAD.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.proCADAdditional.subscribe(self.markAsDirty);
	
	self.handOverAdditionalData.technicalScope.fileserverNetwork.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.fileserverNetworkAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.connectionType.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.connectionTypeAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.dataFileLocation.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.dataFileLocationAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.spareParts.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.sparePartsAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.consumableParts.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.consumablePartsAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.warranty.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.warrantyAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.service.subscribe(self.markAsDirty);
	self.handOverAdditionalData.technicalScope.serviceAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.remarks.specials.subscribe(self.markAsDirty);
	self.handOverAdditionalData.remarks.specialsAdditional.subscribe(self.markAsDirty);
	self.handOverAdditionalData.remarks.remarks.subscribe(self.markAsDirty);
	self.handOverAdditionalData.remarks.ETO.subscribe(self.markAsDirty);
	self.handOverAdditionalData.remarks.ETOAdditional.subscribe(self.markAsDirty);

	self.initHandOverAdditionalData = function(data) {
		if(data.coverpage) {
			self.handOverAdditionalData.coverpage.hggProjectNumber(data.coverpage.hggProjectNumber);
			self.handOverAdditionalData.coverpage.hggProjectManager(data.coverpage.hggProjectManager);
			self.handOverAdditionalData.coverpage.handOverDate(data.coverpage.handOverDate);
			self.handOverAdditionalData.coverpage.salesKeyPerson(data.coverpage.salesKeyPerson);
		} else {
			self.handOverAdditionalData.coverpage.hggProjectNumber('');
			self.handOverAdditionalData.coverpage.hggProjectManager('');
			self.handOverAdditionalData.coverpage.handOverDate('');
			self.handOverAdditionalData.coverpage.salesKeyPerson('');
		}
		
		if(data.contactDetails) {
			
			self.handOverAdditionalData.contactDetails.rev1Date(data.contactDetails.rev1Date);
			self.handOverAdditionalData.contactDetails.rev1Name(data.contactDetails.rev1Name);
			self.handOverAdditionalData.contactDetails.rev1Change(data.contactDetails.rev1Change);
			
			self.handOverAdditionalData.contactDetails.rev2Date(data.contactDetails.rev2Date);
			self.handOverAdditionalData.contactDetails.rev2Name(data.contactDetails.rev2Name);
			self.handOverAdditionalData.contactDetails.rev2Change(data.contactDetails.rev2Change);
			
			self.handOverAdditionalData.contactDetails.rev3Date(data.contactDetails.rev3Date);
			self.handOverAdditionalData.contactDetails.rev3Name(data.contactDetails.rev3Name);
			self.handOverAdditionalData.contactDetails.rev3Change(data.contactDetails.rev3Change);
			
			self.handOverAdditionalData.contactDetails.rev4Date(data.contactDetails.rev4Date);
			self.handOverAdditionalData.contactDetails.rev4Name(data.contactDetails.rev4Name);
			self.handOverAdditionalData.contactDetails.rev4Change(data.contactDetails.rev4Change);
			
			self.handOverAdditionalData.contactDetails.rev5Date(data.contactDetails.rev5Date);
			self.handOverAdditionalData.contactDetails.rev5Name(data.contactDetails.rev5Name);
			self.handOverAdditionalData.contactDetails.rev5Change(data.contactDetails.rev5Change);
		
			
			self.handOverAdditionalData.contactDetails.companyAddress(data.contactDetails.companyAddress);
			self.handOverAdditionalData.contactDetails.companyName(data.contactDetails.companyName);
			self.handOverAdditionalData.contactDetails.companyTelephone(data.contactDetails.companyTelephone);
			self.handOverAdditionalData.contactDetails.companyEmail(data.contactDetails.companyEmail);
			
			self.handOverAdditionalData.contactDetails.financialAddress(data.contactDetails.financialAddress);
			self.handOverAdditionalData.contactDetails.financialName(data.contactDetails.financialName);
			self.handOverAdditionalData.contactDetails.financialTelephone(data.contactDetails.financialTelephone);
			self.handOverAdditionalData.contactDetails.financialEmail(data.contactDetails.financialEmail);
			
			self.handOverAdditionalData.contactDetails.technicalAddress(data.contactDetails.technicalAddress);
			self.handOverAdditionalData.contactDetails.technicalName(data.contactDetails.technicalName);
			self.handOverAdditionalData.contactDetails.technicalTelephone(data.contactDetails.technicalTelephone);
			self.handOverAdditionalData.contactDetails.technicalEmail(data.contactDetails.technicalEmail);
			
			self.handOverAdditionalData.contactDetails.serviceAddress(data.contactDetails.serviceAddress);
			self.handOverAdditionalData.contactDetails.serviceName(data.contactDetails.serviceName);
			self.handOverAdditionalData.contactDetails.serviceTelephone(data.contactDetails.serviceTelephone);
			self.handOverAdditionalData.contactDetails.serviceEmail(data.contactDetails.serviceEmail);
			
			if(data.contactDetails.agencyCompany) {
				self.handOverAdditionalData.contactDetails.agencyCompany(data.contactDetails.agencyCompany);
			} else { // if data from old version
				self.handOverAdditionalData.contactDetails.agencyCompany('');
			}
			self.handOverAdditionalData.contactDetails.agencyAddress(data.contactDetails.agencyAddress);
			self.handOverAdditionalData.contactDetails.agencyName(data.contactDetails.agencyName);
			self.handOverAdditionalData.contactDetails.agencyTelephone(data.contactDetails.agencyTelephone);
			self.handOverAdditionalData.contactDetails.agencyEmail(data.contactDetails.agencyEmail);
			
			self.handOverAdditionalData.contactDetails.deliveryAddress(data.contactDetails.deliveryAddress);
		} else {
		
			self.handOverAdditionalData.contactDetails.rev1Date('');
			self.handOverAdditionalData.contactDetails.rev1Name('');
			self.handOverAdditionalData.contactDetails.rev1Change('');
			
			self.handOverAdditionalData.contactDetails.rev2Date('');
			self.handOverAdditionalData.contactDetails.rev2Name('');
			self.handOverAdditionalData.contactDetails.rev2Change('');
			
			self.handOverAdditionalData.contactDetails.rev3Date('');
			self.handOverAdditionalData.contactDetails.rev3Name('');
			self.handOverAdditionalData.contactDetails.rev3Change('');
			
			self.handOverAdditionalData.contactDetails.rev4Date('');
			self.handOverAdditionalData.contactDetails.rev4Name('');
			self.handOverAdditionalData.contactDetails.rev4Change('');
			
			self.handOverAdditionalData.contactDetails.rev5Date('');
			self.handOverAdditionalData.contactDetails.rev5Name('');
			self.handOverAdditionalData.contactDetails.rev5Change('');
			
			self.handOverAdditionalData.contactDetails.companyAddress(self.parent.project.customerDetails.companyName() + '\n' + 
																	  self.parent.project.customerDetails.fullAddress() + '\n' +
																	  self.parent.project.customerDetails.postalCode() + '\n' +
																	  self.parent.project.customerDetails.city() + '\n' +
																	  self.parent.project.customerDetails.country());
			self.handOverAdditionalData.contactDetails.companyName(self.parent.project.customerDetails.contactPerson());
			self.handOverAdditionalData.contactDetails.companyTelephone(self.parent.project.customerDetails.telNo());
			self.handOverAdditionalData.contactDetails.companyEmail(self.parent.project.customerDetails.email());
			
			self.handOverAdditionalData.contactDetails.financialAddress(self.parent.project.customerDetails.companyName() + '\n' + 
																	    self.parent.project.customerDetails.fullAddress() + '\n' +
																	    self.parent.project.customerDetails.postalCode() + '\n' +
																	    self.parent.project.customerDetails.city() + '\n' +
																	    self.parent.project.customerDetails.country());
			self.handOverAdditionalData.contactDetails.financialName(self.parent.project.customerDetails.contactPerson());
			self.handOverAdditionalData.contactDetails.financialTelephone(self.parent.project.customerDetails.telNo());
			self.handOverAdditionalData.contactDetails.financialEmail(self.parent.project.customerDetails.email());
			
			self.handOverAdditionalData.contactDetails.technicalAddress('');
			self.handOverAdditionalData.contactDetails.technicalName('');
			self.handOverAdditionalData.contactDetails.technicalTelephone('');
			self.handOverAdditionalData.contactDetails.technicalEmail('');
			
			self.handOverAdditionalData.contactDetails.serviceAddress('');
			self.handOverAdditionalData.contactDetails.serviceName('');
			self.handOverAdditionalData.contactDetails.serviceTelephone('');
			self.handOverAdditionalData.contactDetails.serviceEmail('');
			
			self.handOverAdditionalData.contactDetails.agencyCompany('');
			self.handOverAdditionalData.contactDetails.agencyAddress('');
			self.handOverAdditionalData.contactDetails.agencyName('');
			self.handOverAdditionalData.contactDetails.agencyTelephone('');
			self.handOverAdditionalData.contactDetails.agencyEmail('');
			
			self.handOverAdditionalData.contactDetails.deliveryAddress('');
		}
		
		if(data.financialScope) {
			self.handOverAdditionalData.financialScope.hggOfferReference(data.financialScope.hggOfferReference);
			self.handOverAdditionalData.financialScope.poReference(data.financialScope.poReference);
			self.handOverAdditionalData.financialScope.referenceClient(data.financialScope.referenceClient);
			self.handOverAdditionalData.financialScope.vatNumber(data.financialScope.vatNumber);
			self.handOverAdditionalData.financialScope.documents(data.financialScope.documents);
			self.handOverAdditionalData.financialScope.documentsAdditional(data.financialScope.documentsAdditional);
			self.handOverAdditionalData.financialScope.shipping(data.financialScope.shipping);
			self.handOverAdditionalData.financialScope.shippingAdditional(data.financialScope.shippingAdditional);
			self.handOverAdditionalData.financialScope.costsPreAcceptance(data.financialScope.costsPreAcceptance);
			self.handOverAdditionalData.financialScope.costsPreAcceptanceAdditional(data.financialScope.costsPreAcceptanceAdditional);
			self.handOverAdditionalData.financialScope.costsInstallation(data.financialScope.costsInstallation);
			self.handOverAdditionalData.financialScope.costsInstallationAdditional(data.financialScope.costsInstallationAdditional);
			self.handOverAdditionalData.financialScope.commission(data.financialScope.commission);
			self.handOverAdditionalData.financialScope.commissionAdditional(data.financialScope.commissionAdditional);
			
			if(data.financialScope.penalty) { 
				self.handOverAdditionalData.financialScope.penalty(data.financialScope.penalty);
				self.handOverAdditionalData.financialScope.penaltyAdditional(data.financialScope.penaltyAdditional);
			} else {
				self.handOverAdditionalData.financialScope.penalty('');
				self.handOverAdditionalData.financialScope.penaltyAdditional('');
			}
		} else {
			self.handOverAdditionalData.financialScope.hggOfferReference(self.parent.project.projectName);
			self.handOverAdditionalData.financialScope.poReference('');
			self.handOverAdditionalData.financialScope.referenceClient('');
			self.handOverAdditionalData.financialScope.vatNumber('');
			self.handOverAdditionalData.financialScope.documents('');
			self.handOverAdditionalData.financialScope.documentsAdditional('');
			self.handOverAdditionalData.financialScope.shipping('');
			self.handOverAdditionalData.financialScope.shippingAdditional('');
			self.handOverAdditionalData.financialScope.costsPreAcceptance('');
			self.handOverAdditionalData.financialScope.costsPreAcceptanceAdditional('');
			self.handOverAdditionalData.financialScope.costsInstallation('');
			self.handOverAdditionalData.financialScope.costsInstallationAdditional('');
			self.handOverAdditionalData.financialScope.commission('');
			self.handOverAdditionalData.financialScope.commissionAdditional('');
			self.handOverAdditionalData.financialScope.penalty('');
			self.handOverAdditionalData.financialScope.penaltyAdditional('');
		}
		
		if(data.technicalScope) {
			self.handOverAdditionalData.technicalScope.layout(data.technicalScope.layout);
			self.handOverAdditionalData.technicalScope.layoutAdditional(data.technicalScope.layoutAdditional);
			self.handOverAdditionalData.technicalScope.oxyfuelCuttingGas(data.technicalScope.oxyfuelCuttingGas);
			self.handOverAdditionalData.technicalScope.oxyfuelCuttingGasAdditional(data.technicalScope.oxyfuelCuttingGasAdditional);
			self.handOverAdditionalData.technicalScope.plasmaCuttingGas(data.technicalScope.plasmaCuttingGas);
			self.handOverAdditionalData.technicalScope.plasmaCuttingGasAdditional(data.technicalScope.plasmaCuttingGasAdditional);
			self.handOverAdditionalData.technicalScope.power(data.technicalScope.power);
			self.handOverAdditionalData.technicalScope.powerAdditional(data.technicalScope.powerAdditional);
			self.handOverAdditionalData.technicalScope.frequency(data.technicalScope.frequency);
			self.handOverAdditionalData.technicalScope.frequencyAdditional(data.technicalScope.frequencyAdditional);
			self.handOverAdditionalData.technicalScope.voltage(data.technicalScope.voltage);
			self.handOverAdditionalData.technicalScope.voltageAdditional(data.technicalScope.voltageAdditional);
			self.handOverAdditionalData.technicalScope.proCAD(data.technicalScope.proCAD);
			self.handOverAdditionalData.technicalScope.proCADAdditional(data.technicalScope.proCADAdditional);
			self.handOverAdditionalData.technicalScope.fileserverNetwork(data.technicalScope.fileserverNetwork);
			self.handOverAdditionalData.technicalScope.fileserverNetworkAdditional(data.technicalScope.fileserverNetworkAdditional);
			self.handOverAdditionalData.technicalScope.connectionType(data.technicalScope.connectionType);
			self.handOverAdditionalData.technicalScope.connectionTypeAdditional(data.technicalScope.connectionTypeAdditional);
			self.handOverAdditionalData.technicalScope.dataFileLocation(data.technicalScope.dataFileLocation);
			self.handOverAdditionalData.technicalScope.dataFileLocationAdditional(data.technicalScope.dataFileLocationAdditional);
			self.handOverAdditionalData.technicalScope.spareParts(data.technicalScope.spareParts);
			self.handOverAdditionalData.technicalScope.sparePartsAdditional(data.technicalScope.sparePartsAdditional);
			self.handOverAdditionalData.technicalScope.consumableParts(data.technicalScope.consumableParts);
			self.handOverAdditionalData.technicalScope.consumablePartsAdditional(data.technicalScope.consumablePartsAdditional);
			self.handOverAdditionalData.technicalScope.warranty(data.technicalScope.warranty);
			self.handOverAdditionalData.technicalScope.warrantyAdditional(data.technicalScope.warrantyAdditional);
			self.handOverAdditionalData.technicalScope.service(data.technicalScope.service);
			self.handOverAdditionalData.technicalScope.serviceAdditional(data.technicalScope.serviceAdditional);
		} else {
			self.handOverAdditionalData.technicalScope.layout('');
			self.handOverAdditionalData.technicalScope.layoutAdditional('');
			self.handOverAdditionalData.technicalScope.oxyfuelCuttingGas('');
			self.handOverAdditionalData.technicalScope.oxyfuelCuttingGasAdditional('');
			self.handOverAdditionalData.technicalScope.plasmaCuttingGas('');
			self.handOverAdditionalData.technicalScope.plasmaCuttingGasAdditional('');
			self.handOverAdditionalData.technicalScope.power('');
			self.handOverAdditionalData.technicalScope.powerAdditional('');
			self.handOverAdditionalData.technicalScope.frequency('');
			self.handOverAdditionalData.technicalScope.frequencyAdditional('');
			self.handOverAdditionalData.technicalScope.voltage('');
			self.handOverAdditionalData.technicalScope.voltageAdditional('');
			self.handOverAdditionalData.technicalScope.proCAD('');
			self.handOverAdditionalData.technicalScope.proCADAdditional('');
			self.handOverAdditionalData.technicalScope.fileserverNetwork('');
			self.handOverAdditionalData.technicalScope.fileserverNetworkAdditional('');
			self.handOverAdditionalData.technicalScope.connectionType('');
			self.handOverAdditionalData.technicalScope.connectionTypeAdditional('');
			self.handOverAdditionalData.technicalScope.dataFileLocation('');
			self.handOverAdditionalData.technicalScope.dataFileLocationAdditional('');
			self.handOverAdditionalData.technicalScope.spareParts('');
			self.handOverAdditionalData.technicalScope.sparePartsAdditional('');
			self.handOverAdditionalData.technicalScope.consumableParts('');
			self.handOverAdditionalData.technicalScope.consumablePartsAdditional('');
			self.handOverAdditionalData.technicalScope.warranty('');
			self.handOverAdditionalData.technicalScope.warrantyAdditional('');
			self.handOverAdditionalData.technicalScope.service('');
			self.handOverAdditionalData.technicalScope.serviceAdditional('');
		}
		
		if(data.remarks) {
			self.handOverAdditionalData.remarks.specials(data.remarks.specials);
			self.handOverAdditionalData.remarks.specialsAdditional(data.remarks.specialsAdditional);
			self.handOverAdditionalData.remarks.remarks(data.remarks.remarks);
			self.handOverAdditionalData.remarks.ETO(data.remarks.ETO);
			self.handOverAdditionalData.remarks.ETOAdditional(data.remarks.ETOAdditional);
		} else {
			self.handOverAdditionalData.remarks.specials('');
			self.handOverAdditionalData.remarks.specialsAdditional('');
			self.handOverAdditionalData.remarks.remarks('');		
			self.handOverAdditionalData.remarks.ETO('');
			self.handOverAdditionalData.remarks.ETOAdditional('');
		}
	};
	
	self.orderconfirmation = undefined; 
	
	self.generateHandOver = function(draft) {
        var offer = {};
		offer.handOverAdditionalData = self.handOverAdditionalData;
		offer.draft = draft;
		offer.image = self.parent.project.machine.image;
		offer.reference = self.parent.project.projectName;
        offer.customerDetails = self.parent.project.customerDetails;
        offer.machineName = self.parent.project.machine.machineName();
		offer.pdFrontPage = self.parent.project.machine.frontPage;
		var machineType = self.parent.project.machine.machineType();
		var title = 'Profiling Machine';
		if(machineType.indexOf('PPM') != -1) title = 'Pipe Profiling Machine';
		else if(machineType.indexOf('RPM') != -1) title = 'Robotic Profiling Machine';
		offer.scopeTitle = title;
		offer.scopeSummary = self.parent.project.machine.summary;
		offer.warrantyTermsAndConditions = self.parent.project.machine.warrantyTermsAndConditions;
        offer.serviceSupportTermsAndConditions = self.parent.project.machine.serviceSupportTermsAndConditions;
        offer.machineId = self.parent.project.machine.id;
        offer.machineRev = self.parent.project.machine.rev;
		offer.orderconfirmation = self.orderconfirmation;
        //offer.introduction = self.introduction();
		offer.address = '';
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
								chapterContainer.options.push({name: option.name, description: option.description, quantity: qty, pdf: option.pdf, price: amount, id: option.id});
								chapterName = '';
							}
						}
						
						if (subject.subject !== "Complementary goods") {
						    if(self.parent.project.newComponents.standard[subject.subject][chapter.chapterName] == undefined) {
								self.parent.project.newComponents.standard[subject.subject][chapter.chapterName] = ko.observableArray();
							}
							var newComponents = self.parent.project.newComponents.standard[subject.subject][chapter.chapterName].slice();
							for(var ioption = 0; ioption < newComponents.length; ioption++) {
								var option = newComponents[ioption];
								var qty = option.quantity;
								var amount = 0;
                                var pdfDoc = (option.document) ? 'customPdf/' + option.document : '';                                
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
                    var subjectContainer = { name: subject.subject, chapters: []};
                    for (j = 0; j < subject.chapters.length; j++) {
                        var chapter = subject.chapters[j];
                        var chapterContainer = { name: chapter.chapterName, options: []};
                        var additionalComplementaryGoods = self.parent.project.complementaryGoods.standard.slice();
                        for (var iCg = 0; iCg < additionalComplementaryGoods.length; iCg++) {
                            if (chapter.chapterName == additionalComplementaryGoods[iCg].chapter) {
                                var amount = 0;
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
								var amount = self.parent.price.formatPrice(self.parent.price.computeCN(option.price, self.parent.project.price.optional_commission(), self.parent.project.price.optional_negotiation(), option.quantity(), self.parent.project.price.offer_settings.exchange_rate()));
								chapterContainer.options.push({name: option.name, description: option.description, quantity: option.quantity, pdf:'', price: amount, id: option.id});
								chapterName = '';
							}
						}
						
						if (subject.subject !== "Complementary goods") {
							if(self.parent.project.newComponents.optional[subject.subject][chapter.chapterName] == undefined) {
								self.parent.project.newComponents.optional[subject.subject][chapter.chapterName] = ko.observableArray();
							}
							var newComponents = self.parent.project.newComponents.optional[subject.subject][chapter.chapterName].slice();
							for(var ioption = 0; ioption < newComponents.length; ioption++) {
								var option = newComponents[ioption];
								var pdfDoc = (option.document) ? 'customPdf/' + option.document : '';
								var qty = option.quantity;
								var amount = 0;								
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
                    var subjectContainer = { name: subject.subject, chapters: []};
                    for (j = 0; j < subject.chapters.length; j++) {
                        var chapter = subject.chapters[j];
                        var chapterContainer = { name: chapter.chapterName, options: []};
                        var additionalComplementaryGoods = self.parent.project.complementaryGoods.optional.slice();
                        for (var iCg = 0; iCg < additionalComplementaryGoods.length; iCg++) {
                            if (chapter.chapterName == additionalComplementaryGoods[iCg].chapter) {
                                var qty = additionalComplementaryGoods[iCg].quantity;
                                var amount = 0;
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
				
		offer.termsAndConditions = self.parent.project.termsAndConditionsText;
        offer.signature = self.parent.project.signature;
		offer.include = self.parent.project.visibilityOptions.slice();
		//console.log(offer.include);
        offer.productDescriptionIntro = false;
					
		offer.label = 'Hand Over Document';
		offer.customer_ref = self.parent.order.contract.introduction.customer_reference();

		prooffer_data.generateHandOver(ko.toJSON(offer));
	};
	
	self.saveLabel = ko.observable('Save');
	
	self.save = function() {		
		self.allowDirty = false;
		self.saveLabel('Saving...');
		self.parent.project.handover = JSON.parse(ko.toJSON(self.handOverAdditionalData));
		_global_offerComponents_savecallback = function() { self.isDirty(false); self.saveLabel('Save'); _global_offerComponents_savecallback = undefined;}
		self.parent.project.update();		
		self.allowDirty = true;
	};
	
	self.createHandOver = function() { 
		self.generateHandOver(false);
	}	
}

function OrderConfirmation() {
    var self = this;
	
	self.project = new Project();
		
	self.user = prooffer_data.getUserData();
	    
	self.stages = ['Start','OrderConfirmation','HandOver']; 
	
	self.currentStageId = ko.observable(self.stages[0]); 
    self.hasStarted = ko.observable(false); 
	    
    self.startOptions = new OrdConStartOptions(self);
	self.customerDetails = new CustomerDetails(self);
    self.machine = new Machine(self);
	self.machineOptions = new MachineOptions(self);
	self.newComponents = new NewComponents(self);
    self.complementaryGoods = new ComplementaryGoods(self);
    self.price = new Price(self);
	self.order = new Order(self);
	self.handover = new HandOver(self);
	
	self.gotoStage = function(stage) {
        switch (stage) {
            case 'Start':
                if (self.hasStarted()) {
                    self.hasStarted(false);
                    self.currentStageId(stage);
					//set self.offer.allowUpdate to false so offer preview will be refreshed when going to offer
                    if(self.startOptions.isProjectListDirty) {
						self.startOptions.initializeProjectList();
					}
                }
                break;
			case 'OrderConfirmation':
                self.currentStageId(stage);
                //self.order.orderConfirmationTemplate(self.project.ordcon ? self.project.ordcon.content : OrderConfirmationTemplate);
				//self.order.orderConfirmationTemplate.valueHasMutated();
				self.order.appendixN = 0;
				self.order.allowDirty = true;
                break;
			case 'HandOver':
				if(self.order.contract.external()) {
					self.handover.orderconfirmation = '<html><body><p>Please Refer to External Document</p></body></html>';
				} else {					
					self.handover.orderconfirmation = self.order.orderConfirmation(true);
				}
				self.currentStageId(stage);
				self.handover.allowDirty = true;
				break;
            default:
                self.currentStageId(stage);
        }
    };	
	   
    self.projectNumber = ko.observable();
    self.machineName = ko.observable();

	

}

ko.bindingHandlers.htmlValue = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        ko.utils.registerEventHandler(element, "blur", function() {
            var modelValue = valueAccessor();
            var elementValue = element.innerHTML;
            if (ko.isWriteableObservable(modelValue)) {
                modelValue(elementValue);
            }
            else { //handle non-observable one-way binding
                var allBindings = allBindingsAccessor();
                if (allBindings['_ko_property_writers'] && allBindings['_ko_property_writers'].htmlValue) allBindings['_ko_property_writers'].htmlValue(elementValue);
            }
        })
    },
    update: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()) || "";
        element.innerHTML = value;
    }
};

var orderConfirmation = new OrderConfirmation()

orderConfirmation.startOptions.initializeProjectList();

ko.applyBindings(orderConfirmation);

