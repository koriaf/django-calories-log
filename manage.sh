#!/bin/bash
set -e
ROOT=`dirname "${BASH_SOURCE[0]}"`

export DJANGO_SETTINGS_MODULE=nutricalc.settings
export PYTHONDONTWRITEBYTECODE='dontwrite'
export NUTRICALC_DEBUG='True'

${ROOT}/venv.sh ./src/manage.py $@
