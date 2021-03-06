# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-26 04:18
from __future__ import unicode_literals

from django.db import migrations, models
import jsonfield.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(blank=True, max_length=255, null=True)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('unit', models.CharField(default='100gr', max_length=30)),
                ('language', models.CharField(default='en', max_length=3)),
                ('source', models.TextField(blank=True, default='')),
                ('extra_data', jsonfield.fields.JSONField(blank=True, default=dict, null=True)),
                ('ccal', models.FloatField(blank=True, null=True, verbose_name='CCAL per unit')),
                ('nutr_prot', models.FloatField(blank=True, null=True, verbose_name='Proteine per unit')),
                ('nutr_fat', models.FloatField(blank=True, null=True, verbose_name='Fat per unit')),
                ('nutr_carb', models.FloatField(blank=True, null=True, verbose_name='Carbo per unit')),
                ('producer', models.CharField(blank=True, max_length=255, null=True)),
                ('barcode', models.CharField(blank=True, max_length=48, null=True)),
            ],
            options={
                'ordering': ('title',),
            },
        ),
    ]
