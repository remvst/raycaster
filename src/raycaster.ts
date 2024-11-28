import { pointDistance, Vector2, Vector2Like } from '@remvst/geometry';
import Matrix from '@remvst/matrix';

export interface CastResult {
    impact: Vector2Like;
    distance: number;
}

function newCastResult(): CastResult {
    return {
        impact: new Vector2(),
        distance: 0,
    };
}

export class Raycaster {

    private readonly reusableHorizontalCast = new Vector2();
    private readonly reusableVerticalCast = new Vector2();

    castRay(
        matrix: Matrix<any | null>,
        cellSize: number,
        startX: number,
        startY: number,
        angle: number,
        maxDistance: number = Number.POSITIVE_INFINITY,
        out: CastResult = newCastResult(),
    ): CastResult | null {
        const row = Math.floor(startY / cellSize);
        const col = Math.floor(startX / cellSize);

        if (matrix.get(row, col)) {
            out.impact.x = startX;
            out.impact.y = startY;
            out.distance = 0;
            return out;
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

        if (!cast) return null;

        const distanceToImpact = pointDistance(startX, startY, cast.x, cast.y);
        if (distanceToImpact > maxDistance) return null;

        out.impact.x = cast.x;
        out.impact.y = cast.y;
        out.distance = distanceToImpact;

        return out;
    }

    private castAgainstHorizontal(
        matrix: Matrix<any | null>,
        cellSize: number,
        startX: number,
        startY: number,
        angle: number,
    ) {
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
            pointingDown ? 0 : -cellSize * 0.1,
            this.reusableHorizontalCast,
        );
    }

    private castAgainstVertical(
        matrix: Matrix<any | null>,
        cellSize: number,
        startX: number,
        startY: number,
        angle: number,
    ): Vector2Like | null {
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
            0,
            this.reusableVerticalCast,
        );
    }

    private doCast(
        matrix: Matrix<any | null>,
        cellSize: number,
        startX: number,
        startY: number,
        xStep: number,
        yStep: number,
        epsilonX: number,
        epsilonY: number,
        out: Vector2Like,
    ): Vector2Like | null {
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
                return null;
            }

            if (matrix.get(row, col)) {
                // Got a block!
                out.x = x;
                out.y = y;
                return out;
            }

            x += xStep;
            y += yStep;
        }

        return null;
    }

}
