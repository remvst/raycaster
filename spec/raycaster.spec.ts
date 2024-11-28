import Matrix from '@remvst/matrix';
import { Raycaster } from '../src/raycaster';

const ERROR_MARGIN = 0.01;

describe('a raycaster', () => {

    let matrix: Matrix<number>;
    let raycaster: Raycaster<number>;

    beforeEach(() => {
        matrix = new Matrix([
            [1, 1, 1, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1],
        ]);

        raycaster = new Raycaster(
            matrix,
            10,
            (cell) => cell === 1,
        );
    });

    it('cannot cast a ray from the outside', () => {
        const cast = raycaster.castRay({ start: { 'x': 15, 'y': -5 }, angle: 0 });
        expect(cast).toBe(null);
    });

    it('cannot cast a ray from the inside and hit an edge outside', () => {
        const cast = raycaster.castRay({ start: { 'x': 35, 'y': 3 }, angle: -Math.PI / 4 });
        expect(cast).toBe(null);
    });

    it('can cast a simple ray straight to the right', () => {
        const cast = raycaster.castRay({ start: { 'x': 15, 'y': 15 }, angle: 0 })?.impact;
        expect(cast!.x).toBeCloseTo(60, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(15, ERROR_MARGIN);
    });

    it('can cast a simple adapted ray straight to the right', () => {
        const adapted = raycaster.adaptRay({ start: { 'x': 15, 'y': 15 }, angle: 0 });
        const cast = raycaster.castRay(adapted)?.impact;
        expect(cast!.x).toBeCloseTo(60, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(15, ERROR_MARGIN);
    });

    it('can cast a ray from the outside that does not intersect with the matrix', () => {
        const adapted = raycaster.adaptRay({ start: { 'x': Number.MAX_SAFE_INTEGER, 'y': 400 }, angle: 0 });
        expect(raycaster.castRay(adapted)).toBe(null);
    });

    it('can cast a simple ray straight to the right from the outside', () => {
        const adapted = raycaster.adaptRay({ start: { 'x': -20, 'y': 15 }, angle: 0 });
        const cast = raycaster.castRay(adapted)?.impact;
        expect(cast!.x).toBeCloseTo(0, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(15, ERROR_MARGIN);
    });

    it('can cast a simple ray straight to the right from the outside with a maxDistance', () => {
        const adapted = raycaster.adaptRay({ start: { 'x': -20, 'y': 15 }, angle: 0, maxDistance: 2 });
        expect(raycaster.castRay(adapted)).toBe(null);
    });

    it('can cast a simple ray straight to the left', () => {
        const cast = raycaster.castRay({ start: { 'x': 55, 'y': 15 }, angle: Math.PI })?.impact;
        expect(cast!.x).toBeCloseTo(10, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(15, ERROR_MARGIN);
    });

    it('can cast a simple ray straight to the left from the outside', () => {
        const adapted = raycaster.adaptRay({ start: { 'x': 100, 'y': 35 }, angle: Math.PI });
        const cast = raycaster.castRay(adapted)?.impact;
        expect(cast!.x).toBeCloseTo(10, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(35, ERROR_MARGIN);
    });

    it('can cast a simple ray straight to the bottom', () => {
        const cast = raycaster.castRay({ start: { 'x': 15, 'y': 15 }, angle: Math.PI / 2 })?.impact;
        expect(cast!.x).toBeCloseTo(15, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(40, ERROR_MARGIN);
    });

    it('can cast a simple ray straight to the bottom from the outside', () => {
        const adapted = raycaster.adaptRay({ start: { 'x': 15, 'y': -100 }, angle: Math.PI / 2 });
        const cast = raycaster.castRay(adapted)?.impact;
        expect(cast!.x).toBeCloseTo(15, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(0, ERROR_MARGIN);
    });

    it('can cast a simple ray straight to the top', () => {
        const cast = raycaster.castRay({ start: { 'x': 15, 'y': 39 }, angle: -Math.PI / 2 })?.impact;
        expect(cast!.x).toBeCloseTo(15, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(10, ERROR_MARGIN);
    });

    it('can cast a simple ray straight to the top from the outside', () => {
        const adapted = raycaster.adaptRay({ start: { 'x': 15, 'y': 100 }, angle: -Math.PI / 2 });
        const cast = raycaster.castRay(adapted)?.impact;
        expect(cast!.x).toBeCloseTo(15, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(50, ERROR_MARGIN);
    });

    it('can cast a ray that never even hits the matrix', () => {
        const adapted = raycaster.adaptRay({ start: { 'x': -100, 'y': -100 }, angle: 0 });
        expect(raycaster.castRay(adapted)).toBe(null);
    });

    it('can cast a simple ray to the right with a slight angle', () => {
        const cast = raycaster.castRay({ start: { 'x': 15, 'y': 15 }, angle: Math.PI / 16 })?.impact;
        expect(cast!.x).toBeCloseTo(40.13, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(20, ERROR_MARGIN);
    });

    it('can cast a simple ray to the bottom with a slight angle', () => {
        const cast = raycaster.castRay({ start: { 'x': 15, 'y': 15 }, angle: Math.PI / 2 + Math.PI / 8 })?.impact;
        expect(cast!.x).toBeCloseTo(10.02, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(27.07, ERROR_MARGIN);
    });

    it('can cast a simple ray to the right but stop before the max distance', () => {
        const cast = raycaster.castRay({ start: { 'x': 15, 'y': 15 }, angle: 0, maxDistance: 20 });
        expect(cast).toBe(null);
    });

    it('can cast a simple ray and returns the impact if it is right at the max distance', () => {
        const cast = raycaster.castRay({ start: { 'x': 15, 'y': 15 }, angle: 0, maxDistance: 45 })?.impact;
        expect(cast!.x).toBeCloseTo(60, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(15, ERROR_MARGIN);
    });

    it('can cast a simple ray and returns null if it is right below the max distance', () => {
        const cast = raycaster.castRay({ start: { 'x': 15, 'y': 15 }, angle: 0, maxDistance: 44 });
        expect(cast).toBe(null);
    });

    it('can cast a simple ray that goes outside the matrix', () => {
        const cast = raycaster.castRay({ start: { 'x': 15, 'y': 35 }, angle: 0 });
        expect(cast).toBe(null);
    });

    it('can hit a cell right away', () => {
        const cast = raycaster.castRay({ start: { 'x': 5, 'y': 0 }, angle: Math.PI / 2 })?.impact;
        expect(cast!.x).toBeCloseTo(5, ERROR_MARGIN);
        expect(cast!.y).toBeCloseTo(0, ERROR_MARGIN);
    });
});
