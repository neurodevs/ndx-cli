export let callsToFakePrompts: Record<string, string>[][] = []

export function resetCallsToFakePrompts() {
    callsToFakePrompts = []
}

export let fakeResponses: Record<string, string> = {}

export function setFakeResponses(responses: Record<string, string>) {
    fakeResponses = responses
}

export function fakePrompts(questions: Record<string, string>[]) {
    callsToFakePrompts.push(questions)
    return fakeResponses
}
