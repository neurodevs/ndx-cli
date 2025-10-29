import expandHomeDir from '../impl/expandHomeDir.js'
import NeurodevsAutocloner from '../impl/NeurodevsAutocloner.js'

async function main() {
    const cloner = NeurodevsAutocloner.Create()
    await cloner.run(expandHomeDir('~/dev'))
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
