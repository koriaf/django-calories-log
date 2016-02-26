from django.db import models
from jsonfield import JSONField


class Product(models.Model):
    # base info
    category = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    unit = models.CharField(default='100gr', max_length=30)
    language = models.CharField(default='en', max_length=3)
    source = models.TextField(blank=True, default='')
    extra_data = JSONField(blank=True, null=True, default=dict)

    # nutrition facts
    ccal = models.FloatField('CCAL per unit', blank=True, null=True)
    nutr_prot = models.FloatField('Proteine per unit', blank=True, null=True)
    nutr_fat = models.FloatField('Fat per unit', blank=True, null=True)
    nutr_carb = models.FloatField('Carbo per unit', blank=True, null=True)

    # product producer details
    producer = models.CharField(blank=True, null=True, max_length=255)
    barcode = models.CharField(blank=True, null=True, max_length=48)

    class Meta:
        ordering = ('title',)

    def __str__(self):
        return self.title
