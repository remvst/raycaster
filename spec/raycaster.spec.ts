import Matrix from '@remvst/matrix';
import { Raycaster } from '../src/raycaster';

const ERROR_MARGIN = 0.01;

describe('a raycaster', () => {

    let matrix: Matrix<number>;
    let raycaster: Raycaster;

    beforeEach(() => {
        matrix = new Matrix([
            [1, 1, 1, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1],
        ]);

        raycaster = new Raycaster();
    });

    it('cannot cast a ray from the outside', () => {
        const cast = raycaster.castRay(matrix, 10, 15, -5, 0);
        expect(cast).toBe(null);
    });

    it('cannot cast a ray from the inside and hit an edge outside', () => {
        const cast = raycaster.castRay(matrix, 10, 35, 3, -Math.PI / 4);
        expect(cast).toBe(null);
    });

    it('can cast a simple ray straight to the right', () => {
        const cast = raycaster.castRay(matrix, 10, 15, 15, 0)?.impact;
        expect(cast!.x).toBeCloseTo(60, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(15, ERROR_MARGIN);
    });

    it('can cast a simple ray straight to the left', () => {
        const cast = raycaster.castRay(matrix, 10, 55, 15, Math.PI)?.impact;
        expect(cast!.x).toBeCloseTo(10, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(15, ERROR_MARGIN);
    });

    it('can cast a simple ray straight to the bottom', () => {
        const cast = raycaster.castRay(matrix, 10, 15, 15, Math.PI / 2)?.impact;
        expect(cast!.x).toBeCloseTo(15, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(40, ERROR_MARGIN);
    });

    it('can cast a simple ray straight to the top', () => {
        const cast = raycaster.castRay(matrix, 10, 15, 39, -Math.PI / 2)?.impact;
        expect(cast!.x).toBeCloseTo(15, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(10, ERROR_MARGIN);
    });

    it('can cast a simple ray to the right with a slight angle', () => {
        const cast = raycaster.castRay(matrix, 10, 15, 15, Math.PI / 16)?.impact;
        expect(cast!.x).toBeCloseTo(40.13, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(20, ERROR_MARGIN);
    });

    it('can cast a simple ray to the bottom with a slight angle', () => {
        const cast = raycaster.castRay(matrix, 10, 15, 15, Math.PI / 2 + Math.PI / 8)?.impact;
        expect(cast!.x).toBeCloseTo(10.02, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(27.07, ERROR_MARGIN);
    });

    it('can cast a simple ray to the right but stop before the max distance', () => {
        const cast = raycaster.castRay(matrix, 10, 15, 15, 0, 20);
        expect(cast).toBe(null);
    });

    it('can cast a simple ray and returns the impact if it is right at the max distance', () => {
        const cast = raycaster.castRay(matrix, 10, 15, 15, 0, 45)?.impact;
        expect(cast!.x).toBeCloseTo(60, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(15, ERROR_MARGIN);
    });

    it('can cast a simple ray and returns null if it is right below the max distance', () => {
        const cast = raycaster.castRay(matrix, 10, 15, 15, 0, 44);
        expect(cast).toBe(null);
    });

    it('can cast a simple ray that goes outside the matrix', () => {
        const cast = raycaster.castRay(matrix, 10, 15, 35, 0);
        expect(cast).toBe(null);
    });

    it('can hit a cell right away', () => {
        const cast = raycaster.castRay(matrix, 10, 5, 0, Math.PI / 2)?.impact;
        expect(cast!.x).toBeCloseTo(5, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(0, ERROR_MARGIN);
    });
});
