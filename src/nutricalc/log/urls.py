from django.conf.urls import url

from nutricalc.log.views import LogAppView

urlpatterns = [
    url(r'^$', LogAppView.as_view(), name='index'),
]
