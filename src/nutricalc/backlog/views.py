from django.views.generic import TemplateView


class LogAppView(TemplateView):
    template_name = 'backlog/app.html'
