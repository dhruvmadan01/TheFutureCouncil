const fs = require('fs');
const path = require('path');

const iconSrc = path.join(__dirname, 'TFC.png');
const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

if (fs.existsSync(iconSrc) && fs.existsSync(resDir)) {
  const mipmapDirs = ['mipmap-hdpi', 'mipmap-mdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
  for (const dir of mipmapDirs) {
    const targetDir = path.join(resDir, dir);
    if (fs.existsSync(targetDir)) {
      fs.copyFileSync(iconSrc, path.join(targetDir, 'ic_launcher.png'));
      fs.copyFileSync(iconSrc, path.join(targetDir, 'ic_launcher_round.png'));
      fs.copyFileSync(iconSrc, path.join(targetDir, 'ic_launcher_foreground.png'));
    }
  }

  const drawableDirs = [
    'drawable', 'drawable-land-hdpi', 'drawable-land-mdpi', 'drawable-land-xhdpi',
    'drawable-land-xxhdpi', 'drawable-land-xxxhdpi', 'drawable-port-hdpi',
    'drawable-port-mdpi', 'drawable-port-xhdpi', 'drawable-port-xxhdpi', 'drawable-port-xxxhdpi'
  ];
  for (const dir of drawableDirs) {
    const targetDir = path.join(resDir, dir);
    if (fs.existsSync(targetDir)) {
      fs.copyFileSync(iconSrc, path.join(targetDir, 'splash.png'));
    }
  }
  console.log('App icons and splash screens configured with TFC branding!');
}
