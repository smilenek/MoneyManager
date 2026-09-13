// On-demand reverse geocoding only. One upstream request at a time, >= 1 s apart.
function createGeocoder({fetcher=fetch,endpoint=process.env.GEOCODE_URL||'https://nominatim.openstreetmap.org/reverse'}={}){
 const cache=new Map();let pending=null,last=0;
 return async function handle(req,res,url){
  if(url.pathname!=='/api/location')return false;
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));return true;};
  if(req.method!=='GET')return send(405,{error:'Chỉ hỗ trợ GET.'});
  const lat=Number(url.searchParams.get('lat')),lon=Number(url.searchParams.get('lon'));
  if(!url.searchParams.get('lat')||!url.searchParams.get('lon')||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return send(400,{error:'Tọa độ không hợp lệ.'});
  const key=lat.toFixed(5)+','+lon.toFixed(5),cached=cache.get(key);
  if(cached&&Date.now()-cached.time<86400000)return send(200,cached.data);
  if(pending||Date.now()-last<1100)return send(429,{error:'Đang tra địa chỉ khác. Hãy thử lại sau vài giây.'});
  last=Date.now();pending=true;
  try{
   const target=new URL(endpoint);target.search=new URLSearchParams({format:'jsonv2',lat:String(lat),lon:String(lon),zoom:'18',addressdetails:'1','accept-language':'vi'});
   const r=await fetcher(target,{headers:{'User-Agent':'MoneyTrackPWA/2.1 (user-requested reverse geocoding)'},signal:AbortSignal.timeout(7000)});
   if(!r.ok)throw Error('Dịch vụ địa chỉ đang bận.');
   const body=await r.json();if(!body.display_name)throw Error('Chưa tìm thấy địa chỉ tại tọa độ này.');
   const data={address:String(body.display_name).slice(0,500),attribution:'© OpenStreetMap contributors'};
   if(cache.size>=200)cache.delete(cache.keys().next().value);cache.set(key,{time:Date.now(),data});return send(200,data);
  }catch(e){return send(502,{error:'Chưa tra được địa chỉ. Tọa độ vẫn dùng được; bạn có thể nhập địa chỉ thủ công.'});}
  finally{pending=null;}
 };
}
module.exports={createGeocoder};
