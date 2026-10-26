import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pdfTextLines} from '../app/pdf.js';
import {parse} from '../app/core.js';
test('PDF table cells are grouped by row and sorted visually before parsing',()=>{
 const cell=(str,x,y)=>({str,transform:[1,0,0,1,x,y]});
 const text=pdfTextLines([cell('13-17',400,500),cell('Platelets',20,480),cell('14.2',220,501),cell('Hemoglobin',20,500),cell('g/dL',280,500),cell('250',220,480),cell('10^9/L',280,480),cell('150-400',400,480)]);
 assert.deepEqual(parse(text),[{name:'Hemoglobin',value:14.2,unit:'g/dL',low:'13',high:'17'},{name:'Platelets',value:250,unit:'10^9/L',low:'150',high:'400'}]);
});
test('PDF blank text objects and non-text objects are ignored',()=>{
 assert.equal(pdfTextLines([{type:'beginMarkedContent'},{str:' ',transform:[1,0,0,1,0,0]}]),'');
});
