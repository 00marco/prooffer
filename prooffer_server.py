import couchdb
import prooffer_settings

server = couchdb.Server()
projectsdb = server[prooffer_settings.get('projectsdb')]
usersdb = server[prooffer_settings.get('usersdb')]
datadb = server[prooffer_settings.get('datadb')]
admindatadb = server[prooffer_settings.get('admindatadb')]

isAdmin = False

def getServer():
	return server

def getProjectsDB():
    return projectsdb
    
def getUsersDB():
    return usersdb
    
def getDataDB():
    return datadb