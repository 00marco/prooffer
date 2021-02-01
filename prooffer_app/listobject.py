"""
A list object.
objecst to be added to the list should support the 'write' method
"""

class ListObject:
	def __init__(self, name, nameLabel, listLabel):
		self.name = name
		self.nameLabel = nameLabel
		self.listLabel = listLabel
		self.objects = []
		
	def add(self, object):
		self.objects.append(object)
		
	def write(self, stream, terminate = True):
		stream += str("{" + self.nameLabel	+ ":'" + self.name + "'," + self.listLabel + ":[")
		for object in self.objects:
			stream = object.write(stream, terminate)
		stream += "]"
		if terminate == True:
			stream += "},"
		return stream