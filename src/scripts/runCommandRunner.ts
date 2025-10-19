import CliCommandRunner from '../impl/CliCommandRunner'

async function main() {
    const runner = CliCommandRunner.Create(['bind.snippet'])
    await runner.run()
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
