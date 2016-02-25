#!/bin/bash
ROOT=`dirname "${BASH_SOURCE[0]}"`
act="${ROOT}/system/venv/bin/activate"

if [ ! -f "${act}" ]; then
    set -e
    pyvenv ${ROOT}/system/venv
    source ${act}
    pip install -r system/requirements.txt
    set +e
else
    source ${act}
fi

ARGS="$@"
if [ -n "${ARGS}" ]; then
    cd ${ROOT}
    exec $@
fi
