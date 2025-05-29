# pomamo-web-app

## Overview

Web interface for Pomamo

## License

For most of the files, Apache-2.0

See the LICENSE file for more details

## Compilation

```bash
cd pomamo-web-app
node_modules/grunt-cli/bin/grunt beta --pomamoversion=x.x.x
```

## Make a new release

- Update the version in atracking-web-windows/atracking-common/CommonVariables.wxi
- Update atracking-web-linux/server/DEBIAN/changelog and atracking-web-linux/server/DEBIAN/control

## Translations

Here are the files to translate:

- pomamo-web-components/config_component_[fr|de].js
- pomamo-web-components/translation_component_[fr|de].js
- pomamo-web-app/src/scripts/translation_[fr|de].js
