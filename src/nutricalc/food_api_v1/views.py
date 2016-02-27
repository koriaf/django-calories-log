from rest_framework.viewsets import ReadOnlyModelViewSet

from nutricalc.food.models import Product
from nutricalc.food_api_v1.serializers import ProductSerializer


class ProductReadonlyViewSet(ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_fields = ('title', )

    def get_queryset(self):
        """Custom filtering procedure.
        Accepts 'title' GET argument.
        Do search from food database and return partial matches
        """
        q = self.request.GET.get('title', '').strip()
        return super(ProductReadonlyViewSet, self).get_queryset().filter(
            title__icontains=q
        )
