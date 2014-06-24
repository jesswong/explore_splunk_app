from django.contrib.auth.decorators import login_required
from splunkdj.decorators.render import render_to

@render_to('explore_splunk_app:home.html')
@login_required
def home(request):
    return {
        "message": "Hello World from explore_splunk_app!",
        "app_name": "explore_splunk_app"
    }