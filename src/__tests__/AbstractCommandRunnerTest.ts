import { exec as execSync } from 'child_process'
import { mkdir, readFile, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'
import {
    fakeExec,
    fakeLog,
    fakeMkdir,
    fakeReadFile,
    fakeWriteFile,
    resetCallsToExec,
    resetCallsToLog,
    resetCallsToMkdir,
    resetCallsToReadFile,
    resetCallsToWriteFile,
    setFakeReadFileResult,
} from '@neurodevs/fake-node-core'
import generateId from '@neurodevs/generate-id'
import {
    FakeAutomodule,
    FakeAutopackage,
    FakeSnippetKeybinder,
    FakeSnippetSuite,
    ImplAutomodule,
    NpmAutopackage,
    TypescriptClassSnippetSuite,
    UiAutomodule,
    VscodeSnippetKeybinder,
} from '@neurodevs/meta-node'
import prompts from 'prompts'
import CliCommandRunner from '../impl/CliCommandRunner'
import fakePrompts, {
    resetCallsToFakePrompts,
} from '../testDoubles/prompts/fakePrompts'
import AbstractPackageTest from './AbstractPackageTest'

const exec = promisify(execSync)

export default class AbstractCommandRunnerTest extends AbstractPackageTest {
    protected static readonly bindSnippetCommand = 'bind.snippet'

    protected static readonly createImplCommand = 'create.impl'
    protected static readonly interfaceName = generateId()
    protected static readonly implName = generateId()

    protected static readonly createPackageCommand = 'create.package'
    protected static readonly packageName = generateId()
    protected static readonly description = generateId()
    protected static readonly keywords = [generateId(), generateId()]
    protected static readonly githubToken = generateId()
    protected static readonly defaultKeywords = ['nodejs', 'typescript', 'tdd']

    protected static readonly createUiCommand = 'create.ui'
    protected static readonly componentName = generateId()

    protected static readonly installSnippetsCommand = 'install.snippets'

    protected static readonly upgradePackageCommand = 'upgrade.package'

    protected static async beforeEach() {
        await super.beforeEach()

        this.setFakeAutopackage()
        this.setFakeImplAutomodule()
        this.setFakeUiAutomodule()
        this.setFakeSnippetKeybinder()
        this.setFakeSnippetSuite()

        this.setFakeExec()
        this.setFakeLog()
        this.setFakeMkdir()
        this.setFakePrompts()
        this.setFakeReadFile()
        this.setFakeWriteFile()

        process.env.GITHUB_TOKEN = this.githubToken
    }

    protected static setFakeReadFileResultToTsconfig() {
        setFakeReadFileResult(this.tsconfigPath, this.originalTsconfigFile)
    }

    protected static setFakeReadToEmptyPackageJson() {
        setFakeReadFileResult('package.json', '{}')
    }

    protected static setFakeReadToAllInstalledExcept(dep: string) {
        setFakeReadFileResult(
            'package.json',
            this.allInstalled.replace(dep, '')
        )
    }

    protected static setFakeReadToAllInstalled() {
        setFakeReadFileResult('package.json', this.allInstalled)
    }

    protected static setFakePackageJson(
        responses?: Record<string, string | string[]>
    ) {
        const infoFromPackageJson = {
            ...this.infoFromPackageJson,
            ...responses,
        }

        setFakeReadFileResult(
            'package.json',
            JSON.stringify(infoFromPackageJson)
        )

        return infoFromPackageJson
    }

    protected static get keywordsWithDefaults() {
        return [...this.defaultKeywords, ...this.keywords]
    }

    protected static readonly infoFromPackageJson = {
        name: this.packageName,
        description: this.description,
        keywords: this.keywordsWithDefaults,
    }

    protected static readonly allInstalled = `
        {
            "dependencies": {
                "react": "^...",
                "react-dom": "^..."
            },
            "devDependencies": {
                "@types/react": "^...",
                "@types/react-dom": "^...",
                "@types/jsdom": "^...",
                "@testing-library/react": "^...",
                "@testing-library/dom": "^...",
                "@testing-library/jest-dom": "^...",
                "jsdom": "^..."
            }   
        }
    `

    protected static readonly allRequiredDependencies = [
        'react',
        'react-dom',
        '@types/react',
        '@types/react-dom',
        '@types/jsdom',
        '@testing-library/react',
        '@testing-library/dom',
        '@testing-library/jest-dom',
        'jsdom',
    ]

    protected static readonly installDependenciesCommand =
        'yarn add react react-dom'

    protected static readonly installDevDependenciesCommand =
        'yarn add -D @types/react @types/react-dom @types/jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom'

    protected static expandHomeDir(inputPath: string): string {
        return inputPath.startsWith('~')
            ? path.join(os.homedir(), inputPath.slice(1))
            : inputPath
    }

    protected static splitOnCommaOrWhitespace(value: string) {
        return value
            .split(/[\s,]+/)
            .map((v: string) => v.trim())
            .filter(Boolean)
    }

    protected static readonly implTestSaveDir = 'src/__tests__/impl'
    protected static readonly implModuleSaveDir = 'src/impl'

    protected static get implFakeSaveDir() {
        return `src/testDoubles/${this.interfaceName}`
    }

    protected static readonly uiTestSaveDir = 'src/__tests__/ui'
    protected static readonly uiModuleSaveDir = 'src/ui'

    protected static get uiFakeSaveDir() {
        return `src/testDoubles/${this.componentName}`
    }

    protected static readonly tsconfigPath = 'tsconfig.json'
    protected static readonly randomId = generateId()

    protected static readonly originalTsconfigFile = JSON.stringify(
        {
            [this.randomId]: this.randomId,
            compilerOptions: {
                [this.randomId]: this.randomId,
            },
        },
        null,
        4
    )

    protected static readonly updatedTsconfigFile = JSON.stringify(
        {
            [this.randomId]: this.randomId,
            compilerOptions: {
                jsx: 'react-jsx',
                [this.randomId]: this.randomId,
            },
            include: ['src'],
        },
        null,
        4
    )

    protected static setFakeAutopackage() {
        NpmAutopackage.Class = FakeAutopackage
        FakeAutopackage.resetTestDouble()
    }

    protected static setFakeImplAutomodule() {
        ImplAutomodule.Class = FakeAutomodule
        FakeAutomodule.resetTestDouble()
    }

    protected static setFakeUiAutomodule() {
        UiAutomodule.Class = FakeAutomodule
        FakeAutomodule.resetTestDouble()
    }

    protected static setFakeSnippetKeybinder() {
        VscodeSnippetKeybinder.Class = FakeSnippetKeybinder
        FakeSnippetKeybinder.resetTestDouble()
    }

    protected static setFakeSnippetSuite() {
        TypescriptClassSnippetSuite.Class = FakeSnippetSuite
        FakeSnippetSuite.resetTestDouble()
    }

    protected static setFakeExec() {
        CliCommandRunner.exec = fakeExec as unknown as typeof exec
        resetCallsToExec()
    }

    protected static setFakeLog() {
        CliCommandRunner.log = fakeLog as unknown as typeof CliCommandRunner.log
        resetCallsToLog()
    }

    protected static setFakeMkdir() {
        CliCommandRunner.mkdir = fakeMkdir as unknown as typeof mkdir
        resetCallsToMkdir()
    }

    protected static setFakePrompts() {
        CliCommandRunner.prompts = fakePrompts as unknown as typeof prompts
        resetCallsToFakePrompts()
    }

    protected static setFakeReadFile() {
        CliCommandRunner.readFile = fakeReadFile as unknown as typeof readFile
        resetCallsToReadFile()

        this.setFakeReadToAllInstalled()
        this.setFakeReadFileResultToTsconfig()
    }

    protected static setFakeWriteFile() {
        CliCommandRunner.writeFile =
            fakeWriteFile as unknown as typeof writeFile
        resetCallsToWriteFile()
    }

    protected static readonly interfaceNameMessage =
        'What should the interface be called? Example: YourInterface'

    protected static readonly implNameMessage =
        'What should the implementation class be called? Example: YourInterfaceImpl'

    protected static readonly packageNameMessage =
        'What should the package be called? Example: useful-package'

    protected static readonly packageDescriptionMessage =
        'What should the package description be? Example: A useful package.'

    protected static readonly componentNameMessage =
        'What should the component be called? Example: YourComponent'

    protected static readonly setupTestsFile = `
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

    protected static readonly helpText = `ndx CLI (Command Line Interface)

    Available commands:

    - bind.snippet      Bind a text snippet to a keyboard shortcut in vscode.
    - create.impl       Create implementation for interface with test and fake.
    - create.package    Create npm package using latest template.
    - create.ui         Create React component with test and fake.
    - install.snippets  Install text snippets with vscode keybindings.
    - upgrade.package   Upgrade existing npm package to latest template.
    - help, --help, -h  Show this help text.
    
    Usage:

    - ndx <command>
    `

    protected static CliCommandRunner(args: string[]) {
        return CliCommandRunner.Create(args)
    }
}
