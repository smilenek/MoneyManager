globalThis.MediaStore={
 async open(){return new Promise((resolve,reject)=>{const r=indexedDB.open('capmoney-media',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});},
 async operation(mode,callback){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('files',mode),r=callback(tx.objectStore('files'));tx.oncomplete=()=>{db.close();resolve(r.result)};tx.onerror=tx.onabort=()=>{db.close();reject(tx.error||Error('Không thể hoàn tất lưu video.'))}});},
 put(id,blob){return this.operation('readwrite',s=>s.put(blob,id))},
 get(id){return this.operation('readonly',s=>s.get(id))},
 delete(id){return this.operation('readwrite',s=>s.delete(id))},
 async record(video){
  if(!navigator.mediaDevices?.getUserMedia||!globalThis.MediaRecorder)throw Error('Trình duyệt này không hỗ trợ quay video. Hãy chọn video có sẵn.');
  const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:640,height:480},audio:false});
  const stop=()=>{stream.getTracks().forEach(t=>t.stop());video.srcObject=null;};
  try{
   video.srcObject=stream;await video.play();
   return await new Promise((resolve,reject)=>{
    const chunks=[],recorder=new MediaRecorder(stream,{videoBitsPerSecond:400000});
    let timer;
    recorder.ondataavailable=e=>chunks.push(e.data);
    recorder.onerror=e=>{clearTimeout(timer);stop();reject(e.error||Error('Không quay được video.'));};
    recorder.onstop=()=>{clearTimeout(timer);stop();resolve(new Blob(chunks,{type:recorder.mimeType}));};
    recorder.start();timer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},3000);
   });
  }catch(error){stop();throw error;}
 },
 async duration(file){return new Promise((resolve,reject)=>{const video=document.createElement('video'),url=URL.createObjectURL(file);video.preload='metadata';video.onloadedmetadata=()=>{URL.revokeObjectURL(url);resolve(video.duration)};video.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Không đọc được video.'))};video.src=url;});}
};
