from django.contrib import admin

from nutricalc.food.models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'title', 'category', 'source',
        'unit', 'nutr_prot', 'nutr_fat', 'nutr_carb', 'ccal',
        'is_public', 'user', 'licence',
    )
    search_fields = ('title', 'extra_data',)
    list_filter = ('source', 'is_public', 'licence', 'user')
