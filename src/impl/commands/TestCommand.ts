import { access } from 'node:fs/promises'

import CliCommandRunner from '../CliCommandRunner.js'

export default class TestCommand {
    public async run() {
        const localRunner =
            'node_modules/@neurodevs/node-tdd/build/workspace/testRunner.cli.js'

        const runnerPath = (await fileExists(localRunner))
            ? localRunner
            : 'build/workspace/testRunner.cli.js'

        await new Promise<void>((resolve, reject) => {
            const child = CliCommandRunner.spawn(
                'node',
                [runnerPath, '--watchMode', 'standard'],
                { stdio: 'inherit' }
            )
            child.on('close', (code: number | null) =>
                code === 0
                    ? resolve()
                    : reject(new Error(`Test runner exited with code ${code}`))
            )
        })
    }
}

async function fileExists(path: string): Promise<boolean> {
    try {
        await access(path)
        return true
    } catch {
        return false
    }
}
