(function () {
    const style = document.createElement('style');
    document.head.appendChild(style);

    function getAverageColourAsRGB(img) {
        let canvas = document.createElement('canvas'),
            context = canvas.getContext && canvas.getContext('2d'),
            rgb = {
                r: 102,
                g: 102,
                b: 102
            }, // Set a base colour as a fallback for non-compliant browsers
            pixelInterval =
            5, // Rather than inspect every single pixel in the image inspect every 5th pixel
            count = 0,
            i = -4,
            data, length;

        // return the base colour for non-compliant browsers
        if (!context) {
            return rgb;
        }

        // set the height and width of the canvas element to that of the image
        const height = canvas.height = img.naturalHeight || img.offsetHeight || img.height,
            width = canvas.width = img.naturalWidth || img.offsetWidth || img.width;

        context.drawImage(img, 0, 0);

        try {
            data = context.getImageData(0, 0, width, height);
        } catch (e) {
            return rgb;
        }

        data = data.data;
        length = data.length;
        while ((i += pixelInterval * 4) < length) {
            count++;
            rgb.r += data[i];
            rgb.g += data[i + 1];
            rgb.b += data[i + 2];
        }

        // floor the average values to give correct rgb values (ie: round number values)
        rgb.r = Math.floor(rgb.r / count);
        rgb.g = Math.floor(rgb.g / count);
        rgb.b = Math.floor(rgb.b / count);

        return rgb;
    }
    class Color {
        constructor(r, g, b) {
            this.set(r, g, b);
        }

        toString() {
            return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
        }

        set(r, g, b) {
            this.r = this.clamp(r);
            this.g = this.clamp(g);
            this.b = this.clamp(b);
        }

        hueRotate(angle = 0) {
            angle = angle / 180 * Math.PI;
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            this.multiply([
                0.213 + cos * 0.787 - sin * 0.213,
                0.715 - cos * 0.715 - sin * 0.715,
                0.072 - cos * 0.072 + sin * 0.928,
                0.213 - cos * 0.213 + sin * 0.143,
                0.715 + cos * 0.285 + sin * 0.140,
                0.072 - cos * 0.072 - sin * 0.283,
                0.213 - cos * 0.213 - sin * 0.787,
                0.715 - cos * 0.715 + sin * 0.715,
                0.072 + cos * 0.928 + sin * 0.072,
            ]);
        }

        sepia(value = 1) {
            this.multiply([
                0.393 + 0.607 * (1 - value),
                0.769 - 0.769 * (1 - value),
                0.189 - 0.189 * (1 - value),
                0.349 - 0.349 * (1 - value),
                0.686 + 0.314 * (1 - value),
                0.168 - 0.168 * (1 - value),
                0.272 - 0.272 * (1 - value),
                0.534 - 0.534 * (1 - value),
                0.131 + 0.869 * (1 - value),
            ]);
        }

        saturate(value = 1) {
            this.multiply([
                0.213 + 0.787 * value,
                0.715 - 0.715 * value,
                0.072 - 0.072 * value,
                0.213 - 0.213 * value,
                0.715 + 0.285 * value,
                0.072 - 0.072 * value,
                0.213 - 0.213 * value,
                0.715 - 0.715 * value,
                0.072 + 0.928 * value,
            ]);
        }

        multiply(matrix) {
            const newR = this.clamp(this.r * matrix[0] + this.g * matrix[1] + this.b * matrix[2]);
            const newG = this.clamp(this.r * matrix[3] + this.g * matrix[4] + this.b * matrix[5]);
            const newB = this.clamp(this.r * matrix[6] + this.g * matrix[7] + this.b * matrix[8]);
            this.r = newR;
            this.g = newG;
            this.b = newB;
        }

        brightness(value = 1) {
            this.linear(value);
        }
        contrast(value = 1) {
            this.linear(value, -(0.5 * value) + 0.5);
        }

        linear(slope = 1, intercept = 0) {
            this.r = this.clamp(this.r * slope + intercept * 255);
            this.g = this.clamp(this.g * slope + intercept * 255);
            this.b = this.clamp(this.b * slope + intercept * 255);
        }

        invert(value = 1) {
            this.r = this.clamp((value + this.r / 255 * (1 - 2 * value)) * 255);
            this.g = this.clamp((value + this.g / 255 * (1 - 2 * value)) * 255);
            this.b = this.clamp((value + this.b / 255 * (1 - 2 * value)) * 255);
        }

        hsl() {
            const r = this.r / 255;
            const g = this.g / 255;
            const b = this.b / 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;

                case g:
                    h = (b - r) / d + 2;
                    break;

                case b:
                    h = (r - g) / d + 4;
                    break;
                }
                h /= 6;
            }

            return {
                h: h * 100,
                s: s * 100,
                l: l * 100,
            };
        }

        clamp(value) {
            if (value > 255) {
                value = 255;
            } else if (value < 0) {
                value = 0;
            }
            return value;
        }
    }

    class Solver {
        constructor(target, baseColor) {
            this.target = target;
            this.targetHSL = target.hsl();
            this.reusedColor = new Color(0, 0, 0);
        }

        solve() {
            const result = this.solveNarrow(this.solveWide());
            return {
                values: result.values,
                loss: result.loss,
                filter: this.css(result.values),
            };
        }

        solveWide() {
            const A = 5;
            const c = 15;
            const a = [60, 180, 18000, 600, 1.2, 1.2];

            let best = {
                loss: Infinity
            };
            for (let i = 0; best.loss > 25 && i < 3; i++) {
                const initial = [50, 20, 3750, 50, 100, 100];
                const result = this.spsa(A, a, c, initial, 1000);
                if (result.loss < best.loss) {
                    best = result;
                }
            }
            return best;
        }

        solveNarrow(wide) {
            const A = wide.loss;
            const c = 2;
            const A1 = A + 1;
            const a = [0.25 * A1, 0.25 * A1, A1, 0.25 * A1, 0.2 * A1, 0.2 * A1];
            return this.spsa(A, a, c, wide.values, 500);
        }

        spsa(A, a, c, values, iters) {
            const alpha = 1;
            const gamma = 0.16666666666666666;

            let best = null;
            let bestLoss = Infinity;
            const deltas = new Array(6);
            const highArgs = new Array(6);
            const lowArgs = new Array(6);

            for (let k = 0; k < iters; k++) {
                const ck = c / Math.pow(k + 1, gamma);
                for (let i = 0; i < 6; i++) {
                    deltas[i] = Math.random() > 0.5 ? 1 : -1;
                    highArgs[i] = values[i] + ck * deltas[i];
                    lowArgs[i] = values[i] - ck * deltas[i];
                }

                const lossDiff = this.loss(highArgs) - this.loss(lowArgs);
                for (let i = 0; i < 6; i++) {
                    const g = lossDiff / (2 * ck) * deltas[i];
                    const ak = a[i] / Math.pow(A + k + 1, alpha);
                    values[i] = fix(values[i] - ak * g, i);
                }

                const loss = this.loss(values);
                if (loss < bestLoss) {
                    best = values.slice(0);
                    bestLoss = loss;
                }
            }
            return {
                values: best,
                loss: bestLoss
            };

            function fix(value, idx) {
                let max = 100;
                if (idx === 2 /* saturate */ ) {
                    max = 7500;
                } else if (idx === 4 /* brightness */ || idx === 5 /* contrast */ ) {
                    max = 200;
                }

                if (idx === 3 /* hue-rotate */ ) {
                    if (value > max) {
                        value %= max;
                    } else if (value < 0) {
                        value = max + value % max;
                    }
                } else if (value < 0) {
                    value = 0;
                } else if (value > max) {
                    value = max;
                }
                return value;
            }
        }

        loss(filters) {
            // Argument is array of percentages.
            const color = this.reusedColor;
            color.set(0, 0, 0);

            color.invert(filters[0] / 100);
            color.sepia(filters[1] / 100);
            color.saturate(filters[2] / 100);
            color.hueRotate(filters[3] * 3.6);
            color.brightness(filters[4] / 100);
            color.contrast(filters[5] / 100);

            const colorHSL = color.hsl();
            return (
                Math.abs(color.r - this.target.r) +
                Math.abs(color.g - this.target.g) +
                Math.abs(color.b - this.target.b) +
                Math.abs(colorHSL.h - this.targetHSL.h) +
                Math.abs(colorHSL.s - this.targetHSL.s) +
                Math.abs(colorHSL.l - this.targetHSL.l)
            );
        }

        css(filters) {
            function fmt(idx, multiplier = 1) {
                return Math.round(filters[idx] * multiplier);
            }
            return `filter: contrast(0) sepia(100%) brightness(1.4) saturate(0.28) hue-rotate(${fmt(3, 3.6)}deg);`;
        }
    }

    'use strict';
    const paras = document.getElementsByTagName('img');
    for (let i = 0; i < paras.length; i++) {
        paras[i].setAttribute('crossOrigin', '')
        let avg = getAverageColourAsRGB(paras[i]);
        const color = new Color(Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
        const solver = new Solver(color);
        const result = solver.solve();
        paras[i].classList.remove('picHider');
        paras[i].classList.add('picFiller' + i);
        paras[i].classList.add('picChecker');

        let rule = `.picFiller${i}:not(:hover) {${result.filter}`
        style.sheet.insertRule(rule);
    }


    let scroller = function (ev) {
        var paras = document.getElementsByTagName('img');

        for (let i = 0; i < paras.length; i++) {
            if (paras[i].classList.contains("picChecker")) {
                continue;
            }
            const color = new Color(Math.floor(Math.random() * 255),
                Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
            const solver = new Solver(color);
            const result = solver.solve();
            paras[i].classList.add('picFiller' + i);
            paras[i].classList.add('picChecker');

            let rule = `.picFiller${i}:not(:hover) {${result.filter}`
            style.sheet.insertRule(rule);
        }
    };

    window.addEventListener("scroll", scroller);

    let input = document.createElement("input");
    input.setAttribute("id", "picScrollerEvent");
    input.onclick = function (){
        window.removeEventListener("scroll", scroller);
        input.remove();
    };
    document.body.appendChild(input);
})();