'use strict';
function bindLocation(){
 const button=$('[data-action=locate]'),status=$('#locationStatus'),lat=$('#form [name=latitude]'),lng=$('#form [name=longitude]'),place=$('#form [name=place]'),dialog=$('#dialog');
 let busy=false,controller=null,cancelled=false;
 const stop=()=>{cancelled=true;controller?.abort();};dialog.addEventListener('close',stop,{once:true});
 button.onclick=async e=>{
  e.preventDefault();e.stopPropagation();if(busy)return;
  if(!navigator.geolocation){status.textContent='Thiết bị không hỗ trợ định vị. Bạn có thể nhập thủ công.';return;}
  busy=true;button.disabled=true;status.textContent='Đang lấy vị trí…';
  const initial={lat:lat.value,lng:lng.value,place:place.value};
  try{
   const p=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,maximumAge:30000,timeout:5000}));
   if(cancelled||!button.isConnected||!dialog.open)return;
   if(lat.value!==initial.lat||lng.value!==initial.lng){status.textContent='Bạn đã sửa tọa độ. Đã giữ nội dung nhập tay.';return;}
   const latitude=p.coords.latitude.toFixed(6),longitude=p.coords.longitude.toFixed(6);
   lat.value=latitude;lng.value=longitude;
   status.textContent='Đã lấy tọa độ (sai số khoảng '+Math.round(p.coords.accuracy)+' m). Đang tìm địa chỉ…';
   controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
   try{
    const response=await fetch('api/location?'+new URLSearchParams({lat:latitude,lon:longitude}),{signal:controller.signal});
    if(!response.headers.get('content-type')?.includes('application/json'))throw Error('Tra địa chỉ cần máy chủ serve.cjs.');
    const data=await response.json();if(!response.ok)throw Error(data.error);
    if(cancelled||!button.isConnected||!dialog.open)return;
    if(place.value===initial.place&&lat.value===latitude&&lng.value===longitude){place.value=data.address;status.textContent='Đã điền địa chỉ gần vị trí của bạn. Sai số khoảng '+Math.round(p.coords.accuracy)+' m; hãy kiểm tra số nhà/ngõ.';}
    else status.textContent='Đã giữ nội dung bạn vừa chỉnh sửa.';
   }finally{clearTimeout(timeout);}
  }catch(error){if(!cancelled&&button.isConnected)status.textContent=error.code===1?'Chưa được cấp quyền vị trí. Cho phép vị trí trong cài đặt trình duyệt hoặc nhập thủ công.':error.code===3?'Chưa lấy được vị trí sau 5 giây. Hãy thử lại ở nơi có tín hiệu tốt.':error.name==='AbortError'?'Tra địa chỉ quá lâu. Tọa độ đã có; bạn có thể nhập địa chỉ thủ công.':error.message||'Chưa lấy được vị trí. Hãy thử lại hoặc nhập thủ công.';}
  finally{busy=false;button.disabled=false;}
 };
}
