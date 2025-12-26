export class LectureMemory {
    state: DurableObjectState;
    env: any;

    constructor(state: DurableObjectState, env: any) {
        this.state = state;
        this.env = env;
    }

    async fetch(request: Request): Promise<Response> {
        return new Response('Hello from LectureMemory Durable Object!');
    }
}