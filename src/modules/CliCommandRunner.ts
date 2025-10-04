export default class CliCommandRunner implements CommandRunner {
    public static Class?: CommandRunnerConstructor

    protected constructor() {}

    public static Create() {
        return new (this.Class ?? this)()
    }
}

export interface CommandRunner {}

export type CommandRunnerConstructor = new () => CommandRunner
