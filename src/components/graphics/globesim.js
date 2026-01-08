function initGlobe(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let globeRadius = 100; // default
    let rotationY = 0;
    const latLines = 10;
    const lonLines = 20;

    function resizeCanvas() {
        const parent = canvas.parentElement;
        const computedStyle = window.getComputedStyle(parent);
        const parentWidth = parseInt(computedStyle.width);
        const parentHeight = parseInt(computedStyle.height);

        const size = Math.min(parentWidth, parentHeight);
        canvas.width = size;
        canvas.height = size;
        globeRadius = size / 2 - 50;
    }   


    resizeCanvas();
    window.addEventListener("resize", () => resizeCanvas());

    function drawGlobe() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = globeRadius;

        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 1;

        // Latitude lines
        for (let i = 0; i <= latLines; i++) {
            const phi = (i / latLines - 0.5) * Math.PI;
            const r = radius * Math.cos(phi);
            const y = cy + radius * Math.sin(phi);

            ctx.beginPath();
            for (let j = 0; j <= 100; j++) {
                const theta = (j / 100) * 2 * Math.PI + rotationY;
                const x = cx + r * Math.cos(theta);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Longitude lines
        for (let i = 0; i < lonLines; i++) {
            const theta = (i / lonLines) * 2 * Math.PI + rotationY;
            ctx.beginPath();
            for (let j = -0.5; j <= 0.5; j += 0.05) {
                const phi = j * Math.PI;
                const r = radius * Math.cos(phi);
                const x = cx + r * Math.cos(theta);
                const y = cy + radius * Math.sin(phi);
                if (j === -0.5) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Outer circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    function animate() {
        rotationY += 0.01;
        drawGlobe();
        requestAnimationFrame(animate);
    }
    animate();
}

module.exports = { initGlobe };