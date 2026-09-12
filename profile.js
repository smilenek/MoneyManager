'use strict';
async function resizeAvatar(file){
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('Chọn ảnh JPG, PNG hoặc WebP tối đa 10 MB.');
 const url=URL.createObjectURL(file),image=new Image();
 try{
  image.src=url;await image.decode();
  const edge=Math.min(image.naturalWidth,image.naturalHeight);
  if(!edge)throw Error('Không đọc được ảnh.');
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=384;
  const context=canvas.getContext('2d');
  context.fillStyle='#263548';context.fillRect(0,0,384,384);
  context.drawImage(image,(image.naturalWidth-edge)/2,(image.naturalHeight-edge)/2,edge,edge,0,0,384,384);
  return canvas.toDataURL('image/jpeg',.82);
 }finally{URL.revokeObjectURL(url);}
}
function editProfile(){
 let preview=state.avatar||null,loading=Promise.resolve(),error=null,revision=0;
 modal('Chỉnh sửa hồ sơ',`<div class="profile-avatar avatar-preview" id="avatarPreview">${avatarMarkup()}</div>${field('Tên hiển thị','user',state.user,'text','required maxlength="40"')}<label class="avatar-upload">Chọn ảnh đại diện<input name="avatarFile" type="file" accept="image/jpeg,image/png,image/webp"></label><p class="muted">Ảnh được cắt vuông ở giữa và thu nhỏ để tiết kiệm dung lượng. Chỉ lưu trên thiết bị cùng bản sao lưu.</p><button type="button" id="removeAvatar" class="danger full">Bỏ ảnh đại diện</button><p id="avatarStatus" role="status"></p>`,async f=>{
  await loading;if(error)throw error;
  const next=structuredClone(state);next.user=f.get('user').trim();
  if(!next.user)throw Error('Nhập tên hiển thị.');next.avatar=preview;commit(next);
 });
 const status=$('#avatarStatus'),previewElement=$('#avatarPreview');
 $('#form [name=avatarFile]').onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  const current=++revision;error=null;status.textContent='Đang chuẩn bị ảnh…';
  loading=resizeAvatar(file).then(data=>{if(current!==revision)return;preview=data;previewElement.innerHTML=`<img src="${esc(data)}" alt="Ảnh xem trước">`;status.textContent='Ảnh đã sẵn sàng. Nhấn Lưu để áp dụng.';}).catch(err=>{if(current!==revision)return;error=err;status.textContent=err.message;});
 };
 $('#removeAvatar').onclick=e=>{e.stopPropagation();revision++;preview=null;error=null;$('#form [name=avatarFile]').value='';previewElement.textContent=state.user[0]||'N';status.textContent='Nhấn Lưu để bỏ ảnh.';};
}
