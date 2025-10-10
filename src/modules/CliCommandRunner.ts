export default class CliCommandRunner implements CommandRunner {
    public static Class?: CommandRunnerConstructor

    private args: string[]

    protected constructor(args: string[]) {
        this.args = args
    }

    public static Create(args: string[]) {
        return new (this.Class ?? this)(args)
    }

    public async run() {
        this.throwIfCommandIsNotSupported()
    }

    private throwIfCommandIsNotSupported() {
        if (this.command !== 'create.module') {
            throw new Error(`The command "${this.command}" is not supported!`)
        }
    }

    private get command() {
        return this.args[0]
    }
}

export interface CommandRunner {
    run(): Promise<void>
}

export type CommandRunnerConstructor = new (args: string[]) => CommandRunner
