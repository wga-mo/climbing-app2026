export function hostnameCrags() {
    const hostname = window.location.hostname;
    // console.log("Hostname:", hostname);

    const SITE_CONFIG = {
        localhost: {
        cragMin: 1,
        cragMax: 9999,
        },

        //Oslo
        "climbing2026.vercel.app": {
        cragMin: 127,
        cragMax: 153,
        },
        
        //Drammen
        "klatring2026.vercel.app": {
        cragMin: 154,
        cragMax: 186,
        },
    };

    const config =
        SITE_CONFIG[hostname] ?? {
        cragMin: 1,
        cragMax: 9999,
        };

    const { cragMin, cragMax } = config;

    return { cragMin, cragMax };

}