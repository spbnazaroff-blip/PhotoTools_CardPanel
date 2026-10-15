// PT_SCHEMA={"category":"FW Pilates","description":"FW Pilates — Тренер / Тёмный премиум / 5 квалификаций / без затемнения лица. Шаблон для Екатерины Назаровой и других тренеров, с оригинальным логотипом и редактируемой маской Select Subject.","fields":[{"id":"first","label":"Имя","type":"text","default":"Екатерина"},{"id":"last","label":"Фамилия","type":"text","default":"Назарова"},{"id":"role","label":"Должность","type":"text","default":"СЕРТИФИЦИРОВАННЫЙ ПРЕПОДАВАТЕЛЬ ПИЛАТЕСА"},{"id":"studio","label":"Название студии","type":"text","default":"FW PILATES"},{"id":"brandNote","label":"Подпись студии","type":"text","default":"СЕТЬ СТУДИЙ КЛАССИЧЕСКОГО ПИЛАТЕСА"},{"id":"location","label":"Город","type":"text","default":"САНКТ-ПЕТЕРБУРГ"},{"id":"motto","label":"Фраза слева — до 3 строк","type":"textarea","array":true,"default":"ДВИЖЕНИЕ\nКАК ИСКУССТВО"},{"id":"section","label":"Заголовок блока","type":"text","default":"МЕЖДУНАРОДНЫЕ ШКОЛЫ ПИЛАТЕСА:"},{"id":"credentials","label":"Пять квалификаций, по одному пункту на строке","type":"textarea","array":true,"default":"Authentic Pilates Inelia Garcia (Бразилия)\nThe Pilates Standard (Швеция)\nТренер BLACKROLL, миофасциальные методики (Германия)\nТренер по функциональному тренингу, стретчингу\nУчастник международных и российских конвенций и воркшопов"},{"id":"footer","label":"Нижний слоган","type":"text","default":"ГАРМОНИЯ ДВИЖЕНИЯ • СИЛА • КОНТРОЛЬ"},{"id":"logoMode","label":"Логотип FW Pilates","type":"select","default":"Оригинальный знак + текст","options":["Оригинальный знак + текст","Оригинальный логотип целиком","Только текст — логотип вставлю вручную"]},{"id":"logoPath","label":"Путь к файлу логотипа (необязательно)","type":"text","default":""},{"id":"logoBlend","label":"Фон логотипа","type":"select","default":"Сохранить как в файле","options":["Сохранить как в файле","Убрать чёрный фон"]},{"id":"protectSubject","label":"Защитить лицо и фигуру от затемнения","type":"select","default":"Да, через Select Subject","options":["Да, через Select Subject","Нет, затемнять как раньше"]},{"id":"photoShift","label":"Сдвиг фото вправо (%) — 0 убирает вертикальный шов","type":"number","default":0},{"id":"shadeStrength","label":"Затемнение слева (%) — 0…100","type":"number","default":88},{"id":"fontTitle","label":"Шрифт крупного имени","type":"select","default":"Оригинальный","options":["Оригинальный","Arial-BoldMT","Montserrat-Bold","Georgia-Bold"]}]}
// Adobe Photoshop ExtendScript (invoked by PhotoTools CEP)
// PhotoTools Studio / FW PILATES / TRAINER / 5 QUALIFICATIONS / SUBJECT PROTECTED / Photoshop ExtendScript.
// Original portrait and optional brand logo stay on separate image layers. All overlays are native
// gradient fill layer, shape layer, or editable Type layer. No auxiliary images.
(function () {
    var priorUnits=app.preferences.rulerUnits;
    var priorDialogs=app.displayDialogs;
    var src=null,doc=null,finished=false,step='Подготовка';
    var originalPhotoLayer=null;
    var C=$.global.PT_CARD_CONF||{};
    var DW=1024,DH=1434,W=0,H=0,SX=1,SY=1,S=1; // Relative layout coordinates; output canvas is 2:3.
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
        step='Подготовка фотографии';
        src=app.activeDocument;
        if(!sourcePhoto(src.activeLayer))
            throw new Error('Выбери фотографию или фотослой, а не текст или фигуру.');
        doc=src.duplicate('FW Pilates - Trainer - 5 Qualifications - Face Protected',false);
        app.activeDocument=doc;
        if(doc.layers.length>1){
            step='Изоляция фотослоя';
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
        // Photoshop fills the extended canvas with a solid colour when the
        // chosen image is still a locked Background layer. Unlock first:
        // added canvas then becomes transparent, exposing the graphite below.
        // This MUST happen before resizeCanvas, not after.
        step='Подготовка прозрачного расширения холста';
        var originalPhoto=doc.activeLayer;
        if(originalPhoto.typename==='ArtLayer'&&originalPhoto.isBackgroundLayer){
            try{originalPhoto.isBackgroundLayer=false;}
            catch(unlockErr){
                throw new Error('Не удалось преобразовать фоновый слой в обычный: '+unlockErr.message);
            }
            if(originalPhoto.isBackgroundLayer)
                throw new Error('Фоновый слой остался заблокирован. Невозможно добавить прозрачные поля.');
        }
        var ow=doc.width.as('px'),oh=doc.height.as('px');
        if(ow<500||oh<700)throw new Error('Минимальная фотография 500×700.');
        if(ow/oh>0.95)throw new Error('Нужно вертикальное фото. Горизонтальный кадр не подходит этому макету.');
        // The approved Ekaterina poster is 2:3. Extend the canvas only; never
        // resample or discard the source photo's original pixels.
        var ratio=2/3, newW=ow,newH=oh;
        if(ow/oh<ratio)newW=Math.ceil(oh*ratio);
        else if(ow/oh>ratio)newH=Math.ceil(ow/ratio);
        if(newW!==ow||newH!==oh){
            step='Добавление прозрачных полей только при отклонении от 2:3';
            doc.resizeCanvas(px(newW),px(newH),AnchorPosition.MIDDLECENTER);
        }
        W=doc.width.as('px');H=doc.height.as('px');
        SX=W/DW;SY=H/DH;S=Math.min(SX,SY);
        var photo=doc.activeLayer;
        try{if(photo.isBackgroundLayer)photo.isBackgroundLayer=false;}catch(bg){}
        if(photo.kind!==LayerKind.SMARTOBJECT){
            try{doc.activeLayer=photo;executeAction(sid('newPlacedLayer'),new ActionDescriptor(),DialogModes.NO);photo=doc.activeLayer;}catch(smartError){}
        }
        photo.name='ФОТО / исходный кадр — смарт-объект (двигать здесь)';
        var g=group('00 ФОТО / менять на фото другого тренера');
        into(photo,g);
        originalPhotoLayer=photo;
        var move=nval('photoShift',0,0,30);
        if(move)photo.translate(px(W*move/100),px(0));
        var bg=rect('ФОН / редактируемый графит',0,0,DW,DH,g,DARK,100);
        bg.move(photo,ElementPlacement.PLACEAFTER);
    }
    
    function insertOriginalLogo(g,full){
        step='Загрузка оригинального логотипа FW Pilates';
        var p=trim(C.logoPath),f=null;
        if(p){
            f=new File(p);
            if(!f.exists)throw new Error('Нет файла логотипа: '+p);
        }else{
            f=File.openDialog('Выберите оригинальный логотип FW PILATES (PNG, JPG, PSD)',
                'Images:*.png;*.jpg;*.jpeg;*.psd');
        }
        if(!f)return false;
        var asset=null,l=null;
        try{
            asset=app.open(f);
            app.activeDocument=asset;
            var aw=asset.width.as('px'),ah=asset.height.as('px');
            if(!full){
                // Original FW mark has small FWPILATES letters at the bottom.
                // Extract only the icon in the brand block to avoid duplication.
                asset.selection.select([[0,0],[aw,0],[aw,ah*0.80],[0,ah*0.80]]);
            }else asset.selection.selectAll();
            asset.selection.copy(true);
            app.activeDocument=doc;
            doc.paste();
            l=doc.activeLayer;
            l.name=full?'ЛОГО / оригинал полностью':'ЛОГО / оригинальный знак FW';
            var b=layerBounds(l),lw=b[2]-b[0],lh=b[3]-b[1];
            if(lw<=0||lh<=0)throw new Error('Файл логотипа пустой.');
            var targetW=112*SX,targetH=112*SY;
            var scale=Math.min(targetW/lw,targetH/lh);
            l.resize(scale*100,scale*100,AnchorPosition.MIDDLECENTER);
            b=layerBounds(l);
            l.translate(px(72*SX-b[0]),px(52*SY-b[1]));
            if(str('logoBlend','Сохранить как в файле')==='Убрать чёрный фон')
                l.blendMode=BlendMode.SCREEN;
            into(l,g);
            return true;
        }finally{
            if(asset)try{asset.close(SaveOptions.DONOTSAVECHANGES);}catch(ignoreClose){}
            app.activeDocument=doc;
        }
    }
    function drawLogo(g){
        var lg=group('ЛОГО / отдельный слой для замены');
        try{into(lg,g);}catch(e){}
        var m=str('logoMode','Оригинальный знак + текст');
        if(m!=='Только текст — логотип вставлю вручную')
            insertOriginalLogo(lg,m==='Оригинальный логотип целиком');
        // Split brand name into independently editable two-colour type layers.
        var brand=str('studio','FW PILATES').toUpperCase();
        if(brand==='FW PILATES'){
            heavy('БРЕНД / FW — розовый', 'FW',196,67,29,PINK,g,74,125);
            heavy('БРЕНД / PILATES — золотой','PILATES',273,67,29,ORANGE,g,255,94);
        }else{
            heavy('БРЕНД / название студии',brand,196,67,30,LIGHT,g,440,100);
        }
        normal('БРЕНД / описание',str('brandNote','СЕТЬ СТУДИЙ КЛАССИЧЕСКОГО ПИЛАТЕСА').toUpperCase(),
            196,117,12,LIGHT,g,410,75);
        normal('ГОРОД',str('location','САНКТ-ПЕТЕРБУРГ').toUpperCase(),
            74,191,15,LIGHT,g,385,180);
        line('ГОРОД / тонкий штрих',74,225,61,2,g,ORANGE,96);
    }
    
    function drawCredentials(textGroup,iconGroup){
        var a=arr('credentials',[
            'Authentic Pilates Inelia Garcia (Бразилия)',
            'The Pilates Standard (Швеция)',
            'Тренер BLACKROLL, миофасциальные методики (Германия)',
            'Тренер по функциональному тренингу, стретчингу',
            'Участник международных и российских конвенций и воркшопов'
        ]);
        var ys=[754,865,976,1087,1198];
        for(var i=0;i<5;i++){
            var v=trim(a[i]||'');if(!v)continue;
            var y=ys[i];
            circle('ЗНАЧОК '+(i+1)+' / тонкое кольцо',73,y+1,59,iconGroup,1.8,98);
            if(i===0){
                line('ДИПЛОМ / верх',89,y+21,26,2,iconGroup,GOLD);
                line('ДИПЛОМ / нижняя грань',97,y+30,20,2,iconGroup,GOLD,96,30);
                line('ДИПЛОМ / левая грань',89,y+25,23,2,iconGroup,GOLD,96,150);
                line('ДИПЛОМ / кисточка',115,y+24,2,22,iconGroup,GOLD);
            }else if(i===1){
                circle('ГЛОБУС / центр',87,y+15,31,iconGroup,1.2,96);
                line('ГЛОБУС / экватор',92,y+31,22,1.6,iconGroup,GOLD);
                line('ГЛОБУС / меридиан',103,y+16,1.6,29,iconGroup,GOLD);
            }else if(i===2){
                line('ТРЕНАЖЁР / гриф',88,y+30,31,2,iconGroup,GOLD);
                line('ТРЕНАЖЁР / левый диск',92,y+20,3,23,iconGroup,GOLD);
                line('ТРЕНАЖЁР / правый диск',114,y+20,3,23,iconGroup,GOLD);
            }else if(i===3){
                circle('ТРЕНЕР / голова',97,y+13,12,iconGroup,1.5,96);
                oval('ТРЕНЕР / корпус',92,y+29,25,19,iconGroup,null,GOLD,1.4,96);
            }else{
                circle('ГРУППА / центральный',98,y+15,12,iconGroup,1.4,95);
                circle('ГРУППА / левый',84,y+24,9,iconGroup,1.1,92);
                circle('ГРУППА / правый',115,y+24,9,iconGroup,1.1,92);
                oval('ГРУППА / люди',87,y+37,34,13,iconGroup,null,GOLD,1.1,95);
            }
            var country='',head=v,m=v.match(/\s*\(([^()]+)\)\s*$/);
            if(m){
                country='('+m[1]+')';
                head=trim(v.substring(0,m.index));
            }
            // Two readable lines + country as an editable text layer.
            var lines=parts(head,29,3);
            for(var j=0;j<Math.min(lines.length,3);j++){
                if(trim(lines[j]))
                    normal('КВАЛИФИКАЦИЯ '+(i+1)+' / строка '+(j+1),
                        lines[j],159,y+4+j*25,20,LIGHT,textGroup,300,5);
            }
            if(country)
                serif('КВАЛИФИКАЦИЯ '+(i+1)+' / страна',country,
                    159,y+6+Math.min(lines.length,3)*25,17,MUTED,textGroup,305,20);
            if(i<4)
                line('КВАЛИФИКАЦИЯ / разделитель '+(i+1),
                    159,y+100,300,1.2,textGroup,GOLD,58);
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
        // Preserve the trainer's original brightness using an editable
        // Photoshop Select Subject mask. If the user chooses to disable it,
        // the previous editable gradient-only workflow remains available.
        var subjectProtection=null;
        if(str('protectSubject','Да, через Select Subject')==='Да, через Select Subject')
            subjectProtection=protectTrainerBeforeDarkening();
        var strength=nval('shadeStrength',88,0,100);
        var shading=group('01 ЗАТЕМНЕНИЕ / только фон за текстом');
        into(grad('ТЁМНЫЙ ФОН СЛЕВА / градиент',0,100,0,strength),shading);
        into(grad('МЯГКАЯ ЛЕВАЯ ПОДДЕРЖКА',0,100,0,Math.round(strength*0.40)),shading);
        into(grad('НИЖНИЙ ГРАДИЕНТ / край',90,58,0,Math.round(strength*0.38)),shading);
        into(grad('ВЕРХНИЙ ГРАДИЕНТ / контраст логотипа',90,31,0,Math.round(strength*0.19)),shading);
        if(subjectProtection){
            step='Защита тренера над затемняющими градиентами';
            subjectProtection.move(shading,ElementPlacement.PLACEBEFORE);
        }
        var decorations=group('03 РАМКА И АКЦЕНТЫ / редактируемые фигуры');
        // Deliberately broken/open on the portrait side to minimize crossing arms.
        line('РАМКА / верх',478,77,490,2,decorations,ORANGE,95);
        line('РАМКА / право / верх',967,77,2,430,decorations,GOLD,91);
        line('РАМКА / право / низ',967,1260,2,73,decorations,GOLD,83);
        oval('ДУГА / золото справа, отдельный вектор',820,140,300,850,decorations,null,ORANGE,1.9,42);
        oval('ДУГА / розовый нижний акцент',915,560,220,450,decorations,null,PINK,1.8,30);
        line('РАМКА / низ',74,1333,895,2,decorations,ORANGE,94);
        line('ГОРОД / подпись',74,225,59,2,decorations,GOLD,89);
        line('ЦИТАТА / розовый акцент',74,340,58,3,decorations,PINK,97);
        line('ДОЛЖНОСТЬ / розовый акцент',74,662,368,3,decorations,PINK,93);
        var brand=group('04 БРЕНД И ЛОГОТИП / шапка');
        drawLogo(brand);
        var mottoGroup=group('05 ФРАЗА / движение как искусство');
        var motto=arr('motto',['ДВИЖЕНИЕ','КАК ИСКУССТВО']);
        for(var m=0;m<Math.min(3,motto.length);m++)
            if(trim(motto[m]))
                heavy('ДЕВИЗ / '+(m+1),
                    trim(motto[m]).toUpperCase(),74,263+m*30,22,LIGHT,mottoGroup,360,180);
        var name=group('06 ИМЯ И ДОЛЖНОСТЬ / редактируемые тексты');
        title('ИМЯ / крупно',str('first','Екатерина').toUpperCase(),
              70,405,75,GOLD,name,490,-6);
        title('ФАМИЛИЯ / крупно',str('last','Назарова').toUpperCase(),
              70,483,88,LIGHT,name,500,-8);
        var roleLines=parts(str('role','СЕРТИФИЦИРОВАННЫЙ ПРЕПОДАВАТЕЛЬ ПИЛАТЕСА').toUpperCase(),26,2);
        for(var r=0;r<Math.min(roleLines.length,2);r++)
            normal('ДОЛЖНОСТЬ / строка '+(r+1),
                roleLines[r],76,597+r*26,19,LIGHT,name,435,100);
        var info=group('07 КВАЛИФИКАЦИИ / пять редактируемых блоков');
        normal('РАЗДЕЛ / школы пилатеса',
            str('section','МЕЖДУНАРОДНЫЕ ШКОЛЫ ПИЛАТЕСА:').toUpperCase(),
            73,710,18,GOLD,info,448,70);
        var icons=group('08 ИКОНКИ / векторные фигуры');
        drawCredentials(info,icons);
        var foot=group('09 ПОДПИСЬ / низ');
        normal('СЛОГАН / низ',
            str('footer','ГАРМОНИЯ ДВИЖЕНИЯ • СИЛА • КОНТРОЛЬ').toUpperCase(),
            74,1365,19,GOLD,foot,850,140);
        // Text remains fully editable; no flattening or rasterized decorations.
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
        var name=safeName(src.name)+'_FW_PILATES_TRAINER_5_QUAL_FACE_PROTECTED',f=new File(folder.fsName+'/'+name+'.psd'),k=2;
        while(f.exists){f=new File(folder.fsName+'/'+name+'_'+k+'.psd');k++;if(k>1000)throw new Error('Слишком много файлов с одинаковым именем.');}
        var save=new PhotoshopSaveOptions();save.layers=true;save.embedColorProfile=true;
        doc.saveAs(f,save,false,Extension.LOWERCASE);
        finished=true;app.activeDocument=doc;
        // CEP returns PT_OK after successful $.evalFile; result stays open as editable PSD.
    }catch(e){
        var report='FW Pilates Trainer 5 Qualifications / Protected\nЭтап: '+step+'\nОшибка: '+e.message+'\nСтрока: '+(e.line||'?')+'\nТекстовых слоёв: '+countType+', векторных: '+countShape;
        try{
            var errFile=new File(Folder.temp.fsName+'/fw_pilates_trainer_5_qual_face_protected_error.txt');
            errFile.encoding='UTF-8';
            if(errFile.open('w')){errFile.write(report);errFile.close();}
        }catch(logError){}
        try{if(doc&&!finished)doc.close(SaveOptions.DONOTSAVECHANGES);}catch(closeErr){}
        if(src)try{app.activeDocument=src;}catch(ignoreSrc){}
        try{alert(report+'\n\nЛог: '+Folder.temp.fsName+'/fw_pilates_dark_premium_error.txt');}catch(alertError){}
        throw new Error(report);
    }finally{
        try{app.preferences.rulerUnits=priorUnits;}catch(r){}
        try{app.displayDialogs=priorDialogs;}catch(d){}
    }
})();