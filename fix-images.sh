#!/bin/bash
# This script updates all image paths in app/page.tsx from ${basePath}/images/ to /images/

sed -i 's/\${basePath}\/images\//\/images\//g' app/page.tsx
sed -i '/^const basePath/d' app/page.tsx
