from django.contrib import admin

from nutricalc.food.models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'unit', 'nutr_prot', 'nutr_fat', 'nutr_carb', 'ccal', 'category')
