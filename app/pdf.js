import {parse} from './core.js';

// Reconstruct visual rows even when a PDF stores each table cell separately.
export function pdfTextLines(items){
 const rows=[];
 for(const item of items){
  if(typeof item.str!=='string'||!item.str.trim()||!item.transform)continue;
  const x=item.transform[4],y=item.transform[5];
  let row=rows.find(r=>Math.abs(r.y-y)<2);
  if(!row){row={y,cells:[]};rows.push(row);}
  row.cells.push({x,text:item.str});
 }
 return rows.sort((a,b)=>b.y-a.y).map(r=>r.cells.sort((a,b)=>a.x-b.x).map(c=>c.text.trim()).join(' ')).join('\n');
}

export async function readPdf(file,{recognize,onProgress,onPreview,isCurrent=()=>true}){
 const pdfjs=await import('./vendor/pdfjs/pdf.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdfjs/pdf.worker.mjs',import.meta.url).href;
 const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,
  cMapUrl:new URL('./vendor/pdfjs/cmaps/',import.meta.url).href,cMapPacked:true,
  standardFontDataUrl:new URL('./vendor/pdfjs/standard_fonts/',import.meta.url).href,
  wasmUrl:new URL('./vendor/pdfjs/wasm/',import.meta.url).href});
 try{
  const pdf=await task.promise;
  if(pdf.numPages>20)throw Error('This PDF has more than 20 pages. Upload a smaller report.');
  const texts=[];
  for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
   if(!isCurrent())throw Error('Reading cancelled.');
   onProgress(`Reading PDF page ${pageNumber} of ${pdf.numPages}…`);
   const page=await pdf.getPage(pageNumber);
   let text=pdfTextLines((await page.getTextContent()).items);
   // Image-only PDFs and unrecognised table layouts get an on-device OCR pass.
   if(pageNumber===1||!parse(text).length){
    const natural=page.getViewport({scale:1});
    const scale=Math.min(2,2400/Math.max(natural.width,natural.height));
    const viewport=page.getViewport({scale});
    const canvas=document.createElement('canvas');
    canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    try{
     await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
     if(pageNumber===1&&isCurrent())onPreview(canvas.toDataURL('image/png'));
     if(!parse(text).length){
      onProgress(`Reading scanned PDF page ${pageNumber} of ${pdf.numPages}…`);
      text=(await recognize(canvas)).data.text;
     }
    }finally{canvas.width=0;canvas.height=0;}
   }
   texts.push(text);page.cleanup();
  }
  return {text:texts.join('\n\n'),pages:pdf.numPages};
 }catch(error){
  if(error.name==='PasswordException')throw Error('This PDF is password protected. Upload an unlocked copy.');
  if(error.name==='InvalidPDFException')throw Error('This PDF could not be opened. Check the file and try again.');
  throw error;
 }finally{await task.destroy();}
}
