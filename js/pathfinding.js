function findPath(sx, sy, ex, ey, levelMap) {
    let q = [[{x: sx, y: sy}]], v = new Set([sx + "," + sy]);
    while (q.length > 0) {
        let p = q.shift(), curr = p[p.length - 1];
        if (curr.x === ex && curr.y === ey) return p;
        let dirs = [{x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0},{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1}];
        for (let d of dirs) {
            let nx = curr.x + d.x, ny = curr.y + d.y;
            if (nx>=0 && nx<8 && ny>=0 && ny<8 && levelMap[ny][nx] !== 1) {
                if (Math.abs(d.x) === 1 && Math.abs(d.y) === 1) {
                    if (levelMap[curr.y][nx] === 1 || levelMap[ny][curr.x] === 1) continue;
                }
                if (!v.has(nx + "," + ny)) {
                    v.add(nx + "," + ny);
                    q.push([...p, {x: nx, y: ny}]);
                }
            }
        }
    }
    return null;
}
