// PT_SCHEMA={"category":"Пилатес","description":"ПИЛАТЕС 2 • ростовой постер: тренер справа, крупная типографика, 3 специализации, 2 акцента, фирменная рамка. Фото целиком сохраняется отдельным Smart Object.","fields":[{"id":"first","label":"Имя","type":"text","default":"Екатерина"},{"id":"last","label":"Фамилия","type":"text","default":"Назарова"},{"id":"studio","label":"Студия","type":"text","default":"FW PILATES"},{"id":"brandNote","label":"Подпись бренда","type":"text","default":"СЕТЬ СТУДИЙ КЛАССИЧЕСКОГО ПИЛАТЕСА"},{"id":"location","label":"Город","type":"text","default":"САНКТ-ПЕТЕРБУРГ"},{"id":"motto","label":"Короткий посыл (до 3 строк)","type":"textarea","array":true,"default":"ДВИЖЕНИЕ\nКАК ИСКУССТВО"},{"id":"role","label":"Должность","type":"text","default":"СЕРТИФИЦИРОВАННЫЙ ПРЕПОДАВАТЕЛЬ ПИЛАТЕСА"},{"id":"focusTitle","label":"Заголовок направлений","type":"text","default":"НАПРАВЛЕНИЯ"},{"id":"focus","label":"Три основных направления (по строке)","type":"textarea","array":true,"default":"КЛАССИЧЕСКИЙ ПИЛАТЕС\nМИОФАСЦИАЛЬНЫЕ МЕТОДИКИ\nФУНКЦИОНАЛЬНЫЙ ТРЕНИНГ И СТРЕТЧИНГ"},{"id":"stat1","label":"Достижение 1 • крупно","type":"text","default":"2"},{"id":"stat1Note","label":"Достижение 1 • подпись","type":"text","default":"МЕЖДУНАРОДНЫЕ ШКОЛЫ"},{"id":"stat2","label":"Достижение 2 • крупно","type":"text","default":"BLACKROLL"},{"id":"stat2Note","label":"Достижение 2 • подпись","type":"text","default":"ТРЕНЕР (ГЕРМАНИЯ)"},{"id":"footer","label":"Нижняя строка","type":"text","default":"ГАРМОНИЯ ДВИЖЕНИЯ  •  СИЛА  •  КОНТРОЛЬ"},{"id":"logoMode","label":"Логотип","type":"select","default":"Выбрать файл при создании","options":["Выбрать файл при создании","Стилизованный знак","Без логотипа"]},{"id":"logoPath","label":"Путь к логотипу (необязательно)","type":"text","default":""},{"id":"logoCrop","label":"Показывать часть логотипа","type":"select","default":"Только знак (без нижней подписи)","options":["Только знак (без нижней подписи)","Полностью"]},{"id":"logoBlend","label":"Прозрачность/чёрный фон логотипа","type":"select","default":"Сохранить как в файле","options":["Сохранить как в файле","Убрать чёрный фон"]},{"id":"fontTitle","label":"Шрифт крупного имени","type":"select","default":"Оригинальный","options":["Оригинальный","Arial-BoldMT","Georgia-Bold","Montserrat-Bold","TimesNewRomanPS-BoldMT"]},{"id":"photoScale","label":"Высота фотографии (%) — 55…110","type":"number","default":86},{"id":"photoX","label":"Центр фотографии по горизонтали (%) — 45…100","type":"number","default":73},{"id":"photoY","label":"Верх фотографии (%) — -15…30","type":"number","default":9},{"id":"shadeStrength","label":"Затемнение колонки слева (%) — 0…100","type":"number","default":86}]}
// Adobe Photoshop ExtendScript (invoked by PhotoTools CEP)
// PhotoTools Studio / PILATES 2 / CEP compatible / Photoshop ExtendScript.
// Only the currently open photo is raster. Every overlay is a Photoshop native
// gradient fill layer, shape layer, or editable Type layer. No auxiliary images.
(function () {
    var priorUnits=app.preferences.rulerUnits;
    var priorDialogs=app.displayDialogs;
    var src=null,doc=null,finished=false,step='Подготовка';
    var C=$.global.PT_CARD_CONF||{};
    var DW=1024,DH=1536,W=0,H=0,SX=1,SY=1,S=1;
    var GOLD='#F1C592',LIGHT='#FFF9F4',MUTED='#E9DAD0',DARK='#101217',PINK='#E53D74',ORANGE='#F9A53A';
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
        step='Подготовка исходного фото';src=app.activeDocument;
        if(!sourcePhoto(src.activeLayer))throw new Error('Выбери фотографию (обычный слой или Smart Object).');
        doc=src.duplicate('PhotoTools - Пилатес 2 (ростовой)',false);
        app.activeDocument=doc;
        if(doc.layers.length>1){
            step='Изоляция выбранной фотографии';
            var keep=doc.activeLayer;
            try{keep.move(doc,ElementPlacement.PLACEATBEGINNING);}
            catch(e){keep=keep.duplicate(doc,ElementPlacement.PLACEATBEGINNING);}
            keep.name='__KEEP_SOURCE_PHOTO__';
            while(doc.layers.length>1){
                var z=doc.layers[doc.layers.length-1];
                try{if(z.typename==='ArtLayer'&&z.isBackgroundLayer)z.isBackgroundLayer=false;}catch(bg){}
                z.remove();
            }
        }
        if(doc.mode!==DocumentMode.RGB)doc.changeMode(ChangeMode.RGB);
        if(doc.bitsPerChannel!==BitsPerChannelType.EIGHT)doc.bitsPerChannel=BitsPerChannelType.EIGHT;
        W=doc.width.as('px');H=doc.height.as('px');
        if(W<500||H<700)throw new Error('Минимальный размер исходного документа 500×700.');
        SX=W/DW;SY=H/DH;S=Math.min(SX,SY);
        var photo=doc.activeLayer;
        try{if(photo.isBackgroundLayer)photo.isBackgroundLayer=false;}catch(bg){}
        if(photo.kind!==LayerKind.SMARTOBJECT){
            try{doc.activeLayer=photo;executeAction(sid('newPlacedLayer'),new ActionDescriptor(),DialogModes.NO);photo=doc.activeLayer;}
            catch(e){}
        }
        photo.name='ФОТО / масштаб и положение (ростовой)';
        var g=group('00 ФОТО — оригинал как отдельный слой');
        into(photo,g);
        step='Масштаб и позиция фотографии';
        var b=layerBounds(photo), bh=b[3]-b[1];
        if(bh<=0)throw new Error('Выбранный фотослой пустой.');
        // Scale to a percentage of the document height, rather than fitting
        // by width, so the subject can remain full-length in the new layout.
        var wantedH=H*nval('photoScale',86,55,110)/100;
        var factor=wantedH/bh;
        photo.resize(factor*100,factor*100,AnchorPosition.MIDDLECENTER);
        b=layerBounds(photo);
        var cx=W*nval('photoX',73,45,100)/100;
        var top=H*nval('photoY',9,-15,30)/100;
        photo.translate(px(cx-(b[0]+b[2])/2),px(top-b[1]));
        // A solid editable vector underlay covers areas exposed by resizing.
        var base=rect('ФОН / глубокий графит',0,0,DW,DH,g,DARK,100);
        base.move(photo,ElementPlacement.PLACEAFTER);
    }
    
    function insertOriginalLogo(g){
        step='Добавление фирменного логотипа';
        var filePath=trim(C.logoPath),f=null;
        if(filePath){
            f=new File(filePath);
            if(!f.exists)throw new Error('Логотип не найден: '+filePath);
        }else{
            f=File.openDialog('Выберите логотип FW PILATES (PNG, JPG, PSD)',
                'Images:*.png;*.jpg;*.jpeg;*.psd');
        }
        if(!f)return false;
        var asset=null,layer=null;
        try{
            asset=app.open(f);
            app.activeDocument=asset;
            // The supplied FW PILATES original asset includes a tiny wordmark
            // beneath the symbol. The default "symbol only" mode avoids
            // duplicating this wordmark next to the editable brand title.
            var aw=asset.width.as('px'),ah=asset.height.as('px');
            if(str('logoCrop','Только знак (без нижней подписи)')==='Только знак (без нижней подписи)'){
                asset.selection.select([[0,0],[aw,0],[aw,ah*0.83],[0,ah*0.83]]);
            }else asset.selection.selectAll();
            asset.selection.copy(true);
            app.activeDocument=doc;
            doc.paste();
            layer=doc.activeLayer;
            layer.name='ЛОГО / оригинальный знак из файла';
            var b=layerBounds(layer),w=b[2]-b[0],h=b[3]-b[1];
            if(w<=0||h<=0)throw new Error('Выбранный файл логотипа не содержит пикселей.');
            var k=Math.min((122*SX)/w,(132*SY)/h);
            layer.resize(100*k,100*k,AnchorPosition.MIDDLECENTER);
            b=layerBounds(layer);
            layer.translate(px(77*SX-b[0]),px(69*SY-b[1]));
            if(str('logoBlend','Сохранить как в файле')==='Убрать чёрный фон')
                layer.blendMode=BlendMode.SCREEN;
            into(layer,g);
            return true;
        }finally{
            if(asset)try{asset.close(SaveOptions.DONOTSAVECHANGES);}catch(e){}
            app.activeDocument=doc;
        }
    }
    function drawLogo(g){
        var lg=group('ЗНАК / оригинальный логотип или векторная стилизация');
        try{into(lg,g);}catch(e){}
        var mode=str('logoMode','Выбрать файл при создании');
        var imported=false;
        if(mode==='Выбрать файл при создании') imported=insertOriginalLogo(lg);
        if(mode==='Стилизованный знак'||(mode==='Выбрать файл при создании'&&!imported)){
            oval('ЗНАК / янтарная петля',105,70,61,58,lg,null,ORANGE,4.0,100);
            line('ЗНАК / розовый штрих',100,109,4,63,lg,PINK,100,17);
            line('ЗНАК / коралловый штрих',119,106,4,65,lg,'#F27259',100,17);
            oval('ЗНАК / точка',80,120,7,7,lg,PINK,null,0,100);
        }
        heavy('БРЕНД / студия',str('studio','FW PILATES').toUpperCase(),215,86,30,LIGHT,g,550,115);
        normal('БРЕНД / подпись',str('brandNote','СЕТЬ СТУДИЙ КЛАССИЧЕСКОГО ПИЛАТЕСА').toUpperCase(),215,130,11,MUTED,g,650,65);
        line('ГОРОД / короткая линия',79,211,54,2,g,ORANGE,96);
        normal('ГОРОД',str('location','САНКТ-ПЕТЕРБУРГ').toUpperCase(),79,229,13,LIGHT,g,480,148);
    }
    function drawFocus(g,ico){
        var items=arr('focus',[
            'КЛАССИЧЕСКИЙ ПИЛАТЕС',
            'МИОФАСЦИАЛЬНЫЕ МЕТОДИКИ',
            'ФУНКЦИОНАЛЬНЫЙ ТРЕНИНГ И СТРЕТЧИНГ'
        ]);
        var yy=[889,980,1071];
        for(var i=0;i<3;i++){
            var v=trim(items[i]||'');
            if(!v)continue;
            var y=yy[i],cx=106;
            circle('ОБЛАСТЬ '+(i+1)+' / круг',80,y,53,ico,1.5,95);
            if(i===0){
                circle('ПИЛАТЕС / центр',96,y+15,20,ico,1.2,90);
                line('ПИЛАТЕС / линия',99,y+26,15,1.6,ico,GOLD,100);
            }else if(i===1){
                oval('МИОФАСЦИЯ / ролл',97,y+19,20,15,ico,null,GOLD,1.5,94);
                circle('МИОФАСЦИЯ / центр',103,y+23,8,ico,1.3,94);
            }else{
                line('ТРЕНИНГ / гриф',94,y+25,26,2,ico,GOLD,100);
                line('ТРЕНИНГ / левый диск',98,y+18,3,17,ico,GOLD,100);
                line('ТРЕНИНГ / правый диск',115,y+18,3,17,ico,GOLD,100);
            }
            var split=parts(v.toUpperCase(),26,2);
            for(var j=0;j<split.length&&j<2;j++){
                if(trim(split[j]))normal('НАПРАВЛЕНИЕ '+(i+1)+' / '+(j+1),
                    split[j],158,y+6+j*27,21,LIGHT,g,367,85);
            }
            if(i<2)line('СПЕЦИАЛИЗАЦИЯ / разделитель '+(i+1),158,y+79,300,1.2,g,GOLD,44);
        }
    }
    function compose(){
        var shade=nval('shadeStrength',86,0,100);
        var under=group('01 ГРАДИЕНТЫ / читаемость и глубина');
        // Use the verified two-stop Photoshop-native gradient implementation.
        into(grad('ТЁМНАЯ КОЛОНКА / базовый',0,100,0,shade),under);
        into(grad('ТЁМНАЯ КОЛОНКА / усиление',0,100,0,Math.round(shade*0.37)),under);
        into(grad('НИЗ / мягкая виньетка',90,68,0,Math.round(shade*0.42)),under);
        into(grad('ВЕРХ / читаемая шапка',90,35,0,Math.round(shade*0.16)),under);
        var frame=group('02 ГРАФИКА / рамка, штрихи, акценты');
        // Editorial frame borrowed from sports photography, recoloured for FW.
        line('РАМКА / верхний сегмент',490,102,438,2,frame,ORANGE,90);
        line('РАМКА / правый контур',928,102,2,1221,frame,ORANGE,85);
        line('РАМКА / нижний сегмент',558,1323,372,2,frame,PINK,85);
        line('ЦИТАТА / короткая линия',80,374,49,3,frame,ORANGE,100);
        line('ДОЛЖНОСТЬ / акцент',79,770,384,2,frame,PINK,93);
        line('СТАТИСТИКА / верх',79,1189,427,1.5,frame,GOLD,80);
        line('НИЗ / финальная линия',79,1428,871,1.7,frame,ORANGE,89);
        rect('ШТАМП / розовый прямоугольник',80,1177,8,8,frame,PINK,99);
        var brand=group('03 БРЕНД / FW PILATES');
        drawLogo(brand);
        var slogan=group('04 СМЫСЛОВОЙ АКЦЕНТ / фраза');
        var lines=arr('motto',['ДВИЖЕНИЕ','КАК ИСКУССТВО']);
        for(var i=0;i<Math.min(3,lines.length);i++){
            if(trim(lines[i]))heavy('АКЦЕНТ / '+(i+1),
                trim(lines[i]).toUpperCase(),80,302+i*31,19,LIGHT,slogan,400,210);
        }
        var names=group('05 ИМЯ И ДОЛЖНОСТЬ / крупная типографика');
        heavy('ИМЯ / верхняя строка',
            str('first','Екатерина').toUpperCase(),75,512,65,GOLD,names,470,-8);
        title('ФАМИЛИЯ / главная строка',
            str('last','Назарова').toUpperCase(),75,594,78,LIGHT,names,478,-12);
        var role=parts(str('role','СЕРТИФИЦИРОВАННЫЙ ПРЕПОДАВАТЕЛЬ ПИЛАТЕСА').toUpperCase(),28,2);
        for(var r=0;r<role.length&&r<2;r++)
            normal('ДОЛЖНОСТЬ / '+(r+1),role[r],80,715+r*25,18,LIGHT,names,448,135);
        var spec=group('06 НАПРАВЛЕНИЯ / три информационные строки');
        normal('НАПРАВЛЕНИЯ / заголовок',
            str('focusTitle','НАПРАВЛЕНИЯ').toUpperCase(),80,839,16,GOLD,spec,445,140);
        var icons=group('07 ИКОНКИ / редактируемые векторные элементы');
        drawFocus(spec,icons);
        var facts=group('08 ДОСТИЖЕНИЯ / два блока');
        heavy('ДОСТИЖЕНИЕ 1 / число',str('stat1','2').toUpperCase(),
              80,1200,51,GOLD,facts,170,35);
        normal('ДОСТИЖЕНИЕ 1 / пояснение',str('stat1Note','МЕЖДУНАРОДНЫЕ ШКОЛЫ').toUpperCase(),
              80,1271,13,MUTED,facts,190,45);
        line('ДОСТИЖЕНИЯ / вертикальный акцент',285,1203,2,100,facts,PINK,92);
        heavy('ДОСТИЖЕНИЕ 2 / слово',str('stat2','BLACKROLL').toUpperCase(),
              309,1210,31,LIGHT,facts,210,10);
        normal('ДОСТИЖЕНИЕ 2 / пояснение',str('stat2Note','ТРЕНЕР (ГЕРМАНИЯ)').toUpperCase(),
              309,1271,13,MUTED,facts,205,60);
        var footer=group('09 НИЖНЯЯ СТРОКА');
        normal('ПОДПИСЬ / философия',str('footer','ГАРМОНИЯ ДВИЖЕНИЯ  •  СИЛА  •  КОНТРОЛЬ').toUpperCase(),
               79,1450,17,GOLD,footer,857,125);
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
        var name=safeName(src.name)+'_PILATES_2',f=new File(folder.fsName+'/'+name+'.psd'),k=2;
        while(f.exists){f=new File(folder.fsName+'/'+name+'_'+k+'.psd');k++;if(k>1000)throw new Error('Слишком много файлов с одинаковым именем.');}
        var save=new PhotoshopSaveOptions();save.layers=true;save.embedColorProfile=true;
        doc.saveAs(f,save,false,Extension.LOWERCASE);
        finished=true;app.activeDocument=doc;
        // CEP returns PT_OK after successful $.evalFile; result stays open as editable PSD.
    }catch(e){
        var report='PhotoTools Pilates 2\nЭтап: '+step+'\nОшибка: '+e.message+'\nСтрока: '+(e.line||'?')+'\nТекстовых слоёв: '+countType+', векторных: '+countShape;
        try{
            var errFile=new File(Folder.temp.fsName+'/phototools_pilates_2_error.txt');
            errFile.encoding='UTF-8';
            if(errFile.open('w')){errFile.write(report);errFile.close();}
        }catch(logError){}
        try{if(doc&&!finished)doc.close(SaveOptions.DONOTSAVECHANGES);}catch(closeErr){}
        if(src)try{app.activeDocument=src;}catch(ignoreSrc){}
        try{alert(report+'\n\nЛог: '+Folder.temp.fsName+'/phototools_pilates_v4_error.txt');}catch(alertError){}
        throw new Error(report);
    }finally{
        try{app.preferences.rulerUnits=priorUnits;}catch(r){}
        try{app.displayDialogs=priorDialogs;}catch(d){}
    }
})();