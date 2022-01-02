'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
class Raycaster {
    castRay(matrix, cellSize, startX, startY, angle, maxDistance = Number.POSITIVE_INFINITY) {
        // Horizontal lines
        let castHorizontal = this.castAgainstHorizontal(matrix, cellSize, startX, startY, angle);
        let castVertical = this.castAgainstVertical(matrix, cellSize, startX, startY, angle);
        let cast;
        if (castVertical && !castHorizontal) {
            cast = castVertical;
        }
        else if (!castVertical) {
            cast = castHorizontal;
        }
        else {
            const dHorizontal = (0, util_1.pointDistance)(startX, startY, castHorizontal.x, castHorizontal.y);
            const dVertical = (0, util_1.pointDistance)(startX, startY, castVertical.x, castVertical.y);
            cast = dHorizontal < dVertical ? castHorizontal : castVertical;
        }
        if (!cast || maxDistance && (0, util_1.pointDistance)(startX, startY, cast.x, cast.y) > maxDistance) {
            return null;
        }
        return cast;
    }
    castAgainstHorizontal(matrix, cellSize, startX, startY, angle) {
        const pointingDown = Math.sin(angle) > 0;
        const y = Math.floor(startY / cellSize) * cellSize + (pointingDown ? cellSize : 0);
        const x = startX + (y - startY) / Math.tan(angle);
        const yStep = pointingDown ? cellSize : -cellSize;
        const xStep = yStep / Math.tan(angle);
        return this.doCast(matrix, cellSize, x, y, xStep, yStep, 0, pointingDown ? 0 : -cellSize * 0.1);
    }
    castAgainstVertical(matrix, cellSize, startX, startY, angle) {
        const pointingRight = Math.cos(angle) > 0;
        const x = Math.floor(startX / cellSize) * cellSize + (pointingRight ? cellSize : 0);
        const y = startY + (x - startX) * Math.tan(angle);
        const xStep = pointingRight ? cellSize : -cellSize;
        const yStep = xStep * Math.tan(angle);
        return this.doCast(matrix, cellSize, x, y, xStep, yStep, pointingRight ? 0 : -cellSize * 0.1, 0);
    }
    doCast(matrix, cellSize, startX, startY, xStep, yStep, epsilonX, epsilonY) {
        if (!isFinite(xStep) || !isFinite(yStep)) {
            return null;
        }
        let x = startX, y = startY;
        while (true) {
            const row = Math.floor((y + epsilonY) / cellSize);
            const col = Math.floor((x + epsilonX) / cellSize);
            if (row < 0 || col < 0 || row >= matrix.rows || col >= matrix.cols) {
                // Out of bounds
                break;
            }
            if (matrix.get(row, col)) {
                // Got a block!
                return {
                    'x': x,
                    'y': y
                };
            }
            x += xStep;
            y += yStep;
        }
        return null;
    }
}
exports.default = Raycaster;
