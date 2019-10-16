const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const os = require('os');
const cp = require('child_process');

const osMapper = {
  win32: 'windows',
  darwin: 'macosx',
  linux: 'linux',
}

const archMapper = {
  x32: '386',
  x64: 'amd64'
}

async function run() {
  try {
    const phraseapp = 'phraseapp'
    const osPlat = os.platform();
    const osArch = os.arch();
    const version = core.getInput('version');
    const cacheToolPath = tc.find(phraseapp, version)

    if (cacheToolPath && cacheToolPath !== '') {
      core.addPath(cacheToolPath);
      return;
    }

    const fileName = osPlat === 'win32'
      ? `phraseapp_${osMapper[osPlat]}_${archMapper[osArch]}.exe`
      : `phraseapp_${osMapper[osPlat]}_${archMapper[osArch]}`

    const downloadUrl = 'https://github.com/phrase/phraseapp-client/releases/download/' + version + '/' + fileName;
    const downloadPath = await tc.downloadTool(downloadUrl);
    const toolPath = await tc.cacheFile(downloadPath, phraseapp, phraseapp, version, osArch);

    core.addPath(toolPath);

    if (osPlat !== 'win32') {
      cp.exec(`chmod +x ${toolPath}/${phraseapp}`)
    }
  } catch (error) {
    core.setFailed(error);
  }
}

run();

