from django.conf.urls import url, include
from nutricalc.food_api_v1.views import ProductReadonlyViewSet
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'products', ProductReadonlyViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
]
