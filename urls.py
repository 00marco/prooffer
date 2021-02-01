from django.conf.urls import patterns, include, url
from prooffer_app.views import prooffer, machineData, machineOptions, generateOffer, getPdf
from prooffer_app.views import userData, projectList, project, saveProject
from prooffer_app.views import getSignature, uploadUserDataFile
from prooffer_app.views import getTemplates, getTemplate, getImageAttachment, copyAttachment, deleteAttachment
from prooffer_app.views import launch, getUserPrivileges, setUserPrivilege, getUserPrivilegeData
from prooffer_app.views import ordcon, generateOrder, generateOrderPreview
from prooffer_app.views import setUserData, setRemoteURL, setRemoteURLCipher, ready
from prooffer_app.views import updateProofferApp, updateStatus, updateProofferSettings, getDBInfo, getRemoteDBInfo, readCachedParameters
from prooffer_app.views import updateProofferDataViews, updateStatusFrame, uploadUserDataAndProjects
from prooffer_app.views import initSync, migrate, pdf_generator_status, pdf_generator_status_frame
from prooffer_app.views import app_download_progress, app_download_progress_frame
from prooffer_app.views import sync, syncProofferUsersUpStream, syncProofferProjectsUpStream, syncProofferUsersDownStream, syncProofferProjectsDownStream, syncProofferDataDownStream, insertUsernamePassword
from prooffer_app.views import generateHandOver
from prooffer_app.views import getSchema
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	('^prooffer/$', prooffer),
	('^prooffer/machineData/$', machineData),
	('^prooffer/machineOptions/$', machineOptions),
	('^prooffer/getSchema/$', getSchema),
	('^prooffer/generateOffer/$', generateOffer),
    ('^prooffer/getPdf/$', getPdf),
    ('^prooffer/templateList/$', getTemplates),
    ('^prooffer/template/$', getTemplate),
    ('^prooffer/userdata/$', userData),
    ('^prooffer/projectList/$', projectList),
    ('^prooffer/project/$', project),
	('^prooffer/saveProject/$', saveProject),
    ('^prooffer/getSignature/$', getSignature),
    ('^prooffer/uploadUserDataFile/$', uploadUserDataFile),
    ('^prooffer/getImageAttachment/$', getImageAttachment),
    ('^prooffer/getUserPrivilegeData/$', getUserPrivilegeData),
    ('^prooffer/copyAttachment/$', copyAttachment),
	('^prooffer/deleteAttachment/$', deleteAttachment),
	('^prooffer/pdf_generator_status_frame/pdf_generator_status/$', pdf_generator_status),
	('^prooffer/pdf_generator_status_frame/$', pdf_generator_status_frame),
    ('^prooffer/launch/$', launch),
    ('^prooffer/launch/getUserPrivileges/$', getUserPrivileges),
    ('^prooffer/launch/setUserPrivilege/$', setUserPrivilege),
    ('^prooffer/ordcon/$',ordcon),
    ('^prooffer/ordcon/userdata/$', userData),
    ('^prooffer/ordcon/projectList/$',projectList),
    ('^prooffer/ordcon/project/$',project),
	('^prooffer/ordcon/saveProject/$', saveProject),
    ('^prooffer/ordcon/machineOptions/$', machineOptions),
    ('^prooffer/ordcon/machineData/$', machineData),
    ('^prooffer/ordcon/generateOrder/$', generateOrder),
    ('^prooffer/ordcon/getPdf/$', getPdf),
    ('^prooffer/ordcon/uploadUserDataFile/$', uploadUserDataFile),
    ('^prooffer/ordcon/deleteAttachment/$', deleteAttachment),
    ('^prooffer/ordcon/generateOrderPreview/$', generateOrderPreview),
	('^prooffer/ordcon/template/$', getTemplate),
	('^prooffer/ordcon/generateHandOver/$', generateHandOver),
	('^prooffer/sync/$', sync),
	('^prooffer/sync/syncProofferUsersUpStream/$', syncProofferUsersUpStream),
	('^prooffer/sync/syncProofferProjectsUpStream/$', syncProofferProjectsUpStream),
	('^prooffer/sync/syncProofferUsersDownStream/$', syncProofferUsersDownStream),
	('^prooffer/sync/syncProofferProjectsDownStream/$', syncProofferProjectsDownStream),
	('^prooffer/sync/syncProofferDataDownStream/$', syncProofferDataDownStream),
	('^prooffer/sync/insertUsernamePassword/$', insertUsernamePassword),
	('^setUserData/$', setUserData),
	('^setRemoteURL/$', setRemoteURL),
	('^setRemoteURLCipher/$', setRemoteURLCipher),
	('^updateProofferApp/$', updateProofferApp),
	('^updateProofferSettings/$', updateProofferSettings),
	('^updateProofferDataViews/$', updateProofferDataViews),
	('^updateStatusFrame/$', updateStatusFrame),
	('^updateStatusFrame/updateStatus/$', updateStatus),
	('^updateStatusFrame/getDBInfo/$', getDBInfo),
	('^updateStatusFrame/getRemoteDBInfo/$', getRemoteDBInfo),
	('^updateStatusFrame/readCachedParameters/$', readCachedParameters),
	('^app_download_progress_frame/$', app_download_progress_frame),
	('^updateProofferApp/app_download_progress/$', app_download_progress),
	('^updateStatus/$', updateStatus),
	('^getDBInfo/$', getDBInfo),
	('^getRemoteDBInfo/$', getRemoteDBInfo),
	('^readCachedParameters/$', readCachedParameters),
	('^migrate/$', migrate),
	('^ready/$', ready),
)
