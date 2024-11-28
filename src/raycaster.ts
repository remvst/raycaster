import { between, distance, isBetween, pointDistance, Vector2, Vector2Like } from '@remvst/geometry';
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

export interface Ray {
    start: Vector2Like;
    angle: number;
    maxDistance?: number;
}

export class Raycaster<CellType> {

    private readonly reusableHorizontalCast = new Vector2();
    private readonly reusableVerticalCast = new Vector2();

    constructor(
        readonly matrix: Matrix<CellType>,
        readonly cellSize: number,
        readonly isObstacle: (cell: CellType) => boolean = cell => !!cell,
    ) {

    }

    private get width() {
        return this.matrix.cols * this.cellSize;
    }

    private get height() {
        return this.matrix.rows * this.cellSize;
    }

    adaptRay(ray: Ray): Ray {
        let { x, y } = ray.start;

        // Starting within bounds, no need to adapt
        if (isBetween(0, x, this.width) && isBetween(0, y, this.height)) {
            return ray;
        }

        const { angle } = ray;
        const originalX = x;
        const originalY = y;

        const slope = Math.sin(angle) / Math.cos(angle);
        const yAtOrigin = y - slope * x;

        const closestX = between(0, x, this.width);
        const closestY = between(0, y, this.height);

        const yAtClosestX = slope * closestX + yAtOrigin;
        const xAtClosestY = (closestY - yAtOrigin) / slope;

        let adjustedX: number;
        let adjustedY: number;

        if (isBetween(0, closestX, this.width) && isBetween(0, yAtClosestX, this.height)) {
            adjustedX = closestX;
            adjustedY = yAtClosestX;
        } else if (isBetween(0, xAtClosestY, this.width) && isBetween(0, closestY, this.height)) {
            adjustedX = xAtClosestY;
            adjustedY = closestY;
        } else {
            return ray;
        }

        const angleToAdjusted = Math.atan2(adjustedY - y, adjustedX - x);
        if (Math.abs(angleToAdjusted - angle) > Math.PI / 2) {
            return ray;
        }

        ray.start.x = adjustedX;
        ray.start.y = adjustedY;

        if (ray.maxDistance) {
            ray.maxDistance -= pointDistance(originalX, originalY, adjustedX, adjustedY);
        }
        return ray;
    }

    castRay(
        ray: Ray,
        out: CastResult = newCastResult(),
    ): CastResult | null {
        if (ray.maxDistance < 0) return null;

        const { start, angle, maxDistance } = ray;

        const row = Math.floor(start.y / this.cellSize);
        const col = Math.floor(start.x / this.cellSize);

        const startCell = this.matrix.get(row, col);
        if (this.isObstacle(startCell)) {
            out.impact.x = start.x;
            out.impact.y = start.y;
            out.distance = 0;
            return out;
        }

        // Horizontal lines
        let castHorizontal = this.castAgainstHorizontal(ray, start.x, start.y, angle);
        let castVertical = this.castAgainstVertical(ray, start.x, start.y, angle);

        let cast: Vector2Like | null;
        if (castVertical && !castHorizontal) {
            cast = castVertical;
        } else if (!castVertical) {
            cast = castHorizontal;
        } else {
            const dHorizontal = distance(start, castHorizontal);
            const dVertical = distance(start, castVertical);
            cast = dHorizontal < dVertical ? castHorizontal : castVertical;
        }

        if (!cast) return null;

        const distanceToImpact = distance(start, cast);
        if (maxDistance && distanceToImpact > maxDistance) return null;

        out.impact.x = cast.x;
        out.impact.y = cast.y;
        out.distance = distanceToImpact;

        return out;
    }

    private castAgainstHorizontal(
        ray: Ray,
        startX: number,
        startY: number,
        angle: number,
    ) {
        const pointingDown = Math.sin(angle) > 0;

        const y = Math.floor(startY / this.cellSize) * this.cellSize + (pointingDown ? this.cellSize : 0);
        const x = startX + (y - startY) / Math.tan(angle);

        const yStep = pointingDown ? this.cellSize : -this.cellSize;
        const xStep = yStep / Math.tan(angle);

        return this.doCast(
            ray,
            x,
            y,
            xStep,
            yStep,
            0,
            pointingDown ? 0 : -this.cellSize * 0.1,
            this.reusableHorizontalCast,
        );
    }

    private castAgainstVertical(
        ray: Ray,
        startX: number,
        startY: number,
        angle: number,
    ): Vector2Like | null {
        const pointingRight = Math.cos(angle) > 0;

        const x = Math.floor(startX / this.cellSize) * this.cellSize + (pointingRight ? this.cellSize : 0);
        const y = startY + (x - startX) * Math.tan(angle);

        const xStep = pointingRight ? this.cellSize : -this.cellSize;
        const yStep = xStep * Math.tan(angle);

        return this.doCast(
            ray,
            x,
            y,
            xStep,
            yStep,
            pointingRight ? 0 : -this.cellSize * 0.1,
            0,
            this.reusableVerticalCast,
        );
    }

    private doCast(
        ray: Ray,
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

        const distancePerStep = Math.hypot(xStep, yStep);
        let totalDistance = pointDistance(ray.start.x, ray.start.y, startX, startY);

        let x = startX;
        let y = startY;

        while (true) {
            const row = Math.floor((y + epsilonY) / this.cellSize);
            const col = Math.floor((x + epsilonX) / this.cellSize);

            if (!isBetween(0, x, this.width) || !isBetween(0, y, this.height)) {
                // Out of bounds
                return null;
            }

            const cell = this.matrix.get(row, col);
            if (this.isObstacle(cell)) {
                // Got a block!
                out.x = x;
                out.y = y;
                return out;
            }

            x += xStep;
            y += yStep;
            totalDistance += distancePerStep;

            if (totalDistance > ray.maxDistance) {
                return null;
            }
        }
    }
}
