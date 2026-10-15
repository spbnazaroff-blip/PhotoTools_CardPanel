// PT_SCHEMA={"category":"FW Pilates • единый стиль","description":"FW PILATES / Команда / Тёмный премиум / 5 квалификаций. Единая серия: одинаковые шрифты, цвет, рамка, логотип, местоположение блоков; меняется лишь плотность списка.","fields":[{"id":"first","label":"Имя","type":"text","default":"Екатерина"},{"id":"last","label":"Фамилия","type":"text","default":"Назарова"},{"id":"role","label":"Основная должность","type":"text","default":"СЕРТИФИЦИРОВАННЫЙ ПРЕПОДАВАТЕЛЬ ПИЛАТЕСА"},{"id":"roleExtra","label":"Дополнительная квалификация под должностью","type":"text","default":""},{"id":"studio","label":"Бренд","type":"text","default":"FW PILATES"},{"id":"brandNote","label":"Описание бренда","type":"text","default":"СЕТЬ СТУДИЙ КЛАССИЧЕСКОГО ПИЛАТЕСА"},{"id":"location","label":"Город","type":"text","default":"САНКТ-ПЕТЕРБУРГ"},{"id":"motto","label":"Фраза сверху (каждая строка отдельно)","type":"textarea","array":true,"default":"ДВИЖЕНИЕ\nКАК ИСКУССТВО"},{"id":"section","label":"Заголовок квалификаций","type":"text","default":"МЕЖДУНАРОДНЫЕ ШКОЛЫ ПИЛАТЕСА:"},{"id":"credentials","label":"Квалификации (от 1 до 11, каждая с новой строки)","type":"textarea","array":true,"default":"Authentic Pilates Inelia Garcia (Бразилия)\nThe Pilates Standard (Швеция)\nТренер BLACKROLL, миофасциальные методики (Германия)\nТренер по функциональному тренингу, стретчингу\nУчастник международных и российских конвенций и воркшопов"},{"id":"footer","label":"Нижний слоган","type":"text","default":"ГАРМОНИЯ ДВИЖЕНИЯ • СИЛА • КОНТРОЛЬ"},{"id":"logoMode","label":"Оригинальный логотип","type":"select","default":"Оригинальный знак + текст","options":["Оригинальный знак + текст","Оригинальный логотип целиком","Только брендовый текст (вставлю логотип вручную)"]},{"id":"logoPath","label":"Путь к оригинальному PNG/PSD логотипа (необязательно)","type":"text","default":""},{"id":"logoBlend","label":"Фон логотипа","type":"select","default":"Сохранить как в файле","options":["Сохранить как в файле","Убрать чёрный фон"]},{"id":"photoShift","label":"Фото вправо (%) — регулируй под кадр","type":"number","default":18},{"id":"shadeStrength","label":"Затемнение слева (%) — 0…100","type":"number","default":94},{"id":"fontTitle","label":"Шрифт крупного имени","type":"select","default":"Оригинальный","options":["Оригинальный","Arial-BoldMT","Montserrat-Bold","Georgia-Bold"]}]}
// Adobe Photoshop ExtendScript (invoked by PhotoTools CEP)
// PhotoTools Studio / FW PILATES / TEAM UNIFIED / 5-11 QUALIFICATIONS / 2x3 / Photoshop ExtendScript.
// Only the currently open photo is raster. Every overlay is a Photoshop native
// gradient fill layer, shape layer, or editable Type layer. No auxiliary images.
(function () {
    var priorUnits=app.preferences.rulerUnits;
    var priorDialogs=app.displayDialogs;
    var src=null,doc=null,finished=false,step='Подготовка';
    var originalPhotoLayer=null;
    var C=$.global.PT_CARD_CONF||{};
    var DW=1024,DH=1536,W=0,H=0,SX=1,SY=1,S=1;
    var GOLD='#F5BD78',LIGHT='#FCF9F5',MUTED='#D6D3D0',DARK='#0F1218',PINK='#EC3978',ORANGE='#FFAA32';
    var countType=0,countShape=0;
    function trim(t){return String(t===undefined||t===null?'':t).replace(/^\s+|\s+$/g,'');}
    function str(k,def){var v=trim(C[k]);return v?v:def;}
    function nval(k,def,lo,hi){var n=Number(C[k]);if(!isFinite(n))n=def;return Math.min(hi,Math.max(lo,n));}
    function arr(k,defaults){var v=C[k];if(v instanceof Array)return v; if(typeof v==='string')return v.split(/\r?\n/);return defaults;}
    function sid(a){return stringIDToTypeID(a);}
    function px(v){return UnitValue(v,'px');}
    function color(h){var c=new SolidColor();c.rgb.hexValue=h.replace('#','');return c;}
    function rgbDesc(h){var z=h.replace('#',''),d=new ActionDescriptor();d.putDouble(sid('red'),parseInt(z.substring(0,2),16));d.putDouble(sid('green'),parseInt(z.substring(2,4),16));d.putDouble(sid('blue'),parseInt(z.substring(4,6),16));return d;}
    function group(name){var g=doc.layerSets.add();g.name=name;return g;}
    function into(l,g){l.move(g,ElementPlacement.INSIDE);return l;}
    function layerBounds(l){var b=l.bounds;return [b[0].as('px'),b[1].as('px'),b[2].as('px'),b[3].as('px')];}
    function shape(kind,name,x,y,w,h,fill,stroke,sw,g,op,rotation){
        step='Векторная фигура: '+name;
        var mk=new ActionDescriptor(),r=new ActionReference();r.putClass(sid('contentLayer'));mk.putReference(sid('null'),r);
        var layer=new ActionDescriptor(),col=new ActionDescriptor();
        col.putObject(sid('color'),sid('RGBColor'),rgbDesc(fill||stroke||GOLD));
        layer.putObject(sid('type'),sid('solidColorLayer'),col);
        var geo=new ActionDescriptor();geo.putInteger(sid('unitValueQuadVersion'),1);
        geo.putUnitDouble(sid('top'),sid('pixelsUnit'),y*SY);
        geo.putUnitDouble(sid('left'),sid('pixelsUnit'),x*SX);
        geo.putUnitDouble(sid('bottom'),sid('pixelsUnit'),(y+h)*SY);
        geo.putUnitDouble(sid('right'),sid('pixelsUnit'),(x+w)*SX);
        layer.putObject(sid('shape'),sid(kind),geo);
        var st=new ActionDescriptor();st.putBoolean(sid('fillEnabled'),fill!==null);st.putBoolean(sid('strokeEnabled'),stroke!==null);
        st.putInteger(sid('strokeStyleVersion'),2);
        if(stroke!==null){st.putUnitDouble(sid('strokeStyleLineWidth'),sid('pixelsUnit'),Math.max(1,(sw||1)*S));
            var sc=new ActionDescriptor();sc.putObject(sid('color'),sid('RGBColor'),rgbDesc(stroke));
            st.putObject(sid('strokeStyleContent'),sid('solidColorLayer'),sc);}
        layer.putObject(sid('strokeStyle'),sid('strokeStyle'),st);
        mk.putObject(sid('using'),sid('contentLayer'),layer);executeAction(sid('make'),mk,DialogModes.NO);
        var l=doc.activeLayer;l.name=name;
        if(rotation){try{l.rotate(rotation,AnchorPosition.MIDDLECENTER);}catch(re){}}
        if(op!==undefined&&op!==null)l.opacity=op;
        into(l,g);countShape++;return l;
    }
    function rect(name,x,y,w,h,g,hex,opacity,deg){return shape('rectangle',name,x,y,w,h,hex||GOLD,null,0,g,opacity,deg||0);}
    function oval(name,x,y,w,h,g,fill,stroke,width,opacity){return shape('ellipse',name,x,y,w,h,fill,stroke,width,g,opacity,0);}
    function line(name,x,y,w,h,g,hex,opacity,deg){return rect(name,x,y,w,h,g,hex,opacity,deg);}
    function circle(name,x,y,d,g,width,opacity){return oval(name,x,y,d,d,g,null,GOLD,width||1.5,opacity);}
    // Native gradient fill; transparency stops, never a bitmap or external overlay.
    function grad(name,angle,op0,op1,opacity){
        step='Нативный градиент: '+name;
        var K=sid,make=new ActionDescriptor(),ref=new ActionReference();ref.putClass(K('contentLayer'));make.putReference(K('null'),ref);
        var layer=new ActionDescriptor(),style=new ActionDescriptor(),gradient=new ActionDescriptor();
        style.putUnitDouble(K('angle'),K('angleUnit'),angle);
        style.putEnumerated(K('type'),K('gradientType'),K('linear'));
        style.putUnitDouble(K('scale'),K('percentUnit'),100);style.putBoolean(K('dither'),true);
        gradient.putString(K('name'),'PhotoTools Pilates gradient');gradient.putEnumerated(K('gradientForm'),K('gradientForm'),K('customStops'));
        gradient.putDouble(K('interfaceIconFrameDimmed'),4096);
        var stops=new ActionList(),ops=new ActionList();
        for(var i=0;i<2;i++){
            var cs=new ActionDescriptor();cs.putObject(K('color'),K('RGBColor'),rgbDesc(DARK));
            cs.putEnumerated(K('type'),K('colorStopType'),K('userStop'));
            cs.putInteger(K('location'),i?4096:0);cs.putInteger(K('midpoint'),50);stops.putObject(K('colorStop'),cs);
            var os=new ActionDescriptor();os.putUnitDouble(K('opacity'),K('percentUnit'),i?op1:op0);
            os.putInteger(K('location'),i?4096:0);os.putInteger(K('midpoint'),50);ops.putObject(K('transferSpec'),os);
        }
        gradient.putList(K('colors'),stops);gradient.putList(K('transparency'),ops);
        style.putObject(K('gradient'),K('gradientClassEvent'),gradient);
        layer.putObject(K('type'),K('gradientLayer'),style);make.putObject(K('using'),K('contentLayer'),layer);
        executeAction(K('make'),make,DialogModes.NO);
        var l=doc.activeLayer;l.name=name;l.opacity=opacity;return l;
    }
    
    function setFont(t,names){for(var i=0;i<names.length;i++){try{t.font=names[i];return;}catch(e){}}}
    function type(name,content,x,y,size,fonts,hex,g,maxW,tracking){
        step='Текст: '+name;content=String(content||'');if(!trim(content))return null;
        x*=SX;y*=SY;size*=S;maxW=(maxW||950)*SX;
        var l=doc.artLayers.add();
        try{
            l.kind=LayerKind.TEXT;l.name=name;
            var t=l.textItem;t.kind=TextType.POINTTEXT;t.contents=content;t.color=color(hex||LIGHT);
            setFont(t,fonts||['ArialMT']);try{t.antiAliasMethod=AntiAlias.SMOOTH;}catch(aa){}
            if(tracking!==undefined)try{t.tracking=tracking;}catch(tr){}
            var dpi=doc.resolution||72;
            function scale(pxSize){t.size=UnitValue(pxSize*72/dpi,'pt');}
            scale(size);t.position=[px(x),px(y+size*1.1)];
            var b=layerBounds(l),w=b[2]-b[0],iter=0;
            while(w>maxW&&iter++<26){size=size*Math.min(0.94,0.97*maxW/w);scale(size);b=layerBounds(l);w=b[2]-b[0];}
            if(w>maxW+2)throw new Error('Не вмещается текстовый блок «'+name+'».');
            l.translate(px(x-b[0]),px(y-b[1]));
            into(l,g);countType++;return l;
        }catch(e){try{l.remove();}catch(ignore){}throw e;}
    }
    var FONT_LIGHT=['ArialMT','Arial-Regular','MyriadPro-Regular'];
    var FONT_BOLD=['Arial-BoldMT','Montserrat-Bold','ArialMT'];
    var FONT_SERIF=['Georgia','TimesNewRomanPSMT','ArialMT'];
    function titleFont(){var f=str('fontTitle','Оригинальный');return f==='Оригинальный'?FONT_BOLD:[f].concat(FONT_BOLD);}
    function normal(name,txt,x,y,sz,hex,g,width,track){return type(name,txt,x,y,sz,FONT_LIGHT,hex,g,width,track);}
    function heavy(name,txt,x,y,sz,hex,g,width,track){return type(name,txt,x,y,sz,FONT_BOLD,hex,g,width,track);}
    function title(name,txt,x,y,sz,hex,g,width,track){return type(name,txt,x,y,sz,titleFont(),hex,g,width,track);}
    function serif(name,txt,x,y,sz,hex,g,width,track){return type(name,txt,x,y,sz,FONT_SERIF,hex,g,width,track);}
    function parts(s,maxLen,maxRows){
        var words=trim(s).split(/\s+/),rows=[''],ix=0;
        for(var i=0;i<words.length;i++){
            if(ix<maxRows-1&&rows[ix]&&rows[ix].length+words[i].length+1>maxLen){ix++;rows[ix]='';}
            rows[ix]+=(rows[ix]?' ':'')+words[i];
        }
        return rows;
    }
    function sourcePhoto(l){if(!l||l.typename!=='ArtLayer')return false;
        try{return l.isBackgroundLayer||l.kind===LayerKind.NORMAL||l.kind===LayerKind.SMARTOBJECT;}catch(e){return false;}}
    function copySource(){
        step='Подготовка исходной фотографии';
        src=app.activeDocument;
        if(!sourcePhoto(src.activeLayer))
            throw new Error('Выбери фотослой или фоновую фотографию (не текст/фигуру).');
        doc=src.duplicate('FW Pilates Team - Unified Premium',false);
        app.activeDocument=doc;
        if(doc.layers.length>1){
            step='Изоляция исходного фотослоя';
            var keep=doc.activeLayer;
            try{keep.move(doc,ElementPlacement.PLACEATBEGINNING);}
            catch(e){keep=keep.duplicate(doc,ElementPlacement.PLACEATBEGINNING);}
            keep.name='__PHOTO__';
            while(doc.layers.length>1){
                var z=doc.layers[doc.layers.length-1];
                try{if(z.typename==='ArtLayer'&&z.isBackgroundLayer)z.isBackgroundLayer=false;}catch(ignore){}
                z.remove();
            }
        }
        if(doc.mode!==DocumentMode.RGB)doc.changeMode(ChangeMode.RGB);
        if(doc.bitsPerChannel!==BitsPerChannelType.EIGHT)
            doc.bitsPerChannel=BitsPerChannelType.EIGHT;
        // Unlock BEFORE extending canvas; prevents white Photoshop margins.
        step='Разблокировка фотографии перед изменением холста';
        var photo=doc.activeLayer;
        if(photo.isBackgroundLayer){
            photo.isBackgroundLayer=false;
            if(photo.isBackgroundLayer)
                throw new Error('Фоновый слой заблокирован; добавление холста остановлено.');
        }
        var ow=doc.width.as('px'),oh=doc.height.as('px');
        if(ow<500||oh<700)
            throw new Error('Нужна фотография минимум 500×700 пикселей.');
        if(ow/oh>0.95)
            throw new Error('Для этой карточки нужна вертикальная исходная фотография.');
        // Approved founder poster is 2:3. Preserve source pixels and add
        // transparent canvas only if the input aspect ratio differs.
        var ratio=2/3,newW=ow,newH=oh;
        if(ow/oh<ratio)newW=Math.ceil(oh*ratio);
        else if(ow/oh>ratio)newH=Math.ceil(ow/ratio);
        if(newW!==ow||newH!==oh){
            step='Дополнение холста до формата 2:3';
            doc.resizeCanvas(px(newW),px(newH),AnchorPosition.MIDDLECENTER);
        }
        W=doc.width.as('px');H=doc.height.as('px');
        SX=W/DW;SY=H/DH;S=Math.min(SX,SY);
        photo=doc.activeLayer;
        if(photo.kind!==LayerKind.SMARTOBJECT){
            try{
                doc.activeLayer=photo;
                executeAction(sid('newPlacedLayer'),new ActionDescriptor(),DialogModes.NO);
                photo=doc.activeLayer;
            }catch(smartErr){}
        }
        photo.name='ИЗОБРАЖЕНИЕ / заменить фото другого тренера';
        var g=group('00 ФОТО — менять для другого сотрудника');
        into(photo,g);
        originalPhotoLayer=photo;
        var shift=nval('photoShift',14,0,30);
        if(shift>0)photo.translate(px(W*shift/100),px(0));
        var bg=rect('ГРАФИТОВАЯ ПОДЛОЖКА / без белых полей',0,0,DW,DH,g,DARK,100);
        bg.move(photo,ElementPlacement.PLACEAFTER);
    }
    
    function insertOriginalLogo(g,full){
        step='Оригинальный логотип FW Pilates';
        var p=trim(C.logoPath),file=null;
        if(p){
            file=new File(p);
            if(!file.exists)throw new Error('Файл логотипа не найден: '+p);
        }else{
            file=File.openDialog('Выберите логотип FW PILATES — PNG с прозрачным фоном',
                'Images:*.png;*.jpg;*.jpeg;*.psd');
        }
        if(!file)return false;
        var asset=null,l=null;
        try{
            asset=app.open(file);
            app.activeDocument=asset;
            var aw=asset.width.as('px'),ah=asset.height.as('px');
            // Small FWPILATES under the official mark is not shown twice.
            // For the bundled transparent logo, the wordmark is at the bottom.
            if(!full)asset.selection.select([[0,0],[aw,0],[aw,ah*0.70],[0,ah*0.70]]);
            else asset.selection.selectAll();
            asset.selection.copy(true);
            app.activeDocument=doc;doc.paste();
            l=doc.activeLayer;
            l.name=full?'ЛОГО / оригинальный файл целиком':'ЛОГО / фирменный знак без дублирования подписи';
            var b=layerBounds(l),lw=b[2]-b[0],lh=b[3]-b[1];
            if(lw<1||lh<1)throw new Error('Логотип оказался пустым.');
            var k=Math.min(116*SX/lw,121*SY/lh);
            l.resize(k*100,k*100,AnchorPosition.MIDDLECENTER);
            b=layerBounds(l);
            l.translate(px(69*SX-b[0]),px(43*SY-b[1]));
            if(str('logoBlend','Сохранить как в файле')==='Убрать чёрный фон')
                l.blendMode=BlendMode.SCREEN;
            into(l,g);
            return true;
        }finally{
            if(asset)try{asset.close(SaveOptions.DONOTSAVECHANGES);}catch(closeErr){}
            app.activeDocument=doc;
        }
    }
    function drawLogo(g){
        var logo=group('ЛОГО / отдельный импортируемый слой');
        try{into(logo,g);}catch(ignored){}
        var mode=str('logoMode','Оригинальный знак + текст');
        if(mode!=='Только брендовый текст (вставлю логотип вручную)')
            insertOriginalLogo(logo,mode==='Оригинальный логотип целиком');
        var brand=str('studio','FW PILATES').toUpperCase();
        if(brand==='FW PILATES'){
            heavy('ЛОГОТИП / FW', 'FW',200,61,30,PINK,g,65,135);
            heavy('ЛОГОТИП / PILATES','PILATES',268,61,30,ORANGE,g,269,125);
        }else{
            heavy('ЛОГОТИП / название',brand,200,61,30,LIGHT,g,380,110);
        }
        normal('ПОДПИСЬ / сеть студий',
            str('brandNote','СЕТЬ СТУДИЙ КЛАССИЧЕСКОГО ПИЛАТЕСА').toUpperCase(),
            200,115,12,LIGHT,g,442,80);
        normal('ГОРОД',str('location','САНКТ-ПЕТЕРБУРГ').toUpperCase(),
            65,171,17,LIGHT,g,470,200);
        line('ГОРОД / подчеркивание',65,224,61,2,g,ORANGE,99);
    }
    
    function iconFor(i,x,y,g){
        var name='ЗНАЧОК '+(i+1)+' / ';
        circle(name+'круг',x,y,52,g,1.5,100);
        if(i===0){
            line(name+'диплом / верх',x+13,y+16,24,2,g,GOLD,97);
            line(name+'диплом / штрих',x+21,y+29,18,2,g,GOLD,97,27);
        }else if(i===1){
            circle(name+'стандарт / центр',x+14,y+14,24,g,1.3,95);
            line(name+'стандарт / горизонт',x+18,y+26,16,1.5,g,GOLD,97);
        }else if(i===2){
            line(name+'basi / верх',x+15,y+17,24,2,g,GOLD,99);
            line(name+'basi / средний',x+12,y+27,29,2,g,GOLD,99);
            line(name+'basi / низ',x+15,y+37,24,2,g,GOLD,99);
        }else if(i===3){
            oval(name+'mk / цветок',x+17,y+17,21,20,g,null,GOLD,1.5,96);
            line(name+'mk / основание',x+12,y+36,31,1.6,g,GOLD,96);
        }else if(i===4){
            line(name+'университет / крыша',x+14,y+16,28,2,g,GOLD,98);
            line(name+'университет / колонна 1',x+18,y+20,2,18,g,GOLD,98);
            line(name+'университет / колонна 2',x+26,y+20,2,18,g,GOLD,98);
            line(name+'университет / колонна 3',x+34,y+20,2,18,g,GOLD,98);
            line(name+'университет / основа',x+14,y+39,28,2,g,GOLD,98);
        }else if(i===5){
            oval(name+'gyro / орбита',x+13,y+13,28,27,g,null,GOLD,1.3,95);
            circle(name+'gyro / центр',x+22,y+22,10,g,1.2,96);
        }else if(i===6){
            oval(name+'blackroll / ролл',x+15,y+18,25,19,g,null,GOLD,1.4,96);
            circle(name+'blackroll / отверстие',x+22,y+22,10,g,1.2,96);
        }else if(i===7){
            line(name+'fascia / диагональ 1',x+12,y+15,30,2,g,GOLD,96,42);
            line(name+'fascia / диагональ 2',x+12,y+36,30,2,g,GOLD,96,-42);
            circle(name+'fascia / узел',x+21,y+19,11,g,1.3,98);
        }else if(i===8){
            normal(name+'4D', '4D',x+11,y+12,21,GOLD,g,39,-15);
        }else if(i===9){
            line(name+'theraband / первый',x+17,y+31,4,12,g,GOLD,97);
            line(name+'theraband / второй',x+26,y+24,4,19,g,GOLD,97);
            line(name+'theraband / третий',x+35,y+17,4,26,g,GOLD,97);
        }else{
            circle(name+'сотрудники / голова 1',x+13,y+15,10,g,1.3,98);
            circle(name+'сотрудники / голова 2',x+28,y+15,10,g,1.3,98);
            oval(name+'сотрудники / группа',x+11,y+29,30,13,g,null,GOLD,1.4,98);
        }
    }
    function drawCredentials(textGroup,iconGroup){
        // Shared visual system for all FW Pilates trainers.
        // Only the vertical rhythm follows the number of certifications.
        var defaults=[
            'Authentic Pilates Inelia Garcia (Бразилия)',
            'The Pilates Standard (Швеция)',
            'Тренер BLACKROLL, миофасциальные методики (Германия)',
            'Тренер по функциональному тренингу, стретчингу',
            'Участник международных и российских конвенций и воркшопов'
        ];
        var items=arr('credentials',defaults);
        if(items.length<1||items.length>11)
            throw new Error('Макет поддерживает от 1 до 11 квалификаций.');
        var compact=items.length>6;
        var y0=compact?746:740;
        var row=compact?56:Math.min(119,Math.floor(635/items.length));
        var x=compact?144:151, width=compact?346:325;
        var font=compact?18.7:21,subFont=compact?15.4:17.3;
        var perLine=compact?36:29,maxLines=compact?2:3;
        var offset=compact?20:25;
        for(var i=0;i<items.length;i++){
            var val=trim(items[i]||'');
            if(!val)continue;
            var y=y0+i*row;
            iconFor(i,67,y+1,iconGroup);
            var text=val,extra='',m=val.match(/\s*\(([^()]+)\)\s*$/);
            if(m){extra='('+m[1]+')';text=trim(val.substring(0,m.index));}
            var lines=parts(text,perLine,maxLines);
            for(var j=0;j<lines.length;j++){
                normal('КВАЛИФИКАЦИЯ '+(i+1)+' / текст '+(j+1),
                    lines[j],x,y+2+j*offset,font,LIGHT,textGroup,width,0);
            }
            if(extra)normal('КВАЛИФИКАЦИЯ '+(i+1)+' / страна, уточнение',
                extra,x,y+4+offset*lines.length,subFont,MUTED,textGroup,width,20);
            if(i<items.length-1)line('РАЗДЕЛИТЕЛЬ / '+(i+1),
                x,y+row-4,width-20,1.2,textGroup,GOLD,52);
        }
    }
        function protectTrainerBeforeDarkening(){
        // Select Subject on the *unshaded* photo, before gradients or text
        // obscure the pixels. Mask the copy to keep all subject pixels as
        // bright as the original, including face, hair and clothes.
        step='Выделение человека на оригинальном фото (Select Subject)';
        if(!originalPhotoLayer)throw new Error('Не найден фотослой для защиты тренера.');
        var cutout=null,maskGroup=null;
        try{
            cutout=originalPhotoLayer.duplicate(doc,ElementPlacement.PLACEATBEGINNING);
            cutout.name='ЧЕЛОВЕК / исходная яркость — маска Select Subject';
            doc.activeLayer=cutout;
            try{doc.selection.deselect();}catch(ignoreOldSelection){}
            executeAction(sid('autoCutout'),new ActionDescriptor(),DialogModes.NO);
            var b=doc.selection.bounds,selW=b[2].as('px')-b[0].as('px'),
                selH=b[3].as('px')-b[1].as('px');
            if(selW<30||selH<30)
                throw new Error('Photoshop не выделил человека на фотографии.');
            // No hard edge: modest feather preserves natural hair transitions.
            var feather=Math.min(3,Math.max(1,Math.round(S*1.5)));
            if(feather>0)doc.selection.feather(feather);
            step='Создание редактируемой маски защиты лица и фигуры';
            var d=new ActionDescriptor(),rf=new ActionReference();
            d.putClass(sid('new'),sid('channel'));
            rf.putEnumerated(sid('channel'),sid('channel'),sid('mask'));
            d.putReference(sid('at'),rf);
            d.putEnumerated(sid('using'),sid('userMaskEnabled'),sid('revealSelection'));
            executeAction(sid('make'),d,DialogModes.NO);
            try{doc.selection.deselect();}catch(ignoreSelection){}
            maskGroup=group('02 ЗАЩИТА ТРЕНЕРА / лицо и фигура без затемнения');
            into(cutout,maskGroup);
            return maskGroup;
        }catch(e){
            try{doc.selection.deselect();}catch(ignoreSelection2){}
            try{if(cutout)cutout.remove();}catch(ignoreCutout){}
            throw new Error('Не удалось автоматически защитить тренера от затемнения: '+
                 e.message+'. Попробуй открыть обычное RGB-фото и запустить снова.');
        }
    }
        function compose(){
        // First isolate the subject from unshaded pixels. Photoshop's Select
        // Subject mask remains editable for manual hair/edge refinements.
        var subjectProtection=protectTrainerBeforeDarkening();
        var st=nval('shadeStrength',94,0,100);
        var overlay=group('01 ГРАДИЕНТЫ / затемняется только фон, не тренер');
        into(grad('ЛЕВЫЙ ГРАФИТ / основа читаемости',0,100,0,Math.round(st*1.00)),overlay);
        into(grad('ЛЕВЫЙ ГРАФИТ / мягкий дополнительный',0,100,0,Math.round(st*0.75)),overlay);
        into(grad('НИЗ / мягкая виньетка',90,68,0,Math.round(st*0.40)),overlay);
        into(grad('ВЕРХ / лёгкая виньетка',90,29,0,Math.round(st*0.18)),overlay);
        // Above EVERY darkening/vignette layer, below all text and graphics.
        step='Помещение защищённого человека над градиентами';
        subjectProtection.move(overlay,ElementPlacement.PLACEBEFORE);
        var decor=group('03 ДЕКОР / отдельные векторные линии и рамка');
        // The upper and lower frame never needs to be erased across hands.
        line('РАМКА / верхняя линия',489,53,498,2,decor,GOLD,94);
        line('РАМКА / правый верх',986,53,2,570,decor,GOLD,85);
        // Off-center native shape ellipses emulate the approved thin curves.
        // Keep separate so Photoshop masks can hide any overlap with the model.
        oval('ДУГА / тёплый контур справа',883,-90,745,835,decor,null,ORANGE,1.8,23);
        oval('ДУГА / тонкий розовый акцент',928,490,860,1050,decor,null,PINK,1.5,17);
        line('РАМКА / низ',65,1411,922,1.5,decor,ORANGE,92);
        line('РАМКА / розовый штрих',65,322,61,3,decor,PINK,99);
        line('ДОЛЖНОСТЬ / розовый акцент',65,589,79,3,decor,PINK,100);
        line('РОЛЬ / золотой штрих',65,673,360,1.7,decor,GOLD,82);
        var brand=group('04 ФИРМЕННЫЙ ЛОГОТИП И ГОРОД');
        drawLogo(brand);
        var phrase=group('05 ФРАЗА / движение как искусство');
        var motto=arr('motto',['ДВИЖЕНИЕ','КАК ИСКУССТВО']);
        for(var k=0;k<Math.min(3,motto.length);k++){
            if(trim(motto[k]))
                heavy('СЛОГАН / строка '+(k+1),trim(motto[k]).toUpperCase(),
                    65,250+k*31,22,LIGHT,phrase,358,128);
        }
        var name=group('06 ИМЯ / должность / второй титул');
        title('ИМЯ / золото',str('first','Татьяна').toUpperCase(),
              62,354,74,GOLD,name,475,-8);
        title('ФАМИЛИЯ / белый',str('last','Речицкая').toUpperCase(),
              62,432,76,LIGHT,name,480,-10);
        var role=parts(str('role','ОСНОВАТЕЛЬ И РУКОВОДИТЕЛЬ СЕТИ СТУДИЙ FW PILATES').toUpperCase(),29,2);
        for(var r=0;r<Math.min(2,role.length);r++)
            normal('ОСНОВАТЕЛЬ / '+(r+1),role[r],65,529+r*25,18,LIGHT,name,440,105);
        var extra=parts(str('roleExtra','').toUpperCase(),28,2);
        for(var e=0;e<Math.min(2,extra.length);e++)
            normal('ПРЕПОДАВАТЕЛЬ / '+(e+1),extra[e],65,612+e*24,17,LIGHT,name,450,130);
        var quals=group('07 ШКОЛЫ И КВАЛИФИКАЦИИ / единая серия FW');
        normal('ЗАГОЛОВОК / сертификации',
            str('section','МЕЖДУНАРОДНЫЕ ШКОЛЫ И СЕРТИФИКАЦИИ:').toUpperCase(),
            64,703,17.5,GOLD,quals,473,44);
        var icons=group('08 ЗНАЧКИ / редактируемые фигуры');
        drawCredentials(quals,icons);
        var footer=group('09 ФУТЕР / гармония движения');
        normal('НИЖНЯЯ ПОДПИСЬ / слоган',
            str('footer','ГАРМОНИЯ ДВИЖЕНИЯ • СИЛА • КОНТРОЛЬ').toUpperCase(),
            65,1450,19,GOLD,footer,887,125);
    }
    
    function countChildren(g){var n=0;for(var i=0;i<g.layers.length;i++)n++;return n;}
    function safeName(s){return s.replace(/\.[^.]*$/,'').replace(/[\\\/:*?"<>|]/g,'_').substr(0,55);}
    try{
        if(!app.documents.length)throw new Error('Открой фотографию в Photoshop.');
        app.displayDialogs=DialogModes.NO;app.preferences.rulerUnits=Units.PIXELS;
        copySource();compose();
        try{doc.activeLayer=doc.layerSets[0];}catch(disableTextHandles){}
        step='Сохранение многослойного PSD';
        var folder=new Folder(Folder.userData.fsName+'/PhotoTools/StudioSuite/OUTPUT');
        if(!folder.exists&&!folder.create())throw new Error('Не могу создать каталог OUTPUT.');
        var name=safeName(src.name)+'_FW_PILATES_TEAM_DARK_5',f=new File(folder.fsName+'/'+name+'.psd'),k=2;
        while(f.exists){f=new File(folder.fsName+'/'+name+'_'+k+'.psd');k++;if(k>1000)throw new Error('Слишком много файлов с одинаковым именем.');}
        var save=new PhotoshopSaveOptions();save.layers=true;save.embedColorProfile=true;
        doc.saveAs(f,save,false,Extension.LOWERCASE);
        finished=true;app.activeDocument=doc;
        // CEP returns PT_OK after successful $.evalFile; result stays open as editable PSD.
    }catch(e){
        var report='FW Pilates Team Unified 5\nЭтап: '+step+'\nОшибка: '+e.message+'\nСтрока: '+(e.line||'?')+'\nТекстовых слоёв: '+countType+', векторных: '+countShape;
        try{
            var errFile=new File(Folder.temp.fsName+'/fw_pilates_team_dark_5_error.txt');
            errFile.encoding='UTF-8';
            if(errFile.open('w')){errFile.write(report);errFile.close();}
        }catch(logError){}
        try{if(doc&&!finished)doc.close(SaveOptions.DONOTSAVECHANGES);}catch(closeErr){}
        if(src)try{app.activeDocument=src;}catch(ignoreSrc){}
        try{alert(report+'\n\nЛог: '+Folder.temp.fsName+'/fw_pilates_founder_11_cert_error.txt');}catch(alertError){}
        throw new Error(report);
    }finally{
        try{app.preferences.rulerUnits=priorUnits;}catch(r){}
        try{app.displayDialogs=priorDialogs;}catch(d){}
    }
})();