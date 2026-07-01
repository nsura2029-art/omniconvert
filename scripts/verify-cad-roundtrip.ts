import { stlToObj, objToStl } from '../src/lib/cad-conversion';

const stlIn = `solid cube
facet normal 0 0 -1
  outer loop
    vertex 0 0 0
    vertex 1 0 0
    vertex 1 1 0
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex 0 0 1
    vertex 1 0 1
    vertex 1 1 1
  endloop
endfacet
endsolid cube
`;

const obj = stlToObj(stlIn);
const stlOut = objToStl(obj);
const vertsObj = (obj.match(/^v /gm) || []).length;
const facesObj = (obj.match(/^f /gm) || []).length;
const facetsStl = (stlOut.match(/facet normal/g) || []).length;
const vertsStl = (stlOut.match(/vertex/g) || []).length;

console.log(`STL→OBJ : ${vertsObj} vertices, ${facesObj} faces`);
console.log(`OBJ→STL : ${facetsStl} facets, ${vertsStl} vertex rows`);
const pass = vertsObj === 6 && facesObj === 2 && facetsStl === 2 && vertsStl === 6;
console.log(`Round-trip integrity: ${pass ? 'PASS ✓' : 'FAIL ✗'}`);
if (!pass) process.exit(1);
