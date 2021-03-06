"""nutricalc URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic import RedirectView, TemplateView

urlpatterns = [
    url(r'^$', RedirectView.as_view(url='/log/'), name='index'),
    url(r'^log/', include('nutricalc.backlog.urls')),

    url(r'^admin/', admin.site.urls),
    url(r'^accounts/', include('allauth.urls')),

    url(r'^api/v1/', include('nutricalc.food_api_v1.urls')),
    url(r'^api/v1/docs/', include('rest_framework_swagger.urls')),

    url(r'^information/$', TemplateView.as_view(template_name='information.html'), name='information'),
]
