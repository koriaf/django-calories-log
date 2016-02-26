from rest_framework import serializers

from nutricalc.food.models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            'pk',
            'category', 'title', 'description', 'unit', 'language',
            'ccal', 'nutr_prot', 'nutr_carb', 'nutr_fat',
            'source', 'extra_data',
        )
