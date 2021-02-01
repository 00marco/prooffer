"""
Convert excel data to javascript array
"""

from listobject import ListObject
import prooffer_utils
import re

import prooffer_server


class MachineType(ListObject):
	def __init__(self, name):
		ListObject.__init__(self,name, 'typeName', 'ranges')

class MachineRange(ListObject):
	def __init__(self, name):
		ListObject.__init__(self,name, 'rangeName', 'machines')		
		
class Machine:
    def __init__(self, name, options, initprice, defaultCurrency, image, frontPage, introduction, introduced, default, summary, technicalData, machineLayout, referenceList, warrantyTermsAndConditions, serviceSupportTermsAndConditions, id, rev):
        self.name = name
        self.options = options
        self.initprice = initprice
        self.defaultCurrency = defaultCurrency
        self.image = image
        self.frontPage = frontPage
        self.introduction = introduction  
        self.introduced = introduced
        self.default = default
        self.summary = re.escape(summary)
        self.technicalData = technicalData
        self.machineLayout = machineLayout
        self.referenceList = referenceList
        self.warrantyTermsAndConditions = warrantyTermsAndConditions
        self.serviceSupportTermsAndConditions = serviceSupportTermsAndConditions
        self.id = id
        self.rev = rev
        
    def write(self, stream, terminate = True):
        stream += '{'
        
        def add(name, value, comma = True):
            strm = (name + ':' + "'" + value + "'")
            if comma:
                strm += ','    
            return strm
        
        stream += add('machineName', self.name)
        stream += add('options', self.options)
        stream += add('initprice', str(self.initprice))
        stream += add('defaultCurrency', str(self.defaultCurrency))
        stream += add('image', self.image)
        stream += add('frontPage', self.frontPage)
        stream += add('introduction', self.introduction)
        stream += add('introduced', self.introduced)        
        stream += add('defaultSelection', self.default)
        stream += add('summary', self.summary)
        stream += add('technicalData', self.technicalData)
        stream += add('machineLayout', self.machineLayout)
        stream += add('referenceList', self.referenceList)
        stream += add('warrantyTermsAndConditions', self.warrantyTermsAndConditions)
        stream += add('serviceSupportTermsAndConditions', self.serviceSupportTermsAndConditions)
        stream += add('id', self.id)
        stream += add('rev', self.rev,False)
        stream += '},'
        
        return stream

def getMachineData():   
    server = prooffer_server.getServer()
    projectsdb = prooffer_server.getProjectsDB()
    datadb = prooffer_server.getDataDB()
    usersdb = prooffer_server.getUsersDB()
    
    machines = {}
    viewresult = datadb.view('prooffer_data_views/machines')
    for row in viewresult:
        (type, range, name) = row.key
        machines.update({(type, range, name):row.value})
    machinelist = sorted(machines)    
    
    machinetypes = datadb['schema']['machinetypes']
    machine_types = []    
    types = []
    for type_id,range_id,machine_name in machinelist:
        type =  machinetypes[type_id]      
        
        typeName = type['name']
        if typeName not in types:
            types.append(typeName)
            machineType = MachineType(typeName)
            machine_types.append(machineType)
            ranges = []
        
        rangeName = type['elements'][range_id]['name']
        if rangeName not in ranges:
            ranges.append(rangeName)
            machineRange = MachineRange(rangeName)
            machineType.add(machineRange)
        
        machine_id = machines[(type_id,range_id,machine_name)]
        machinedata = datadb[machine_id]
        
        options = machine_id
        initprice = prooffer_utils.setValue(machinedata['initial_price'], '0.00')
        try:
            defaultCurrency = machinedata['default_currency']
        except KeyError:
            defaultCurrency = 'EUR'
        image = ''#prooffer_utils.setValue(machinedata['cover_image'], '')
        frontPage = ''#prooffer_utils.setValue(machinedata['front_page_desc'], '') 
        introduction = ''#prooffer_utils.setValue(machinedata['description_intro'], '')
        try:
            introduced = machinedata['introduced']
        except KeyError:
            introduced = 'no'
        default = 'DEFAULT'
        summary = prooffer_utils.setValue(machinedata['scope_intro'], '')
        technicalData = ''#prooffer_utils.setValue(machinedata['technical_data'], '')
        machineLayout = ''#prooffer_utils.setValue(machinedata['machine_layout'], '')
        referenceList = ''#prooffer_utils.setValue(machinedata['reference_list'], '')
        warrantyTermsAndConditions = ''#prooffer_utils.setValue(machinedata['warranty_tc'], '')
        serviceSupportTermsAndConditions = ''#prooffer_utils.setValue(machinedata['service_tc'], '')
        machine = Machine(machine_name, options, initprice, defaultCurrency, image, frontPage, introduction, introduced, default, summary, technicalData, machineLayout, referenceList, warrantyTermsAndConditions, serviceSupportTermsAndConditions, machinedata['_id'],machinedata['_rev'])
        machineRange.add(machine)
        
    stream = "["
    for type in machine_types:
        stream = type.write(stream)
    stream += "]"

    return stream
    
if __name__ == "__main__":
    print getMachineData()