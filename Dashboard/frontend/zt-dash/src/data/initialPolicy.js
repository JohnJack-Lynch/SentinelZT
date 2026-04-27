export const INIT_POLICY = {
    version: "1.0.0",
    updated: new Date().toISOString(),
    roles: {
        ADMIN: {
            network: true,
            exec: true,
            read: true,
            write: true,
            privileged: true
        },
        NAVAL_OFFICER: {
            network: true,
            exec: false,
            read: true,
            write: false,
            privileged: false
        },
        ENGINEER: {
            network: true,
            exec: false,
            read: true,
            write: true,
            privileged: false,
        }
    }
}