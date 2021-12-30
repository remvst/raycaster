'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointDistance = void 0;
function pointDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}
exports.pointDistance = pointDistance;
;
