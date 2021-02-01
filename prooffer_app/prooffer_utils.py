def setValue(value, default):
    if value:
        if value == '#':
            return '0'
        else:
            return value
    return default
	
def listToString(list):
	result = ''
	for item in list:
		if len(result) > 0:
			result += ","
		result += str("'" + item + "'")
	if result == "''":
		return "[]"
	return "[" + result + "]"