#!/usr/bin/env bash

# Ensuring everyting works as intended
echo "Ensuring all tests passing.."
npm run test
npm run build -- --prod

npm run test-package
npm run lint-package


# Publishing
echo "Building package.."
npm run build-package
echo "Running \"npm pack\".."
cd dist/libs/ngx-cva-test-suite/ 
npm pack

if [ $# -ne 0 ] && [ $1 = '--publish' ]
then
    echo "Publishing.."
    npm publish
else
    echo 'Stopped before publishing'
fi
