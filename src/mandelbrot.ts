function init() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas === null) throw new Error('Cannot find an element with id canvas');

    // Use clientWidth/clientHeight for actual rendered size
    const canvasWidth = canvas.width = canvas.clientWidth || window.innerWidth;
    const canvasHeight = canvas.height = canvas.clientHeight || window.innerHeight;

    let zoom = canvasWidth / 5;
    let centerX = 0;
    let centerY = 0;
    let iteration = 100;

    function calcMandelbrot(c: number, d: number): number {
        // Z = a+bxi, C = c+dxi
        let a = 0;
        let b = 0;

        for (let n = 0; n < iteration; n++) {
            const aa = a * a;
            const bb = b * b;
            const na = aa - bb + c;
            const nb = 2 * a * b + d;
            a = na;
            b = nb;
            if (aa + bb > 4) return n;
        }
        return -1;
    }

    function draw(): void {
        const ctx = canvas.getContext('2d');
        if (ctx === null) throw new Error('Canvas doesn\'t have a 2d context');

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const id = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        const pixels = id.data;

        for (let x = 0; x <= canvasWidth; x++) {
            for (let y = 0; y <= canvasHeight; y++) {
                const dx = x - canvasWidth / 2;
                const dy = y - canvasHeight / 2;
                const c = dx / zoom + centerX;
                const d = dy / zoom + centerY;

                const mandelbrotValue = calcMandelbrot(c, d);

                const off = (y * id.width + x) * 4;
                if (mandelbrotValue == -1) {
                    pixels[off] = 0;
                    pixels[off + 1] = 0;
                    pixels[off + 2] = 0;
                } else {
                    const r = Math.floor(128 + 127 * Math.sin(0.1 * mandelbrotValue));
                    const g = Math.floor(128 + 127 * Math.sin(0.15 * mandelbrotValue + Math.PI / 3));
                    const b = Math.floor(128 + 127 * Math.sin(0.2 * mandelbrotValue + Math.PI / 2));
                    pixels[off] = r;
                    pixels[off + 1] = g;
                    pixels[off + 2] = b;
                }
                pixels[off + 3] = 255;
            }
        }

        ctx.putImageData(id, 0, 0);
    }

    document.addEventListener('mousedown', (event) => {
        const dx = event.clientX - canvasWidth / 2;
        const dy = event.clientY - canvasHeight / 2;
        const c = dx / zoom + centerX;
        const d = dy / zoom + centerY;

        zoom = zoom * 2;
        centerX = c;
        centerY = d;
        iteration = iteration * 1.25;

        draw();
    });

    draw();
}

// Run immediately if document is ready, otherwise wait for load
if (document.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}
