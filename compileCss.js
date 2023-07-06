const sass = require('sass');
const { readdirSync , writeFileSync} = require('fs');
const path = require('path');


const compileCss = ({src, dest, ext=[".sass", ".scss"]}) => {

    const srcFiles = readdirSync(src, {withFileTypes: true}).filter(dirent => dirent.isFile() && ext.includes(path.extname(dirent.name)));
    for(const file of srcFiles) {
        if(file.name[0]==='_')
            continue
        const srcFilePath = path.join(src, file.name);
        const baseName = path.basename(file.name, path.extname(file.name));
        const cssName = baseName + '.css';
        const destFilePath = path.join(dest, cssName);
        const result = sass.compile(srcFilePath);
        writeFileSync(destFilePath, result.css, 'utf-8');
    }

}

module.exports = { compileCss }