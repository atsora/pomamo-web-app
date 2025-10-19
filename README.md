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
node_modules/grunt-cli/bin/grunt release --pomamoversion=x.x.x
```

## Make a new release

- Update the version in atracking-web-windows/atracking-common/CommonVariables.wxi
- Update atracking-web-linux/server/DEBIAN/changelog and atracking-web-linux/server/DEBIAN/control

### Windows

- Use C:\Devel\atracking\atracking-web\atracking-web-windows\atracking-web.sln
- TODO: script...

### Debian

On WSL:
```bash
cd /mnt/c/Devel/atracking/atracking-web/atracking-web-linux
./make-atracking-web-deb.sh
```

## Translations

Here are the files to translate:

- pomamo-web-components/config_component_[fr|de].js
- pomamo-web-components/translation_component_default.js
- pomamo-web-app/src/scripts/translation_default.js
- pomamo-web-app/src/scripts/translation_locale_[fr|de].js
