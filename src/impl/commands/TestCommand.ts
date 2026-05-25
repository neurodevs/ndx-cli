import CliCommandRunner from '../CliCommandRunner.js'

export default class TestCommand {
    public async run() {
        CliCommandRunner.exec(
            'node $([ -f node_modules/@neurodevs/node-tdd/build/workspace/testRunner.cli.js ] && echo node_modules/@neurodevs/node-tdd/build/workspace/testRunner.cli.js || echo build/workspace/testRunner.cli.js) --watchMode standard'
        )
    }
}
