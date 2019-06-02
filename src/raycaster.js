'use strict';

const Util = require('./util');

class Raycaster {

    castRay(matrix, cellSize, startX, startY, angle, maxDistance) {
        // Horizontal lines
        let castHorizontal = this.castAgainstHorizontal(matrix, cellSize, startX, startY, angle);
        let castVertical = this.castAgainstVertical(matrix, cellSize, startX, startY, angle);

        let cast;
        if (castVertical && !castHorizontal) {
            cast = castVertical;
        } else if (!castVertical) {
            cast = castHorizontal;
        } else {
            const dHorizontal = Util.pointDistance(startX, startY, castHorizontal.x, castHorizontal.y);
            const dVertical = Util.pointDistance(startX, startY, castVertical.x, castVertical.y);
            cast = dHorizontal < dVertical ? castHorizontal : castVertical;
        }

        if (!cast || maxDistance && Util.pointDistance(startX, startY, cast.x, cast.y) > maxDistance) {
            return null;
        }

        return cast;
    }

    castAgainstHorizontal(matrix, cellSize, startX, startY, angle) {
        const pointingDown = Math.sin(angle) > 0;

        const y = ~~(startY / cellSize) * cellSize + (pointingDown ? cellSize : 0);
        const x = startX + (y - startY) / Math.tan(angle);

        const yStep = pointingDown ? cellSize : -cellSize;
        const xStep = yStep / Math.tan(angle);

        return this.doCast(
            matrix,
            cellSize,
            x,
            y,
            xStep,
            yStep,
            0,
            pointingDown ? 0 : -cellSize * 0.1
        );
    }

    castAgainstVertical(matrix, cellSize, startX, startY, angle) {
        const pointingRight = Math.cos(angle) > 0;

        const x = ~~(startX / cellSize) * cellSize + (pointingRight ? cellSize : 0);
        const y = startY + (x - startX) * Math.tan(angle);

        const xStep = pointingRight ? cellSize : -cellSize;
        const yStep = xStep * Math.tan(angle);

        return this.doCast(
            matrix,
            cellSize,
            x,
            y,
            xStep,
            yStep,
            pointingRight ? 0 : -cellSize * 0.1,
            0
        );
    }

    doCast(matrix, cellSize, startX, startY, xStep, yStep, epsilonX, epsilonY) {
        if (!isFinite(xStep) || !isFinite(yStep)) {
            return null;
        }

        let x = startX,
            y = startY;

        for(let i = 0 ; i < 100 ; i++) {
            const row = ~~((y + epsilonY) / cellSize);
            const col = ~~((x + epsilonX) / cellSize);

            if (row < 0 || col < 0 || row >= matrix.rows || col >= matrix.cols) {
                // Out of bounds
                return null;
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
    }

}

module.exports = Raycaster;
