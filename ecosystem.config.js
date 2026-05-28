
module.exports = {
    apps: [{
        name: "whatsapp-marketing",
        script: "npm",
        args: "run dev",
        watch: false,
        env: {
            NODE_ENV: "production",
            PORT: 5000,
        }
    }]
}