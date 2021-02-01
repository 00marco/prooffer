from PyPDF2 import PdfFileWriter, PdfFileReader
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

import datetime
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.platypus import BaseDocTemplate, PageTemplate, PageBreak, NextPageTemplate, Paragraph, Spacer, Image, Frame, Table, TableStyle
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import Color, HexColor
from reportlab.platypus import PageBreak
							
from io import BytesIO
from django.core.servers.basehttp import FileWrapper
import json
import os
import re
import urllib, cStringIO
import PIL
import shutil
from PIL import Image as PILImage

import prooffer_server
server = prooffer_server.getServer()
projectsdb = prooffer_server.getProjectsDB()
datadb = prooffer_server.getDataDB()
usersdb = prooffer_server.getUsersDB()
def getAttachment(db, key, filename):
	if key in db:
		data = db.get_attachment(key, filename)
		bytes = cStringIO.StringIO(data.read())
		data.close()
		return bytes
	else:
		return None
	
def getResource(resource_id):
	if resource_id in datadb:
		resource = datadb[resource_id]
		attachments = resource['_attachments']
		return getAttachment(datadb, resource_id,attachments.keys()[0])
	else:
		return None
		
class OfferDocTemplate(BaseDocTemplate):
	scopeFlag = False
	def __init__(self, filename, **kw):
		apply(BaseDocTemplate.__init__, (self, filename), kw)
		self.bookmarks = {     'bookmark-intro'      : 'Introduction',
							   'bookmark-orderConf'  : 'Order Confirmation',
							   'bookmark-contract'   : 'Contract',
							   'bookmark-agreement'  : 'Agreement',
							   'bookmark-quotation'  : 'Quotation',
						       'bookmark-tc'         : 'General Terms and Conditions', 
						       'bookmark-pd'         : 'Product Descriptions',
						       'bookmark-td'         : 'Technical Data',
						       'bookmark-ml'         : 'Machine Layout',
						       'bookmark-rl'         : 'Reference List',
						       'bookmark-wtc'        : 'Warranty Terms and Conditions',
						       'bookmark-sstc'       : 'Service Support Terms and Conditions'}
							   
	def afterFlowable(self, flowable):
		bn = getattr(flowable, '_bookmarkName', None)
		if bn is not None:
			# decrease self.page by 1 to allow dummy first page
			entry = [1, self.bookmarks[bn], self.page-1, bn]
			self.notify('TOCEntry', tuple(entry))
			

def escapeCharacters(text):
	text = text.replace("&", "&amp;")
	text = text.replace("<", "&lt;")
	text = text.replace(">", "&gt;")
	return u"%s" % text
	
class Offer:
	def __init__(self, data):
		self.data = data
		self.image = None
		self.customerDetails = {}
		self.customerName = None
		self.customerAddress = None
		self.quoteNumber = None
		self.machineName = None
		self.contactPerson = None
		self.introduction = None
		self.sender = None
		self.showItemPrice = False
		self.showDiscount = False
		self.scopeOfSupply = None
		self.scopeOfSupplyAmount = None
		self.optionList = None
		self.priceOptions = {}
		self.terms = None
		self.pdfContents = []
		self.pageWidth = 11.69
		self.pageHeight = 8.27
		self.doc = OfferDocTemplate('temp/offer.pdf', pagesize=(self.pageWidth*inch, self.pageHeight*inch)) 
		self.initPageTemplates()
		self.machine = datadb[data['machineId']]
		
	def setImage(self, image):
		self.image = image
	
	def setQuoteNumber(self, quoteNumber):
		self.quoteNumber = quoteNumber
		
	def setCustomerDetails(self, customerDetails):
		self.customerDetails = customerDetails
		
	def setCustomerName(self, customerName):
		self.customerName = customerName
		
	def setCustomerAddress(self, address):
		self.customerAddress = address
		
	def setMachineName(self, machineName):
		self.machineName = machineName
		
	def setContactPerson(self, contactPerson):
		self.contactPerson = contactPerson
		
	def setIntroduction(self, introduction):
		self.introduction = introduction
		
	def setSender(self, sender):
		self.sender = sender
	
	def setShowItemPrice(self, showItemPrice):
		self.showItemPrice = showItemPrice
	
	def setShowDiscount(self, showDiscount):
		self.showDiscount = showDiscount
		
	def setSelectedScopeOfSupply(self, scopeOfSupplySelections):
		self.scopeOfSupply = scopeOfSupplySelections
		
	def setScopeOfSupplyAmount(self, amount):
		self.scopeOfSupplyAmount = amount
	
	def setOptionList(self, optionList):
		self.optionList = optionList
	
	def setSelectedOptional(self, optianalSelections):
		self.optionals = optianalSelections
		
	def setPriceOptions(self, priceOptions):
		self.priceOptions = priceOptions
		
	def setTerms(self, terms):
		self.terms = terms
		
	def createLogo(self, aCanvas):
		logo = Image("prooffer_app/static/img/hgg-logo.png", 0.556*inch, 0.764*inch)
		img = []
		img.append(logo)
		frameWidth = inch
		frameHeight = inch
		xPos = 11.69*inch - frameWidth - 0.80*inch
		yPos = 8.27*inch - frameHeight - 0.5*inch
		
		imageFrame = Frame(xPos, yPos, frameWidth, frameHeight, showBoundary=0)
		imageFrame.addFromList(img, aCanvas)
		
	def createSeparator(self, aCanvas, theTitle, summary=''):
		titleFrame = Frame(1.8*inch, self.pageHeight*inch - 5.45*inch, 9.2*inch, inch, showBoundary=0)
		titleFrame.addFromList([Paragraph(theTitle, self.styleDisplay)], aCanvas)
		
	def createPageTitle(self, aCanvas, theTitle, summary=''):
		titleFrame = Frame(0.8*inch, self.pageHeight*inch - 1.45*inch, 9.2*inch, inch, showBoundary=0)
		titleFrame.addFromList([Paragraph(theTitle, self.styleH)], aCanvas)
		
	def createPageNumber(self, aCanvas, pageNumber):
		aCanvas.setFillColorRGB(0.8156862745098039, 0.8549019607843137, 0.992156862745098)
		aCanvas.setFont('HGG_Sans_Italics', 12)
		# decrease pageNumber by 1 to allow dummy first page
		aCanvas.drawString(self.pageWidth*inch - inch, 0.25*inch, "%r" % (pageNumber - 1))
		
	def createRect(self, aCanvas):
		aCanvas.setStrokeColorRGB(0.003921568627451, 0.2313725490196078, 0.5529411764705882)
		aCanvas.setFillColorRGB(0.003921568627451, 0.2313725490196078, 0.5529411764705882)
		#aCanvas.rect(1.05*inch, 0.55*inch, self.pageWidth*inch - 2*inch, 0.15*inch, fill=1)
		aCanvas.rect(1*inch, 0.55*inch, self.pageWidth*inch - 2*inch, 0.15*inch, fill=1)

	def waterMark(self, aCanvas):
		aCanvas.saveState()
		if self.data['draft']:
			aCanvas.setFillColorRGB(0.8,0.8,0.8,0.3)
			aCanvas.setFont('Helvetica', 16)
			for x in range(0, 15):
				for y in range(0, 40):
					aCanvas.drawString(x * 60,y * 15,'DRAFT')
		aCanvas.restoreState()
		
	def staticCoverTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		canvas.setStrokeColorRGB(0.0274509803921569, 0.3098039215686275, 0.6392156862745098)
		canvas.setFillColorRGB(0.0274509803921569, 0.3098039215686275, 0.6392156862745098)
		canvas.rect(7.227289464664136*inch, 0, self.pageWidth*inch - 4.462710535335864*inch, self.pageHeight*inch, fill=1)
		canvas.drawImage("prooffer_app/static/img/logo_with_text.png", inch, 0.55*inch, 4.486*inch, 1.556*inch)
		
		if self.customerDetails['companyLogo']:			
			logoFile = getAttachment(projectsdb, self.data['reference'], self.customerDetails['companyLogo'])
			img = PILImage.open(logoFile)
			maxWidth = 2.5*inch
			maxHeight = 2*inch
			
			if float(img.size[0]) > float(img.size[1]): #if width is larger
				width = maxWidth
				scale = width / (float(img.size[0]) / 72)
				height = int((float(img.size[1]) / 72) * float(scale))
			else: #if height is larger
				height = maxHeight
				scale = height / (float(img.size[1]) / 72)
				width = int((float(img.size[0]) / 72) * float(scale))
			
			#reload logoFile to simulate 'rewind', PILImage already set it to EOF
			logoFile = getAttachment(projectsdb, self.data['reference'], self.customerDetails['companyLogo'])
			companyLogo = Image(logoFile, width, height)
			img = [companyLogo]
			if 'handOverAdditionalData' in self.data:
				logoFrame = Frame(7.5*inch, 4*inch, 4*inch, 3.5*inch, showBoundary=1)
			else:
				logoFrame = Frame(7.5*inch, 3*inch, 4*inch, 3.5*inch, showBoundary=1)
			logoFrame.addFromList(img, canvas)
			
		canvas.setFillColorRGB(1, 1, 1);
		
		if 'handOverAdditionalData' in self.data:
			handOverAdditionalData = self.data['handOverAdditionalData']
			canvas.setFont('HGG_Sans', 15)
			height = 5.0
			textheight = 0.30
			#canvas.drawString(7.85*inch, height*inch, 'Customer Name: ' + self.customerDetails['companyName'])
			
			if 'customer_ref' in self.data:
				if len(self.data['customer_ref']) > 0:
					customerRef = self.data['customer_ref']
					customerRef = customerRef.replace(" / ","/")
					lengthCR = len(customerRef)
					numberCR = 0
					countCR = True
					
					for i in range(lengthCR):
						if countCR == True:
							numberCR = numberCR + 1
							countCR = False
							
						if customerRef[i] == '/':
							countCR = True
							
					listCR = [] * numberCR
					listCR = customerRef.split("/")
					
					for i in range(numberCR):
						if i == 0 and numberCR > 1:
							canvas.drawString(7.85*inch, height*inch, 'Customer ref: ' + listCR[i] + ' / ');
						elif i == 0 and numberCR == 1:
							canvas.drawString(7.85*inch, height*inch, 'Customer ref: ' + listCR[i]);
						elif i == (numberCR - 1):
							canvas.drawString(9.10*inch, height*inch, listCR[i]);
						else:
							canvas.drawString(9.10*inch, height*inch, listCR[i] + ' / ');
						height = height - textheight
			
			canvas.drawString(7.85*inch, height*inch, 'HGG Project Number: ' + handOverAdditionalData['coverpage']['hggProjectNumber'])
			height = height - textheight
			canvas.drawString(7.85*inch, height*inch, 'HGG Project Manager: ' + handOverAdditionalData['coverpage']['hggProjectManager'])
			height = height - textheight
			canvas.drawString(7.85*inch, height*inch, 'Hand Over Date: ' + handOverAdditionalData['coverpage']['handOverDate'])
			height = height - textheight
			canvas.drawString(7.85*inch, height*inch, 'Sales Key Person: ' + handOverAdditionalData['coverpage']['salesKeyPerson'])
			height = height - textheight
			revNum = 0
			if (handOverAdditionalData['contactDetails']['rev5Date'] != '') or (handOverAdditionalData['contactDetails']['rev5Name'] != '') or (handOverAdditionalData['contactDetails']['rev5Change'] != ''):
				revNum = 5
			elif (handOverAdditionalData['contactDetails']['rev4Date'] != '') or (handOverAdditionalData['contactDetails']['rev4Name'] != '') or (handOverAdditionalData['contactDetails']['rev4Change'] != ''):
				revNum = 4
			elif (handOverAdditionalData['contactDetails']['rev3Date'] != '') or (handOverAdditionalData['contactDetails']['rev3Name'] != '') or (handOverAdditionalData['contactDetails']['rev3Change'] != ''):
				revNum = 3
			elif (handOverAdditionalData['contactDetails']['rev2Date'] != '') or (handOverAdditionalData['contactDetails']['rev2Name'] != '') or (handOverAdditionalData['contactDetails']['rev2Change'] != ''):
				revNum = 2
			elif (handOverAdditionalData['contactDetails']['rev1Date'] != '') or (handOverAdditionalData['contactDetails']['rev1Name'] != '') or (handOverAdditionalData['contactDetails']['rev1Change'] != ''):
				revNum = 1
			canvas.drawString(7.85*inch, height*inch, 'Revision Number: ' + str(revNum))
			height = height - textheight
			canvas.setFont('HGG_Sans', 20);
			canvas.drawString(7.85*inch, 1.13*inch, self.data['label']);
		else:
			canvas.setFont('HGG_Sans', 18);
			if 'label' in self.data:
				if len(self.data['label']) > 0:
					canvas.drawString(7.85*inch, 1.13*inch, self.data['label']);
			
			canvas.drawString(7.85*inch, 0.83*inch, 'HGG ref: ' + self.quoteNumber);
			if 'customer_ref' in self.data:
				if len(self.data['customer_ref']) > 0:
					customerRef = self.data['customer_ref']
					customerRef = customerRef.replace(" / ","/")
					lengthCR = len(customerRef)
					numberCR = 0
					countCR = True
					
					for i in range(lengthCR):
						if countCR == True:
							numberCR = numberCR + 1
							countCR = False
							
						if customerRef[i] == '/':
							countCR = True
							
					listCR = [] * numberCR
					listCR = customerRef.split("/")
					vPlace = 0.58
					
					for i in range(numberCR):
						if i == 0 and numberCR > 1:
							canvas.drawString(7.85*inch, vPlace*inch, 'Customer ref: ' + listCR[i] + ' / ');
						elif i == 0 and numberCR == 1:
							canvas.drawString(7.85*inch, vPlace*inch, 'Customer ref: ' + listCR[i]);
						elif i == (numberCR - 1):
							canvas.drawString(9.35*inch, vPlace*inch, listCR[i]);
						else:
							canvas.drawString(9.35*inch, vPlace*inch, listCR[i] + ' / ');
						vPlace = vPlace - 0.25
					
		canvas.restoreState()
		
	def staticIntroTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		titleFrame = Frame(11.69*inch - 3.5*inch, 4*inch, 2.7*inch, 3*inch, showBoundary=0)
		titleFrame.addFromList([Paragraph(self.data['address'], self.styleAddress)], canvas)
		self.createRect(canvas)
		canvas.restoreState()
		
	def staticTocTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		self.createPageTitle(canvas, "Table of Contents")
		canvas.restoreState()
		
	def staticScopeOfSupplyTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		label = 'Quotation'
		if 'label' in self.data:
			if self.data['label'] == 'Hand Over Document':
				label = 'Technical Scope'
		self.createPageTitle(canvas, label + " <span>&nbsp;&nbsp;%s %s</span>" % (self.data['scopeTitle'],self.machineName), self.data['scopeSummary'])
		self.createPageNumber(canvas, self.doc.page)
		canvas.restoreState()
	
	def staticScopeOfSupplyTemplateAfter(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		label = 'Quotation'
		if 'label' in self.data:
			if self.data['label'] == 'Hand Over Document':
				label = 'Technical Scope'
		self.createPageTitle(canvas, label + " <span>&nbsp;&nbsp;%s %s</span>" % (self.data['scopeTitle'],self.machineName))
		self.createPageNumber(canvas, self.doc.page)
		canvas.restoreState()
	
	def staticSeparatorTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		self.createSeparator(canvas, "O p t i o n s")
		self.createPageNumber(canvas, self.doc.page)
		canvas.restoreState()
	
	def staticOptionListTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		self.createPageTitle(canvas, "Quotation <span>&nbsp;&nbsp;%s %s (Optional)</span>" % (self.data['scopeTitle'],self.machineName))
		self.createPageNumber(canvas, self.doc.page)
		canvas.restoreState()
		
	def staticTermsTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		self.createPageTitle(canvas, "General Terms and Conditions")
		self.createPageNumber(canvas, self.doc.page)
		self.createRect(canvas)
		canvas.restoreState()

	def staticHandOverContactDetailsTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		self.createPageTitle(canvas, "Contact Details")
		self.createPageNumber(canvas, self.doc.page)
		self.createRect(canvas)
		canvas.restoreState()

	def staticHandOverFinancialScopeTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		self.createPageTitle(canvas, "Financial Scope")
		self.createPageNumber(canvas, self.doc.page)
		self.createRect(canvas)
		canvas.restoreState()

	def staticHandOverTechnicalScopeTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		self.createPageTitle(canvas, "Technical Scope")
		self.createPageNumber(canvas, self.doc.page)
		self.createRect(canvas)
		canvas.restoreState()

	def staticHandOverRemarksTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		self.createPageTitle(canvas, "Remarks")
		self.createPageNumber(canvas, self.doc.page)
		self.createRect(canvas)
		canvas.restoreState()
		
	def staticOrdConTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		self.createPageTitle(canvas, self.data['label'])
		self.createPageNumber(canvas, self.doc.page)
		self.createRect(canvas)
		canvas.restoreState()
		
	def staticBlankTemplate(self, canvas, doc):
		self.waterMark(canvas)
		canvas.saveState()
		self.createPageNumber(canvas, self.doc.page)
		canvas.restoreState()
		
	def initPageTemplates(self):
		self.initStyles()
		imageFrame = Frame(0.5*inch, 2*inch, self.pageWidth*inch - 5*inch, self.pageHeight*inch - 2.75*inch, showBoundary=0)
		quarterFrame = Frame(7.227289464664136*inch, 0.5*inch, 4*inch, self.pageHeight*inch/2.3, showBoundary=0)
		wholeFrame = Frame(inch, 0.75*inch, self.pageWidth*inch - 2*inch, self.pageHeight*inch - 1.8*inch + 0.25*inch, showBoundary=0)
		soloFrame = Frame(inch, 0.75*inch, self.pageWidth*inch - 2*inch, self.pageHeight*inch - 2.1*inch + 0.25*inch, showBoundary=0)
		leftColFrame = Frame(inch, 0.75*inch, (self.pageWidth/2)*inch - 1.125*inch, self.pageHeight*inch - 2*inch + 0.25*inch, showBoundary=0)
		rightColFrame = Frame((self.pageWidth/2)*inch + 0.125*inch, 0.75*inch, (self.pageWidth/2)*inch - 1.125*inch, self.pageHeight*inch - 2*inch + 0.25*inch, showBoundary=0)
		
		coverTemplate = PageTemplate(id="coverTemplate", frames=[imageFrame, quarterFrame], onPage=self.staticCoverTemplate)
		introTemplate = PageTemplate(id="introTemplate", frames=[leftColFrame, rightColFrame], onPage=self.staticIntroTemplate)
		tocTemplate = PageTemplate(id="tocTemplate", frames=[soloFrame], onPage=self.staticTocTemplate)
		scopeTemplate = PageTemplate(id="scopeTemplate", frames=[wholeFrame], onPage=self.staticScopeOfSupplyTemplate)
		scopeTemplateAfter = PageTemplate(id="scopeTemplateAfter", frames=[soloFrame], onPage=self.staticScopeOfSupplyTemplateAfter)
		separatorTemplate = PageTemplate(id="separatorTemplate", frames=[soloFrame], onPage=self.staticSeparatorTemplate)
		optionalTemplate = PageTemplate(id="optionalTemplate", frames=[soloFrame], onPage=self.staticOptionListTemplate)
		termsTemplate = PageTemplate(id="termsTemplate", frames=[leftColFrame, rightColFrame], onPage=self.staticTermsTemplate)
		blankTemplate = PageTemplate(id="blankTemplate", frames=[soloFrame], onPage=self.staticBlankTemplate)
		ordconTemplate = PageTemplate(id="ordconTemplate", frames=[leftColFrame, rightColFrame], onPage=self.staticOrdConTemplate)
		handOverContactDetailsTemplate = PageTemplate(id="handOverContactDetailsTemplate", frames=[leftColFrame, rightColFrame], onPage=self.staticHandOverContactDetailsTemplate)
		handOverFinancialScopeTemplate = PageTemplate(id="handOverFinancialScopeTemplate", frames=[leftColFrame, rightColFrame], onPage=self.staticHandOverFinancialScopeTemplate)
		handOverTechnicalScopeTemplate = PageTemplate(id="handOverTechnicalScopeTemplate", frames=[leftColFrame, rightColFrame], onPage=self.staticHandOverTechnicalScopeTemplate)
		handOverRemarksTemplate = PageTemplate(id="handOverRemarksTemplate", frames=[leftColFrame, rightColFrame], onPage=self.staticHandOverRemarksTemplate)
		
		# blankTemplate is the first template applied for dummy first page
		self.doc.addPageTemplates([blankTemplate, coverTemplate, introTemplate, tocTemplate, scopeTemplate, scopeTemplateAfter, separatorTemplate, optionalTemplate, termsTemplate, ordconTemplate, handOverContactDetailsTemplate, handOverFinancialScopeTemplate, handOverTechnicalScopeTemplate, handOverRemarksTemplate])
		
	def initStyles(self):
		pdfmetrics.registerFont(TTFont('HGG_Sans', 'PTS75F.ttf'))
		pdfmetrics.registerFont(TTFont('HGG_Sans_Italics', 'PTS56F.ttf'))
		pdfmetrics.registerFont(TTFont('Calibri', 'calibri.ttf'))
		pdfmetrics.registerFont(TTFont('CalibriBd', 'calibrib.ttf'))
		pdfmetrics.registerFont(TTFont('CalibriIt', 'calibrii.ttf'))
		pdfmetrics.registerFont(TTFont('CalibriBI', 'calibriz.ttf'))
		pdfmetrics.registerFontFamily('Calibri', normal='Calibri', bold='CalibriBd', italic='CalibriIt', boldItalic='CalibriBI')
		self.hggBlue = Color(0.003921568627451, 0.2313725490196078, 0.5529411764705882, 1)
		self.lightBlue = Color(0.8156862745098039, 0.8549019607843137, 0.992156862745098)
		self.lightGray = Color(0.9725490196078431, 0.9803921568627451, 0.9490196078431373)
		self.steelGray = Color(0.8784313725490196, 0.8784313725490196, 0.8784313725490196)
		self.styles = getSampleStyleSheet()
		self.styles.add(ParagraphStyle(name='Center', alignment=TA_CENTER))
		self.styles.add(ParagraphStyle(name='Indented', alignment=TA_LEFT))
		self.styleN = self.styles['Normal']
		self.styleN.fontName = 'Calibri'
		self.styleH = self.styles['Heading1']
		self.styleH.fontName = 'HGG_Sans'
		self.styleH.textColor = self.hggBlue
		self.styleCenter = self.styles['Center']
		self.styleCenter.fontName = 'HGG_Sans'
		self.styleCenter.fontSize = 30
		self.styleCenter.textColor = self.hggBlue
		self.styleIndented = self.styles['Indented']
		self.styleIndented.leftIndent = 24
		self.styleBordered = self.styles['Heading5']
		self.styleBordered.borderWidth = 1
		self.styleBordered.borderColor = Color(0, 0, 0, 1)
		self.styleH4 = self.styles['Heading4']
		self.styleH4.fontName = 'HGG_Sans'
		self.styleH4.textColor = self.hggBlue
		self.styleTitleLeftAligned = ParagraphStyle(fontName = "Helvetica", fontSize = 11, name='Indented', leading=13, alignment=TA_LEFT, textColor=self.hggBlue)
		self.styleParagraphJustified = ParagraphStyle(fontName = "Helvetica", fontSize = 11, name='Indented', leading=13, alignment=TA_JUSTIFY)
		self.styleTitleRightAligned = ParagraphStyle(fontName = "Helvetica", fontSize = 11, name='Indented', leading=13, alignment=TA_RIGHT, textColor=self.hggBlue)
		self.styleAddress = ParagraphStyle(fontName = "Calibri", fontSize = 11, name='Indented', leading=13, alignment=TA_RIGHT, textColor=Color(0, 0, 0))
		self.priceTextStyle = ParagraphStyle(fontName = "Calibri", fontSize = 11, name='Indented', leading=13, alignment=TA_RIGHT, textColor=Color(0, 0, 0))
		self.quantityTextStyle = ParagraphStyle(fontName = "Calibri", fontSize = 11, name='Indented', leading=13, alignment=TA_CENTER, textColor=Color(0, 0, 0))
		self.styleSubjectCentered = ParagraphStyle(fontName = "Calibri", fontSize = 10, name='Indented', leading=13, alignment=TA_CENTER, textColor=Color(1, 1, 1))
		self.styleSubjectLeft = ParagraphStyle(fontName = "Calibri", fontSize = 10, name='Indented', leading=13, alignment=TA_LEFT, textColor=Color(1, 1, 1))
		self.styleNormal = ParagraphStyle(fontName = "Calibri", fontSize = 11, name='Normal', leading=13, alignment=TA_RIGHT, textColor=Color(0, 0, 0))
		self.styleDisplay = ParagraphStyle(fontName = "HGG_Sans_Italics", fontSize = 80, name='Normal', leading=13, alignment=TA_RIGHT, textColor=Color(0.003921568627451, 0.2313725490196078, 0.5529411764705882, 1))
		self.styleSummary = ParagraphStyle(fontName = "Calibri", fontSize = 11, name='Indented', leading=13, alignment=TA_LEFT, leftIndent=20, rightIndent=20, textColor=Color(0, 0, 0))
	  
	def createCoverPage(self):		
		self.pdfContents.append(NextPageTemplate('coverTemplate'))
		self.pdfContents.append(PageBreak())
		
		self.pdfContents.append(Spacer(1, 50))
		cover_image = self.machine['cover_image']
		imagefile = None
		if len(cover_image) > 0:
			imagefile = getResource(cover_image[0])
		
		if imagefile != None:
			self.pdfContents.append(Image(imagefile, 6*inch, 4*inch))
		else:
			self.pdfContents.append(Spacer(1, 290))
		self.pdfContents.append(Paragraph(self.machineName, ParagraphStyle(fontName = "HGG_Sans", fontSize = 24, name='Indented', alignment=TA_LEFT, leftIndent=30, textColor=Color(0.0274509803921569, 0.3098039215686275, 0.6392156862745098))))	
		
		LINE_LIMIT = 22
		charCount = 0
		if len(str(self.customerName)) > 0:
			numOfLines = 1
		else:
			numOfLines = 0
		
		line = str(self.customerName).split(' ');
		
		for word in line:
			charCount = charCount + len(word)
			if charCount > LINE_LIMIT:
				charCount = + len(word)
				numOfLines = numOfLines + 1
		
		vSpace = 164 - (numOfLines * 21) - ((len(str(self.customerDetails['country'])) / 24) * 20)
		self.pdfContents.append(Spacer(1, vSpace))
		self.pdfContents.append(Paragraph(escapeCharacters(self.customerName), ParagraphStyle(fontName = "HGG_Sans", fontSize = 21, name='Indented', leading=23, alignment=TA_LEFT, leftIndent=20, textColor=Color(1, 1, 1))))
		self.pdfContents.append(Spacer(1, 3))
		self.pdfContents.append(Paragraph(self.customerDetails['country'], ParagraphStyle(fontName = "HGG_Sans_Italics", fontSize = 18, name='Indented', leading=20, alignment=TA_LEFT, leftIndent=35, textColor=Color(1, 1, 1))))
		
	def createIntroductionPage(self):
	
		from xhtml2pdf import document
		
		html = ('<html> '
				'<head> '
				'<style type="text/css"> '
				'body { '
					'font-size: 1pt; '
				'} '
				'p { '
					'text-align: left; '
				'} '
				'label {'
					'width: 200px;'
				'}'
				'@page { '
					'size: a4 landscape; '
					'@frame cola { '
						'width: 480pt; '
						'left: 72pt; '
						'top: 54pt; '
						'height: 500pt; '
					'} '
				'} '
				'.breaker { '
					'-pdf-page-break: before; '
				'} '
				'</style> '
				'</head> '
				'<body> ')			
		html += self.introduction.replace('<p', '<span').replace('</p>','</span><br/>')
		html += '</body></html>'
	
		f = file('temp/introduction.pdf','wb')
		document.pisaDocument(html, f)
		f.close()
		f = file('temp/introduction.pdf', 'rb')
		pdf = PdfFileReader(f)
		pages = pdf.getNumPages()
		f.close()
		
		for i in range(0,pages):
			self.pdfContents.append(NextPageTemplate('introTemplate'))
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Spacer(1,1))
			if i == 0:
				bookmarkName = 'bookmark-intro'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)

	def createTableofContentsPage(self):
		
		self.pdfContents.append(NextPageTemplate('tocTemplate'))
		self.pdfContents.append(PageBreak())
		
		toc = TableOfContents()
		toc.levelStyles = [
						ParagraphStyle(fontName='HGG_Sans', fontSize=14, name='TOCHeading1', leftIndent=20, firstLineIndent=-20, spaceBefore=10, leading=16),
						ParagraphStyle(fontSize=11, name='TOCHeading2', leftIndent=40, firstLineIndent=-20, spaceBefore=5, leading=12)
		]
		
		self.pdfContents.append(toc)
		
	def createScopeOfSupplyPage(self):
	
		self.pdfContents.append(NextPageTemplate('scopeTemplate'))
		self.pdfContents.append(PageBreak())
		self.pdfContents.append(NextPageTemplate('scopeTemplateAfter'))
		self.pdfContents.append(Spacer(1, -12))
		bookmarkName  = 'bookmark-quotation'
		p = Paragraph('<a name= "%s" />'% bookmarkName, self.styleN)
		p._bookmarkName = bookmarkName
		self.pdfContents.append(p)
		
		if len(self.data['scopeSummary']) > 0:
			machineSummary = Paragraph('<i>%s</i>' % self.data['scopeSummary'], self.styleSummary)
			self.pdfContents.append(machineSummary)
		else:
			self.pdfContents.append(Spacer(1, 18))
			
		self.pdfContents.append(Spacer(1, 5))
		
		scopeData = []  
		tableStyle = []
		rowCount = 0

		for subject in self.scopeOfSupply:
			rowCount = 0
			scopeData = []  
			tableStyle = []
			header = []
			header.append(Paragraph('<b>' + subject['name'] + '</b>', self.styleSubjectLeft))
			header.append(Spacer(1,10))
			header.append(Spacer(1,10))
			header.append(Paragraph('<b>Quantity</b>', self.styleSubjectCentered))
			if self.showItemPrice:
				header.append(Paragraph('<b>Price (%s)</b>' % self.data['currency'], self.styleSubjectCentered))
			
			scopeData.append([''])
			tableStyle.append(("BOTTOMPADDING", (0, rowCount), (-1, rowCount), -5))
			rowCount += 1	
			
			scopeData.append(header)
			tableStyle.append(("BACKGROUND", (0, rowCount), (-1, rowCount), self.hggBlue))
			tableStyle.append(("BOTTOMPADDING", (0, rowCount), (-1, rowCount), 3))
			tableStyle.append(("TOPPADDING", (0, rowCount), (-1, rowCount), 3))
			rowCount += 1
			
			scopeData.append([''])
			tableStyle.append(("TOPPADDING", (0, rowCount), (-1, rowCount), -5))
			rowCount += 1
			odd = True
			for chapter in subject['chapters']:
				iOptions = 0
				for option in chapter['options']:
					rowData = []
					if odd:
						tableStyle.append(("BACKGROUND", (1, rowCount), (-1, rowCount), self.steelGray))
					
					if iOptions == 0:
						rowData.append(Paragraph(chapter['name'], self.styleN))
					else:
						rowData.append('')
					
					if len(escapeCharacters(option["name"])) > 0:
						try:
							rowData.append(Paragraph(escapeCharacters(option['name']), self.styleN))
						except:
							rowData.append(Paragraph('ERROR IN WRITING NAME', self.styleN))
					else:
						rowData.append(Spacer(1,15))
						
					if len(escapeCharacters(option["description"])) > 0:
						try:
							rowData.append(Paragraph(escapeCharacters(option['description']), self.styleN))
						except:
							rowData.append(Paragraph('ERROR IN WRITING DESCRIPTION', self.styleN))
					else:
						rowData.append(Spacer(1,15))
					
					if len(str(option["quantity"])) > 0:
						rowData.append(Paragraph(str(option['quantity']), self.quantityTextStyle))
					else:
						rowData.append(Spacer(1,15))
						
					if self.showItemPrice:
						rowData.append(Paragraph(str(option['price']), self.priceTextStyle))
						
					odd = not(odd)
					tableStyle.append(('VALIGN', (0, rowCount), (2, rowCount), 'TOP'))	
					scopeData.append(rowData)
					iOptions += 1
					rowCount += 1
			
			table = Table(scopeData, style=tableStyle, repeatRows=3)
			
			table._argW[0] = 1.8*inch
			table._argW[1] = 2*inch
			table._argW[3] = 0.8*inch
			if self.showItemPrice:
				table._argW[4] = 1.6*inch
				table._argW[2] = 4*inch
			else:
				table._argW[2] = 4.6*inch
				table._argW[3] = 1.6*inch
			self.pdfContents.append(table)
		 
		self.pdfContents.append(Spacer(1,10))
		tableStyle = []
		footerData = []

		if self.showDiscount:
			origPriceRow = []
			origPriceRow.append(Paragraph('Price:', self.styles['Heading4']))
			origPriceRow.append('')
			origPriceRow.append('')
			
			if self.showItemPrice:
				origPriceRow.append('')
			
			origPriceRow.append(Paragraph(self.data['currency'] + ' ' + str(self.data['originalPrice']), self.styleTitleRightAligned))
			footerData.append(origPriceRow)
		
		
		if self.showDiscount:
			discountRow = []
			discountRow.append(Paragraph('Discount:', self.styles['Heading4']))
			discountRow.append('')
			discountRow.append('')
			if self.showItemPrice:
				discountRow.append('')
			discountRow.append(Paragraph(self.data['currency'] + ' ' + str(self.data['discount']), self.styleTitleRightAligned))
			footerData.append(discountRow)
						
		totalRow = []
		totalRow.append(Paragraph('Total', self.styles['Heading4']))
		totalRow.append(Spacer(1,15))
		totalRow.append(Spacer(1,15))
		if self.showItemPrice:
			totalRow.append('')
		totalRow.append(Paragraph(self.data['currency'] + ' ' +'<b>' + str(self.scopeOfSupplyAmount) + '</b>', self.styleTitleRightAligned))		
		footerData.append(totalRow)
		
		tableStyle.append(('LINEABOVE', (0,-1), (-1,-1), 1, self.hggBlue))
		tableStyle.append(('LINEBELOW', (0,-1), (-1,-1), 1.2, self.hggBlue))
		tableStyle.append(('ALIGN', (0,0), (-1,0), 'LEFT'))
		
		table = Table(footerData, style=tableStyle)			
		table._argW[0] = 1.8*inch
		table._argW[1] = 2*inch
		table._argW[3] = 0.8*inch
		if self.showItemPrice:
			table._argW[4] = 1.6*inch
			table._argW[2] = 4*inch
		else:
			table._argW[2] = 4.6*inch
			table._argW[3] = 1.6*inch
		self.pdfContents.append(table)
		
	def createOptionalsPage(self):
		#self.pdfContents.append(NextPageTemplate('separatorTemplate'))
		#self.pdfContents.append(PageBreak())
		self.pdfContents.append(NextPageTemplate('optionalTemplate'))
		self.pdfContents.append(PageBreak())
		"""
		bookmarkName = 'bookmark-quotation'
		p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
		p._bookmarkName = bookmarkName
		self.pdfContents.append(p)
		"""

		optionalData = []	  
		tab_style = []
		rowCount = 0

		for subject in self.optionList:
			optionalData = []	  
			tab_style = []
			rowCount = 0
			header = []
			header.append(Paragraph('<b>' + subject['name'] + '</b>', self.styleSubjectLeft))
			header.append(Spacer(1,10))			
			header.append(Spacer(1,10))
			header.append(Paragraph('<b>Quantity</b>', self.styleSubjectCentered))
			header.append(Paragraph('<b>Price (%s)</b>' % self.data['currency'], self.styleSubjectCentered))
			
			optionalData.append([''])
			tab_style.append(("BOTTOMPADDING", (0, rowCount), (-1, rowCount), -5))
			rowCount += 1	
			
			optionalData.append(header)
			tab_style.append(("BACKGROUND", (0, rowCount), (-1, rowCount), self.hggBlue))
			tab_style.append(("BOTTOMPADDING", (0, rowCount), (-1, rowCount), 3))
			tab_style.append(("TOPPADDING", (0, rowCount), (-1, rowCount), 3))
			rowCount += 1
			
			optionalData.append([''])
			tab_style.append(("TOPPADDING", (0, rowCount), (-1, rowCount), -5))
			rowCount += 1
			odd = True
			for chapter in subject['chapters']:
				iOptions = 0
				for option in chapter['options']:
					rowData = []
					if odd:
						tab_style.append(("BACKGROUND", (1, rowCount), (-1, rowCount), self.steelGray))				 
					
					if iOptions == 0:
						rowData.append(Paragraph(chapter['name'], self.styleN))
					else:
						rowData.append('')
						
					if len(escapeCharacters(option["name"])) > 0:
						try:
							rowData.append(Paragraph(escapeCharacters(option['name']), self.styleN))
						except:
							rowData.append(Paragraph('ERROR IN WRITING NAME', self.styleN))
					else:
						rowData.append(Spacer(1,15))
						
					if len(escapeCharacters(option["description"])) > 0:
						try:
							rowData.append(Paragraph(escapeCharacters(option['description']), self.styleN))
						except:
							rowData.append(Paragraph('ERROR IN WRITING DESCRIPTION', self.styleN))
					else:
						rowData.append(Spacer(1,15))
					
					if len(str(option["quantity"])) > 0:
						rowData.append(Paragraph(str(option['quantity']), self.quantityTextStyle))
					else:
						rowData.append(Spacer(1,15))
					
					if len(str(option["price"])) > 0:
						rowData.append(Paragraph(str(option['price']), self.priceTextStyle))
					else:
						rowData.append(Spacer(1,15))
						
					odd = not(odd)
					tab_style.append(('VALIGN', (0, rowCount), (2, rowCount), 'TOP'))
					optionalData.append(rowData)
					iOptions += 1
					rowCount += 1
			
			table = Table(optionalData, style=tab_style, repeatRows=3)
			table._argW[0] = 1.8*inch
			table._argW[1] = 2*inch
			table._argW[2] = 4.2*inch
			table._argW[3] = inch
			table._argW[4] = inch
						
			self.pdfContents.append(table) 
		
	def createTermsPage(self):
	
		from xhtml2pdf import document
		
		html = ('<html> '
				'<head> '
				'<style type="text/css"> '
				'p { '
					'text-align: justify; '
				'} '
				'label {'
					'width: 200px;'
				'}'
				'@page { '
					'size: a4 landscape; '
					'@frame cola { '
						'width: 690pt; '
						'left: 72pt; '
						'top: 90pt; '
						'height: 460pt; '
					'} '
				'} '
				'.breaker { '
					'-pdf-page-break: before; '
				'} '
				'</style> '
				'</head> '
				'<body> ')	
		html += self.terms
		html += '</body></html>'
	
		f = file('temp/terms.pdf','wb')
		document.pisaDocument(html, f)
		f.close()
		f = file('temp/terms.pdf', 'rb')
		pdf = PdfFileReader(f)
		pages = pdf.getNumPages()
		f.close()
					
		for i in range(0,pages):
			self.pdfContents.append(NextPageTemplate('termsTemplate'))
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Spacer(1,1))
			if i == 0:
				bookmarkName = 'bookmark-tc'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)
		
	def createMachineOptionPage(self, pages):
		
		from xhtml2pdf import document
		
		html = ('<html> '
				'<head> '
				'<style type="text/css"> '
				'p { '
					'text-align: justify; '
				'} '
				'label {'
					'width: 200px;'
				'}'
				'@page { '
					'size: a4 landscape; '
					'@frame cola { '
						'width: 690pt; '
						'left: 72pt; '
						'top: 90pt; '
						'height: 460pt; '
					'} '
				'} '
				'.breaker { '
					'-pdf-page-break: before; '
				'} '
				'</style> '
				'</head> '
				'<body> ')	
		html += self.terms
		html += '</body></html>'
	"""
		f = file('temp/terms.pdf','wb')
		document.pisaDocument(html, f)
		f.close()
		f = file('temp/terms.pdf', 'rb')
		pdf = PdfFileReader(f)
		pages = pdf.getNumPages()
		f.close()
	"""	
	def createProductDescriptionPages(self, pages):
		self.pdfContents.append(NextPageTemplate('blankTemplate'))
		for i in range(0, pages):
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Paragraph('', self.styleN))
			if i == 0:
				self.pdfContents.append(Spacer(1, -12))
				bookmarkName = 'bookmark-pd'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)
	
	def createTechnicalDataPages(self, pages):
		self.pdfContents.append(NextPageTemplate('blankTemplate'))
		for i in range(0, pages):
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Paragraph('', self.styleN))
			if i == 0:
				self.pdfContents.append(Spacer(1, -12))
				bookmarkName = 'bookmark-td'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)

	def createMachineLayoutPages(self, pages):
		self.pdfContents.append(NextPageTemplate('blankTemplate'))
		for i in range(0, pages):
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Paragraph('', self.styleN))
			if i == 0:
				self.pdfContents.append(Spacer(1, -12))
				bookmarkName = 'bookmark-ml'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)
				
	def createReferenceListPages(self, pages):
		self.pdfContents.append(NextPageTemplate('blankTemplate'))
		for i in range(0, pages):
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Paragraph('', self.styleN))
			if i == 0:
				self.pdfContents.append(Spacer(1, -12))
				bookmarkName = 'bookmark-rl'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)
				
	def createWarrantyTermsAndConditionsPages(self, pages):
		self.pdfContents.append(NextPageTemplate('blankTemplate'))
		for i in range(0, pages):
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Paragraph('', self.styleN))
			if i == 0:
				self.pdfContents.append(Spacer(1, -12))
				bookmarkName = 'bookmark-wtc'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)
				
	def createServiceSupportTermsAndConditionsPages(self, pages):
		self.pdfContents.append(NextPageTemplate('blankTemplate'))
		for i in range(0, pages):
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Paragraph('', self.styleN))
			if i == 0:
				self.pdfContents.append(Spacer(1, -12))
				bookmarkName = 'bookmark-sstc'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)
				
	def createCustomPages(self, pages, title, bm):
		self.pdfContents.append(NextPageTemplate('blankTemplate'))
		self.doc.bookmarks['bookmark-%s' % bm] = title 
		for i in range(0, pages):
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Paragraph('', self.styleN))
			if i == 0:
				self.pdfContents.append(Spacer(1, -12))
				bookmarkName = 'bookmark-%s' % bm
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)

	def createAppendixPage(self,title, bm):
		self.pdfContents.append(NextPageTemplate('blankTemplate'))
		#self.doc.bookmarks['bookmark-%s' % bm] = title		 
		self.pdfContents.append(PageBreak())

		self.pdfContents.append(Spacer(1, 50))

		banner = []
		banner.append(Image("prooffer_app/static/img/logo_with_text.png"))
		if self.customerDetails['companyLogo']:			
			logoFile = getAttachment(projectsdb, self.data['reference'], self.customerDetails['companyLogo'])
			img = PILImage.open(logoFile)
			maxWidth = 2.5*inch
			maxHeight = 2*inch
			
			if float(img.size[0]) > float(img.size[1]): #if width is larger
				width = maxWidth
				scale = width / (float(img.size[0]) / 72)
				height = int((float(img.size[1]) / 72) * float(scale))
			else: #if height is larger
				height = maxHeight
				scale = height / (float(img.size[1]) / 72)
				width = int((float(img.size[0]) / 72) * float(scale))
			
			#reload logoFile to simulate 'rewind', PILImage already set it to EOF
			logoFile = getAttachment(projectsdb, self.data['reference'], self.customerDetails['companyLogo'])
			companyLogo = Image(logoFile, width, height)
			banner.append(Spacer(50,1))
			banner.append(companyLogo)

		self.pdfContents.append(Table([banner]))
		self.pdfContents.append(Spacer(1, 100))
		self.pdfContents.append(Paragraph(title, self.styleCenter))
		#bookmarkName = 'bookmark-%s' % bm
		#p = Paragraph(title, self.styleH)#<a name="%s"/>' % bookmarkName, self.styleN)
		#p._bookmarkName = bookmarkName
		#self.pdfContents.append(p)
				
	def countPdfNumPages(self, file):		
		if file != None:
			pdf = PdfFileReader(file, strict=False)
			pages = pdf.getNumPages()
			return pages
		return 0
		
	def savePdf(self):
		self.doc.multiBuild(self.pdfContents)
		
	def generate(self, include):
		server = prooffer_server.getServer()
		projectsdb = prooffer_server.getProjectsDB()
		datadb = prooffer_server.getDataDB()
		usersdb = prooffer_server.getUsersDB()
		cachedb = server['prooffer_cache']
		pdf_generator_status = cachedb['pdf_generator_status']
		
		visibilityOptions = include
		
		showToc = False
		coverPages = 0
		tocPages = 0
		customOptionsPages = 0
		prodDescPages = 0
		technicalDataPages = 0
		machineLayoutPages = 0
		referenceListPages = 0
		warrantyTermsAndConditionsPages = 0
		serviceSupportTermsAndConditionsPages = 0
		intropdfpages = 0
		termsPdfPages = 0
		pdfDoc = None
		index = 0
		iCustom = 0
		for vOption in visibilityOptions:
			if vOption['include']:
				if  vOption['title'] == 'Quotation' or \
					vOption['title'] == 'General Terms and Conditions' or \
					vOption['title'] == 'Product Description' or \
					vOption['title'] == 'Technical Data' or \
					vOption['title'] == 'Machine Layout' or \
					vOption['title'] == 'Reference List' or \
					vOption['title'] == 'Warranty Terms and Conditions' or \
					vOption['type'] == 'custom':
						showToc = True
						tocPages = 1
						break
			index += 1
			
		if showToc:
			tocEntry = {u'include': True, u'title': u'Table Of Contents', u'pdf': u'', u'type': u'toc'}
			visibilityOptions.insert(index, tocEntry)

		def setStatus(mainStep, subStep):
			pdf_generator_status.update({'value': mainStep + ' ' + subStep})
			cachedb['pdf_generator_status'] = pdf_generator_status
		
		setStatus('Creating pages...', '')
		for vOption in visibilityOptions:
			if vOption['include']: 
				
				if vOption['type'] == 'standard':
					if vOption['title'] == 'Cover Page':
						setStatus('Creating pages...', 'Cover Page')
						self.createCoverPage()
						coverPages = 1
					
					if vOption['title'] == 'Introduction':
						setStatus('Creating pages...', 'Introduction')
						self.createIntroductionPage()
						intropdf = PdfFileReader(file('temp/introduction.pdf', 'rb'))
						intropdfpages = intropdf.getNumPages()
					
					if vOption['title'] == 'Quotation':
						setStatus('Creating pages...', 'Quotation')
						self.createScopeOfSupplyPage()
						if len(self.optionList) > 0:
							self.createOptionalsPage()
					
					if vOption['title'] == 'General Terms and Conditions':
						setStatus('Creating pages...', 'General Terms and Conditions')
						self.createTermsPage()
						termsPdf = PdfFileReader(file('temp/terms.pdf', 'rb'))
						termsPdfPages = termsPdf.getNumPages()
					
					def countPdfPages(resources):
						pages = 0
						for resource in resources:
							pages = pages + self.countPdfNumPages(getResource(resource))
						return pages
					
					if vOption['title'] == 'Product Description':
						setStatus('Creating pages...', 'Product Description')
						productDescriptions = []
						
						for resource_id in self.machine['front_page_desc']:
							productDescriptions.append(resource_id)						
						if self.data['productDescriptionIntro']:
							for resource_id in self.machine['description_intro']:
								productDescriptions.append(resource_id)
						for subject in self.scopeOfSupply:
							for chapter in subject['chapters']:
								for option in chapter['options']:
									if 'id' in option:
										machineoption = datadb[option['id']]
										for resource_id in machineoption['product_descriptions']:
											if not resource_id in productDescriptions:
												productDescriptions.append(resource_id)
							if subject['name'] == 'Hardware':
								for resource_id in self.machine['health_and_safety']:
			 						productDescriptions.append(resource_id)
												
						if len(self.optionList) > 0:
							productDescriptions.append('optionlist_divider')
							
						for subject in self.optionList:
							for chapter in subject['chapters']:
								for option in chapter['options']:
									if 'id' in option:
										machineoption = datadb[option['id']]
										for resource_id in machineoption['product_descriptions']:
											if not resource_id in productDescriptions:
												productDescriptions.append(resource_id)
							
						prodDescPages = countPdfPages(productDescriptions)
						#prodDescPages = prodDescPages + 1
						#self.createMachineOptionPage(prodDescPages)
						self.createProductDescriptionPages(prodDescPages)
					
					if vOption['title'] == 'Technical Data':
						setStatus('Creating pages...', 'Technical Data')
						technicalData = self.machine['technical_data']
						technicalDataPages = countPdfPages(technicalData)
						self.createTechnicalDataPages(technicalDataPages)
						
					if vOption['title'] == 'Machine Layout':
						setStatus('Creating pages...', 'Machine Layout')
						machineLayout = self.machine['machine_layout']
						machineLayoutPages = countPdfPages(machineLayout)
						self.createMachineLayoutPages(machineLayoutPages)
						
					if vOption['title'] == 'Reference List':
						setStatus('Creating pages...', 'Reference List')					
						referenceList = self.machine['reference_list']
						referenceListPages = countPdfPages(referenceList)			
						self.createReferenceListPages(referenceListPages)
						
					if vOption['title'] == 'Warranty Terms and Conditions':	
						setStatus('Creating pages...', 'Warranty Terms and Conditions')
						warrantyTermsAndConditions = self.machine['warranty_tc']
						warrantyTermsAndConditionsPages = countPdfPages(warrantyTermsAndConditions)						
						self.createWarrantyTermsAndConditionsPages(warrantyTermsAndConditionsPages)
						
					if vOption['title'] == 'Service Support Terms and Conditions':
						setStatus('Creating pages...', 'Service Support Terms and Conditions')
						serviceSupportTermsAndConditions = self.machine['service_tc']
						serviceSupportTermsAndConditionsPages = countPdfPages(serviceSupportTermsAndConditions)
						self.createServiceSupportTermsAndConditionsPages(serviceSupportTermsAndConditionsPages)
				
				elif vOption['type'] == 'custom':
					title = None
					title = vOption['title']
					pdfDoc = vOption['pdf']
					currentCustomPages = 0
					iCustom += 1
					if len(pdfDoc) > 0:
						currentCustomPages = self.countPdfNumPages(getAttachment(projectsdb, self.data['reference'], pdfDoc))
						customOptionsPages += currentCustomPages 
					self.createCustomPages(currentCustomPages, escapeCharacters(title), 'custom%s' % iCustom)
				
				else:
					self.createTableofContentsPage()
		
		self.savePdf()
		
		output = PdfFileWriter()
		
		pdf = PdfFileReader(file('temp/offer.pdf', 'rb'))
				
		hggPdfTemplate = PdfFileReader(file('HGG template.pdf', 'rb'))
		
		# subtract 1 to allow dummy first page
		offerPages = pdf.getNumPages() - 1
		quotationPages = offerPages - tocPages - coverPages - intropdfpages - termsPdfPages - prodDescPages - technicalDataPages - machineLayoutPages - referenceListPages - warrantyTermsAndConditionsPages - serviceSupportTermsAndConditionsPages - customOptionsPages
		
		def pdfgetPage(n):
			# add 1 because of dummy first page
			return pdf.getPage(n + 1)
			
		def isPortraitLayout(pageObj):
			rect = pageObj.mediaBox
			if (rect[2] < rect[3]): # if width is less than the height then rotate
				return True
			else:
				return False
				
		currentPage = 0
		
		def compress(pageObject):
			pageObject.compressContentStreams()
			return pageObject
		
		def merge(resources, currentPage):
			for resource in resources:
				pdffile = getResource(resource)
				if pdffile:
					pdfdocument = PdfFileReader(pdffile, strict=False)
					numpages = pdfdocument.getNumPages()
					for j in range(0,numpages):
						if isPortraitLayout(pdfdocument.getPage(j)):
							output.addPage(pdfdocument.getPage(j).rotateClockwise(90))
							output.addPage(compress(pdfdocument.getPage(j)))
							currentPage += 1
						else:
							masterPage = pdfgetPage(currentPage)
							masterPage.mergePage(pdfdocument.getPage(j))
							output.addPage(compress(masterPage))
							currentPage += 1

			return currentPage
		
		setStatus('Merging pages...','')
		for vOption in visibilityOptions:
			if vOption['include']: 
				if vOption['type'] == 'standard':
					if vOption['title'] == 'Cover Page':
						setStatus('Merging pages...', 'Cover Page')
						output.addPage(compress(pdfgetPage(currentPage)))
						currentPage += 1
					
					if vOption['title'] == 'Introduction':
						setStatus('Merging pages...', 'Introduction')
						for i in range(0, intropdfpages):
							basepage = pdfgetPage( currentPage + i)
							basepage.mergePage(intropdf.getPage(i))
							basepage.mergePage(hggPdfTemplate.getPage(0))
							output.addPage(compress(basepage))
						currentPage += intropdfpages
					
					if vOption['title'] == 'Quotation':
						setStatus('Merging pages...', 'Quotation')
						for i in range(0, quotationPages):
							basepage = pdfgetPage(currentPage + i)
							basepage.mergePage(hggPdfTemplate.getPage(0))
							output.addPage(compress(basepage))
						currentPage += quotationPages
					
					if vOption['title'] == 'General Terms and Conditions':
						setStatus('Merging pages...', 'General Terms and Conditions')
						for i in range(0, termsPdfPages):
							basepage = pdfgetPage( currentPage + i)
							basepage.mergePage(termsPdf.getPage(i))
							basepage.mergePage(hggPdfTemplate.getPage(0))
							output.addPage(compress(basepage))
						currentPage += termsPdfPages
					
					if vOption['title'] == 'Product Description':
						setStatus('Merging pages...', 'Product Description')
						if prodDescPages > 0:
							currentPage = merge(productDescriptions, currentPage)
							
							"""
							for resource_id in productDescriptions:
								pdffile = getResource(resource_id)
								if pdffile != None:
									pdfdata = PdfFileReader(pdffile)
									numPages = pdfdata.getNumPages()
									for j in range(0, numPages):
										masterPage = pdfgetPage(currentPage)
										masterPage.mergePage(pdfdata.getPage(j))
										output.addPage(masterPage)
										currentPage += 1
										"""
					if vOption['title'] == 'Technical Data':
						setStatus('Merging pages...', 'Technical Data')
						if technicalDataPages > 0:
							currentPage = merge(technicalData, currentPage)
							
					if vOption['title'] == 'Machine Layout':
						setStatus('Merging pages...', 'Machine Layout')
						if machineLayoutPages > 0:
							currentPage = merge(machineLayout, currentPage)
							
					if vOption['title'] == 'Reference List':
						setStatus('Merging pages...', 'Reference List')
						if referenceListPages > 0:
							currentPage = merge(referenceList, currentPage)
							
					if vOption['title'] == 'Warranty Terms and Conditions':
						setStatus('Merging pages...', 'Warranty Terms and Conditions')
						if warrantyTermsAndConditionsPages > 0:
							currentPage = merge(warrantyTermsAndConditions, currentPage)
							
					if vOption['title'] == 'Service Support Terms and Conditions':
						setStatus('Merging pages...', 'Service Support Terms and Conditions')
						if serviceSupportTermsAndConditionsPages > 0:
							currentPage = merge(serviceSupportTermsAndConditions, currentPage)
							
				elif vOption['type'] == 'custom':
					setStatus('Merging pages...', 'Custom: ' + vOption['pdf'])
					if customOptionsPages > 0:								
						customOptionsFile = getAttachment(projectsdb, self.data['reference'], vOption['pdf'])
						if customOptionsFile != None:
							customOptionsPdf = PdfFileReader(customOptionsFile, strict=True)
							numPages = customOptionsPdf.getNumPages()
							for j in range(0, numPages):
								if isPortraitLayout(customOptionsPdf.getPage(j)):
									output.addPage(compress(customOptionsPdf.getPage(j).rotateClockwise(90)))
									#output.addPage(compress(customOptionsPdf.getPage(j).rotateClockwise(0)))
									currentPage += 1
								else:
									masterPage = pdfgetPage(currentPage)
									masterPage.mergePage(customOptionsPdf.getPage(j))
									output.addPage(compress(masterPage))
									currentPage += 1
						
				else:
					# Table of Contents
					
					basepage = pdfgetPage(currentPage)
					basepage.mergePage(hggPdfTemplate.getPage(0)) # remember me
					output.addPage(compress(basepage))
					currentPage += 1
					
		setStatus('Writing file...','')
		outputStream = file('temp/temp.pdf', 'wb')
		output.write(outputStream)
		outputStream.close()
		pdf.stream.close()
		setStatus('','')
		return "ok";

	def createOrderConfirmationPage(self):
		#introduction = self.data['orderconfirmation']['contactDetails']
		from xhtml2pdf import document
		import re
		
		html = ('<html> '
				'<head> '
				'<style type="text/css"> '
				'body { '
					'font-size: 10pt; '
					'text-align: left;'
				'} '
				'label {'
					'width: 200px;'
				'}'
				'@page { '
					'size: a4 landscape; '
					'@frame cola { '
						'width: 650pt; '
						'left: 90pt; '
						'top: 75pt; '
						'height: 450pt; '
					'} '
				'} '
				'.breaker { '
					'-pdf-page-break: before; '
				'} '
				'</style> '
				'</head> '
				'<body> ')
		orderconfirmation = self.data['orderconfirmation']
		html += orderconfirmation.replace('<p>', '<span>').replace('</p>','</span><br/><ul>')
		html += '</body></html>'
		
		f = file('temp/orderconfirmation.pdf','wb')
		document.pisaDocument(html, f)
		f.close()
		f = file('temp/orderconfirmation.pdf', 'rb')
		pdf = PdfFileReader(f)
		pages = pdf.getNumPages()
		f.close()
		
		template = 'ordconTemplate'
		if self.data['label'] == 'Hand Over Document':
			template = 'handOverFinancialScopeTemplate'
		
		for i in range(0,pages):
			self.pdfContents.append(NextPageTemplate(template))
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Spacer(1,1))
			if i == 0:
				if self.data['label'] == "Order Confirmation":
					bookmarkName = 'bookmark-orderConf'
				elif self.data['label'] == "Contract":
					bookmarkName = 'bookmark-contract'
				elif self.data['label'] == "Agreement":
					bookmarkName = 'bookmark-agreement'
				else:
					bookmarkName = 'bookmark-intro'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)

	def generateOrder(self, include):
	
		projectsdb = prooffer_server.getProjectsDB()
		datadb = prooffer_server.getDataDB()
		usersdb = prooffer_server.getUsersDB()
	
		visibilityOptions = include
		
		showToc = False
		coverPages = 0
		tocPages = 0
		customOptionsPages = 0
		prodDescPages = 0
		technicalDataPages = 0
		machineLayoutPages = 0
		referenceListPages = 0
		warrantyTermsAndConditionsPages = 0
		serviceSupportTermsAndConditionsPages = 0
		intropdfpages = 0
		termsPdfPages = 0
		pdfDoc = None
		index = 0
		iCustom = 0
		appendixPages = 0
		
		#Cover Page
		self.createCoverPage()
		coverPages = 1
		
		self.createTableofContentsPage()
		tocPages = 1

		#Order Confirmation
		self.createOrderConfirmationPage()
		intropdf = PdfFileReader(file('temp/orderconfirmation.pdf', 'rb'))
		intropdfpages = intropdf.getNumPages()
			
		for vOption in visibilityOptions:
			if vOption['include']: 

#				if vOption['title'] not in ['Cover Page','Introduction','Product Description Introduction']:
#					appendixPages += 1
#					self.createAppendixPage('Appendix ' + str(appendixPages) + ': ' + vOption['title'], 'appendix_' + str(appendixPages))
				
				if vOption['type'] == 'standard':
						
					if vOption['title'] == 'Quotation':
						appendixPages += 1
						self.createAppendixPage('Appendix ' + str(appendixPages) + ': ' + vOption['title'], 'appendix_' + str(appendixPages))
						self.createScopeOfSupplyPage()
						if len(self.optionList) > 0:
							self.createOptionalsPage()
					
					if vOption['title'] == 'General Terms and Conditions':
						appendixPages += 1
						self.createAppendixPage('Appendix ' + str(appendixPages) + ': ' + vOption['title'], 'appendix_' + str(appendixPages))
						self.createTermsPage()
						termsPdf = PdfFileReader(file('temp/terms.pdf', 'rb'))
						termsPdfPages = termsPdf.getNumPages()
					
					def countPdfPages(resources):
						pages = 0
						for resource in resources:
							pages = pages + self.countPdfNumPages(getResource(resource))
						return pages
					
					if vOption['title'] == 'Product Description':
						productDescriptions = []
						
						for resource_id in self.machine['front_page_desc']:
							productDescriptions.append(resource_id)						
						if self.data['productDescriptionIntro']:
							for resource_id in self.machine['description_intro']:
								productDescriptions.append(resource_id)
						for subject in self.scopeOfSupply:
							for chapter in subject['chapters']:
								for option in chapter['options']:
									if 'id' in option:
										machineoption = datadb[option['id']]
										for resource_id in machineoption['product_descriptions']:
											if not resource_id in productDescriptions:
												productDescriptions.append(resource_id)
						for subject in self.optionList:
							for chapter in subject['chapters']:
								for option in chapter['options']:
									if 'id' in option:
										machineoption = datadb[option['id']]
										for resource_id in machineoption['product_descriptions']:
											if not resource_id in productDescriptions:
												productDescriptions.append(resource_id)
											
						for resource_id in self.machine['health_and_safety']:
							productDescriptions.append(resource_id)
												
						prodDescPages = countPdfPages(productDescriptions)
						if prodDescPages > 0:
							appendixPages += 1
							self.createAppendixPage('Appendix ' + str(appendixPages) + ': ' + vOption['title'], 'appendix_' + str(appendixPages))
						self.createProductDescriptionPages(prodDescPages)
					
					if vOption['title'] == 'Technical Data':
						technicalData = self.machine['technical_data']
						technicalDataPages = countPdfPages(technicalData)
						if technicalDataPages > 0:
							appendixPages += 1
							self.createAppendixPage('Appendix ' + str(appendixPages) + ': ' + vOption['title'], 'appendix_' + str(appendixPages))
						self.createTechnicalDataPages(technicalDataPages)
						
					if vOption['title'] == 'Machine Layout':
						machineLayout = self.machine['machine_layout']
						machineLayoutPages = countPdfPages(machineLayout)
						if machineLayoutPages > 0:
							appendixPages += 1
							self.createAppendixPage('Appendix ' + str(appendixPages) + ': ' + vOption['title'], 'appendix_' + str(appendixPages))
						self.createMachineLayoutPages(machineLayoutPages)
						
					if vOption['title'] == 'Reference List':							
						referenceList = self.machine['reference_list']
						referenceListPages = countPdfPages(referenceList)
						if referenceListPages > 0:
							appendixPages += 1
							self.createAppendixPage('Appendix ' + str(appendixPages) + ': ' + vOption['title'], 'appendix_' + str(appendixPages))
						self.createReferenceListPages(referenceListPages)
						
					if vOption['title'] == 'Warranty Terms and Conditions':	
						warrantyTermsAndConditions = self.machine['warranty_tc']
						warrantyTermsAndConditionsPages = countPdfPages(warrantyTermsAndConditions)
						if warrantyTermsAndConditionsPages > 0:
							appendixPages += 1
							self.createAppendixPage('Appendix ' + str(appendixPages) + ': ' + vOption['title'], 'appendix_' + str(appendixPages))
						self.createWarrantyTermsAndConditionsPages(warrantyTermsAndConditionsPages)
						
					if vOption['title'] == 'Service Support Terms and Conditions':
						serviceSupportTermsAndConditions = self.machine['service_tc']
						serviceSupportTermsAndConditionsPages = countPdfPages(serviceSupportTermsAndConditions)
						if serviceSupportTermsAndConditionsPages > 0:
							appendixPages += 1
							self.createAppendixPage('Appendix ' + str(appendixPages) + ': ' + vOption['title'], 'appendix_' + str(appendixPages))
						self.createServiceSupportTermsAndConditionsPages(serviceSupportTermsAndConditionsPages)
				
				elif vOption['type'] == 'custom':
					title = None
					title = vOption['title']
					pdfDoc = vOption['pdf']
					currentCustomPages = 0
					iCustom += 1
					if len(pdfDoc) > 0:
						currentCustomPages = self.countPdfNumPages(getAttachment(projectsdb, self.data['reference'], pdfDoc))
						customOptionsPages += currentCustomPages 
					if customOptionsPages > 0:
						appendixPages += 1
						self.createAppendixPage('Appendix ' + str(appendixPages) + ': ' + vOption['title'], 'appendix_' + str(appendixPages))
					self.createCustomPages(currentCustomPages, escapeCharacters(title), 'custom%s' % iCustom)
				
		self.savePdf()
		
		output = PdfFileWriter()
		
		pdf = PdfFileReader(file('temp/offer.pdf', 'rb'))
				
		hggPdfTemplate = PdfFileReader(file('HGG template.pdf', 'rb'))
		
		# subtract 1 to allow dummy first page
		offerPages = pdf.getNumPages() - 1
		quotationPages = offerPages - tocPages - coverPages - intropdfpages - termsPdfPages - prodDescPages - technicalDataPages - machineLayoutPages - referenceListPages - warrantyTermsAndConditionsPages - serviceSupportTermsAndConditionsPages - customOptionsPages
		quotationPages = quotationPages - appendixPages		
		
		def pdfgetPage(n):
			# add 1 because of dummy first page
			return pdf.getPage(n + 1)
			
		def isPortraitLayout(pageObj):
			rect = pageObj.mediaBox
			if (rect[2] < rect[3]): # if width is less than the height then rotate
				return True
			else:
				return False
				
		currentPage = 0
		
		def merge(resources, currentPage):
			for resource in resources:
				pdffile = getResource(resource)
				if pdffile:
					pdfdocument = PdfFileReader(pdffile, strict=False)
					numpages = pdfdocument.getNumPages()
					for j in range(0,numpages):
						if isPortraitLayout(pdfdocument.getPage(j)):
							output.addPage(pdfdocument.getPage(j).rotateClockwise(90))
							output.addPage(pdfdocument.getPage(j))
						else:
							masterPage = pdfgetPage(currentPage)
							masterPage.mergePage(pdfdocument.getPage(j))
							output.addPage(masterPage)
						currentPage += 1
			return currentPage

		#Cover Page
		output.addPage(pdfgetPage(currentPage))
		currentPage += 1
		
		# Table of Contents
		basepage = pdfgetPage(currentPage)
		basepage.mergePage(hggPdfTemplate.getPage(0))
		output.addPage(basepage)
		currentPage += 1

		#Order Confirmation
		for i in range(0, intropdfpages):
			basepage = pdfgetPage(currentPage + i)
			basepage.mergePage(intropdf.getPage(i))
			#output.addPage(intropdf.getPage(i).rotateClockwise(90))
			output.addPage(basepage)
		currentPage += intropdfpages
			
		for vOption in visibilityOptions:
			if vOption['include']: 
				if vOption['type'] == 'standard':
					
					if vOption['title'] == 'Quotation':
						if quotationPages > 0:
							basepage = pdfgetPage(currentPage)
							output.addPage(basepage)
							currentPage += 1
						for i in range(0, quotationPages):
							basepage = pdfgetPage(currentPage + i)
							basepage.mergePage(hggPdfTemplate.getPage(0))
							output.addPage(basepage)
						currentPage += quotationPages
					
					if vOption['title'] == 'General Terms and Conditions':
						if termsPdfPages > 0:
							basepage = pdfgetPage(currentPage)
							output.addPage(basepage)
							currentPage += 1
						for i in range(0, termsPdfPages):
							basepage = pdfgetPage( currentPage + i)
							basepage.mergePage(termsPdf.getPage(i))
							basepage.mergePage(hggPdfTemplate.getPage(0))
							output.addPage(basepage)
						currentPage += termsPdfPages
					
					if vOption['title'] == 'Product Description':
						if prodDescPages > 0:
							basepage = pdfgetPage(currentPage)
							output.addPage(basepage)
							currentPage += 1
							for resource_id in productDescriptions:
								pdffile = getResource(resource_id)
								if pdffile != None:
									pdfdata = PdfFileReader(pdffile, strict=False)
									numPages = pdfdata.getNumPages()
									for j in range(0, numPages):
										masterPage = pdfgetPage(currentPage)
										masterPage.mergePage(pdfdata.getPage(j))
										output.addPage(masterPage)
										currentPage += 1
							
					if vOption['title'] == 'Technical Data':
						if technicalDataPages > 0:
							basepage = pdfgetPage(currentPage)
							output.addPage(basepage)
							currentPage += 1
							currentPage = merge(technicalData, currentPage)
							
					if vOption['title'] == 'Machine Layout':
						if machineLayoutPages > 0:
							basepage = pdfgetPage(currentPage)
							output.addPage(basepage)
							currentPage += 1
							currentPage = merge(machineLayout, currentPage)
							
					if vOption['title'] == 'Reference List':
						if referenceListPages > 0:
							basepage = pdfgetPage(currentPage)
							output.addPage(basepage)
							currentPage += 1
							currentPage = merge(referenceList, currentPage)
							
					if vOption['title'] == 'Warranty Terms and Conditions':
						if warrantyTermsAndConditionsPages > 0:
							basepage = pdfgetPage(currentPage)
							output.addPage(basepage)
							currentPage += 1
							currentPage = merge(warrantyTermsAndConditions, currentPage)
							
					if vOption['title'] == 'Service Support Terms and Conditions':
						if serviceSupportTermsAndConditionsPages > 0:
							basepage = pdfgetPage(currentPage)
							output.addPage(basepage)
							currentPage += 1
							currentPage = merge(serviceSupportTermsAndConditions, currentPage)
							
				elif vOption['type'] == 'custom':
					if customOptionsPages > 0:
						basepage = pdfgetPage(currentPage)
						output.addPage(basepage)
						currentPage += 1
						customOptionsFile = getAttachment(projectsdb, self.data['reference'], vOption['pdf'])
						if customOptionsFile != None:
							customOptionsPdf = PdfFileReader(customOptionsFile, strict=False)
							numPages = customOptionsPdf.getNumPages()
							for j in range(0, numPages):
								if isPortraitLayout(customOptionsPdf.getPage(j)):
									output.addPage(customOptionsPdf.getPage(j).rotateClockwise(90))
								else:
									masterPage = pdfgetPage(currentPage)
									masterPage.mergePage(customOptionsPdf.getPage(j))
									output.addPage(masterPage)
								currentPage += 1
								
		outputStream = file('temp/temp.pdf', 'wb')
		output.write(outputStream)
		outputStream.close()
		pdf.stream.close()
		return "ok";

	def generateOrderPreview(self):
	
		coverPages = 0
		intropdfpages = 0

		#Cover Page
		self.createCoverPage()
		coverPages = 1
		
		#Order Confirmation
		self.createOrderConfirmationPage()
		intropdf = PdfFileReader(file('temp/orderconfirmation.pdf', 'rb'))
		intropdfpages = intropdf.getNumPages()

		self.savePdf()
		
		output = PdfFileWriter()
		
		pdf = PdfFileReader(file('temp/offer.pdf', 'rb'))
				
		def pdfgetPage(n):
			# add 1 because of dummy first page
			return pdf.getPage(n + 1)
			
		currentPage = 0

		#Cover Page
		output.addPage(pdfgetPage(currentPage))
		currentPage += 1
	
		#Order Confirmation
		for i in range(0, intropdfpages):
			basepage = pdfgetPage(currentPage + i)
			basepage.mergePage(intropdf.getPage(i))
			#output.addPage(intropdf.getPage(i).rotateClockwise(90))
			output.addPage(basepage)
		currentPage += intropdfpages

		outputStream = file('temp/temp.pdf', 'wb')
		output.write(outputStream)
		outputStream.close()
		pdf.stream.close()
		return "ok";

	def createHandOverContactDetailsPage(self):
		contactDetails = self.data['handOverAdditionalData']['contactDetails']
		from xhtml2pdf import document

		html = ('<html> '
				'<head> '
				'<style type="text/css"> '
				'p, th { '
					'font: bold 13px;'
				'} '
				'td {'
					'font: normal 13px;'
				'} '
				'label {'
					'width: 200px;'
				'}'
				'@page { '
					'size: a4 landscape; '
					'@frame cola { '
						'width: 690pt; '
						'left: 72pt; '
						'top: 70pt; '
						'height: 470pt; '
					'} '
				'} '
				'.breaker { '
					'-pdf-page-break: before; '
				'} '
				'.TFtable{'
					'width:100%;'
					'text-align: left;'
					'border-collapse: #013B8D 1px solid;'
				'}'
				'.TFtable th{'
					'padding-top: 5px;'
					'padding-left: 5px;'
					'background:#013B8D;'
					'color:#FFFFFF;'
				'}'
				'.TFtable2 th{'
					'padding-top: 5px;'
					'padding-left: 5px;'
					'background:#FFFFFF;'
					'color:#FFFFFF;'
				'}'
				'.TFtable td{'
					'padding:5px;'
					'font-size: 12px;'
				'}'
				'.TFtable tr:nth-child(odd){'
					'background: #E0E0E0;'
				'}'
				'.TFtable tr:nth-child(even){'
					'background: #FFFFFF;'
				'}'
				'</style> '
				'</head> '
				'<body> ')
		
		html +=('<div><table class="TFtable">'
				'<tr><th class="TFtable">Revision</th><th class="TFtable">Date</th><th class="TFtable">Name</th><th class="TFtable" colspan="4">Change</th></tr>'
				'<tr><td class="TFtable">Entry 1</td><td class="TFtable">' + contactDetails['rev1Date'] + '</td><td class="TFtable">' + contactDetails['rev1Name'] + '</td><td class="TFtable" colspan="4">' + contactDetails['rev1Change'] + '</td></tr>'
				'<tr><td class="TFtable">Entry 2</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['rev2Date'] + '</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['rev2Name'] + '</td><td class="TFtable" colspan="4" style="background: #E0E0E0;">' + contactDetails['rev2Change'] + '</td></tr>'
				'<tr><td class="TFtable">Entry 3</td><td class="TFtable">' + contactDetails['rev3Date'] + '</td><td class="TFtable">' + contactDetails['rev3Name'] + '</td><td class="TFtable" colspan="4">' + contactDetails['rev3Change'] + '</td></tr>'
				'<tr><td class="TFtable">Entry 4</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['rev4Date'] + '</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['rev4Name'] + '</td><td class="TFtable" colspan="4" style="background: #E0E0E0;">' + contactDetails['rev4Change'] + '</td></tr>'
				'<tr><td class="TFtable">Entry 5</td><td class="TFtable">' + contactDetails['rev5Date'] + '</td><td class="TFtable">' + contactDetails['rev5Name'] + '</td><td class="TFtable" colspan="4">' + contactDetails['rev5Change'] + '</td></tr>'
				'</table></div><br/>')
				
		html += ('<div><table class="TFtable">'
				 '<tr><th class="TFtable" colspan="3">Company</th><th class="TFtable" colspan="3">Financial</th></tr>'
				 '<tr><td class="TFtable" colspan="2">Address:</td><td class="TFtable">' + contactDetails['companyAddress'] + '</td><td class="TFtable" colspan="2">Address:</td><td class="TFtable">' + contactDetails['financialAddress'] + '</td></tr>'
				 '<tr><td class="TFtable" colspan="2">Name:</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['companyName'] + '</td><td class="TFtable" colspan="2" style="background: #FFFFFF;">Name:</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['financialName'] + '</td></tr>'
				 '<tr><td class="TFtable" colspan="2">Telephone:</td><td class="TFtable">' + contactDetails['companyTelephone'] + '</td><td class="TFtable" colspan="2">Telephone:</td><td class="TFtable">' + contactDetails['financialTelephone'] + '</td></tr>'
				 '<tr><td class="TFtable" colspan="2">E-Mail:</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['companyEmail'] + '</td><td class="TFtable" colspan="2" style="background: #FFFFFF;">E-Mail:</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['financialEmail'] + '</td></tr>'
				 '</table></div><br/>')

		html += ('<div><table class="TFtable">'
				 '<tr><th class="TFtable" colspan="3">Technical</th><th class="TFtable" colspan="3">Service</th></tr>'
				 '<tr><td class="TFtable" colspan="2">Address:</td><td class="TFtable">' + contactDetails['technicalAddress'] + '</td><td class="TFtable" colspan="2">Address:</td><td class="TFtable">' + contactDetails['serviceAddress'] + '</td></tr>'
				 '<tr><td class="TFtable" colspan="2">Name:</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['technicalName'] + '</td><td class="TFtable" colspan="2" style="background: #FFFFFF;">Name:</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['serviceName'] + '</td></tr>'
				 '<tr><td class="TFtable" colspan="2">Telephone:</td><td class="TFtable">' + contactDetails['technicalTelephone'] + '</td><td class="TFtable" colspan="2">Telephone:</td><td class="TFtable">' + contactDetails['serviceTelephone'] + '</td></tr>'
				 '<tr><td class="TFtable" colspan="2">E-Mail:</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['technicalEmail'] + '</td><td class="TFtable" colspan="2" style="background: #FFFFFF;">E-Mail:</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['serviceEmail'] + '</td></tr>'
				 '</table></div><br/>')
				 
		html += ('<div><table class="TFtable">'
				 '<tr><th class="TFtable" colspan="3">Agency</th></tr>'
				 '<tr><td class="TFtable" colspan="2">Company:</td><td class="TFtable">' + contactDetails['agencyCompany'] + '</td><td class="TFtable" colspan="2">Delivery address in case differs from company details:</td><td class="TFtable">' + contactDetails['deliveryAddress'] + '</td></tr>'
				 '<tr><td class="TFtable" colspan="2">Address:</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['agencyAddress'] + '</td><td style="background: #FFFFFF;" colspan="3"></td></tr>'
				 '<tr><td class="TFtable" colspan="2">Name:</td><td class="TFtable">' + contactDetails['agencyName'] + '</td></tr>'
				 '<tr><td class="TFtable" colspan="2">Telephone:</td><td class="TFtable" style="background: #E0E0E0;">' + contactDetails['agencyTelephone'] + '</td><td style="background: #FFFFFF;" colspan="3"></td></tr>'
				 '<tr><td class="TFtable" colspan="2">E-Mail:</td><td class="TFtable">' + contactDetails['agencyEmail'] + '</td></tr>'
				 '</table></div><br/>')
	
		f = file('temp/handOverContactDetails.pdf','wb')
		document.pisaDocument(html, f)
		f.close()
		f = file('temp/handOverContactDetails.pdf', 'rb')
		pdf = PdfFileReader(f)
		pages = pdf.getNumPages()
		f.close()
		
		for i in range(0,pages):
			self.pdfContents.append(NextPageTemplate('handOverContactDetailsTemplate'))
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Spacer(1,1))
			if i == 0:
				bookmarkName = 'bookmark-tc'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)

	def createHandOverFinancialScopePage(self):
		financialScope = self.data['handOverAdditionalData']['financialScope']
		from xhtml2pdf import document
		
		html = ('<html> '
				'<head> '
				'<style type="text/css"> '
				'p, th { '
					'font: bold 13px;'
				'} '
				'td {'
					'font: normal 13px;'
				'} '
				'label {'
					'width: 200px;'
				'}'
				'@page { '
					'size: a4 landscape; '
					'@frame cola { '
						'width: 690pt; '
						'left: 72pt; '
						'top: 70pt; '
						'height: 470pt; '
					'} '
				'} '
				'.breaker { '
					'-pdf-page-break: before; '
				'} '
				'.TFtable{'
					'width:100%;'
					'text-align: left;'
					'border-collapse: #013B8D 1px solid;'
				'}'
				'.TFtable th{'
					'padding-top: 5px;'
					'padding-left: 5px;'
					'background:#013B8D;'
					'color:#FFFFFF;'
				'}'
				'.TFtable td{'
					'padding:5px;'
					'margin-top: 5px;'
					'font-size: 12px;'
				'}'
				'.TFtable tr{'
					#'background: #b8d1f3;'
				'}'
				'.TFtable tr:nth-child(odd){'
					'background: #E0E0E0;'
				'}'
				'.TFtable tr:nth-child(even){'
					'background: #FFFFFF;'
				'}'
				'</style> '
				'</head> '
				'<body> ')			
		html += ('<div><table class="TFtable">'
				 '<tr><th class="TFtable" colspan="4">Additional Information</th></tr>'
				 '<tr><td class="TFtable">HGG Offer Reference</td><td class="TFtable">' + financialScope['hggOfferReference'] + '</td><td class="TFtable" colspan="2"></td></tr>'
				 '<tr><td class="TFtable">PO Reference</td><td class="TFtable" style="background: #E0E0E0;">' + financialScope['poReference'] + '</td><td class="TFtable" colspan="2" style="background: #E0E0E0;"></td></tr>'
				 '<tr><td class="TFtable">Reference Client</td><td class="TFtable">' + financialScope['referenceClient'] + '</td><td class="TFtable" colspan="2"></td></tr>'
				 '<tr><td class="TFtable">VAT Number</td><td class="TFtable" style="background: #E0E0E0;">' + financialScope['vatNumber'] + '</td><td class="TFtable" colspan="2" style="background: #E0E0E0;"></td></tr>'
				 '<tr><td class="TFtable">Documents</td><td class="TFtable">' + financialScope['documents'] + '</td><td class="TFtable" colspan="2">' + financialScope['documentsAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Shipping</td><td class="TFtable" style="background: #E0E0E0;">' + financialScope['shipping'] + '</td><td class="TFtable" colspan="2" style="background: #E0E0E0;">' + financialScope['shippingAdditional'] +'</td></tr>'
				 '<tr><td class="TFtable">Costs PreAcceptance</td><td class="TFtable">' + financialScope['costsPreAcceptance'] + '</td><td class="TFtable" colspan="2">'+ financialScope['costsPreAcceptanceAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Costs Installation</td><td class="TFtable" style="background: #E0E0E0;">' + financialScope['costsInstallation'] + '</td><td class="TFtable" colspan="2" style="background: #E0E0E0;">'+ financialScope['costsInstallationAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Commission</td><td class="TFtable">' + financialScope['commission'] + '</td><td class="TFtable" colspan="2">'+ financialScope['commissionAdditional'] + '</td></tr>'
				 '</table></div>')
		html += '</body></html>'
	
		f = file('temp/handOverFinancialScope.pdf','wb')
		document.pisaDocument(html, f)
		f.close()
		f = file('temp/handOverFinancialScope.pdf', 'rb')
		pdf = PdfFileReader(f)
		pages = pdf.getNumPages()
		f.close()
		
		for i in range(0,pages):
			self.pdfContents.append(NextPageTemplate('handOverFinancialScopeTemplate'))
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Spacer(1,1))
			if i == 0:
				bookmarkName = 'bookmark-tc'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)
				
	def createHandOverTechnicalScopePage(self):
		technicalScope = self.data['handOverAdditionalData']['technicalScope']
		from xhtml2pdf import document
		
		html = ('<html> '
				'<head> '
				'<style type="text/css"> '
				'p, th { '
					'font: bold 13px;'
				'} '
				'td {'
					'font: normal 13px;'
				'} '
				'label {'
					'width: 200px;'
				'}'
				'@page { '
					'size: a4 landscape; '
					'@frame cola { '
						'width: 690pt; '
						'left: 72pt; '
						'top: 70pt; '
						'height: 470pt; '
					'} '
				'} '
				'.breaker { '
					'-pdf-page-break: before; '
				'} '
				'.TFtable{'
					'width:100%;'
					'text-align: left;'
					'border-collapse: #013B8D 1px solid;'
				'}'
				'.TFtable th{'
					'padding-top: 5px;'
					'padding-left: 5px;'
					'background:#013B8D;'
					'color:#FFFFFF;'
				'}'
				'.TFtable td{'
					'padding:5px;'
					'margin-top: 5px;'
					'font-size: 12px;'
				'}'
				'.TFtable tr{'
					#'background: #b8d1f3;'
				'}'
				'.TFtable tr:nth-child(odd){'
					'background: #E0E0E0;'
				'}'
				'.TFtable tr:nth-child(even){'
					'background: #FFFFFF;'
				'}'
				'</style> '
				'</head> '
				'<body> ')			
		html += ('<div><table class="TFtable">'
				 '<tr><th class="TFtable" colspan="4">Additional Information</th></tr>'
				 '<tr><td class="TFtable">Layout</td><td class="TFtable">' + technicalScope['layout'] + '</td><td class="TFtable" colspan="2">' + technicalScope['layoutAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">OxyFuel Cutting Gas</td><td class="TFtable" style="background: #E0E0E0;">' + technicalScope['oxyfuelCuttingGas'] + '</td><td class="TFtable" colspan="2" style="background: #E0E0E0;">' + technicalScope['oxyfuelCuttingGasAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Plasma Cutting Gas</td><td class="TFtable">' + technicalScope['plasmaCuttingGas'] + '</td><td class="TFtable" colspan="2">' + technicalScope['plasmaCuttingGasAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Power</td><td class="TFtable" style="background: #E0E0E0;">' + technicalScope['power'] + '</td><td class="TFtable" colspan="2" style="background: #E0E0E0;">' + technicalScope['powerAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Frequency</td><td class="TFtable">' + technicalScope['frequency'] + '</td><td class="TFtable" colspan="2">' + technicalScope['frequencyAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Voltage</td><td class="TFtable" style="background: #E0E0E0;">' + technicalScope['voltage'] + '</td><td class="TFtable" colspan="2" style="background: #E0E0E0;">' + technicalScope['voltageAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">ProCAD[ProCAM]</td><td class="TFtable">' + technicalScope['proCAD'] + '</td><td class="TFtable" colspan="2">' + technicalScope['proCADAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">File Server Network</td><td class="TFtable" style="background: #E0E0E0;">' + technicalScope['fileserverNetwork'] + '</td><td class="TFtable" colspan="2" style="background: #E0E0E0;">' + technicalScope['fileserverNetworkAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Connection Type</td><td class="TFtable">' + technicalScope['connectionType'] + '</td><td class="TFtable" colspan="2">' + technicalScope['connectionTypeAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Data File Location</td><td class="TFtable" style="background: #E0E0E0;">' + technicalScope['dataFileLocation'] + '</td><td class="TFtable" colspan="2" style="background: #E0E0E0;">' + technicalScope['dataFileLocationAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Spare Parts</td><td class="TFtable">' + technicalScope['spareParts'] + '</td><td class="TFtable" colspan="2">' + technicalScope['sparePartsAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Consumable Parts</td><td class="TFtable" style="background: #E0E0E0;">' + technicalScope['consumableParts'] + '</td><td class="TFtable" colspan="2" style="background: #E0E0E0;">' + technicalScope['consumablePartsAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Warranty</td><td class="TFtable">' + technicalScope['warranty'] + '</td><td class="TFtable" colspan="2">' + technicalScope['warrantyAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Service</td><td class="TFtable" style="background: #E0E0E0;">' + technicalScope['service'] + '</td><td class="TFtable" colspan="2" style="background: #E0E0E0;">' + technicalScope['serviceAdditional'] + '</td></tr>'
				 '</table></div>')
		html += '</body></html>'
	
		f = file('temp/handOverTechnicalScope.pdf','wb')
		document.pisaDocument(html, f)
		f.close()
		f = file('temp/handOverTechnicalScope.pdf', 'rb')
		pdf = PdfFileReader(f)
		pages = pdf.getNumPages()
		f.close()
		
		for i in range(0,pages):
			self.pdfContents.append(NextPageTemplate('handOverTechnicalScopeTemplate'))
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Spacer(1,1))
			if i == 0:
				bookmarkName = 'bookmark-tc'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)

	def createHandOverRemarksPage(self):
		remarks = self.data['handOverAdditionalData']['remarks']
		from xhtml2pdf import document
		
		html = ('<html> '
				'<head> '
				'<style type="text/css"> '
				'label {'
					'width: 200px;'
				'}'
				'@page { '
					'size: a4 landscape; '
					'@frame cola { '
						'width: 690pt; '
						'left: 72pt; '
						'top: 80pt; '
						'height: 470pt; '
					'} '
				'} '
				'.breaker { '
					'-pdf-page-break: before; '
				'} '
				'.TFtable{'
					'width:100%;'
					'text-align: left;'
					'border-collapse: #013B8D 1px solid;'
				'}'
				'.TFtable th{'
					'padding-top: 5px;'
					'padding-left: 5px;'
					'background:#013B8D;'
					'color:#FFFFFF;'
				'}'
				'.TFtable td{'
					'padding:5px;'
					'margin-top: 5px;'
					'font-size: 12px;'
				'}'
				'.TFtable tr{'
					#'background: #b8d1f3;'
				'}'
				'.TFtable tr:nth-child(odd){'
					'background: #E0E0E0;'
				'}'
				'.TFtable tr:nth-child(even){'
					'background: #FFFFFF;'
				'}'
				'.headLabel {'
					'font: oblique bold 16px'
				'} '
				'.dataLabel {'
					'font: 13px'
				'} '
				'</style> '
				'</head> '
				'<body> ')			
		html += ('<div><table class="TFtable">'
				 '<tr><th class="TFtable" colspan="4"></th></tr>'
				 '<tr><td class="TFtable">Specials</td><td class="TFtable">' + remarks['specials'] + '</td><td class="TFtable" colspan="2">' + remarks['specialsAdditional'] + '</td></tr>'
				 '<tr><td class="TFtable">Remarks</td><td class="TFtable" style="background: #E0E0E0;"></td><td class="TFtable" colspan="2" style="background: #E0E0E0;">' + remarks['remarks'] + '</td></tr>'
				 '<tr><td class="TFtable">ETO Design Check Form</td><td class="TFtable">' + remarks['ETO'] + '</td><td class="TFtable" colspan="2">' + remarks['ETOAdditional'] + '</td></tr>'
				 '</table></div>')
		html += '</body></html>'
	
		f = file('temp/handOverRemarks.pdf','wb')
		document.pisaDocument(html, f)
		f.close()
		f = file('temp/handOverRemarks.pdf', 'rb')
		pdf = PdfFileReader(f)
		pages = pdf.getNumPages()
		f.close()
		
		for i in range(0,pages):
			self.pdfContents.append(NextPageTemplate('handOverRemarksTemplate'))
			self.pdfContents.append(PageBreak())
			self.pdfContents.append(Spacer(1,1))
			if i == 0:
				bookmarkName = 'bookmark-tc'
				p = Paragraph('<a name="%s"/>' % bookmarkName, self.styleN)
				p._bookmarkName = bookmarkName
				self.pdfContents.append(p)
				
	def generateHandOver(self, include):
  
		projectsdb = prooffer_server.getProjectsDB()
		datadb = prooffer_server.getDataDB()
		usersdb = prooffer_server.getUsersDB()
	
		visibilityOptions = include
		
		showToc = False
		coverPages = 0
		tocPages = 0
		customOptionsPages = 0
		prodDescPages = 0
		technicalDataPages = 0
		machineLayoutPages = 0
		referenceListPages = 0
		warrantyTermsAndConditionsPages = 0
		serviceSupportTermsAndConditionsPages = 0
		intropdfpages = 0
		termsPdfPages = 0
		pdfDoc = None
		index = 0
		iCustom = 0
		appendixPages = 0
		handOverContactDetailsPages = 0
		handOverFinancialScopePages = 0
		handOverTechnicalScopePages = 0
		handOverRemarksPages = 0
		
		#Cover Page
		self.createCoverPage()
		coverPages = 1
		
		#self.createTableofContentsPage()
		#tocPages = 1
		
		self.createHandOverContactDetailsPage()
		handOverContactDetailsPDF = PdfFileReader(file('temp/handOverContactDetails.pdf','rb'))
		handOverContactDetailsPages = handOverContactDetailsPDF.getNumPages()
		
		#Order Confirmation
		self.createOrderConfirmationPage()
		intropdf = PdfFileReader(file('temp/orderconfirmation.pdf', 'rb'))
		intropdfpages = intropdf.getNumPages()

		self.createHandOverFinancialScopePage()
		handOverFinancialScopePDF = PdfFileReader(file('temp/handOverFinancialScope.pdf'))
		handOverFinancialScopePages = handOverFinancialScopePDF.getNumPages()
		
		for vOption in visibilityOptions:
			if vOption['include']: 

				if vOption['type'] == 'standard':
						
					if vOption['title'] == 'Quotation':
						self.createScopeOfSupplyPage()
						if len(self.optionList) > 0:
							self.createOptionalsPage()
										
					def countPdfPages(resources):
						pages = 0
						for resource in resources:
							pages = pages + self.countPdfNumPages(getResource(resource))
						return pages
																															  
				elif vOption['type'] == 'custom':
					title = None
					title = vOption['title']
					pdfDoc = vOption['pdf']
					currentCustomPages = 0
					iCustom += 1
					if len(pdfDoc) > 0:
						currentCustomPages = self.countPdfNumPages(getAttachment(projectsdb, self.data['reference'], pdfDoc))
						customOptionsPages += currentCustomPages 
					self.createCustomPages(currentCustomPages, escapeCharacters(title), 'custom%s' % iCustom)
						
		self.createHandOverTechnicalScopePage()
		handOverTechnicalScopePDF = PdfFileReader(file('temp/handOverTechnicalScope.pdf'))
		handOverTechnicalScopePages = handOverTechnicalScopePDF.getNumPages()
		
		self.createHandOverRemarksPage()
		handOverRemarksPDF = PdfFileReader(file('temp/handOverRemarks.pdf'))
		handOverRemarksPages = handOverRemarksPDF.getNumPages()
						
		self.savePdf()
		
		output = PdfFileWriter()
		
		pdf = PdfFileReader(file('temp/offer.pdf', 'rb'))
				
		hggPdfTemplate = PdfFileReader(file('HGG template.pdf', 'rb'))
		
		# subtract 1 to allow dummy first page
		offerPages = pdf.getNumPages() - 1
		quotationPages = offerPages - tocPages - coverPages - intropdfpages - termsPdfPages - prodDescPages - technicalDataPages - machineLayoutPages - referenceListPages - warrantyTermsAndConditionsPages - serviceSupportTermsAndConditionsPages - customOptionsPages
		quotationPages = quotationPages - appendixPages
		quotationPages = quotationPages	- handOverContactDetailsPages - handOverFinancialScopePages - handOverTechnicalScopePages - handOverRemarksPages
		
		def pdfgetPage(n):
			# add 1 because of dummy first page
			return pdf.getPage(n + 1)
			
		def isPortraitLayout(pageObj):
			rect = pageObj.mediaBox
			if (rect[2] < rect[3]): # if width is less than the height then rotate
				return True
			else:
				return False
				
		currentPage = 0
		
		def merge(resources, currentPage):
			for resource in resources:
				pdffile = getResource(resource)
				if pdffile:
					pdfdocument = PdfFileReader(pdffile, strict=False)
					numpages = pdfdocument.getNumPages()
					for j in range(0,numpages):
						if isPortraitLayout(pdfdocument.getPage(j)):
							#output.addPage(pdfdocument.getPage(j).rotateClockwise(90))
							output.addPage(pdfdocument.getPage(j))
						else:
							masterPage = pdfgetPage(currentPage)
							masterPage.mergePage(pdfdocument.getPage(j))
							output.addPage(masterPage)
						currentPage += 1
			return currentPage

		#Cover Page
		output.addPage(pdfgetPage(currentPage))
		currentPage += 1
		
		# Table of Contents
		"""
		basepage = pdfgetPage(currentPage)
		basepage.mergePage(hggPdfTemplate.getPage(0))
		output.addPage(basepage)
		currentPage += 1
		"""
		
		for i in range(0, handOverContactDetailsPages):
			basepage = pdfgetPage(currentPage + i)
			basepage.mergePage(handOverContactDetailsPDF.getPage(i))
			output.addPage(basepage)
		currentPage += handOverContactDetailsPages
		
		#Order Confirmation
		for i in range(0, intropdfpages):
			basepage = pdfgetPage(currentPage + i)
			basepage.mergePage(intropdf.getPage(i))
			output.addPage(basepage)
		currentPage += intropdfpages
			
		for i in range(0, handOverFinancialScopePages):
			basepage = pdfgetPage(currentPage + i)
			basepage.mergePage(handOverFinancialScopePDF.getPage(i))
			output.addPage(basepage)
		currentPage += handOverFinancialScopePages
			
		for vOption in visibilityOptions:
			if vOption['include']: 
				if vOption['type'] == 'standard':
					
					if vOption['title'] == 'Quotation':
						for i in range(0, quotationPages):
							basepage = pdfgetPage(currentPage + i)
							basepage.mergePage(hggPdfTemplate.getPage(0))
							output.addPage(basepage)
						currentPage += quotationPages
																	
				elif vOption['type'] == 'custom':
					if customOptionsPages > 0:			
						customOptionsFile = getAttachment(projectsdb, self.data['reference'], vOption['pdf'])
						if customOptionsFile != None:
							customOptionsPdf = PdfFileReader(customOptionsFile, strict=False)
							numPages = customOptionsPdf.getNumPages()
							for j in range(0, numPages):
								if isPortraitLayout(customOptionsPdf.getPage(j)):
									output.addPage(customOptionsPdf.getPage(j).rotateClockwise(90))
								else:
									masterPage = pdfgetPage(currentPage)
									masterPage.mergePage(customOptionsPdf.getPage(j))
									output.addPage(masterPage)
								currentPage += 1

		for i in range(0, handOverTechnicalScopePages):
			basepage = pdfgetPage(currentPage + i)
			basepage.mergePage(handOverTechnicalScopePDF.getPage(i))
			output.addPage(basepage)
		currentPage += handOverTechnicalScopePages

		for i in range(0, handOverRemarksPages):
			basepage = pdfgetPage(currentPage + i)
			basepage.mergePage(handOverRemarksPDF.getPage(i))
			output.addPage(basepage)
		currentPage += handOverRemarksPages
								
		outputStream = file('temp/temp.pdf', 'wb')
		output.write(outputStream)
		outputStream.close()
		pdf.stream.close()
		return "ok";
		
if __name__ == "__main__":
	offer = Offer()
	offer.createScopeOfSupplyPage()
	offer.savePdf()