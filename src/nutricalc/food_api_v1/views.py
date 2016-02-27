from django.db.models import Q
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
        if not q:
            return Product.objects.none()
        words = q.split()
        qs = Q(title__icontains="")
        for word in words:
            if word[0] == '-':
                qs &= ~Q(title__icontains=word[1:])
            else:
                qs &= Q(title__icontains=word)
        qset = super(ProductReadonlyViewSet, self).get_queryset().filter(
            qs
        )
        return qset
