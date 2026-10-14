/* PhotoTools Studio 1.1.2 — CEP bridge to editable ExtendScript templates.
   Every imported project is local; no network, external imagery, or telemetry. */
(function(){'use strict';
var nodeRequire=(typeof require==='function')?require:(typeof window.require==='function'?window.require:null);
var fs=null,path=null,os=null;
try { if(nodeRequire){fs=nodeRequire('fs');path=nodeRequire('path');os=nodeRequire('os');} }catch(ignore){}
var dom={sel:document.getElementById('project'),fields:document.getElementById('fields'),desc:document.getElementById('description'),run:document.getElementById('run'),imp:document.getElementById('import'),remove:document.getElementById('remove'),reload:document.getElementById('reload'),chooser:document.getElementById('chooser'),status:document.getElementById('status')};
var projects=[],selected=null,cache={},root='',userDir='';
function setStatus(msg,typ){dom.status.textContent=msg;dom.status.className='status '+(typ||'');}
function fatal(msg){setStatus(msg,'error');dom.run.disabled=true;dom.imp.disabled=true;}
function sourceRoot(){
 var r=window.__adobe_cep__&&window.__adobe_cep__.getSystemPath('extension');
 if(!r)return '';
 try{r=decodeURI(r);}catch(e){}
 // CEP on Windows returns file:///C:/...; stripping only file:// leaves /C:/...
 // which Node resolves as \C:\... and makes the bundled projects invisible.
 r=r.replace(/^file:\/\/\/?/i,'');
 if(path.sep==='\\'){
  r=r.replace(/^[/\\]+(?=[A-Za-z]:[/\\])/,'');
  r=r.replace(/\//g,'\\');
 }
 return path.normalize(r);
}
function schemaOf(src){
 var m=src.replace(/^\uFEFF/,'').match(/^\/\/ PT_SCHEMA=(\{.*\})\s*$/m);
 if(!m)return {category:'Импортированные',description:'Этот JSX запускается без формы. Для настройки полей добавь строку PT_SCHEMA.',fields:[]};
 var v=JSON.parse(m[1]);if(!v.fields||!Array.isArray(v.fields))throw new Error('PT_SCHEMA: нужен массив fields');
 if(v.fields.length>50)throw new Error('PT_SCHEMA: слишком много полей');
 var ids={};for(var i=0;i<v.fields.length;i++){var f=v.fields[i];if(!/^[A-Za-z][A-Za-z0-9_]*$/.test(f.id)||ids[f.id])throw new Error('Неверное id поля: '+f.id);ids[f.id]=true;if(['text','number','textarea','select'].indexOf(f.type)<0)throw new Error('Неизвестный тип '+f.type);}
 return v;
}
function addFile(filename,builtin){
 if(!/\.jsx$/i.test(filename))return;
 try{
  var src=fs.readFileSync(filename,'utf8'),meta=schemaOf(src),name=path.basename(filename,'.jsx');
  projects.push({id:(builtin?'base:':'user:')+name,name:name,file:filename,builtin:builtin,meta:meta});
 }catch(e){setStatus('Пропущен повреждённый JSX: '+filename+' ('+e.message+')','error');}
}
function reload(prefer){
 var before=prefer||(selected&&selected.id);projects=[];
 var folder=path.join(root,'projects');
 if(!fs.existsSync(folder))throw new Error('Нет комплектных JSX: '+folder);
 fs.readdirSync(folder).forEach(function(n){addFile(path.join(folder,n),true);});
 if(!fs.existsSync(userDir))fs.mkdirSync(userDir,{recursive:true});
 fs.readdirSync(userDir).forEach(function(n){addFile(path.join(userDir,n),false);});
 projects.sort(function(a,b){return (a.meta.category||'').localeCompare(b.meta.category||'','ru')||a.name.localeCompare(b.name,'ru');});
 dom.sel.innerHTML='';var category='';
 projects.forEach(function(p){if((p.meta.category||'')!==category){category=p.meta.category||'Импортированные';var section=document.createElement('option');section.disabled=true;section.textContent='──── '+category+' ────';dom.sel.appendChild(section);}var op=document.createElement('option');op.textContent=p.name;op.value=p.id;dom.sel.appendChild(op);});
 selected=null;for(var i=0;i<projects.length;i++)if(projects[i].id===before){selected=projects[i];break;}
 if(!selected)selected=projects[0]||null;
 if(selected){dom.sel.value=selected.id;showForm();}else{dom.run.disabled=true;dom.fields.textContent='Проекты не найдены.';}
}
function takeValues(){
 if(!selected)return {};
 var result={};selected.meta.fields.forEach(function(f){var el=document.getElementById('field_'+f.id);if(!el)return;var value=el.value;
  if(f.array||f.id==='specialties')value=value.split(/\r?\n/).map(function(x){return x.trim();}).filter(Boolean);
  else if(f.type==='number')value=Number(value)||0;
  result[f.id]=value;
 });return result;
}
function remember(){if(selected)cache[selected.id]=takeValues();}
function showForm(){
 dom.fields.innerHTML='';if(!selected)return;
 dom.desc.textContent=selected.meta.description||'';dom.remove.hidden=selected.builtin;dom.run.disabled=false;
 var old=cache[selected.id]||{};
 if(!selected.meta.fields.length){dom.fields.textContent='У проекта нет дополнительных полей.';return;}
 selected.meta.fields.forEach(function(f){
  var wrap=document.createElement('div');wrap.className='field';var label=document.createElement('label');label.textContent=f.label||f.id;label.htmlFor='field_'+f.id;
  var control;
  if(f.type==='textarea')control=document.createElement('textarea');
  else if(f.type==='select'){control=document.createElement('select');(f.options||[]).forEach(function(o){var item=document.createElement('option');item.value=typeof o==='string'?o:o.value;item.textContent=typeof o==='string'?o:o.label||o.value;control.appendChild(item);});}
  else{control=document.createElement('input');control.type=f.type==='number'?'number':'text';}
  control.id='field_'+f.id;
  var value=Object.prototype.hasOwnProperty.call(old,f.id)?old[f.id]:f.default;
  control.value=Array.isArray(value)?value.join('\n'):(value==null?'':String(value));
  control.addEventListener('change',remember);wrap.appendChild(label);wrap.appendChild(control);dom.fields.appendChild(wrap);
 });
}
function evalScript(jsx,callback){
 if(!window.__adobe_cep__||typeof window.__adobe_cep__.evalScript!=='function')throw new Error('Отсутствует CEP evalScript. Панель запущена вне Photoshop.');
 window.__adobe_cep__.evalScript(jsx,function(res){callback(String(res==null?'':res));});
}
function jsxString(s){return JSON.stringify(s).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
function execute(){
 if(!selected)return;
 remember();var cur=selected,config=takeValues();dom.run.disabled=true;setStatus('Выполняется «'+cur.name+'»…');
 var code='(function(){try{'+
   'if(app.documents.length===0)return "PT_ERROR: Сначала откройте фотографию.";'+
   '$.global.PT_CARD_CONF='+JSON.stringify(config)+';'+
   'var f=new File('+jsxString(cur.file.replace(/\\/g,'/'))+');'+
   'if(!f.exists)return "PT_ERROR: JSX не найден: "+f.fsName;'+
   '$.evalFile(f);return "PT_OK";'+
   '}catch(e){return "PT_ERROR: "+e.toString()+" (строка "+e.line+")";}'+
   'finally{$.global.PT_CARD_CONF=null;}})()';
 try{evalScript(code,function(result){dom.run.disabled=false;if(result==='PT_OK'){setStatus('Готово. Проверь PSD и слои Photoshop.','ok');}else if(result.indexOf('PT_ERROR:')===0){setStatus(result.slice(9),'error');}else{setStatus('Неожиданный ответ Photoshop: '+result,'error');}});}
 catch(e){dom.run.disabled=false;setStatus(e.message,'error');}
}
function copyProject(filePath){
 filePath=stripPath(filePath);
 if(!filePath||!fs.existsSync(filePath)){setStatus('Файл JSX не найден: '+filePath,'error');return false;}
 if(!/\.jsx$/i.test(filePath)){setStatus('Требуется файл .jsx','error');return false;}
 try{
  var data=fs.readFileSync(filePath,'utf8');schemaOf(data);
  var name=path.basename(filePath),dest=path.join(userDir,name);
  if(fs.existsSync(dest)){
   if(fs.readFileSync(dest,'utf8')===data){
    reload('user:'+name.replace(/\.jsx$/i,''));
    setStatus('Проект уже подключён: '+name+'.','ok');return true;
   }
   setStatus('Проект с таким именем уже есть. Переименуй JSX для новой версии: '+name,'error');return false;
  }
  fs.writeFileSync(dest,data,'utf8');
  reload('user:'+name.replace(/\.jsx$/i,''));
  setStatus('Добавлен проект «'+name.replace(/\.jsx$/i,'')+'».','ok');
  return true;
 }catch(e){setStatus('Ошибка импорта: '+e.message,'error');return false;}
}
// Avoid CEP's synchronous showOpenDialog: it can freeze the whole panel.
var importBox=null,importPath=null;
function stripPath(s){
 s=String(s||'').replace(/^\s+|\s+$/g,'');
 if((s.charAt(0)==='"'&&s.charAt(s.length-1)==='"')||
    (s.charAt(0)==="'"&&s.charAt(s.length-1)==="'")) s=s.slice(1,-1);
 return s;
}
function submitImport(){
 var p=stripPath(importPath.value);
 if(!p){setStatus('Вставь полный путь к файлу JSX или перетащи файл в область импорта.','error');return;}
 // Keep the form open on errors. This also avoids losing a manually pasted path.
 if(copyProject(p)) {importBox.hidden=true;importPath.value='';}
}
function importProject(){
 if(!importBox)return setStatus('Панель импорта не инициализирована. Перезапусти Photoshop.','error');
 importBox.hidden=!importBox.hidden;
 if(!importBox.hidden){importPath.focus();setStatus('Вставь путь к JSX (можно скопировать его из Проводника) либо перетащи JSX в рамку.');}
}
function initImportUI(){
 var box=document.createElement('div');
 box.id='pt-inline-import';box.hidden=true;
 box.style.cssText='margin-top:12px;padding:12px;border:1px dashed #bda476;border-radius:4px;background:#303030;';
 var title=document.createElement('div');
 title.textContent='ПОДКЛЮЧИТЬ ПРОЕКТ JSX';
 title.style.cssText='font-weight:bold;color:#d8bf91;font-size:11px;letter-spacing:.6px;margin-bottom:9px;';
 var hint=document.createElement('div');
 hint.textContent='Скопируй путь к файлу из Проводника (Shift + правая кнопка -> Копировать как путь) или перетащи JSX в эту область.';
 hint.style.cssText='font-size:11px;color:#bdbdbd;line-height:1.5;margin-bottom:8px;';
 var input=document.createElement('input');
 input.type='text';input.id='pt-import-path';input.placeholder='E:\\Coding\\...\\pilates_1_v5.jsx';
 input.style.cssText='width:100%;margin-bottom:6px;';
 var btn=document.createElement('button');
 btn.textContent='Добавить по пути';btn.className='secondary';
 var cancel=document.createElement('button');
 cancel.textContent='Отмена';cancel.className='secondary';
 btn.addEventListener('click',submitImport);
 cancel.addEventListener('click',function(){box.hidden=true;});
 input.addEventListener('keydown',function(e){if(e.key==='Enter'||e.keyCode===13){e.preventDefault();submitImport();}});
 function allowDrop(e){e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='copy';}
 function onDrop(e){
  e.preventDefault();
  var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
  if(f&&f.path){input.value=f.path;submitImport();}
  else setStatus('Не удалось определить путь перетащенного файла. Скопируй путь из Проводника.','error');
 }
 box.addEventListener('dragenter',allowDrop);
 box.addEventListener('dragover',allowDrop);
 box.addEventListener('drop',onDrop);
 box.appendChild(title);box.appendChild(hint);box.appendChild(input);
 box.appendChild(btn);box.appendChild(cancel);
 dom.imp.parentNode.appendChild(box);
 importBox=box;importPath=input;
}
function removeProject(){if(!selected||selected.builtin)return;var id=selected.id;try{fs.unlinkSync(selected.file);delete cache[id];reload();setStatus('Проект удалён из пользовательской папки.','ok');}catch(e){setStatus(e.message,'error');}}
function init(){
 dom.sel.addEventListener('change',function(){remember();selected=projects.filter(function(p){return p.id===dom.sel.value;})[0]||null;showForm();});
 dom.run.addEventListener('click',execute);dom.imp.addEventListener('click',importProject);dom.remove.addEventListener('click',removeProject);
 dom.reload.addEventListener('click',function(){remember();try{reload();setStatus('Список проектов обновлён.','ok');}catch(e){setStatus(e.message,'error');}});
 initImportUI();
 if(!fs||!path||!os){fatal('CEP не предоставил Node.js. Без файловой системы импорт JSX невозможен.');return;}
 root=sourceRoot();if(!root){fatal('Не удалось определить папку расширения Photoshop.');return;}
 // If CEP provides a malformed URI or the installation was moved, resolve our known
 // extension folder from the user's APPDATA rather than breaking the project selector.
 if(!fs.existsSync(path.join(root,'projects'))){
  var installed=path.join(process.env.APPDATA||path.join(os.homedir(),'AppData','Roaming'),'Adobe','CEP','extensions','com.denisnazarov.phototools.cards.cep');
  if(fs.existsSync(path.join(installed,'projects')))root=installed;
 }
 userDir=path.join(process.env.APPDATA||path.join(os.homedir(),'AppData','Roaming'),'PhotoTools','CardPanel','projects');
 try{reload();setStatus('Открой фотографию, выбери проект и создай PSD.','ok');}catch(e){fatal('Ошибка загрузки: '+e.message);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();