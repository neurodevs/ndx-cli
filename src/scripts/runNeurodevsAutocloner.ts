import expandHomeDir from '../impl/expandHomeDir'
import NeurodevsAutocloner from '../impl/NeurodevsAutocloner'

async function main() {
    const cloner = NeurodevsAutocloner.Create()
    await cloner.run(expandHomeDir('~/dev'))
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
