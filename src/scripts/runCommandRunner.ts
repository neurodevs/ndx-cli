import CliCommandRunner from '../modules/CliCommandRunner'

async function main() {
    const runner = CliCommandRunner.Create(['create.ui'])
    await runner.run()
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
