import CliCommandRunner from '../CliCommandRunner.js'

export default class BuildLabrecorderCommand {
    public constructor() {}

    public async run() {
        const { stdout, stderr } = await this.exec(this.bashCommand, {
            cwd: '.',
        })

        if (stdout) {
            this.log(stdout)
        }

        if (stderr) {
            this.error(stderr)
        }
    }

    private get exec() {
        return CliCommandRunner.exec
    }

    private get log() {
        return CliCommandRunner.log
    }

    private get error() {
        return CliCommandRunner.error
    }

    private readonly bashCommand = `sudo rm -rf build/ \
&& cmake -S . -B build \
  -DCMAKE_INSTALL_PREFIX=/opt/local \
  -DLSL_INSTALL_ROOT=/opt/local \
  -DLSL_UNIXFOLDERS=1 \
  -DBUILD_GUI=OFF \
&& cmake --build build \
&& sudo cmake --install build`
}
