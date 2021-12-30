import Matrix from '@remvst/matrix';
interface Vector2 {
    x: number;
    y: number;
}
export default class Raycaster {
    castRay(matrix: Matrix<any | null>, cellSize: number, startX: number, startY: number, angle: number, maxDistance?: number): Vector2 | null;
    castAgainstHorizontal(matrix: Matrix<any | null>, cellSize: number, startX: number, startY: number, angle: number): Vector2 | null;
    castAgainstVertical(matrix: Matrix<any | null>, cellSize: number, startX: number, startY: number, angle: number): Vector2 | null;
    doCast(matrix: Matrix<any | null>, cellSize: number, startX: number, startY: number, xStep: number, yStep: number, epsilonX: number, epsilonY: number): Vector2 | null;
}
export {};
