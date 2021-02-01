"""
Convert excel data to javascript array
"""

from listobject import ListObject
import prooffer_utils
import os
import re
import json

import prooffer_server


class Subject(ListObject):
    def __init__(self, name):
        ListObject.__init__(self,name, 'subject', 'chapters')

class Chapter(ListObject):

    def __init__(self, name, type='OR', description=''):
        ListObject.__init__(self,re.escape(name), 'chapterName', 'options')	
        self.type = type
        self.description = description

    def write(self, stream, terminate):
        stream = ListObject.write(self,stream, False)
        
        getTotal = "getTotal: function() { \
						var total = 0;\
						for(var i = 0; i < this.options.length; i++) { \
							if(this.options[i].isSelected()) { \
								total += (parseFloat(this.options[i].price) * parseInt(this.options[i].quantity()));\
							}\
						}\
						return total;}"
		
        stream += str(", description:'" + self.description + "'");
        
        if self.type == 'OR':
            stream += str(",checkbox:false,selector: new ORSelector('" + self.name + "')," + getTotal + "},");
        elif self.type == 'AND':
            stream += str(",checkbox:true,selector: new ANDSelector('" + self.name + "')," + getTotal + "},");
        return stream
        
class Option:
    def __init__(self, name, chapter, price, isUSD, description, type, pdf, isDefault, isRequired, isDisabled):
        self.name = re.escape(name)
        self.chapter = chapter
        self.price = price
        self.isUSD = isUSD
        self.description = description
        self.type = type
        self.pdf = pdf
        self.isDefault = isDefault
        self.isRequired = isRequired
        self.isDisabled = isDisabled

    def write(self, stream, terminate):
        description = self.description
        description = description.replace(u'\u2018', "\\'")
        description = description.replace(u'\u2019', "\\'")
        description = description.replace(u'\u201c', "\\'")
        description = description.replace(u'\u201d', "\\'")
        description = description.replace(u'\xb0', ' degrees')
        description = description.replace('\n', '\\n') 
        #description = re.escape(description)
        stream += str("new Option('" + self.name + "','" + self.chapter + "','" + str(self.price) + "','" + str(self.isUSD) + "','" + description + "','" + self.pdf + "',");
        
        if self.isDefault:
            stream += "true,"
        else:
            stream += "false,"
        
        if self.isRequired:
            stream += "true,"
        else:
            stream += "false,"
        
        if self.isDisabled:
            stream += "true,"
        else:
            stream += "false,"
        
        if self.type.startswith('MULTIPLE'):
            str1 = self.type.split(':');
            default = str1[1];
            stream += str("'MULTIPLE', " + str(default));
        elif self.type.startswith('LENGTH'):
            str1 = self.type.split(':');
            default = str1[1];
            stream += str("'LENGTH', " + str(default));
        else:
            stream += str("'SINGLE'");
        
        stream += "),"
        return stream
        
def getMachineOptions(data):
    server = prooffer_server.getServer()
    projectsdb = prooffer_server.getProjectsDB()
    datadb = prooffer_server.getDataDB()
    usersdb = prooffer_server.getUsersDB()

    options = data['options']
    machineoptions_schema = datadb['schema']['subjects']
    machine = None
    query = None
    complementary_goods_id = -1
    
    EURtoUSDrate = datadb['testOverwrite']['2016_week_42']
    
    if options == 'Complementary goods':   
        
        for subject in machineoptions_schema:
            if subject['name'] == 'Complementary Goods':
                complementary_goods_id = subject['id']
        
        if complementary_goods_id != -1:
            query = 'function(doc){'\
                    '  if(doc.datatype) {'\
                    '    if(doc.datatype == "machineoption"){'\
                    '      if(doc.subject == ' + str(complementary_goods_id) + ' && doc.c0priceDefined == "yes" && doc.accepted == "yes" && doc.deliveryAndCostsDefined == "yes" && doc.payrollCalculated == "yes" && doc.released == "yes" && doc.isAvailable) {'\
                    '         emit([doc.subject, doc.chapter, doc.name], doc);'\
                    '      }'\
                    '    }'\
                    '  }'\
                    '}'
    elif len(options) > 0:
        machine = datadb[options]
        query = 'function(doc) {'\
                '  var machineoptions = "' + ';'.join(machine['machineoptions']) + '";'\
                '  if(machineoptions.indexOf(doc._id) != -1 && doc.c0priceDefined == "yes" && doc.accepted == "yes" && doc.deliveryAndCostsDefined == "yes" && doc.payrollCalculated == "yes" && doc.released == "yes" && doc.isAvailable) {'\
                '    emit([doc.subject, doc.chapter, doc.name], doc);'\
                '  }'\
                '}'
                
    machineoptions = {}
    if query:
        for row in datadb.query(query):
            (subject, chapter, name) = row.key
            machineoptions.update({(subject, chapter, name):row.value})
    machineoptions_list = sorted(machineoptions)
    
    subjectNames = []
    subjects = []
    for subject_id, chapter_id, option_name in machineoptions_list:
        if subject_id is not None:
            schema = machineoptions_schema[subject_id] #ERROR 	/home/rafael/prooffer/prooffer_app/machineoptions.py in getMachineOptions, line 143
            subjectName = schema['name']
            if subjectName not in subjectNames:
                subjectNames.append(subjectName)
                subject = Subject(subjectName)
                subjects.append(subject)
                chapterNames = []

            chapterName = schema['elements'][chapter_id]['name']
            if chapterName not in chapterNames:
                chapterNames.append(chapterName)
                chapter = Chapter(chapterName, schema['elements'][chapter_id]['type'])
                subject.add(chapter)

            machineoption = machineoptions[(subject_id, chapter_id, option_name)]

            isUSD = False

            if machineoption.has_key('hasUSDPrice'):
                if (machineoption['hasUSDPrice']):
                    isUSD = True
                    price = prooffer_utils.setValue(machineoption['unit_price_USD'], '0.00')
                else:
                    price = prooffer_utils.setValue(machineoption['unit_price'], '0.00')
            else:
                price = prooffer_utils.setValue(machineoption['unit_price'], '0.00')
            description = prooffer_utils.setValue(machineoption['description'], '')
            type = prooffer_utils.setValue(machineoption['option_type'],'NORMAL')
            pdf = ''
            if machine and data['defaultOptions'] != 'NONE':
                optionType = machine['machineoptions'][machineoption['_id']]
            else:
                optionType = 'Optional'
            option = Option(';'.join([option_name,machineoption['_id'],machineoption['_rev']]), chapterName, price, isUSD, description, type, pdf, optionType == 'Default', optionType == 'Required', optionType == 'NA')
            chapter.add(option)

    stream = "["
    for sub in subjects: 
        stream = sub.write(stream)
    stream += "]"
    
    if data['includeIndustryDefaults'] == True:
        industry_defaults = datadb['industry_default']['defaults']
        sequence = ['Standard', 'Steel', 'Process', 'Offshore', 'Ship', 'Other']
        
        defaults = '{'
        for industryDefault in sequence:
            defaults += (industryDefault + ':[')
            for default in industry_defaults[industryDefault]:
                defaults += ("'" + default + "',")
            defaults += "],"
        defaults += '}'
            
        return "[{ options:" + stream + ", defaults:" + defaults + "}]"
    else:
        return stream
        
if __name__ == "__main__":
    print getMachineOptions({ 'options': 'Complementary goods', 'defaultOptions':'NONE','includeIndustryDefaults': False})