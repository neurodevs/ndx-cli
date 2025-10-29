import { UiAutomodule } from '@neurodevs/meta-node'

import CliCommandRunner from '../CliCommandRunner.js'

export default class CreateUiCommand {
    private componentName!: string

    public constructor() {}

    public async run() {
        await this.installDependenciesIfNeeded()

        const { componentName } = await this.promptForUimodule()

        this.componentName = componentName

        if (!this.componentName) {
            return
        }

        await this.makeRequiredUiDirectories()

        const instance = this.UiAutomodule()
        await instance.run()
    }

    private async installDependenciesIfNeeded() {
        const isInstalled = await this.checkIfDependenciesAreInstalled()

        if (!isInstalled) {
            const { shouldInstall } = await this.promptForInstallDependencies()

            if (shouldInstall) {
                await this.installReactDependencies()
                await this.updateTsconfigForReact()
                await this.createSetupTestsFile()
                await this.addSetupTestsToPackageJson()
                await this.recompileForTsxFiles()
            }
        }
    }

    private async checkIfDependenciesAreInstalled() {
        const original = await this.loadPackageJson()
        const parsed = JSON.parse(original)

        const dependencies = Object.keys(parsed.dependencies ?? {})

        const areDepsInstalled = this.requiredDependencies.every((dep) =>
            dependencies.includes(dep)
        )

        const devDependencies = Object.keys(parsed.devDependencies ?? {})

        const areDevDepsInstalled = this.requiredDevDependencies.every((dep) =>
            devDependencies.includes(dep)
        )

        return areDepsInstalled && areDevDepsInstalled
    }

    private async loadPackageJson() {
        return await this.readFile(this.packageJsonPath, 'utf-8')
    }

    private readonly packageJsonPath = 'package.json'

    private readonly requiredDependencies = ['react', 'react-dom']

    private readonly requiredDevDependencies = [
        '@types/react',
        '@types/react-dom',
        '@types/jsdom',
        '@testing-library/react',
        '@testing-library/dom',
        '@testing-library/jest-dom',
        'jsdom',
    ]

    private async promptForInstallDependencies() {
        return await this.prompts([
            {
                type: 'confirm',
                name: 'shouldInstall',
                message:
                    'Some required dependencies are missing! Press Enter to install, or any other key to abort.',
                initial: true,
            },
        ])
    }

    private async installReactDependencies() {
        await this.installDependencies()
        await this.installDevDependencies()
    }

    private async installDependencies() {
        console.log('Installing required dependencies...')
        await this.exec('yarn add react react-dom')
    }

    private async installDevDependencies() {
        console.log('Installing required dev dependencies...')
        await this.exec(
            'yarn add -D @types/react @types/react-dom @types/jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom'
        )
    }

    private async updateTsconfigForReact() {
        console.log('Updating tsconfig.json for React...')

        const original = await this.loadTsconfig()
        const parsed = JSON.parse(original)

        const updated = JSON.stringify(
            {
                ...parsed,
                compilerOptions: {
                    jsx: 'react-jsx',
                    ...parsed.compilerOptions,
                },
                include: ['src'],
            },
            null,
            4
        )

        await this.writeFile(this.tsconfigPath, updated)
    }

    private async loadTsconfig() {
        return await this.readFile(this.tsconfigPath, 'utf-8')
    }

    private readonly tsconfigPath = 'tsconfig.json'

    private async createSetupTestsFile() {
        console.log('Creating src/setupTests.ts...')
        await this.writeFile('src/__tests__/setupTests.ts', this.setupTestsFile)
    }

    private async addSetupTestsToPackageJson() {
        console.log('Adding setupTests.ts to package.json...')

        const original = await this.loadPackageJson()
        const parsed = JSON.parse(original)

        const updated = JSON.stringify(
            {
                ...parsed,
                jest: {
                    ...parsed.jest,
                    setupFiles: ['<rootDir>/build/__tests__/setupTests.js'],
                },
            },
            null,
            4
        )

        await this.writeFile(this.packageJsonPath, updated)
    }

    private async recompileForTsxFiles() {
        console.log('Recompiling project for .tsx files...')
        await this.exec('npx tsc')
    }

    private async promptForUimodule() {
        return await this.prompts([
            {
                type: 'text',
                name: 'componentName',
                message: this.componentNameMessage,
            },
        ])
    }

    private readonly componentNameMessage =
        'What should the component be called? Example: YourComponent'

    private async makeRequiredUiDirectories() {
        await this.mkdir(this.uiTestSaveDir, { recursive: true })
        await this.mkdir(this.uiModuleSaveDir, { recursive: true })
        await this.mkdir(this.uiFakeSaveDir, { recursive: true })
    }

    private readonly uiTestSaveDir = 'src/__tests__/ui'
    private readonly uiModuleSaveDir = 'src/ui'

    private get uiFakeSaveDir() {
        return `src/testDoubles/${this.componentName}`
    }

    private get exec() {
        return CliCommandRunner.exec
    }

    private get mkdir() {
        return CliCommandRunner.mkdir
    }

    private get prompts() {
        return CliCommandRunner.prompts
    }

    private get readFile() {
        return CliCommandRunner.readFile
    }

    private get writeFile() {
        return CliCommandRunner.writeFile
    }

    private readonly setupTestsFile = `
        import { JSDOM } from 'jsdom'

        const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
            url: 'http://localhost',
        })

        global.window = jsdom.window as unknown as Window & typeof globalThis
        global.document = jsdom.window.document
        global.navigator = jsdom.window.navigator
        global.HTMLElement = jsdom.window.HTMLElement
        global.getComputedStyle = jsdom.window.getComputedStyle

        global.ResizeObserver = class {
            public observe() {}
            public unobserve() {}
            public disconnect() {}
        }

        global.SVGElement = jsdom.window.SVGElement
    `

    private UiAutomodule() {
        return UiAutomodule.Create({
            testSaveDir: this.uiTestSaveDir,
            moduleSaveDir: this.uiModuleSaveDir,
            fakeSaveDir: this.uiFakeSaveDir,
            componentName: this.componentName,
        })
    }
}
