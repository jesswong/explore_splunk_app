from django.conf.urls import patterns, include, url
from splunkdj.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^home/$', 'explore_splunk_app.views.home', name='home'),
)
