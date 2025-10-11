#!/usr/bin/env node

import CliCommandRunner from './modules/CliCommandRunner'

async function main() {
    const args = process.argv.slice(2)

    const runner = CliCommandRunner.Create(args)
    await runner.run()
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
