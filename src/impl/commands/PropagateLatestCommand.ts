import { NpmPropagationCoordinator } from '@neurodevs/meta-node'

import npmRepoNames from '../../npmRepoNames.js'

export default class PropagateLatestCommand {
    public constructor() {}

    public async run() {
        const coordinator = this.NpmPropagationCoordinator()
        await coordinator.run()
    }

    private NpmPropagationCoordinator() {
        const repoPaths = npmRepoNames.map((name) => `../${name}`)
        const shouldGitCommit = process.argv.includes('--commit') ? true : false

        return NpmPropagationCoordinator.Create('.', repoPaths, {
            shouldGitCommit,
        })
    }
}
