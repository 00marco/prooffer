import os
import json

def get(setting):
    settingsfile = open('/home/rafael/prooffer/prooffer_settings.txt')
    settings = json.loads(settingsfile.read())
    settingsfile.close()
    return settings[setting]
    
def getCentralDB():
    print 'Connecting to Central Database...'
    urls = get('centraldb')
    import urllib
    for url in urls:
        try:
            print 'Trying', url
            urllib.urlopen(url)
            return url
        except:
            pass
    return None
    
