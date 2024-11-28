import { pointDistance, Vector2Like } from '@remvst/geometry';
import Matrix from '@remvst/matrix';

export class Raycaster {

    castRay(
        matrix: Matrix<any | null>,
        cellSize: number,
        startX: number,
        startY: number,
        angle: number,
        maxDistance: number = Number.POSITIVE_INFINITY,
    ): Vector2Like | null {
        const row = Math.floor(startY / cellSize);
        const col = Math.floor(startX / cellSize);

        if (matrix.get(row, col)) {
            return {
                'x': startX,
                'y': startY,
            };
        }

        // Horizontal lines
        let castHorizontal = this.castAgainstHorizontal(matrix, cellSize, startX, startY, angle);
        let castVertical = this.castAgainstVertical(matrix, cellSize, startX, startY, angle);

        let cast: Vector2Like | null;
        if (castVertical && !castHorizontal) {
            cast = castVertical;
        } else if (!castVertical) {
            cast = castHorizontal;
        } else {
            const dHorizontal = pointDistance(startX, startY, castHorizontal!.x, castHorizontal!.y);
            const dVertical = pointDistance(startX, startY, castVertical.x, castVertical.y);
            cast = dHorizontal < dVertical ? castHorizontal : castVertical;
        }

        if (!cast || maxDistance && pointDistance(startX, startY, cast.x, cast.y) > maxDistance) {
            return null;
        }

        return cast;
    }

    castAgainstHorizontal(matrix: Matrix<any | null>, cellSize: number, startX: number, startY: number, angle: number) {
        const pointingDown = Math.sin(angle) > 0;

        const y = Math.floor(startY / cellSize) * cellSize + (pointingDown ? cellSize : 0);
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

    castAgainstVertical(matrix: Matrix<any | null>, cellSize: number, startX: number, startY: number, angle: number): Vector2Like | null {
        const pointingRight = Math.cos(angle) > 0;

        const x = Math.floor(startX / cellSize) * cellSize + (pointingRight ? cellSize : 0);
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

    doCast(matrix: Matrix<any | null>, cellSize: number, startX: number, startY: number, xStep: number, yStep: number, epsilonX: number, epsilonY: number): Vector2Like | null {
        if (!isFinite(xStep) || !isFinite(yStep)) {
            return null;
        }

        let x = startX,
            y = startY;

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
