"""Quick and dirty importer of this database files. Text files with all needed data.
Used to populate local DB for easy development and testing.

Turn of debug before import if it's too slow. Needs like 20 seconds.

"""
import os
from django.core.management.base import BaseCommand
from django.conf import settings

from nutricalc.food.models import Product


class Command(BaseCommand):
    CARB_ID = 205
    PROT_ID = 203
    FAT_ID = 204
    CCAL_ID = 208

    def parse_categories(self):
        raw_defs = open(os.path.join(
            settings.BASE_DIR,
            '../var/usa_food_gov',
            'FD_GROUP.txt'
        ), 'r').readlines()

        results = {}

        for raw in raw_defs:
            old_row = raw.replace("~", '').split('^')
            row = []
            for item in old_row:
                if item.strip():
                    row.append(item.strip())
            gid, name = row
            results[int(gid)] = name
        return results

    def parse_foods(self, cats):
        raw_defs = open(os.path.join(
            settings.BASE_DIR,
            '../var/usa_food_gov',
            'FOOD_DES.txt'
        ), 'r').readlines()

        results = {}

        for raw in raw_defs:
            old_row = raw.replace("~", '').split('^')
            row = []
            for item in old_row:
                if item.strip():
                    row.append(item.strip())
            food_id, group, descr, abbr = row[:4]
            result_row = {
                'group': cats[int(group)],
                'descr': descr,
                'abbr': abbr,
                'nutrients': {},
            }
            # print(result_row)
            results[int(food_id)] = result_row
        return results

    def parse_nutrients(self):
        raw_defs = open(os.path.join(
            settings.BASE_DIR,
            '../var/usa_food_gov',
            'NUTR_DEF.txt'
        ), 'r').readlines()
        results = {}
        for raw in raw_defs:
            old_row = raw.replace("~", '').split('^')
            row = []
            for item in old_row:
                if item.strip():
                    row.append(item.strip())
            item_id, item_unit, item_slug, item_name = row[:4]
            result_row = {
                'unit': item_unit,
                'slug': item_slug,
                'name': item_name,
            }
            results[int(item_id)] = result_row

        return results

    def handle(self, *args, **options):
        CATEGORIES = self.parse_categories()
        PRODUCTS = self.parse_foods(CATEGORIES)
        NUTRIENTS = self.parse_nutrients()

        print("{} products, {} nutrients".format(
            len(PRODUCTS), len(NUTRIENTS)))

        nut_lines = open(os.path.join(
            settings.BASE_DIR,
            '../var/usa_food_gov',
            'NUT_DATA.txt'
        ), 'r').readlines()

        for nline in nut_lines:
            old_row = nline.replace("~", '').split('^')
            row = []
            for item in old_row:
                row.append(item.strip())
            product_id, nutr_id, nutr_val = row[:3]
            product_id = int(product_id)
            nutr_id = int(nutr_id)
            nutr_row = NUTRIENTS[nutr_id].copy()
            nutr_row['value'] = nutr_val
            PRODUCTS[product_id]['nutrients'][nutr_id] = nutr_row

        for prod in PRODUCTS.values():
            try:
                prot = float(prod['nutrients'][self.PROT_ID]['value'])
            except KeyError:
                prot = -1
            try:
                fat = float(prod['nutrients'][self.FAT_ID]['value'])
            except KeyError:
                fat = -1
            try:
                carb = float(prod['nutrients'][self.CARB_ID]['value'])
            except KeyError:
                carb = -1
            try:
                ccal = float(prod['nutrients'][self.CCAL_ID]['value'])
            except KeyError:
                ccal = -1
            Product.objects.update_or_create(
                title=prod['descr'],
                source='ndb.nal.usda.gov',
                defaults=dict(
                    category=prod['group'],
                    description=prod['abbr'],
                    language='en',
                    extra_data=prod,
                    ccal=ccal,
                    nutr_prot=prot,
                    nutr_fat=fat,
                    nutr_carb=carb,
                )
            )

        return
