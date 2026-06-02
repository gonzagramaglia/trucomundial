const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const findAndReplace = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if it has a muchomovimiento button
      if (content.includes('muchomovimiento')) {
        // Simple heuristic: if TwitchButton is already imported, skip
        if (content.includes('TwitchButton')) {
          continue;
        }

        // Replace the block.
        // It might be <a href="https://twitch.tv/muchomovimiento/videos" ...> ... </a>
        // Or www.twitch.tv...
        const regex = /<a\s+href="https:\/\/(www\.)?twitch\.tv\/muchomovimiento\/videos"[\s\S]*?<\/a>/g;
        
        if (regex.test(content)) {
          content = content.replace(regex, '<TwitchButton />');
          
          // Compute relative path to src/components/shared/TwitchButton
          const currentDir = path.dirname(fullPath);
          const targetDir = path.join(srcDir, 'components', 'shared');
          let relativePath = path.relative(currentDir, targetDir);
          if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
          }
          const importStatement = `import { TwitchButton } from '${relativePath}/TwitchButton';\n`;
          
          // Add import after the last import
          const importMatches = [...content.matchAll(/^import.*$/gm)];
          if (importMatches.length > 0) {
            const lastImportIndex = importMatches[importMatches.length - 1].index + importMatches[importMatches.length - 1][0].length;
            content = content.slice(0, lastImportIndex) + '\n' + importStatement + content.slice(lastImportIndex);
          } else {
            content = importStatement + content;
          }

          fs.writeFileSync(fullPath, content, 'utf8');
          console.log('Updated', fullPath);
        }
      }
    }
  }
};

findAndReplace(srcDir);
