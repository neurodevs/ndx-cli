import { TypescriptClassSnippetSuite } from '@neurodevs/meta-node'

export default class InstallSnippetsCommand {
    public constructor() {}

    public async run() {
        const suite = this.TypescriptClassSnippetSuite()
        await suite.install()
    }

    private TypescriptClassSnippetSuite() {
        return TypescriptClassSnippetSuite.Create()
    }
}
