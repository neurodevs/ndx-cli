import expandHomeDir from '../modules/expandHomeDir'
import NeurodevsAutocloner from '../modules/NeurodevsAutocloner'

async function main() {
    const cloner = NeurodevsAutocloner.Create()
    await cloner.run(expandHomeDir('~/dev'))
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
