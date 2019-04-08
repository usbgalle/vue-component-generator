const fs = require('fs')
const path = require('path')


module.exports = (api, options, rootOptions) => {
  var { moduleName, storeRootDir } = options;
  moduleName = moduleName.toLowerCase();
  const templatesRoot = './templates';
  const moduleDirPath = path.join(storeRootDir, moduleName);
  const storeRootPath = path.join(moduleDirPath, `${moduleName}.vue`);



  // Abort if module already exists
  if (fs.existsSync(storeRootPath)) {
    console.warn(`Module ${moduleName} exists`);
    return
  }

  // extending package
  api.extendPackage({
    scripts: {
      create: "vue invoke vue-cli-plugin-vue-component-generator"
    }
  })

  const files = {}

  // Write templete files
  if (!fs.existsSync(storeRootPath)) {
    ['vue', 'templete.html', 'scss'].forEach(template => {
      const fileName = `templete.${template}`
      const new_fileName = moduleName.toString() + '.' + template;
      const filePath = path.join(moduleDirPath, new_fileName)
      files[filePath] = `${templatesRoot}/vue/${fileName}`
    })
  }
  api.render(files);

  // After creating files
  api.onCreateComplete(() => {
    const importLines = `\n<style lang="scss" src="./${moduleName}.scss"></style> \n <template src="./${moduleName}.templete.html"></template>`;
    const mainPath = api.resolve(`${storeRootDir}/${moduleName}/${moduleName}.vue`);

    // get content and inject import lines
    let contentMain = fs.readFileSync(mainPath, { encoding: 'utf-8' });
    const lines = contentMain.split(/\r?\n/g).reverse();
    const lastScriptIndex = lines.findIndex(line => line.match(/^<\/script>/));
    lines[lastScriptIndex] += importLines;

    // modify Component Class name
    contentMain = lines.reverse().join('\n');
    contentMain = contentMain.replace("TestComponent", `${prettify(moduleName)}Component`);

    // convert module name to camel case 
    function prettify(str) {
      return str.split('-').map(function capitalize(part) {
          return part.charAt(0).toUpperCase() + part.slice(1);
      }).join('');
  }

    // Write files 
    fs.writeFileSync(mainPath, contentMain, { encoding: 'utf-8' });
  })

}
