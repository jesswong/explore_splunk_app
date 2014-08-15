import os
import cherrypy
import logging
import logging.handlers
import json
import subprocess
import shlex
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import sys
import re

import splunk, splunk.util
import splunk.appserver.mrsparkle.controllers as controllers
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route
from splunk.appserver.mrsparkle.lib import jsonresponse, util, cached
#Server side functionality to send an HTML formatted email. You can use this with other dashboards and you can
#choose how to format the email by writing HTML code.

def setup_logger(level):
    logger = logging.getLogger('ecommerce')
    logger.propagate = False # Prevent the log messages from being duplicated in the python.log file
    logger.setLevel(level)

    file_handler = logging.handlers.RotatingFileHandler(os.path.join(os.environ.get("SPLUNK_HOME"), 'var', 'log', 'splunk', 'ecommerce.log'), maxBytes=25000000, backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)

    return logger
    
logger = setup_logger(logging.INFO)

class TerminalController(controllers.BaseController):
    
    @expose_page(must_login=True, methods=['POST'])
    @route('/', methods=['POST'])
    def process(self, **kwargs):

        #Insert multiple recipients here
        recipients = ['emailRecipients@gmail.com']
        fromAdd = 'yourEmail@gmail.com'
        toAdd = ",".join(recipients)

        #Get the data being sent to this server
        webData = kwargs.get('data')

        #Assume email is going to be sent
        status = 'Email has been successfully sent'

        body = MIMEMultipart('alternative')

        body['Subject'] = "Insert Email Subject Here"
        body['From'] = fromAdd
        body['To'] = toAdd

        #HTML formatting goes in this string.
        html = """\
            <html>
                <head></head>
                <body>
                    %s
                </body>
            </html>
        """ % webData
        htmlPart = MIMEText(html, 'html')
        body.attach(htmlPart)
        
        #SMTP Port used to send email. Default port is 25.
        s = smtplib.SMTP('localhost', 25)
        
        #Change the attribute to read from config file.

        try:
          s.sendmail(fromAdd, toAdd, body.as_string())
          s.close()
        except Exception:
            status = 'Something went wrong: %s' % Exception


        return self.render_json(dict(status=status))
