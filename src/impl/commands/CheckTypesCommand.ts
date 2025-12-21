import { NpmWorkspaceTypeChecker } from '@neurodevs/meta-node'

export default class CheckTypesCommand {
    public constructor() {}

    public async run() {
        const checker = this.NpmWorkspaceTypeChecker()
        await checker.run()
    }

    private NpmWorkspaceTypeChecker() {
        return NpmWorkspaceTypeChecker.Create('.')
    }
}
