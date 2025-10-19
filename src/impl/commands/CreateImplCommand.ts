import { ImplAutomodule } from '@neurodevs/meta-node'
import CliCommandRunner from '../CliCommandRunner'

export default class CreateImplCommand {
    private interfaceName!: string
    private implName!: string

    public constructor() {}

    public async run() {
        const { interfaceName, implName } = await this.promptForAutomodule()

        this.interfaceName = interfaceName
        this.implName = implName

        if (!this.userInputExistsForCreateImpl) {
            return
        }

        await this.makeRequiredImplDirectories()

        const automodule = this.ImplAutomodule()
        await automodule.run()
    }

    private async promptForAutomodule() {
        return await this.prompts([
            {
                type: 'text',
                name: 'interfaceName',
                message: this.interfaceNameMessage,
            },
            {
                type: 'text',
                name: 'implName',
                message: this.implNameMessage,
            },
        ])
    }

    private readonly interfaceNameMessage =
        'What should the interface be called? Example: YourInterface'

    private readonly implNameMessage =
        'What should the implementation class be called? Example: YourInterfaceImpl'

    private get userInputExistsForCreateImpl() {
        return this.interfaceName && this.implName
    }

    private async makeRequiredImplDirectories() {
        await this.mkdir(this.implTestSaveDir, { recursive: true })
        await this.mkdir(this.implModuleSaveDir, { recursive: true })
        await this.mkdir(this.implFakeSaveDir, { recursive: true })
    }

    private readonly implTestSaveDir = 'src/__tests__/impl'
    private readonly implModuleSaveDir = 'src/impl'

    private get implFakeSaveDir() {
        return `src/testDoubles/${this.interfaceName}`
    }

    private get mkdir() {
        return CliCommandRunner.mkdir
    }

    private get prompts() {
        return CliCommandRunner.prompts
    }

    private ImplAutomodule() {
        return ImplAutomodule.Create({
            testSaveDir: this.implTestSaveDir,
            moduleSaveDir: this.implModuleSaveDir,
            fakeSaveDir: this.implFakeSaveDir,
            interfaceName: this.interfaceName,
            implName: this.implName,
        })
    }
}
