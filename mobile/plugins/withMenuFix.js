const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withMenuFix = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const filePath = path.join(
        config.modRequest.projectRoot,
        'node_modules/@react-native-menu/menu/android/src/main/java/com/reactnativemenu/MenuViewManagerBase.kt'
      );
      if (fs.existsSync(filePath)) {
        let contents = fs.readFileSync(filePath, 'utf8');
        if (contents.includes('view.overflow = overflow')) {
          contents = contents.replace('view.overflow = overflow', 'view.setOverflow(overflow)');
          fs.writeFileSync(filePath, contents, 'utf8');
          console.log('[withMenuFix] Patched @react-native-menu/menu successfully');
        } else {
          console.log('[withMenuFix] Patch already applied or not needed');
        }
      }
      return config;
    },
  ]);
};

module.exports = withMenuFix;
