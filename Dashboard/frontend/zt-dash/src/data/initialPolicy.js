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
        TEST: {
            network: true,
            exec: true,
            read: true,
            write: true,
            privileged: true
        }
    }
}