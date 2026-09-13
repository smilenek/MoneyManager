'use strict';
const addressCache=new Map();let lastAddressRequest=0;
async function reverseAddress(latitude,longitude,signal){
 const key=latitude+','+longitude;
 if(addressCache.has(key))return addressCache.get(key);
 const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 if(!local&&Date.now()-lastAddressRequest<1100)throw Error('Hãy đợi một giây trước khi thử lại.');
 const url=local?'api/location?'+new URLSearchParams({lat:latitude,lon:longitude}):'https://nominatim.openstreetmap.org/reverse?'+new URLSearchParams({lat:latitude,lon:longitude,format:'jsonv2',zoom:'18','accept-language':'vi'});
 lastAddressRequest=Date.now();
 const response=await fetch(url,{signal,referrerPolicy:'origin'});
 if(!response.ok)throw Error('Dịch vụ địa chỉ đang bận. Bạn có thể nhập địa chỉ hoặc chọn địa điểm đã dùng.');
 const data=await response.json(),address=data.address&&typeof data.address==='string'?data.address:data.display_name;
 if(!address)throw Error('Chưa tìm thấy địa chỉ. Bạn có thể nhập thủ công.');
 if(addressCache.size>=100)addressCache.delete(addressCache.keys().next().value);
 addressCache.set(key,address);return address;
}
function bindLocation(){
 const button=$('[data-action=locate]'),status=$('#locationStatus'),lat=$('#form [name=latitude]'),lng=$('#form [name=longitude]'),place=$('#form [name=place]'),dialog=$('#dialog');
 let busy=false,controller=null,cancelled=false;
 const stop=()=>{cancelled=true;controller?.abort();};dialog.addEventListener('close',stop,{once:true});
 button.onclick=async e=>{
  e.preventDefault();e.stopPropagation();if(busy)return;
  if(!navigator.geolocation){status.textContent='Thiết bị không hỗ trợ định vị. Bạn có thể nhập thủ công.';return;}
  busy=true;button.disabled=true;status.textContent='Đang lấy vị trí…';
  controller=new AbortController();let timer;
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Object.assign(Error('Chưa có kết quả sau 2 giây. Bạn có thể thử lại, chọn địa điểm đã dùng hoặc nhập địa chỉ; không cần chờ để lưu giao dịch.'),{name:'LocationTimeout'}));},2000);});
  const wait=promise=>Promise.race([promise,deadline]);
  const initial={lat:lat.value,lng:lng.value,place:place.value};
  try{
   const p=await wait(new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,maximumAge:30000,timeout:1800})));
   if(cancelled||!button.isConnected||!dialog.open)return;
   if(lat.value!==initial.lat||lng.value!==initial.lng){status.textContent='Bạn đã sửa tọa độ. Đã giữ nội dung nhập tay.';return;}
   const latitude=p.coords.latitude.toFixed(6),longitude=p.coords.longitude.toFixed(6);
   lat.value=latitude;lng.value=longitude;
   status.textContent='Đã lấy tọa độ (sai số khoảng '+Math.round(p.coords.accuracy)+' m). Đang tìm địa chỉ…';
   {
    const address=await wait(reverseAddress(latitude,longitude,controller.signal));
    if(cancelled||!button.isConnected||!dialog.open)return;
    if(place.value===initial.place&&lat.value===latitude&&lng.value===longitude){place.value=address;status.textContent='Đã điền địa chỉ gần vị trí của bạn. Sai số khoảng '+Math.round(p.coords.accuracy)+' m; hãy kiểm tra số nhà/ngõ.';}
    else status.textContent='Đã giữ nội dung bạn vừa chỉnh sửa.';
   }
  }catch(error){if(!cancelled&&button.isConnected)status.textContent=error.code===1?'Chưa được cấp quyền vị trí. Cho phép vị trí trong cài đặt trình duyệt hoặc nhập thủ công.':error.code===3?'Chưa nhận được vị trí trong 2 giây. Chọn địa điểm đã dùng hoặc thử lại.':error.name==='AbortError'?'Chưa tra kịp địa chỉ trong 2 giây. Tọa độ đã có; bạn có thể nhập địa chỉ hoặc lưu ngay.':error.message||'Chưa lấy được vị trí. Hãy thử lại hoặc nhập thủ công.';}
  finally{clearTimeout(timer);busy=false;button.disabled=false;}
 };
}

function recentPlaces(){const seen=new Set();return [...state.transactions].reverse().filter(t=>{if(!t.place||seen.has(t.place))return false;seen.add(t.place);return true;}).slice(0,30);}
