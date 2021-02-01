from django.http import HttpResponse, HttpResponseServerError, HttpResponseRedirect
from django.shortcuts import render_to_response
from pyPdf import PdfFileWriter, PdfFileReader
from reportlab.pdfgen import canvas
from io import BytesIO
from django.core.servers.basehttp import FileWrapper
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from datetime import datetime
from offergenerator import Offer
import machinedata
import machineoptions
import os
import json
import prooffer_user
import prooffer_settings
import cStringIO
import subprocess
import base64
import sys

import prooffer_server
server = prooffer_server.getServer()
projectsdb = prooffer_server.getProjectsDB()
datadb = prooffer_server.getDataDB()
usersdb = prooffer_server.getUsersDB()
cachedb = server['prooffer_cache']
settingsdb = server['prooffer_settings']


def prooffer(request):
    privilege = cachedb['current_privilege']['value']
    if privilege:
        #if privilege == 'privilege_c21b83c992e14b1b98a13210fb6a67ed':           
        #    prooffer_server.isAdmin = True
        #    datadb = prooffer_server.getDataDB()
        return render_to_response("index.html")
    else:
        return HttpResponseServerError('Privilege is not set')

def machineData(request):
	return HttpResponse(machinedata.getMachineData(), content_type='text')
	
def machineOptions(request):
    data = json.loads(request.REQUEST['data'])
    if 'options' not in data:
        data.update({'options':''})
    if 'defaultOptions' not in data:
        data.update({'defaultOptions':'NONE'})
    if 'includeIndustryDefaults' not in data:
        data.update({'includeIndustryDefaults':False})
    return HttpResponse(machineoptions.getMachineOptions(data), content_type='text')

def getSchema(request):
    # requeststream = "{"
    
    # requeststream += '"_id":"' + datadb['schema']['_id'] + '", '
    # requeststream += '"_rev":"' + datadb['schema']['_rev'] + '", '
    # requeststream += '"datatype":"' + datadb['schema']['datatype'] + '", '
    
    # requeststream += '"machinetypes":['
    # typeiterator = 0
    # rangeiterator = 0
    
    
    # for machinetype in datadb['schema']['machinetypes']:
        # if typeiterator > 0:
            # requeststream += ', '
        # requeststream += '{'
        # typename =  machinetype['name']
        # requeststream += '"name":"' + typename + '", '
        # requeststream += '"ranges":['
        # for range in machinetype['elements']:
            # if rangeiterator > 0:
			
                # requeststream += ', '
            # rangename = range['name']
            # requeststream += '{"name":"' + rangename + '"}'
            # rangeiterator += 1
        # requeststream += ']}'
        # typeiterator += 1
        # rangeiterator = 0
    # requeststream += '], '
    
    
    # requeststream += '"subjects":['
    # subjectiterator = 0
    # chapteriterator = 0
    
    # for optionsubject in datadb['schema']['subjects']:
        # if subjectiterator > 0:
            # requeststream += ', '
        # requeststream += '{'
        # subjectname =  optionsubject['name']
        # requeststream += '"name":"' + subjectname + '", '
        # requeststream += '"chapters":['
        # for chapter in optionsubject['elements']:
            # if chapteriterator > 0:
			
                # requeststream += ', '
            # chaptername = chapter['name']
            # requeststream += '{"name":"' + chaptername + '"}'
            # chapteriterator += 1
        # requeststream += ']}'
        # subjectiterator += 1
        # chapteriterator = 0
    # requeststream += ']'
    
    
    # requeststream += "}"
    
    requeststream = json.dumps(datadb['schema'])
    
    return HttpResponse(requeststream, content_type='text')	
	
def generateOffer(request):
    data = json.loads(request.POST['data'])
    offer = Offer(data)
    offer.setImage(data['image'])
    offer.setCustomerDetails(data['customerDetails'])
    offer.setCustomerName(data['customerDetails']['companyName'])
    offer.setCustomerAddress(data['customerDetails']['fullAddress'])
    offer.setQuoteNumber('QUOTE ' + data['reference'])
    offer.setContactPerson(data['customerDetails']['contactPerson'])
    offer.setMachineName(data['machineName'])
    offer.setIntroduction(data['introduction'])
    offer.setShowItemPrice(data['showItemPrice'])
    offer.setShowDiscount(data['showDiscount'])
    offer.setSelectedScopeOfSupply(data['scopeOfSupply'])
    offer.setScopeOfSupplyAmount(data['scopeOfSupplyAmount'])
    offer.setOptionList(data['optionList'])
    offer.setTerms(data['termsAndConditions'])

    return HttpResponse(offer.generate(data['include']))
	
def generateOrder(request):
    data = json.loads(request.POST['data'])
    offer = Offer(data)
    offer.setImage(data['image'])
    offer.setCustomerDetails(data['customerDetails'])
    offer.setCustomerName(data['customerDetails']['companyName'])
    offer.setCustomerAddress(data['customerDetails']['fullAddress'])
    offer.setQuoteNumber(data['reference'])
    offer.setContactPerson(data['customerDetails']['contactPerson'])
    offer.setMachineName(data['machineName'])
    #offer.setIntroduction(data['introduction'])
    offer.setShowItemPrice(data['showItemPrice'])
    offer.setShowDiscount(data['showDiscount'])
    offer.setSelectedScopeOfSupply(data['scopeOfSupply'])
    offer.setScopeOfSupplyAmount(data['scopeOfSupplyAmount'])
    offer.setOptionList(data['optionList'])
    offer.setTerms(data['termsAndConditions'])
	
    return HttpResponse(offer.generateOrder(data['include']))

def generateOrderPreview(request):
    data = json.loads(request.REQUEST['data'])
    offer = Offer(data)
    offer.setImage(data['image'])
    offer.setCustomerDetails(data['customerDetails'])
    offer.setCustomerName(data['customerDetails']['companyName'])
    offer.setCustomerAddress(data['customerDetails']['fullAddress'])
    offer.setQuoteNumber(data['reference'])
    offer.setContactPerson(data['customerDetails']['contactPerson'])
    offer.setMachineName(data['machineName'])
    return HttpResponse(offer.generateOrderPreview())

def generateHandOver(request):
    data = json.loads(request.POST['data'])
    offer = Offer(data)
    offer.setImage(data['image'])
    offer.setCustomerDetails(data['customerDetails'])
    offer.setCustomerName(data['customerDetails']['companyName'])
    offer.setCustomerAddress(data['customerDetails']['fullAddress'])
    offer.setQuoteNumber(data['reference'])
    offer.setContactPerson(data['customerDetails']['contactPerson'])
    offer.setMachineName(data['machineName'])
    offer.setSelectedScopeOfSupply(data['scopeOfSupply'])
    offer.setOptionList(data['optionList'])
    offer.setTerms(data['termsAndConditions'])
	
    return HttpResponse(offer.generateHandOver(data['include']))
	
def getPdf(request):   
    theFile = file('temp/temp.pdf', 'rb')
    wrapper = FileWrapper(theFile)
    fName = request.GET['fileName']
    response = HttpResponse(wrapper, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename=%s.pdf' % fName
   
    return response

def getTemplates(request):
    try:
        list = []        
        for row in datadb.query(request.REQUEST['map_fun']):
            list.append(row.key)
        return HttpResponse(json.dumps(list))       
    except:
        return HttpResponseServerError()

def getTemplate(request):
    templateType = request.REQUEST['templateType']
    templateName = request.REQUEST['templateName']
    query = 'function(doc){'\
            '  if(doc.datatype) {'\
            '    if(doc.datatype == "template") {'\
            '      if(doc.templatetype == "' + templateType + '" && doc.name == "' + templateName + '") emit(doc._id,doc.content);'\
            '    }'\
            '  }'\
            '}'
    template = []
    for row in datadb.query(query):
        template.append(row.value)
    print templateType, templateName    
    if len(template) > 0:
        return HttpResponse(template[0])

    return HttpResponseServerError('Error in reading template ' + templateName)
	  
def userData(request):
    try:
        command = request.REQUEST['command']        
        userid_doc = cachedb['userid']
        userid = userid_doc['value']
        if userid != None:                
            if userid in usersdb:                
                if command == 'get':     
                    doc = usersdb[userid]
                    data = usersdb[userid + '_data']
                    privilege = cachedb['current_privilege']['value']
                    doc.update({'sequence':data['sequence'], 'lastupdate':data['lastupdate']})				
                    doc.update({'role':datadb[privilege]['name']})
                    return HttpResponse(json.dumps(doc))
                if command == 'set':
                    key = userid + '_data'
                    doc = usersdb[key]
                    userdata = json.loads(request.REQUEST['data'])
                    doc.update({'sequence':userdata['sequence']})
                    usersdb[key] = doc
                    return HttpResponse()
                return HttpResponseServerError('Unknown command.')
            else: 
                return HttpResponseServerError('ERROR: userid ' + userid + ' does not exist in usersdb.')
        else:
            return HttpResponseServerError('User id is None.')
    except:
        return HttpResponseServerError('Error in requesting user data.')
        
def projectList(request):
    try:
        projList = []
        for row in projectsdb.query(request.REQUEST['map_fun']):
            projList.append({'key':row.key, 'value':row.value})
        return HttpResponse(str(projList))       
    except:
        return HttpResponseServerError()
    
def project(request):
    try:
        command = request.REQUEST['command']
        project = request.REQUEST['name']
        optionlist_debug = "bools"
        
        if command == 'check':

            if project in projectsdb:
                response = { 'machineName': '', 'machineDataChanged': 'false', 'machineOptionsChanged':[]}
                doc = projectsdb[project]
                file = open("optionlistdebug.txt", "w")
                file.write(project)
                file.close()
                machine_id = doc['machine']['id']
                machine_rev = doc['machine']['rev']
                
                if len(machine_id) > 0:                    
                    machine = datadb[machine_id]
                    response['machineName'] = doc['machine']['machineName']
					
                    if machine_rev != machine.rev:                    
                        response['machineDataChanged'] = 'true'
                    
                    for option in doc['machineOptions']['standard']:
                        machineoption = datadb[option['id']]
                        if option['rev'] != machineoption.rev:
                            response['machineOptionsChanged'].append(option['name'])
                        # if machineoption.['isAvailable']:
                            # response['machineOptionsChanged'].append(option['name'])
                            
                    for option in doc['machineOptions']['optional']:
                        machineoption = datadb[option['id']]
                        if option['rev'] != machineoption.rev:
                            response['machineOptionsChanged'].append(option['name'])
                    
                    
                    
                return HttpResponse(json.dumps(response), 'application/json')
            return HttpResponseServerError('Error in reading project file')
        
        elif command == 'get_old':
            doc = projectsdb[project]
            return HttpResponse(json.dumps(doc), 'application/json')
                        
        elif command == 'get_new':
            doc = projectsdb[project]
            machine_id = doc['machine']['id']
            machine_rev = doc['machine']['rev']
            machine = datadb[machine_id]
            if machine_rev != machine.rev:
                doc['machine'].update({'machineName':machine['name'],
                                       'initialPrice':machine['initial_price'],
                                       'summary':machine['scope_intro'],
                                       'rev':machine.rev})
            for option in doc['machineOptions']['standard']:
                machineoption = datadb[option['id']]
                if option['rev'] != machineoption.rev:
                    option.update({'name':machineoption['name'],
                                   'description':machineoption['description'],
                                   'type':machineoption['option_type'],
                                   'price':machineoption['unit_price'],
                                   'rev':machineoption.rev})
            for option in doc['machineOptions']['optional']:
                machineoption = datadb[option['id']]
                if option['rev'] != machineoption.rev:
                    option.update({'name':machineoption['name'],
                                   'description':machineoption['description'],
                                   'type':machineoption['option_type'],
                                   'price':machineoption['unit_price'],
                                   'rev':machineoption.rev})
            projectsdb[project] = doc
            return HttpResponse(json.dumps(doc), 'application/json') 
                   
        elif command == 'remove':
            if project in projectsdb:
                del projectsdb[project]
                return HttpResponse()
            return HttpResponseServerError('Error in removing project file')    
            
    except IOError as e:
        return HttpResponseServerError("I/O error({0}): {1}".format(e.errno, e.strerror))
    except:
        return HttpResponseServerError('Error in saving project files')
		
def saveProject(request):
	project = request.POST['name']
	if not project in projectsdb:
		projectsdb[project] = {}
	doc = projectsdb[project]
	data = json.loads(request.POST['data'])
	userid_doc = cachedb['userid']
	userid = userid_doc['value']
	data.update({'lastmodifiedby': usersdb[userid]['code'], 'lastmodified': str(datetime.now())})          
	doc.update(data)
	projectsdb[project] = doc
	return HttpResponse()

def getSignature(request):
    img = None
    img = datadb.get_attachment('resource_signature_eb51b2e436dc4634a4ad6e442a7e8420', 'igor_sig.png')
    data = img.read()
    img.close()
    return HttpResponse("data:image/png;base64,%s" % data.encode('base64'), "image/png")
    
@csrf_exempt
def uploadUserDataFile(request):
    data = request.FILES['content']
    id = request.POST['id']
    
    io = cStringIO.StringIO()
    for chunk in data.chunks():
        io.write(chunk)
   
    content = io.getvalue()
    doc = projectsdb[id]
    projectsdb.put_attachment(doc,filename = data._get_name(),content = content)    
    content.close()   
        
    return HttpResponse('ok')
    
def getImageAttachment(request):
    id = request.REQUEST['id']
    filename = request.REQUEST['filename']
    attachment = projectsdb.get_attachment(id, filename)
    data = attachment.read()
    attachment.close()
    return HttpResponse("data:image/png;base64,%s" % data.encode('base64'), "image/png")
	
def deleteAttachment(request):
    id = request.REQUEST['id']
    filename = request.REQUEST['filename']
    doc = projectsdb[id]
    projectsdb.delete_attachment(doc, filename)
    return HttpResponse('ok')
	
def copyAttachment(request):
    source = request.REQUEST['source']
    destination = request.REQUEST['destination']
    filename = request.REQUEST['filename']

    attachment = projectsdb.get_attachment(source, filename)
    data = attachment.read()

    doc = projectsdb[destination]
    projectsdb.put_attachment(doc, filename = filename, content = data)

    attachment.close()

    return HttpResponse('ok')
	
    
def launch(request):
    return render_to_response("launcher.html")

def sync(request):
	return render_to_response("sync.html")
	
def getUserPrivileges(request):
    response = { 'app_url': prooffer_settings.get('app_url'),
                 'privileges':[]
               }

    if len(usersdb) > 0:
        userid_doc = cachedb['userid']
        userid = userid_doc['value']
        if userid in usersdb:
            user = usersdb[userid]
            for privilege in user['privileges']:
                response['privileges'].append({'name':datadb[privilege]['name'], 'id':privilege})
   
	# file = open("aaaaaaa.txt", "w")
	# file.write(prooffer_settings.get('test_datadb'))
	# file.write(prooffer_settings.get('test_projectsdb'))
	# file.write(prooffer_settings.get('test_usersdb'))
	# file.close()
	
	# file = open("bbbbbb.txt", "w")
	# file.write(settingsdb['settings']['remote_datadb'])
	# file.write(settingsdb['settings']['remote_usersdb'])
	# file.write(settingsdb['settings']['remote_projectsdb'])
	# file.close()
	

	return HttpResponse(json.dumps(response))
	
def getUserPrivilegeData(request):
    privilege = cachedb['current_privilege']['value']
    if privilege:
        doc = datadb[privilege]
        doc.update({'isAdmin': prooffer_server.isAdmin})
        return HttpResponse(json.dumps(doc), 'application/json')
    
	return HttpResponseServerError('Privilege is not set')
		
def setUserPrivilege(request):
    privilege = request.REQUEST['privilege']
    if privilege == 'privilege_c21b83c992e14b1b98a13210fb6a67ed':           
        prooffer_server.isAdmin = True
    else:
        prooffer_server.isAdmin = False
    datadb = prooffer_server.getDataDB()
    current_privilege = cachedb['current_privilege']
    current_privilege.update({'value': privilege})
    cachedb['current_privilege'] = current_privilege
    return HttpResponse('ok')

def ordcon(request):
	return render_to_response("orderConfirmation.html")
	
def setUserData(request):
	userid = request.REQUEST['userid']
	file = open('/home/rafael/prooffer/user_data/prooffer_user.user','w+')
	file.write(userid)
	file.close()
	userid_doc = cachedb['userid']
	userid_doc.update({'value': userid})
	cachedb['userid'] = userid_doc
	return HttpResponse('done')

def masterkey():
	return "5rgGQAxRcsv0gs5Kc7HQhFLnIKIhe4Jv2zswdkZjtBvuRDVf6ZQXDKwoTuXz9rC"
	
def decipher(cipher_text):
	from Crypto.Cipher import AES
	dec_secret = AES.new(masterkey()[:32])
	raw_decrypted = dec_secret.decrypt(base64.b64decode(cipher_text))
	cipher_val = raw_decrypted.rstrip("\0")
	return cipher_val

def insertUsernamePassword(url):
	from urlparse import urlparse
	parsedUrl = urlparse(url)
	cipher_doc = cachedb['cipher']
	cipher_text = cipher_doc['value']
	new_url = parsedUrl.scheme + '://' + "cedric:09205934861" + '@' + parsedUrl.hostname
	if parsedUrl.port:
		new_url += ':' + str(parsedUrl.port)
	new_url += '/'
	return new_url
	
def updateProofferApp(request):			
	remote_url_doc = cachedb['remote_url']
	remote_url = remote_url_doc['value']
	subprocess.Popen(['/home/rafael/prooffer_app-download.sh',insertUsernamePassword(remote_url)]) 
	return render_to_response("app_downloader.html")

def updateProofferDataViews(request):
	settings = settingsdb['settings']
	remote_url_doc = cachedb['remote_url']
	remote_url = remote_url_doc['value']
	#remote_datadb = settings['remote_datadb']
	remote_datadb = prooffer_settings.get('remote_datadb')
	datadb = settings['datadb']
	server.replicate(insertUsernamePassword(remote_url) + remote_datadb, datadb,doc_ids=['_design/prooffer_data_views'])
	return render_to_response("status.html")
	
def updateProofferSettings(request):
	remote_url_doc = cachedb['remote_url']
	remote_url = remote_url_doc['value']
	server.replicate(insertUsernamePassword(remote_url) + 'prooffer_settings', 'prooffer_settings')
	return render_to_response("status.html")
	
def syncProofferDataDownStream(request):
	try:
		file = open("test.txt", "w")
		settings = settingsdb['settings']
		remote_url_doc = cachedb['remote_url']
		remote_url = remote_url_doc['value']
		file.write(remote_url)
		file.write(insertUsernamePassword(remote_url))
		#remote_datadb = settings['remote_datadb']
		remote_datadb = prooffer_settings.get('remote_datadb')
		datadb = settings['datadb']
		server.replicate(insertUsernamePassword(remote_url) + remote_datadb, datadb)
		return HttpResponse("OK")
	except:
		raise
	finally:
		file.close()
	

def syncProofferProjectsDownStream(request):
	try:
		settings = settingsdb['settings']
		remote_url_doc = cachedb['remote_url']
		remote_url = remote_url_doc['value']
		#remote_db = settings['remote_projectsdb']
		remote_db = prooffer_settings.get('remote_projectsdb')
		db = settings['projectsdb']
		server.replicate(insertUsernamePassword(remote_url) + remote_db, db)
		return HttpResponse("OK")
	except Exception  as error:
		raise


def syncProofferUsersDownStream(request):
	settings = settingsdb['settings']
	remote_url_doc = cachedb['remote_url']
	remote_url = remote_url_doc['value']
	#remote_db = settings['remote_usersdb']
	remote_db = prooffer_settings.get('remote_usersdb')
	db = settings['usersdb']
	server.replicate(insertUsernamePassword(remote_url) + remote_db, db)
	return HttpResponse("OK")

def syncProofferProjectsUpStream(request):
	settings = settingsdb['settings']
	remote_url_doc = cachedb['remote_url']
	remote_url = remote_url_doc['value']
	#remote_db = settings['remote_projectsdb']
	remote_db = prooffer_settings.get('remote_projectsdb')
	db = settings['projectsdb']
	server.replicate(db, insertUsernamePassword(remote_url) + remote_db)
	return HttpResponse("OK")

def syncProofferUsersUpStream(request):
	settings = settingsdb['settings']
	remote_url_doc = cachedb['remote_url']
	remote_url = remote_url_doc['value']
	#remote_db = settings['remote_usersdb']
	remote_db = prooffer_settings.get('remote_usersdb')
	db = settings['usersdb']
	server.replicate(db, insertUsernamePassword(remote_url) + remote_db)
	return HttpResponse("OK")	
	
def uploadUserDataAndProjects(request):
	settings = settingsdb['settings']
	remote_url_doc = cachedb['remote_url']
	remote_url = remote_url_doc['value']
	#remote_projectsdb = settings['remote_projectsdb']
	#remote_usersdb = setttings['remote_usersdb']
	remote_usersdb = prooffer_settings.get('remote_usersdb')
	remote_projectsdb = prooffer_settings.get('remote_projectsdb')
	projectsdb = settings['projectsdb']
	usersdb = settings['usersdb']
	server.replicate(projectsdb, insertUsernamePassword(remote_url) + remote_projectsdb)
	server.replicate(usersdb, insertUsernamePassword(remote_url) + remote_usersdb)
	return render_to_response("status.html")
	
def updateStatus(request):
	return HttpResponse(json.dumps(server.tasks()))
	
def updateStatusFrame(request):
	return render_to_response("status.html")
	
def getDBInfo(request):
	dbname = request.REQUEST['dbname']
	db = server[dbname]
	return HttpResponse(json.dumps(db.info()))

def getRemoteDBInfo(request):
	import couchdb 
	remote_url_doc = cachedb['remote_url']
	remote_url = remote_url_doc['value']
	remote_server = couchdb.Server(insertUsernamePassword(remote_url))
	
	dbname = request.REQUEST['dbname']
	db = remote_server[dbname]
	return HttpResponse(json.dumps(db.info()))
	
def readCachedParameters(request):
	cached_parameters = []
	for doc_id in cachedb:
		cached_parameters.append(cachedb[doc_id])
	return HttpResponse(json.dumps(cached_parameters))
	
def initSync(request):
	replicatordb = server['_replicator']
	def initialize(replicant, source, target):
		if  replicant not in replicatordb:
			replicant_doc = {'source': source, 'target': target}
			replicant_doc.update({'continuous': request.REQUEST['continuous'] == 'True'})
			replicant_doc.update({'create_target': request.REQUEST['create_target'] == 'True'})
			replicatordb[replicant] = replicant_doc
			
		if request.REQUEST['cancel'] == 'True':
			if replicant in replicatordb:
				doc = replicatordb[replicant]
				replicatordb.delete(doc)
			
	settings = settingsdb['settings']
	remote_url_doc = cachedb['remote_url']
	remote_url = remote_url_doc['value']
	#remote_usersdb = settings['remote_usersdb']
	#remote_datadb = settings['remote_datadb']
	#remote_projectsdb = settings['remote_projectsdb']
	remote_usersdb = prooffer_settings.get('remote_usersdb')
	remote_projectsdb = prooffer_settings.get('remote_projectsdb')
	remote_datadb = prooffer_settings.get('remote_datadb')
	usersdb = settings['usersdb']
	datadb = settings['datadb']
	projectsdb = settings['projectsdb']

	initialize('prooffer_data', insertUsernamePassword(remote_url) + remote_datadb, datadb)
	initialize('prooffer_users', insertUsernamePassword(remote_url) + remote_usersdb, usersdb)
	initialize('prooffer_projects', insertUsernamePassword(remote_url) + remote_projectsdb, projectsdb)
	
	return render_to_response("status.html")
	
def migrate(request):
	import couchdb
	source_server = couchdb.Server(request.REQUEST['source_url'])
	source_db = request.REQUEST['source_db']
	target_db = request.REQUEST['target_db']
	remote_url_doc = cachedb['remote_url']
	remote_url = remote_url_doc['value']
	source_server.replicate(source_db, insertUsernamePassword(remote_url) + target_db)
	
	return HttpResponse('done')
	
def setRemoteURLCipher(request):
	cipher = request.REQUEST['cipher']
	if ':' not in decipher(cipher):
		return HttpResponse('Invalid Username and Password Cipher')
	
	cipher_doc = cachedb['cipher']
	cipher_doc['value'] = cipher 
	cachedb['cipher'] = cipher_doc
	return HttpResponse('done')
	
def setRemoteURL(request):
	url = request.REQUEST['url']
	remote_url_doc = cachedb['remote_url']
	remote_url_doc['value'] = url 
	cachedb['remote_url'] = remote_url_doc
	return HttpResponse('done')
	
def pdf_generator_status(request):
	status = cachedb['pdf_generator_status']
	return HttpResponse(status['value'])
	
def pdf_generator_status_frame(request):
	return render_to_response("pdf_generator_status.html")

def app_download_progress(request):
	progress = cachedb['app_download_progress']
	return HttpResponse(progress['value'])
	
def app_download_progress_frame(request):
	return render_to_response("app_downloader.html")
	
def ready(request):
	if 'callback' in request.REQUEST:
		data = json.dumps({status: 'ready'})
		data = '%s(%s);' % (request.REQUEST['callback'], data)
		return HttpResponse(data, "text/javascript")
	return HttpResponse('READY')
