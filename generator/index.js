const fs = require('fs')
const path = require('path')


module.exports = (api, options, rootOptions) => {
  const { moduleName, storeRootDir } = options
  const templatesRoot = './templates'
  const moduleDirPath = path.join(storeRootDir, moduleName)
  const storeRootPath = path.join(moduleDirPath, `${moduleName}.vue`)

  // Abort if module already exists
  if (fs.existsSync(storeRootPath)) {
    console.warn(`Module ${moduleName} exists`)
    return
  }

  // extending package
  api.extendPackage({
    scripts: {
      create: "vue invoke vue-cli-plugin-vue-component-generator"
    }
  })

  const files = {}

  // Store root
  if (!fs.existsSync(storeRootPath)) {
  
    ['vue', 'templete.html', 'scss'].forEach(template => {
      const fileName = `templete.${template}`
      const new_fileName = moduleName + '.' + template;
      const filePath = path.join(moduleDirPath, new_fileName)
      files[filePath] = `${templatesRoot}/vue/${fileName}`
    })


  }

  api.render(files);

  api.onCreateComplete(() => {

    let rxLines = `\n<style lang="scss" src="./${moduleName}.scss"></style> \n <template src="./${moduleName}.templete.html"></template>`;
    const mainPath = api.resolve(`${storeRootDir}/${moduleName}/${moduleName}.vue`);

    // get content
    let contentMain = fs.readFileSync(mainPath, { encoding: 'utf-8' });
    const lines = contentMain.split(/\r?\n/g).reverse();

    // inject import
    // const lastImportIndex = lines.findIndex(line => line.match(/^<style/));
    const lastScriptIndex = lines.findIndex(line => line.match(/^<\/script>/));
    lines[lastScriptIndex] += rxLines;

    // modify app
    contentMain = lines.reverse().join('\n');
    contentMain = contentMain.replace("TestComponent", `${moduleName}Component`);


    fs.writeFileSync(mainPath, contentMain, { encoding: 'utf-8' });
  })

}
