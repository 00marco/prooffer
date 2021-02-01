import glob

userid = None

userfiles = glob.glob("/home/rafael/prooffer/user_data/*.user")
if len(userfiles) > 0:
    userfile = open(userfiles[0])
    userid = userfile.read()
    userfile.close()
