export const LOKI_CONFIG = {
    // base url for loki instance-- to be changed once we know the actual url
    url: import.meta.env.VITE_LOKI_URL || "http://localhost:3100",

    // how far back to query each log to (5 minutes in this case)
    lookbackNs: 5 * 60 * 1_000_000_000,

    // promtail label for all zeek logs
    zeekJob: "zeek",

    containerMap: {
        // "(ip address)": {id: "(container id)", name: "(display name)", role: "(must match one of the predefined roles)", image: "(image name:tag)"}
    }
}